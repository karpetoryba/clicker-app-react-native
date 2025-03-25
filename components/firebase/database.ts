// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAm43dBvoqtsCsvP32rXIcI8LTzZMhxI3g",
  authDomain: "clicker-app-a7a15.firebaseapp.com",
  projectId: "clicker-app-a7a15",
  storageBucket: "clicker-app-a7a15.firebasestorage.app",
  messagingSenderId: "853470199341",
  appId: "1:853470199341:web:b1f08833b740d4b4a5c2a4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
