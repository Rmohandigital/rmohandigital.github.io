// ============================================================
// R MOHAN DIGITAL
// TEAM LOGIN AUTHENTICATION
// File: js/admin-auth.js
//
// Used ONLY by admin.html
//
// Roles:
//   Owner
//   Mentor
//   Editor
//   Faculty
//
// NO STUDENT PUZZLE CODE IN THIS FILE.
// ============================================================

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ============================================================
// DOM
// ============================================================

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const roleButtons =
    document.querySelectorAll(".role-btn");

const togglePassword =
    document.getElementById("toggleLoginPassword");


// ============================================================
// CURRENT ROLE
// ============================================================

let selectedRole = null;


// ============================================================
// MESSAGE
// ============================================================

function showMessage(message, type = "error") {

    if (!loginMessage) return;

    loginMessage.textContent = message;

    if (type === "success") {

        loginMessage.style.color = "#22c55e";

    } else if (type === "info") {

        loginMessage.style.color = "#38bdf8";

    } else {

        loginMessage.style.color = "#f87171";

    }
}


// ============================================================
// ROLE SELECTION
// ============================================================

roleButtons.forEach(button => {

    button.addEventListener("click", function () {

        // Remove previous selection
        roleButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        // Select clicked button
        this.classList.add("selected");

        // Save selected role
        selectedRole =
            this.getAttribute("data-role");

        console.log(
            "Selected Team Role:",
            selectedRole
        );

        showMessage("", "info");

    });

});


// ============================================================
// PASSWORD SHOW / HIDE
// ============================================================

if (togglePassword && loginPassword) {

    togglePassword.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        if (loginPassword.type === "password") {

            loginPassword.type = "text";

            togglePassword.textContent = "🙈";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

            togglePassword.setAttribute(
                "title",
                "Hide password"
            );

        } else {

            loginPassword.type = "password";

            togglePassword.textContent = "👁";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

            togglePassword.setAttribute(
                "title",
                "Show password"
            );

        }

    });

}


// ============================================================
// ROLE NORMALIZATION
// ============================================================

function normalizeRole(role) {

    if (!role) return "";

    return String(role)
        .trim()
        .toLowerCase();

}


// ============================================================
// ROLE NAME FOR DISPLAY
// ============================================================

function roleDisplayName(role) {

    const normalized =
        normalizeRole(role);

    switch (normalized) {

        case "admin":
        case "owner":
            return "Owner";

        case "mentor":
            return "Mentor";

        case "editor":
            return "Editor";

        case "faculty":
            return "Faculty";

        default:
            return "Team Member";
    }

}


// ============================================================
// CHECK WHETHER FIREBASE ROLE MATCHES SELECTED ROLE
// ============================================================

function roleMatches(selected, firebaseRole) {

    const a =
        normalizeRole(selected);

    const b =
        normalizeRole(firebaseRole);


    // Owner can be stored as owner OR admin
    if (a === "admin") {

        return b === "admin" ||
               b === "owner";

    }


    // Normal roles
    return a === b;

}


// ============================================================
// DASHBOARD REDIRECT
// ============================================================

function redirectUser(role) {

    const normalized =
        normalizeRole(role);


    // OWNER
    if (
        normalized === "owner" ||
        normalized === "admin"
    ) {

        window.location.href =
            "admin-dashboard.html";

        return;
    }


    // MENTOR
    if (normalized === "mentor") {

        window.location.href =
            "mentor-dashboard.html";

        return;
    }


    // FACULTY
    if (normalized === "faculty") {

        window.location.href =
            "faculty-dashboard.html";

        return;
    }


    // EDITOR
    if (normalized === "editor") {

        window.location.href =
            "editor-dashboard.html";

        return;
    }


    showMessage(
        "Dashboard is not configured for this role."
    );

}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function firebaseErrorMessage(error) {

    if (!error) {

        return "Login failed.";

    }


    switch (error.code) {

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/invalid-login-credentials":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "Account not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-disabled":
            return "This account has been disabled.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        default:
            return error.message ||
                   "Unable to login.";
    }

}


// ============================================================
// LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // ----------------------------------------------------
        // CHECK ROLE
        // ----------------------------------------------------

        if (!selectedRole) {

            showMessage(
                "Please select Mentor, Owner, Editor or Faculty first."
            );

            return;
        }


        // ----------------------------------------------------
        // GET INPUT
        // ----------------------------------------------------

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        // ----------------------------------------------------
        // VALIDATE
        // ----------------------------------------------------

        if (!email) {

            showMessage(
                "Please enter your email address."
            );

            loginEmail.focus();

            return;
        }


        if (!password) {

            showMessage(
                "Please enter your password."
            );

            loginPassword.focus();

            return;
        }


        // ----------------------------------------------------
        // DISABLE BUTTON
        // ----------------------------------------------------

        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";

        showMessage(
            "Checking your account...",
            "info"
        );


        try {

            // ------------------------------------------------
            // FIREBASE LOGIN
            // ------------------------------------------------

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            console.log(
                "Firebase login successful:",
                user.uid
            );


            // ------------------------------------------------
            // LOAD USER PROFILE
            // ------------------------------------------------

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnap =
                await getDoc(userRef);


            if (!userSnap.exists()) {

                await signOut(auth);

                showMessage(
                    "Profile not found. Please contact the Owner."
                );

                return;
            }


            const userData =
                userSnap.data();


            console.log(
                "Firebase user profile:",
                userData
            );


            // ------------------------------------------------
            // GET ROLE
            // ------------------------------------------------

            const firebaseRole =
                normalizeRole(
                    userData.role
                );


            // ------------------------------------------------
            // CHECK ROLE
            // ------------------------------------------------

            if (
                !roleMatches(
                    selectedRole,
                    firebaseRole
                )
            ) {

                await signOut(auth);

                showMessage(
                    "This account is not registered as " +
                    roleDisplayName(selectedRole) +
                    "."
                );

                return;
            }


            // ------------------------------------------------
            // CHECK STATUS
            // ------------------------------------------------

            const status =
                normalizeRole(
                    userData.status
                );


            const active =
                userData.active === true;


            // ------------------------------------------------
            // OWNER
            // ------------------------------------------------

            if (
                firebaseRole === "owner" ||
                firebaseRole === "admin"
            ) {

                showMessage(
                    "Owner login successful.",
                    "success"
                );

                setTimeout(() => {

                    redirectUser(
                        firebaseRole
                    );

                }, 400);

                return;
            }


            // ------------------------------------------------
            // MENTOR
            // ------------------------------------------------

            if (firebaseRole === "mentor") {

                if (
                    status !== "active" &&
                    !active
                ) {

                    await signOut(auth);

                    showMessage(
                        "Your mentor account is not active."
                    );

                    return;
                }


                showMessage(
                    "Mentor login successful.",
                    "success"
                );

                setTimeout(() => {

                    redirectUser(
                        firebaseRole
                    );

                }, 400);

                return;
            }


            // ------------------------------------------------
            // FACULTY
            // ------------------------------------------------

            if (firebaseRole === "faculty") {

                if (
                    status !== "active" &&
                    status !== "approved" &&
                    !active
                ) {

                    await signOut(auth);

                    showMessage(
                        "Your faculty account is not active."
                    );

                    return;
                }


                showMessage(
                    "Faculty login successful.",
                    "success"
                );

                setTimeout(() => {

                    redirectUser(
                        firebaseRole
                    );

                }, 400);

                return;
            }


            // ------------------------------------------------
            // EDITOR
            // ------------------------------------------------

            if (firebaseRole === "editor") {

                if (
                    status !== "active" &&
                    status !== "approved" &&
                    !active
                ) {

                    await signOut(auth);

                    showMessage(
                        "Your editor account is not active."
                    );

                    return;
                }


                showMessage(
                    "Editor login successful.",
                    "success"
                );

                setTimeout(() => {

                    redirectUser(
                        firebaseRole
                    );

                }, 400);

                return;
            }


            // ------------------------------------------------
            // UNKNOWN ROLE
            // ------------------------------------------------

            await signOut(auth);

            showMessage(
                "Your account role is not configured."
            );


        } catch (error) {

            console.error(
                "Team login error:",
                error
            );

            showMessage(
                firebaseErrorMessage(error)
            );

        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";

        }

    });

}


// ============================================================
// INITIAL STATE
// ============================================================

console.log(
    "R Mohan Digital Team Login loaded successfully."
);

console.log(
    "Student puzzle is NOT loaded on admin.html."
);
