import { useState } from "react";

export default function RoadmapForm({ onRoadmapGenerated }) {
  const [goal, setGoal] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/generate_roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal,
        current_skills: currentSkills,
        duration,
      }),
    });

    const data = await res.json();
    if (data.roadmap) {
      onRoadmapGenerated({
        goal,
        steps: data.roadmap,
      });
    } else {
      alert("Failed to generate roadmap");
    }
  } catch (err) {
    console.error("Error generating roadmap:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Generate Your Roadmap</h2>

      <label className="block mb-2 font-semibold">Goal</label>
      <input
        type="text"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="e.g. Data Scientist"
        className="w-full border rounded-lg p-2 mb-4"
        required
      />

      <label className="block mb-2 font-semibold">Current Skills</label>
      <input
        type="text"
        value={currentSkills}
        onChange={(e) => setCurrentSkills(e.target.value)}
        placeholder="e.g. Python, Statistics"
        className="w-full border rounded-lg p-2 mb-4"
        required
      />

      <label className="block mb-2 font-semibold">Duration</label>
      <input
        type="text"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="e.g. 6 months"
        className="w-full border rounded-lg p-2 mb-4"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        {loading ? "Generating..." : "Generate Roadmap"}
      </button>
    </form>
  );
}
