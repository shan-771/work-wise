// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ Import authentication
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBh0tq-5fLtqfr31pWJj-ZRogX5IfzXZDQ",
  authDomain: "work-wise771.firebaseapp.com",
  projectId: "work-wise771",
  storageBucket: "work-wise771.appspot.com", // ✅ Fixed storageBucket
  messagingSenderId: "398512412946",
  appId: "1:398512412946:web:6a8ad1015715a845dcfbcb",
  measurementId: "G-BGTTCK3WGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ Initialize authentication
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, auth }; // Make sure both are exported