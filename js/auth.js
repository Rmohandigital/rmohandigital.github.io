// ==========================================
// R MOHAN DIGITAL - LOGIN & ROLE SYSTEM
// ==========================================

import { auth, db } from "../firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

window.toggleLoginPassword = function () {

    const password =
        document.getElementById("loginPassword");

    const button =
        document.querySelector(".toggle-password");

    if (password.type === "password") {

        password.type = "text";
        button.textContent = "🙈";

    } else {

        password.type = "password";
        button.textContent = "👁";

    }

};


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail")
        .value
        .trim();

    const password =
        document.getElementById("loginPassword")
        .value;


    // ==========================================
    // CHECK EMPTY FIELDS
    // ==========================================

    if (email === "" || password === "") {

        loginMessage.style.color = "red";

        loginMessage.textContent =
            "Please enter email and password.";

        return;
    }


    // ==========================================
    // LOGIN MESSAGE
    // ==========================================

    loginMessage.style.color = "#2563eb";

    loginMessage.textContent =
        "Logging in...";


    try {

        // ==========================================
        // FIREBASE LOGIN
        // ==========================================

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "User logged in:",
            user.uid
        );


        // ==========================================
        // GET USER ROLE FROM FIRESTORE
        // ==========================================

        const userDocRef =
            doc(db, "users", user.uid);

        const userDoc =
            await getDoc(userDocRef);


        // ==========================================
        // USER DOCUMENT NOT FOUND
        // ==========================================

        if (!userDoc.exists()) {

            loginMessage.style.color = "red";

            loginMessage.textContent =
                "Account profile not found.";

            return;
        }


        // ==========================================
        // GET USER DATA
        // ==========================================

        const userData =
            userDoc.data();

        const role =
            userData.role;


        console.log(
            "User role:",
            role
        );


        // ==========================================
        // LOGIN SUCCESS
        // ==========================================

        loginMessage.style.color = "green";

        loginMessage.textContent =
            "Login successful!";


        // ==========================================
        // ROLE BASED REDIRECT
        // ==========================================

        setTimeout(() => {


            // --------------------------------------
            // FACULTY
            // --------------------------------------

            if (role === "faculty") {

                window.location.href =
                    "faculty.html";

            }


            // --------------------------------------
            // MENTOR / ADMIN
            // --------------------------------------

            else if (
                role === "mentor" ||
                role === "admin"
            ) {

                window.location.href =
                    "admin.html";

            }


            // --------------------------------------
            // STUDENT
            // --------------------------------------

            else if (role === "student") {

                window.location.href =
                    "dashboard.html";

            }


            // --------------------------------------
            // UNKNOWN ROLE
            // --------------------------------------

            else {

                loginMessage.style.color = "red";

                loginMessage.textContent =
                    "Your account role is not configured.";

            }

        }, 800);


    } catch (error) {

        console.error(
            "Firebase Login Error:",
            error
        );


        loginMessage.style.color = "red";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            loginMessage.textContent =
                "Incorrect email or password.";

        }

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            loginMessage.textContent =
                "Please enter a valid email address.";

        }

        else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            loginMessage.textContent =
                "Too many attempts. Please try again later.";

        }

        else {

            loginMessage.textContent =
                "Login failed. Please try again.";

        }

    }

});
