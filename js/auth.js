// ==========================================
// R MOHAN DIGITAL - LOGIN & ROLE SYSTEM
// ==========================================

// firebase.js is one folder above auth.js
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

    if (!password || !button) {
        return;
    }

    if (password.type === "password") {

        password.type = "text";
        button.textContent = "🙈";

    } else {

        password.type = "password";
        button.textContent = "👁";

    }

};


// ==========================================
// GET LOGIN FORM
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


// ==========================================
// CHECK LOGIN FORM
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // ==========================================
        // GET EMAIL & PASSWORD
        // ==========================================

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
            // FIREBASE AUTHENTICATION
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
            // GET USER PROFILE FROM FIRESTORE
            // ==========================================

            const userDocRef =
                doc(db, "users", user.uid);

            const userDoc =
                await getDoc(userDocRef);


            // ==========================================
            // CHECK USER DOCUMENT
            // ==========================================

            if (!userDoc.exists()) {

                loginMessage.style.color = "red";

                loginMessage.textContent =
                    "Account profile not found. Please contact the administrator.";

                return;
            }


            // ==========================================
            // GET USER DATA
            // ==========================================

            const userData =
                userDoc.data();

            const role =
                userData.role;

            const status =
                userData.status;


            console.log(
                "User role:",
                role
            );

            console.log(
                "User status:",
                status
            );


            // ==========================================
            // CHECK ACCOUNT STATUS
            // ==========================================

            if (
                status &&
                status !== "active"
            ) {

                loginMessage.style.color = "red";

                loginMessage.textContent =
                    "Your account is not active. Please contact the administrator.";

                return;
            }


            // ==========================================
            // LOGIN SUCCESS
            // ==========================================

            loginMessage.style.color = "green";

            loginMessage.textContent =
                "Login successful!";


            // ==========================================
            // ROLE-BASED REDIRECT
            // ==========================================

            setTimeout(() => {


                // ======================================
                // FACULTY
                // ======================================

                if (role === "faculty") {

                    window.location.href =
                        "faculty.html";

                }


                // ======================================
                // MENTOR
                // ======================================

                else if (role === "mentor") {

                    window.location.href =
                        "admin.html";

                }


                // ======================================
                // ADMIN
                // ======================================

                else if (role === "admin") {

                    window.location.href =
                        "admin.html";

                }


                // ======================================
                // STUDENT
                // ======================================

                else if (role === "student") {

                    window.location.href =
                        "dashboard.html";

                }


                // ======================================
                // UNKNOWN ROLE
                // ======================================

                else {

                    loginMessage.style.color = "red";

                    loginMessage.textContent =
                        "Your account role is not configured.";

                    console.error(
                        "Unknown role:",
                        role
                    );

                }

            }, 800);


        } catch (error) {

            // ==========================================
            // FIREBASE LOGIN ERROR
            // ==========================================

            console.error(
                "Firebase Login Error:",
                error
            );


            loginMessage.style.color = "red";


            // ==========================================
            // INVALID LOGIN
            // ==========================================

            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                loginMessage.textContent =
                    "Incorrect email or password.";

            }


            // ==========================================
            // INVALID EMAIL
            // ==========================================

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                loginMessage.textContent =
                    "Please enter a valid email address.";

            }


            // ==========================================
            // TOO MANY REQUESTS
            // ==========================================

            else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                loginMessage.textContent =
                    "Too many attempts. Please try again later.";

            }


            // ==========================================
            // PERMISSION ERROR
            // ==========================================

            else if (
                error.code ===
                "permission-denied"
            ) {

                loginMessage.textContent =
                    "Permission denied. Please contact the administrator.";

            }


            // ==========================================
            // OTHER ERROR
            // ==========================================

            else {

                loginMessage.textContent =
                    "Login failed. Please try again.";

            }

        }

    });

}
