// ==========================================
// R MOHAN DIGITAL
// LOGIN & ROLE SYSTEM
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
// PASSWORD SHOW / HIDE
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
// LOGIN FORM
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            // ==================================
            // EMPTY CHECK
            // ==================================

            if (!email || !password) {

                loginMessage.style.color = "red";

                loginMessage.textContent =
                    "Please enter email and password.";

                return;
            }


            loginMessage.style.color = "#2563eb";

            loginMessage.textContent =
                "Logging in...";


            try {

                // ==================================
                // FIREBASE AUTH LOGIN
                // ==================================

                const result =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    result.user;


                console.log(
                    "Firebase UID:",
                    user.uid
                );


                // ==================================
                // GET USER PROFILE
                // ==================================

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnapshot =
                    await getDoc(userRef);


                // ==================================
                // PROFILE NOT FOUND
                // ==================================

                if (!userSnapshot.exists()) {

                    loginMessage.style.color = "red";

                    loginMessage.textContent =
                        "Your account profile is not configured yet.";

                    console.error(
                        "No users document found for UID:",
                        user.uid
                    );

                    return;
                }


                // ==================================
                // USER DATA
                // ==================================

                const userData =
                    userSnapshot.data();


                const role =
                    userData.role;

                const status =
                    userData.status;


                console.log(
                    "User:",
                    userData
                );


                // ==================================
                // CHECK STATUS
                // ==================================

                if (status !== "active") {

                    loginMessage.style.color = "red";

                    loginMessage.textContent =
                        "Your account is not active.";

                    return;
                }


                // ==================================
                // SUCCESS
                // ==================================

                loginMessage.style.color = "green";

                loginMessage.textContent =
                    "Login successful!";


                // ==================================
                // ROLE REDIRECTION
                // ==================================

                setTimeout(function () {


                    // ==============================
                    // FACULTY
                    // ==============================

                    if (role === "faculty") {

                        window.location.href =
                            "faculty-dashboard.html";

                        return;
                    }


                    // ==============================
                    // ADMIN
                    // ==============================

                    if (role === "admin") {

                        window.location.href =
                            "admin-dashboard.html";

                        return;
                    }


                    // ==============================
                    // MENTOR
                    // ==============================

                    if (role === "mentor") {

                        window.location.href =
                            "admin-dashboard.html";

                        return;
                    }


                    // ==============================
                    // STUDENT
                    // ==============================

                    if (role === "student") {

                        window.location.href =
                            "dashboard.html";

                        return;
                    }


                    // ==============================
                    // UNKNOWN ROLE
                    // ==============================

                    loginMessage.style.color = "red";

                    loginMessage.textContent =
                        "Your account role is not configured.";

                }, 700);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.style.color =
                    "red";


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
                        "Please enter a valid email.";

                }

                else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    loginMessage.textContent =
                        "Too many attempts. Try again later.";

                }

                else {

                    loginMessage.textContent =
                        "Login failed. Please try again.";

                }

            }

        }
    );

}