// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

// Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

// Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// Storage
import { getStorage } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDarA4FEnJ0Sg7cDxf8uPglDmrfZ6lgJ9I",
  authDomain: "r-mohan-digital-e4e4b.firebaseapp.com",
  projectId: "r-mohan-digital-e4e4b",
  storageBucket: "r-mohan-digital-e4e4b.firebasestorage.app",
  messagingSenderId: "56539770062",
  appId: "1:56539770062:web:0c815083264f74a189349f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
