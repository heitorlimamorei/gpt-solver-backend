import dotenv from 'dotenv';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.APP_ID,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  storageBucket: process.env.storageBucket
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;