// R MOHAN DIGITAL - FIREBASE CONNECTION

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyDarA4FEnJ0Sg7cDxf8uPglDmrfZlg9J9I",

    authDomain: "r-mohan-digital-e4e4b.firebaseapp.com",

    projectId: "r-mohan-digital-e4e4b",

    storageBucket: "r-mohan-digital-e4e4b.firebasestorage.app",

    messagingSenderId: "56539770062",

    appId: "1:56539770062:web:0c815083264f74a189349f"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


export {
    app,
    auth,
    db,
    storage
};
