// ============================================================
// R MOHAN DIGITAL
// STUDENT LOGIN AUTHENTICATION
// File: js/auth.js
//
// Used ONLY by login.html
//
// Student login:
// Student ID + Password + Puzzle
//
// DO NOT USE THIS FILE IN admin.html
// ============================================================

import {
    signInWithEmailAndPassword
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

const togglePassword =
    document.getElementById("togglePassword");

const puzzleGrid =
    document.getElementById("puzzleGrid");

const targetNumber =
    document.getElementById("targetNumber");

const puzzleStatus =
    document.getElementById("puzzleStatus");


// ============================================================
// STUDENT ID FROM REGISTRATION
// ============================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const studentIdFromURL =
    urlParams.get("studentId");


console.log(
    "Student ID received from registration:",
    studentIdFromURL
);


// ============================================================
// STUDENT ID VALIDATION
// ============================================================

function validStudentId(studentId) {

    return /^SM\d{8}$/.test(
        studentId
    );

}


// ============================================================
// AUTO FILL STUDENT ID
// ============================================================

if (
    studentIdFromURL &&
    validStudentId(studentIdFromURL)
) {

    loginEmail.value =
        studentIdFromURL.toUpperCase();

    loginEmail.readOnly = true;

    loginEmail.style.opacity = "0.85";

}


// ============================================================
// PASSWORD SHOW / HIDE
// ============================================================

if (
    togglePassword &&
    loginPassword
) {

    togglePassword.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                loginPassword.type =
                    "password";

                togglePassword.textContent =
                    "👁";

                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


// ============================================================
// PUZZLE
// ============================================================

let puzzleSolved = false;

let puzzleTarget = null;


// ============================================================
// RANDOM NUMBER
// ============================================================

function randomNumber() {

    return Math.floor(
        Math.random() * 9
    ) + 1;

}


// ============================================================
// CREATE PUZZLE
// ============================================================

function createPuzzle() {

    if (!puzzleGrid) return;


    puzzleSolved = false;

    puzzleTarget =
        randomNumber();


    if (targetNumber) {

        targetNumber.textContent =
            puzzleTarget;

    }


    if (puzzleStatus) {

        puzzleStatus.textContent =
            "Select the correct number.";

        puzzleStatus.style.color =
            "#94a3b8";

    }


    if (loginButton) {

        loginButton.disabled =
            true;

    }


    puzzleGrid.innerHTML = "";


    const numbers = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
    ];


    // Shuffle numbers

    numbers.sort(
        () => Math.random() - 0.5
    );


    numbers.forEach(number => {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.textContent =
            number;

        button.className =
            "puzzle-number";


        button.addEventListener(
            "click",
            function () {

                // Correct
                if (
                    number ===
                    puzzleTarget
                ) {

                    puzzleSolved =
                        true;

                    puzzleStatus.textContent =
                        "✓ Puzzle completed!";

                    puzzleStatus.style.color =
                        "#22c55e";


                    // Highlight correct
                    button.style.borderColor =
                        "#22c55e";

                    button.style.color =
                        "#22c55e";


                    if (loginButton) {

                        loginButton.disabled =
                            false;

                    }

                    return;
                }


                // Wrong
                puzzleStatus.textContent =
                    "✕ Wrong number. Try again.";

                puzzleStatus.style.color =
                    "#f87171";

            }
        );


        puzzleGrid.appendChild(
            button
        );

    });

}


// ============================================================
// START PUZZLE
// ============================================================

createPuzzle();


// ============================================================
// LOGIN MESSAGE
// ============================================================

function showMessage(
    message,
    type = "error"
) {

    if (!loginMessage) return;


    loginMessage.textContent =
        message;


    if (type === "success") {

        loginMessage.style.color =
            "#22c55e";

    } else if (type === "info") {

        loginMessage.style.color =
            "#38bdf8";

    } else {

        loginMessage.style.color =
            "#f87171";

    }

}


// ============================================================
// STUDENT INTERNAL FIREBASE EMAIL
// ============================================================

function createStudentFirebaseEmail(
    studentId
) {

    return (
        studentId
            .toLowerCase()
            .trim()
        +
        "@student.rmdigital.local"
    );

}


// ============================================================
// FIREBASE ERROR
// ============================================================

function firebaseErrorMessage(error) {

    if (!error) {

        return "Login failed.";

    }


    switch (error.code) {

        case "auth/invalid-credential":
            return "Incorrect Student ID or password.";

        case "auth/invalid-login-credentials":
            return "Incorrect Student ID or password.";

        case "auth/user-not-found":
            return "Student account not found.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Invalid Student ID.";

        case "auth/user-disabled":
            return "This student account has been disabled.";

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
// STUDENT LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // PUZZLE CHECK
            // ------------------------------------------------

            if (!puzzleSolved) {

                showMessage(
                    "Please complete the puzzle first."
                );

                return;
            }


            // ------------------------------------------------
            // STUDENT ID
            // ------------------------------------------------

            const studentId =
                loginEmail.value
                    .trim()
                    .toUpperCase();


            // ------------------------------------------------
            // PASSWORD
            // ------------------------------------------------

            const password =
                loginPassword.value;


            // ------------------------------------------------
            // VALIDATE STUDENT ID
            // ------------------------------------------------

            if (
                !validStudentId(
                    studentId
                )
            ) {

                showMessage(
                    "Enter a valid Student ID."
                );

                loginEmail.focus();

                return;
            }


            // ------------------------------------------------
            // PASSWORD
            // ------------------------------------------------

            if (!password) {

                showMessage(
                    "Please enter your password."
                );

                loginPassword.focus();

                return;
            }


            // ------------------------------------------------
            // DISABLE
            // ------------------------------------------------

            loginButton.disabled =
                true;

            loginButton.textContent =
                "Signing in...";


            showMessage(
                "Checking student account...",
                "info"
            );


            try {

                // --------------------------------------------
                // CREATE INTERNAL EMAIL
                // --------------------------------------------

                const firebaseEmail =
                    createStudentFirebaseEmail(
                        studentId
                    );


                // --------------------------------------------
                // FIREBASE LOGIN
                // --------------------------------------------

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        firebaseEmail,
                        password
                    );


                const user =
                    credential.user;


                console.log(
                    "Student Firebase login:",
                    user.uid
                );


                // --------------------------------------------
                // LOAD USER PROFILE
                // --------------------------------------------

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnap =
                    await getDoc(
                        userRef
                    );


                if (!userSnap.exists()) {

                    await auth.signOut();

                    showMessage(
                        "Student profile not found."
                    );

                    return;
                }


                const userData =
                    userSnap.data();


                // --------------------------------------------
                // CHECK ROLE
                // --------------------------------------------

                const role =
                    String(
                        userData.role || ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    role !== "student"
                ) {

                    await auth.signOut();

                    showMessage(
                        "This account is not a student account."
                    );

                    return;
                }


                // --------------------------------------------
                // STATUS
                // --------------------------------------------

                const status =
                    String(
                        userData.status || ""
                    )
                        .trim()
                        .toLowerCase();


                // --------------------------------------------
                // REJECTED
                // --------------------------------------------

                if (
                    status === "rejected"
                ) {

                    await auth.signOut();

                    showMessage(
                        "Your registration was rejected."
                    );

                    return;
                }


                // --------------------------------------------
                // PENDING
                // --------------------------------------------

                if (
                    status === "pending"
                ) {

                    await auth.signOut();

                    showMessage(
                        "Your registration is still waiting for approval."
                    );

                    return;
                }


                // --------------------------------------------
                // APPROVED / ACTIVE
                // --------------------------------------------

                if (
                    status === "approved" ||
                    status === "active"
                ) {

                    showMessage(
                        "Login successful. Opening dashboard...",
                        "success"
                    );


                    setTimeout(
                        function () {

                            window.location.href =
                                "student-dashboard.html";

                        },
                        500
                    );

                    return;
                }


                // --------------------------------------------
                // UNKNOWN STATUS
                // --------------------------------------------

                await auth.signOut();

                showMessage(
                    "Your student account status is not configured."
                );


            } catch (error) {

                console.error(
                    "Student login error:",
                    error
                );


                showMessage(
                    firebaseErrorMessage(
                        error
                    )
                );

            } finally {

                loginButton.disabled =
                    !puzzleSolved;

                loginButton.textContent =
                    "Login";

            }

        }
    );

}


console.log(
    "R Mohan Digital Student Login loaded successfully."
);

console.log(
    "Student puzzle is active only on login.html."
);
