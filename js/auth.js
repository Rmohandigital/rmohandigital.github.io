// ==========================================
// R MOHAN DIGITAL
// COMPLETE LOGIN & ROLE SYSTEM
// Owner + Mentor + Faculty + Student
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


            const emailInput =
                document.getElementById("loginEmail");

            const passwordInput =
                document.getElementById("loginPassword");


            if (!emailInput || !passwordInput) {

                console.error(
                    "Login input elements not found."
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

                loginMessage.style.color =
                    "red";

                loginMessage.textContent =
                    "Please enter email and password.";

                return;
            }


            loginMessage.style.color =
                "#2563eb";

            loginMessage.textContent =
                "Logging in...";


            try {

                // ==================================
                // FIREBASE AUTH
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


                console.log(
                    "Firebase Email:",
                    user.email
                );


                // ==================================
                // GET FIRESTORE PROFILE
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

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "Your Firebase profile is not found.";

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


                console.log(
                    "Firebase User Profile:",
                    userData
                );


                // ==================================
                // GET ROLE
                // ==================================

                const rawRole =
                    userData.role;


                const role =
                    String(
                        rawRole || ""
                    )
                    .trim()
                    .toLowerCase();


                // ==================================
                // GET STATUS
                // ==================================

                const rawStatus =
                    userData.status;


                const status =
                    String(
                        rawStatus || ""
                    )
                    .trim()
                    .toLowerCase();


                console.log(
                    "Role:",
                    role
                );


                console.log(
                    "Status:",
                    status
                );


                // ==================================
                // ROLE NOT FOUND
                // ==================================

                if (!role) {

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "Your account role is not configured.";

                    console.error(
                        "Role missing in Firestore:",
                        userData
                    );

                    return;
                }


                // ==================================
                // STATUS CHECK
                // Accepts:
                // Active
                // active
                // ==================================

                if (status !== "active") {

                    loginMessage.style.color =
                        "red";

                    if (status === "pending") {

                        loginMessage.textContent =
                            "Your account is still pending approval.";

                    }

                    else if (status === "rejected") {

                        loginMessage.textContent =
                            "Your account has been rejected.";

                    }

                    else {

                        loginMessage.textContent =
                            "Your account is not active.";

                    }

                    return;
                }


                // ==================================
                // SUCCESS
                // ==================================

                loginMessage.style.color =
                    "green";

                loginMessage.textContent =
                    "Login successful!";


                // ==================================
                // ROLE REDIRECTION
                // ==================================

                setTimeout(
                    function () {


                        // ==========================
                        // OWNER
                        // role:
                        // owner / Owner / admin
                        // ==========================

                        if (
                            role === "owner" ||
                            role === "admin"
                        ) {

                            console.log(
                                "Opening Owner Dashboard"
                            );

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

                            console.log(
                                "Opening Mentor Dashboard"
                            );

                            window.location.href =
                                "mentor-dashboard.html";

                            return;
                        }


                        // ==========================
                        // FACULTY
                        //
                        // Harsha
                        // Jyoshna
                        // Jaswanth
                        //
                        // ALL use the same
                        // faculty-dashboard.html
                        // ==========================

                        if (
                            role === "faculty"
                        ) {

                            console.log(
                                "Opening Faculty Dashboard"
                            );

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

                            console.log(
                                "Opening Student Dashboard"
                            );

                            window.location.href =
                                "dashboard.html";

                            return;
                        }


                        // ==========================
                        // UNKNOWN ROLE
                        // ==========================

                        loginMessage.style.color =
                            "red";

                        loginMessage.textContent =
                            "Your account role is not configured.";

                        console.error(
                            "Unknown role:",
                            rawRole
                        );


                    },
                    500
                );


            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.style.color =
                    "red";


                // ==================================
                // FIREBASE ERRORS
                // ==================================

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
                    "auth/user-not-found"
                ) {

                    loginMessage.textContent =
                        "No account found with this email.";

                }

                else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    loginMessage.textContent =
                        "Incorrect password.";

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