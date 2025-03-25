// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKkaKUK28WXwnxdl6i6-Gwa3IZDeAjshE",
  authDomain: "clicker-66580.firebaseapp.com",
  projectId: "clicker-66580",
  storageBucket: "clicker-66580.firebasestorage.app",
  messagingSenderId: "77556637399",
  appId: "1:77556637399:web:dad902f6f4b4378a239a92",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
