import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQZtUp8YgwEZWNU_RCsgF19PFr7njWOCw",
  authDomain: "mangoteamhoctuvung.firebaseapp.com",
  projectId: "mangoteamhoctuvung",
  storageBucket: "mangoteamhoctuvung.firebasestorage.app",
  messagingSenderId: "67729204338",
  appId: "1:67729204338:web:7161222f42214c06b60eeb",
  measurementId: "G-HN5NHGBNVH"
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
