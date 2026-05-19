import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB89t_hUV6RMv0DuHyZociVaE05WU1bALs",
  authDomain: "mangoteamapphoctap.firebaseapp.com",
  projectId: "mangoteamapphoctap",
  storageBucket: "mangoteamapphoctap.firebasestorage.app",
  messagingSenderId: "334124494064",
  appId: "1:334124494064:web:316db0c3880ffd5f3da635",
  measurementId: "G-BE2K559WMF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence not enabled');
  } else if (err.code === 'unimplemented') {
    console.log('Browser does not support persistence');
  }
});

export default app;
export { db };
