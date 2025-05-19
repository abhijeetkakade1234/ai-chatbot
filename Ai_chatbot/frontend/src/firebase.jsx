// src/firebase.jsx
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 




// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export auth and db for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);

