import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function ProgressTracker() {
  const [progress, setProgress] = useState({
    interviews: 0,
    avgScore: 0,
    latestResumeScore: 0
  });

  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribeProgress = () => {};
    let unsubscribeRoadmaps = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Progress listener
      const progressRef = doc(db, "users", user.uid);
      unsubscribeProgress = onSnapshot(progressRef, (snapshot) => {
        if (snapshot.exists()) setProgress(snapshot.data());
        setLoading(false);
      });

      // Roadmaps listener
      const roadmapColRef = collection(db, "roadmaps", user.uid, "userRoadmaps");
      unsubscribeRoadmaps = onSnapshot(roadmapColRef, (snapshot) => {
        const fetchedRoadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRoadmaps(fetchedRoadmaps);

        if (fetchedRoadmaps.length > 0 && !selectedRoadmap) {
          setSelectedRoadmap(fetchedRoadmaps[0]);
        }
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProgress();
      unsubscribeRoadmaps();
    };
  }, [selectedRoadmap]);

  if (loading) return <p>Loading progress...</p>;

  const toggleStepCompletion = async (roadmapId, stepIndex) => {
    const roadmapIndex = roadmaps.findIndex(r => r.id === roadmapId);
    if (roadmapIndex === -1) return;

    const updatedRoadmaps = [...roadmaps];
    const updatedSteps = [...updatedRoadmaps[roadmapIndex].steps];

    updatedSteps[stepIndex].completed = !updatedSteps[stepIndex].completed;
    updatedRoadmaps[roadmapIndex].steps = updatedSteps;

    setRoadmaps(updatedRoadmaps);

    if (selectedRoadmap?.id === roadmapId) {
      setSelectedRoadmap({ ...selectedRoadmap, steps: updatedSteps });
    }

    await updateDoc(
      doc(db, "roadmaps", auth.currentUser.uid, "userRoadmaps", roadmapId),
      { steps: updatedSteps }
    );
  };

  // const totalSteps = selectedRoadmap?.steps?.length || 0;
  // const completedSteps = selectedRoadmap?.steps?.filter(step => step.completed).length || 0;

  return (
    <div className="flex gap-6 p-4">
      {/* Progress Card */}
      <div className="flex-1 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">📊 Your Progress</h2>
        <div className="space-y-2">
          <p>Interviews Taken: {progress.interviews}</p>
          <p>Average Score: {progress.avgScore?.toFixed(2) || "0.00"}</p>
          <p>Latest Resume Score: {progress.latestResumeScore?.toFixed(2) || "0.00"}</p>
        </div>
      </div>

      {/* Roadmaps List */}
      <div className="w-1/3 bg-white rounded-2xl shadow-md p-6 overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-bold mb-4">📚 Your Roadmaps</h2>
        {roadmaps.length === 0 && <p className="text-gray-500">No roadmaps yet</p>}
        <ul className="space-y-3">
          {roadmaps.map(rm => (
            <li
              key={rm.id}
              className={`p-3 rounded-lg cursor-pointer transition ${
                selectedRoadmap?.id === rm.id ? "bg-green-400" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedRoadmap(rm)}
            >
              <p className="font-semibold">{rm.name}</p>
              <p className="text-sm text-gray-500">
                Started: {rm.startedAt ? new Date(rm.startedAt.seconds * 1000).toLocaleDateString() : "N/A"}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1 overflow-hidden">
                <div
                  className="bg-green-500 h-3 transition-all"
                  style={{
                    width: `${rm.steps?.length ? Math.round((rm.steps.filter(s => s.completed).length / rm.steps.length) * 100) : 0}%`
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        {selectedRoadmap && (
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setModalOpen(true)}
          >
            View Full Steps
          </button>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedRoadmap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-3/4 max-h-[85vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedRoadmap.name} - Full Steps</h2>

            {selectedRoadmap.steps.map((step, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p>{step.description}</p>
                  <p className="text-sm text-gray-500 mt-1">⏳ Duration: {step.expected_duration}</p>
                  {step.resources?.length > 0 && (
                    <ul className="list-disc ml-6 mt-2">
                      {step.resources.map((res, i) => <li key={i}>{res}</li>)}
                    </ul>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => toggleStepCompletion(selectedRoadmap.id, idx)}
                    className={`px-3 py-1 rounded ${step.completed ? "bg-gray-400" : "bg-green-500"} text-white`}
                  >
                    {step.completed ? "Completed" : "Mark Done"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
