// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCI3Ffh1fxJ5OXf37MMX8X4-TUtEsXqj58",
  authDomain: "konnekt-13a67.firebaseapp.com",
  projectId: "konnekt-13a67",
  storageBucket: "konnekt-13a67.firebasestorage.app",
  messagingSenderId: "156596738895",
  appId: "1:156596738895:web:45690cfbbe8fc68ef4433a",
  measurementId: "G-J96ZLP1F88"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

