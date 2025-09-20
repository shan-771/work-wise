// src/components/JobPreferencesForm.js
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

const JobPreferencesForm = ({ onPreferencesSaved }) => {
const [preferences, setPreferences] = useState({
    skills: "",
    jobType: "full-time",
    location: "",
  });
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid, "settings", "jobPreferences");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPreferences(snap.data());
      }
      setLoading(false);
    };
    fetchPreferences();
  }, [user]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user) return;

  // Save preferences in Firestore
  const ref = doc(db, "users", user.uid, "settings", "jobPreferences");
  await setDoc(ref, preferences);

  // Call your API with query and location
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/job_suggestions?query=${preferences.skills}&location=${preferences.location}`
    );
    const data = await res.json();
    console.log("Job Suggestions:", data); // <-- check in console

    if (onPreferencesSaved) {
  onPreferencesSaved(preferences); // pass the preferences object
}

  } catch (error) {
    console.error("Error fetching job suggestions:", error);
  }
};

 if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <motion.div
      className="flex justify-center mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-full max-w-lg shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-indigo-200 p-8">
        <h2 className="text-2xl font-bold text-indigo-700 text-center mb-6">
          🎯 Job Preferences
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-indigo-800 mb-2">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={preferences.skills}
              onChange={(e) =>
                setPreferences({ ...preferences, skills: e.target.value })
              }
              className="w-full p-3 border rounded-lg border-indigo-300 focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. React, Python, SQL"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-semibold text-indigo-800 mb-2">
              Job Type
            </label>
            <select
              value={preferences.jobType}
              onChange={(e) =>
                setPreferences({ ...preferences, jobType: e.target.value })
              }
              className="w-full p-3 border rounded-lg border-indigo-300 focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="full-time">Full-Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-indigo-800 mb-2">
              Location Preference
            </label>
            <input
              type="text"
              value={preferences.location}
              onChange={(e) =>
                setPreferences({ ...preferences, location: e.target.value })
              }
              className="w-full p-3 border rounded-lg border-indigo-300 focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. Bangalore, Remote"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200"
          >
            💾 Save Preferences
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default JobPreferencesForm;
