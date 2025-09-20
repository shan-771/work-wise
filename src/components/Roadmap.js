import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import RoadmapForm from "../components/RoadmapForm";
import RoadmapDisplay from "../components/RoadmapDisplay";

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [generatedGoal, setGeneratedGoal] = useState(""); // ✅ store default goal name

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        setLoading(false);
        return;
      }

      const roadmapCollection = collection(db, "roadmaps", user.uid, "userRoadmaps");
      const unsubscribeRoadmaps = onSnapshot(roadmapCollection, snapshot => {
        const r = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRoadmaps(r);
        setLoading(false);
      });

      return () => unsubscribeRoadmaps();
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <p>Loading your roadmaps...</p>;

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

  const deleteRoadmap = async (roadmapId) => {
    await deleteDoc(doc(db, "roadmaps", auth.currentUser.uid, "userRoadmaps", roadmapId));
    setModalOpen(false);
  };

  const computeTotalDuration = (steps) => {
    let totalDays = steps.reduce((sum, s) => {
      const m = parseInt(s.expected_duration) || 0;
      return sum + m * 30;
    }, 0);
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    return `${months} month${months !== 1 ? "s" : ""} ${days} day${days !== 1 ? "s" : ""}`;
  };

  

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📍 Your Roadmaps</h1>

      {/* Create New Roadmap button */}
      <button
        onClick={() => {
          setShowForm(!showForm);
          setGeneratedRoadmap(null);
          setGeneratedGoal("");
        }}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {showForm ? "Cancel" : "+ Create New Roadmap"}
      </button>

      {/* Roadmap Form OR Generated Roadmap */}
      {showForm && !generatedRoadmap && (
        <RoadmapForm
          onRoadmapGenerated={(roadmap, goal) => {
            setGeneratedRoadmap(roadmap);
            setGeneratedGoal(goal); // ✅ capture goal name
          }}
        />
      )}

      {showForm && generatedRoadmap && (
  <RoadmapDisplay
    roadmap={generatedRoadmap}
    goalName={generatedGoal} // pass goal from RoadmapForm
    onNewRoadmap={() => {
      setGeneratedRoadmap(null);
      setGeneratedGoal("");
      setShowForm(false); // ✅ main roadmap list is shown
    }}
  />
)}


      {/* Roadmap Cards */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmaps.map((r) => {
            const totalSteps = r.steps.length;
            const completedSteps = r.steps.filter(s => s.completed).length;
            const completionPercent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition"
                onClick={() => { setSelectedRoadmap(r); setModalOpen(true); }}
              >
                <h2 className="font-semibold text-lg">{r.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Started: {r.startedAt ? r.startedAt.toDate().toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Time Left: {computeTotalDuration(r.steps)}
                </p>

                {/* Progress bar */}
                <p className="text-sm text-gray-500 mt-1">Completion: {completionPercent}%</p>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-500 h-3 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Selected Roadmap */}
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

            <button
              onClick={() => deleteRoadmap(selectedRoadmap.id)}
              className="bg-red-600 text-white px-4 py-2 rounded mt-4"
            >
              Delete Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
