import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Add debugging
console.log('Firebase config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '[SET]' : '[MISSING]',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '[SET]' : '[MISSING]',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? '[SET]' : '[MISSING]',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '[SET]' : '[MISSING]',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '[SET]' : '[MISSING]',
  appId: process.env.REACT_APP_FIREBASE_APP_ID ? '[SET]' : '[MISSING]'
});

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;