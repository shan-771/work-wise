import { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export default function RoadmapDisplay({ roadmap, onNewRoadmap }) {
  const [goalName, setGoalName] = useState("");

  // Set goalName from roadmap (sent from RoadmapForm)
  useEffect(() => {
    if (roadmap?.goal) {
      setGoalName(roadmap.goal);
    }
  }, [roadmap]);

  const saveRoadmap = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const roadmapRef = collection(db, "roadmaps", user.uid, "userRoadmaps");

      const roadmapWithCompletion = roadmap.steps.map(step => ({
        ...step,
        completed: step.completed || false,
      }));

      await addDoc(roadmapRef, {
        steps: roadmapWithCompletion,
        startedAt: new Date(),
        name: goalName || "Untitled Goal",
      });

      // Go back to main roadmap list after saving
      onNewRoadmap();
    } catch (error) {
      console.error("Error saving roadmap:", error);
    }
  };

  // If no steps, show placeholder
  if (!roadmap || !Array.isArray(roadmap.steps) || roadmap.steps.length === 0) {
    return <p className="text-gray-500 mt-4">No roadmap generated yet.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Your Roadmap</h2>
      <p className="text-lg font-semibold mb-4">📌 Goal: {goalName}</p>

      <ol className="relative border-l border-gray-300">
        {roadmap.steps.map((step, index) => (
          <li key={index} className="mb-8 ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full text-white">
              {index + 1}
            </span>
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-gray-700">{step.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              ⏳ Duration: {step.expected_duration}
            </p>
          </li>
        ))}
      </ol>

      <div className="flex space-x-4 mt-6">
        <button
          onClick={saveRoadmap}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ✅ Start Roadmap
        </button>
        <button
          onClick={onNewRoadmap}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          🔄 New Roadmap
        </button>
      </div>
    </div>
  );
}
