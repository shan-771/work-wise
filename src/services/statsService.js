import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';

// Get user stats
export const getUserStats = async (userId) => {
  try {
    const statsRef = doc(db, "userStats", userId);
    const statsSnap = await getDoc(statsRef);
    return statsSnap.exists() ? statsSnap.data() : null;
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
};

// Initialize user stats (call when new user registers)
export const initializeUserStats = async (userId) => {
  try {
    const statsRef = doc(db, "userStats", userId);
    await setDoc(statsRef, {
      completedInterviews: 0,
      resumeScore: 0,
      recommendedJobs: 0,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error initializing user stats:", error);
  }
};

// Update specific stat
export const updateStat = async (userId, statName, value) => {
  try {
    const statsRef = doc(db, "userStats", userId);
    await updateDoc(statsRef, {
      [statName]: value,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
};

// Increment a stat (for interviews completed, etc.)
export const incrementStat = async (userId, statName) => {
  try {
    const statsRef = doc(db, "userStats", userId);
    await updateDoc(statsRef, {
      [statName]: increment(1),
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error incrementing user stat:", error);
  }
};