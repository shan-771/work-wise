import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProgressTracker() {
  const [progress, setProgress] = useState({
    interviews: 0,
    avgScore: 0,
    latestResumeScore: 0, // match Firestore
    builderSessions: 0,
    scorerSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProgress = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const progressRef = doc(db, "users", user.uid);

      unsubscribeProgress = onSnapshot(progressRef, (snapshot) => {
        if (snapshot.exists()) {
          setProgress(snapshot.data());
        }
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProgress();
    };
  }, []);

  if (loading) return <p>Loading progress...</p>;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-2">📊 Your Progress</h2>
      <p>Interviews Taken: {progress.interviews}</p>
      <p>Average Score: {progress.avgScore?.toFixed(2) || "0.00"}</p>
      <p>Latest Resume Score: {progress.latestResumeScore?.toFixed(2) || "0.00"}</p>

      
    </div>
  );
}
