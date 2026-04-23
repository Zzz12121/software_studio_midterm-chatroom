import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEjgpt4WZi-90Y_ITRNPzFIQJ07z5Km3U",
  authDomain: "ss-mid-3bd1d.firebaseapp.com",
  projectId: "ss-mid-3bd1d",
  storageBucket: "ss-mid-3bd1d.firebasestorage.app",
  messagingSenderId: "459254455765",
  appId: "1:459254455765:web:80982b52c0ebc43742b15c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);