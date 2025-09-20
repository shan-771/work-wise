import { useState } from "react";
import JobPreferencesForm from "../components/JobPreferencesForm";

export default function JobSuggestions() {
  const [showForm, setShowForm] = useState(true);
  const [jobs, setJobs] = useState([]);

  const handlePreferencesSaved = async (preferences) => {
    setShowForm(false);

    try {
      const queryParams = new URLSearchParams({
        query: preferences.skills || "software engineer", // using skills as role
        location: preferences.location || "remote",
      });

      const res = await fetch(`http://127.0.0.1:5000/job_suggestions?${queryParams}`);
      const data = await res.json();

      console.log("API response:", data); // 👀 check what backend returns

      if (data.jobs && data.jobs.length > 0) {
  setJobs(data.jobs.map(job => ({
    title: job.title,
    company: job.company || "Unknown",
    location: job.location || "Not specified",
    url: job.url,
  })));
} else {
  setJobs([]);
}


    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    }
  };

  return (
    <div className="relative p-6">
      {/* Edit button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="absolute top-6 right-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition"
        >
          ✏️ Edit Preferences
        </button>
      )}

      {showForm ? (
        <JobPreferencesForm onPreferencesSaved={handlePreferencesSaved} />
      ) : (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📌 Job Suggestions</h2>
          {jobs.length > 0 ? (
            <ul className="space-y-4">
              {jobs.map((job, idx) => (
                <li
                  key={idx}
                  className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-indigo-700">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    🔗 View Job
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No jobs found for your preferences.</p>
          )}
        </div>
      )}
    </div>
  );
}
