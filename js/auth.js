// ==========================================
// R MOHAN DIGITAL
// COMPLETE LOGIN & ROLE SYSTEM
// Owner / Mentor / Faculty / Student
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


            // ==================================
            // GET EMAIL
            // ==================================

            const emailInput =
                document.getElementById("loginEmail");


            // ==================================
            // GET PASSWORD
            // ==================================

            const passwordInput =
                document.getElementById("loginPassword");


            if (!emailInput || !passwordInput) {

                console.error(
                    "Login fields were not found."
                );

                return;
            }


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            // ==================================
            // EMPTY CHECK
            // ==================================

            if (!email || !password) {

                showMessage(
                    "Please enter email and password.",
                    "red"
                );

                return;
            }


            // ==================================
            // LOGIN MESSAGE
            // ==================================

            showMessage(
                "Logging in...",
                "#2563eb"
            );


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
                // GET FIRESTORE USER PROFILE
                // ==================================

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnapshot =
                    await getDoc(
                        userRef
                    );


                // ==================================
                // PROFILE NOT FOUND
                // ==================================

                if (!userSnapshot.exists()) {

                    showMessage(
                        "Your Firebase profile is not configured.",
                        "red"
                    );


                    console.error(
                        "No users document found for UID:",
                        user.uid
                    );


                    /*
                        IMPORTANT:
                        Sign out because the Firebase
                        Auth account exists but the
                        Firestore profile does not.
                    */

                    await auth.signOut();

                    return;
                }


                // ==================================
                // USER DATA
                // ==================================

                const userData =
                    userSnapshot.data();


                console.log(
                    "Firestore user data:",
                    userData
                );


                // ==================================
                // GET ROLE
                // ==================================

                const rawRole =
                    userData.role || "";


                // ==================================
                // NORMALIZE ROLE
                // ==================================

                const role =
                    String(rawRole)
                        .trim()
                        .toLowerCase();


                // ==================================
                // GET STATUS
                // ==================================

                const rawStatus =
                    userData.status || "";


                // ==================================
                // NORMALIZE STATUS
                // ==================================

                const status =
                    String(rawStatus)
                        .trim()
                        .toLowerCase();


                console.log(
                    "Original role:",
                    rawRole
                );


                console.log(
                    "Normalized role:",
                    role
                );


                console.log(
                    "Original status:",
                    rawStatus
                );


                console.log(
                    "Normalized status:",
                    status
                );


                // ==================================
                // ROLE CHECK
                // ==================================

                const validRoles = [

                    "owner",

                    "admin",

                    "mentor",

                    "faculty",

                    "student"

                ];


                if (
                    !validRoles.includes(role)
                ) {

                    showMessage(
                        "Your account role is not configured.",
                        "red"
                    );


                    console.error(
                        "Invalid role:",
                        rawRole
                    );


                    await auth.signOut();

                    return;
                }


                // ==================================
                // STATUS CHECK
                // ==================================

                if (status !== "active") {

                    // ==============================
                    // PENDING
                    // ==============================

                    if (
                        status === "pending"
                    ) {

                        showMessage(
                            "Your account is still pending approval.",
                            "red"
                        );

                    }


                    // ==============================
                    // REJECTED
                    // ==============================

                    else if (
                        status === "rejected"
                    ) {

                        showMessage(
                            "Your account has been rejected.",
                            "red"
                        );

                    }


                    // ==============================
                    // OTHER STATUS
                    // ==============================

                    else {

                        showMessage(
                            "Your account is not active.",
                            "red"
                        );

                    }


                    await auth.signOut();

                    return;
                }


                // ==================================
                // LOGIN SUCCESS
                // ==================================

                showMessage(
                    "Login successful!",
                    "green"
                );


                console.log(
                    "Login successful."
                );


                // ==================================
                // REDIRECT
                // ==================================

                setTimeout(
                    function () {


                        // ==========================
                        // OWNER
                        // ==========================

                        if (
                            role === "owner" ||
                            role === "admin"
                        ) {

                            window.location.href =
                                "admin-dashboard.html";

                            return;
                        }


                        // ==========================
                        // MENTOR
                        // ==========================

                        if (
                            role === "mentor"
                        ) {

                            window.location.href =
                                "mentor-dashboard.html";

                            return;
                        }


                        // ==========================
                        // FACULTY
                        // ==========================

                        if (
                            role === "faculty"
                        ) {

                            window.location.href =
                                "faculty-dashboard.html";

                            return;
                        }


                        // ==========================
                        // STUDENT
                        // ==========================

                        if (
                            role === "student"
                        ) {

                            window.location.href =
                                "dashboard.html";

                            return;
                        }


                        // ==========================
                        // UNKNOWN
                        // ==========================

                        showMessage(
                            "Unable to determine dashboard.",
                            "red"
                        );


                    },
                    700
                );


            }


            // ==================================
            // FIREBASE LOGIN ERROR
            // ==================================

            catch (error) {


                console.error(
                    "Login error:",
                    error
                );


                showMessage(
                    getLoginErrorMessage(
                        error
                    ),
                    "red"
                );

            }

        }
    );

}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    message,
    color
) {

    if (!loginMessage) {
        return;
    }


    loginMessage.style.color =
        color;


    loginMessage.textContent =
        message;

}


// ==========================================
// FIREBASE ERROR MESSAGES
// ==========================================

function getLoginErrorMessage(
    error
) {


    if (
        error.code ===
        "auth/invalid-credential"
    ) {

        return "Incorrect email or password.";

    }


    if (
        error.code ===
        "auth/invalid-email"
    ) {

        return "Please enter a valid email.";

    }


    if (
        error.code ===
        "auth/user-disabled"
    ) {

        return "This Firebase account has been disabled.";

    }


    if (
        error.code ===
        "auth/user-not-found"
    ) {

        return "Account not found.";

    }


    if (
        error.code ===
        "auth/wrong-password"
    ) {

        return "Incorrect password.";

    }


    if (
        error.code ===
        "auth/too-many-requests"
    ) {

        return "Too many login attempts. Please try again later.";

    }


    if (
        error.code ===
        "auth/network-request-failed"
    ) {

        return "Network error. Please check your internet connection.";

    }


    return (
        "Login failed. Please try again."
    );

}