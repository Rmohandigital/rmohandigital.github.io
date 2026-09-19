// ============================================================
// R MOHAN DIGITAL
// STUDENT LOGIN AUTHENTICATION
// File: js/auth.js
//
// Student login:
// Student ID + Password + Puzzle
//
// PERSISTENT LOGIN:
// Student stays logged in until Logout.
// Closing/reopening the website or Android app does not
// automatically sign the student out.
//
// DO NOT USE THIS FILE IN admin.html
// ============================================================


/* ============================================================
   FIREBASE AUTH
============================================================ */

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


/* ============================================================
   FIRESTORE
============================================================ */

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* ============================================================
   YOUR FIREBASE FILE
   auth.js is inside /js/
   firebase.js is also inside /js/
============================================================ */

import {
    auth,
    db
} from "./firebase.js";



/* ============================================================
   VARIABLES
============================================================ */

let puzzleSolved = false;

let puzzleTarget = null;

let persistenceReady = false;


/* ============================================================
   PERSISTENT LOGIN STORAGE KEY
============================================================ */

const LAST_DASHBOARD_KEY =
    "rmd_student_last_dashboard";



/* ============================================================
   DOM
============================================================ */

const loginForm =
    document.getElementById(
        "loginForm"
    );


const loginEmail =
    document.getElementById(
        "loginEmail"
    );


const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


const togglePassword =
    document.getElementById(
        "togglePassword"
    );


const puzzleGrid =
    document.getElementById(
        "puzzleGrid"
    );


const targetNumber =
    document.getElementById(
        "targetNumber"
    );


const puzzleStatus =
    document.getElementById(
        "puzzleStatus"
    );



/* ============================================================
   SAVE LAST DASHBOARD
============================================================ */

function saveLastDashboard() {

    try {

        localStorage.setItem(
            LAST_DASHBOARD_KEY,
            "student-dashboard.html"
        );

    }

    catch (error) {

        console.warn(
            "Could not save dashboard state:",
            error
        );

    }

}



/* ============================================================
   CLEAR LAST DASHBOARD
============================================================ */

function clearLastDashboard() {

    try {

        localStorage.removeItem(
            LAST_DASHBOARD_KEY
        );

    }

    catch (error) {

        console.warn(
            "Could not clear dashboard state:",
            error
        );

    }

}



/* ============================================================
   GET LAST DASHBOARD
============================================================ */

function getLastDashboard() {

    try {

        return localStorage.getItem(
            LAST_DASHBOARD_KEY
        );

    }

    catch {

        return null;

    }

}



/* ============================================================
   STUDENT ID FROM REGISTRATION
============================================================ */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const studentIdFromURL =
    urlParams.get(
        "studentId"
    );


console.log(
    "Student ID received from registration:",
    studentIdFromURL
);



/* ============================================================
   STUDENT ID VALIDATION
============================================================ */

function validStudentId(
    studentId
) {

    return /^SM\d{8}$/.test(
        studentId
    );

}



/* ============================================================
   AUTO FILL STUDENT ID
============================================================ */

if (
    studentIdFromURL &&
    validStudentId(
        studentIdFromURL
    )
) {

    if (loginEmail) {

        loginEmail.value =
            studentIdFromURL.toUpperCase();

        loginEmail.readOnly =
            true;

        loginEmail.style.opacity =
            "0.85";

    }

}



/* ============================================================
   PASSWORD SHOW / HIDE
============================================================ */

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

            }

            else {

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



/* ============================================================
   PUZZLE RANDOM NUMBER
============================================================ */

function randomNumber() {

    return Math.floor(
        Math.random() * 9
    ) + 1;

}



/* ============================================================
   CREATE PUZZLE
============================================================ */

function createPuzzle() {

    if (!puzzleGrid) {

        return;

    }


    puzzleSolved =
        false;


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


    puzzleGrid.innerHTML =
        "";


    const numbers = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
    ];


    /* Shuffle */

    numbers.sort(
        () =>
            Math.random() -
            0.5
    );


    numbers.forEach(
        number => {

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

                    /* ========================================
                       CORRECT NUMBER
                    ======================================== */

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


                    /* ========================================
                       WRONG NUMBER
                    ======================================== */

                    puzzleStatus.textContent =
                        "✕ Wrong number. Try again.";


                    puzzleStatus.style.color =
                        "#f87171";

                }
            );


            puzzleGrid.appendChild(
                button
            );

        }
    );

}



/* ============================================================
   START PUZZLE
============================================================ */

createPuzzle();



/* ============================================================
   LOGIN MESSAGE
============================================================ */

function showMessage(
    message,
    type = "error"
) {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        message;


    if (
        type === "success"
    ) {

        loginMessage.style.color =
            "#22c55e";

    }

    else if (
        type === "info"
    ) {

        loginMessage.style.color =
            "#38bdf8";

    }

    else {

        loginMessage.style.color =
            "#f87171";

    }

}



/* ============================================================
   STUDENT INTERNAL FIREBASE EMAIL
============================================================ */

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



/* ============================================================
   FIREBASE ERROR
============================================================ */

function firebaseErrorMessage(
    error
) {

    if (!error) {

        return "Login failed.";

    }


    switch (
        error.code
    ) {

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

            return (
                error.message ||
                "Unable to login."
            );

    }

}



/* ============================================================
   ENABLE LOCAL FIREBASE AUTH PERSISTENCE
============================================================ */

async function enablePersistentLogin() {

    if (persistenceReady) {

        return;

    }


    await setPersistence(
        auth,
        browserLocalPersistence
    );


    persistenceReady =
        true;


    console.log(
        "Firebase LOCAL persistence enabled."
    );

}



/* ============================================================
   ALREADY LOGGED-IN STUDENT
===============================================================
   When login.html opens again:
   Firebase checks whether the previous student is still
   authenticated.

   If yes AND our dashboard state exists,
   go directly to student-dashboard.html.
============================================================ */

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            return;

        }


        const currentPath =
            window.location.pathname
                .toLowerCase();


        /*
         * Only redirect automatically from login.html.
         */

        if (
            !currentPath.endsWith(
                "/login.html"
            ) &&
            !currentPath.endsWith(
                "login.html"
            )
        ) {

            return;

        }


        const lastDashboard =
            getLastDashboard();


        /*
         * If no saved dashboard exists, stay on login page.
         */

        if (!lastDashboard) {

            return;

        }


        try {

            /*
             * Verify the Firebase user's profile again.
             */

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


            if (
                !userSnap.exists()
            ) {

                clearLastDashboard();

                await signOut(
                    auth
                );

                return;

            }


            const data =
                userSnap.data();


            const role =
                String(
                    data.role || ""
                )
                .trim()
                .toLowerCase();


            const status =
                String(
                    data.status || ""
                )
                .trim()
                .toLowerCase();


            /*
             * Only an approved/active student may be
             * automatically returned to the dashboard.
             */

            if (
                role !== "student" ||
                (
                    status !== "approved" &&
                    status !== "active"
                )
            ) {

                clearLastDashboard();

                await signOut(
                    auth
                );

                return;

            }


            console.log(
                "Existing student session found. Opening dashboard."
            );


            window.location.replace(
                "student-dashboard.html"
            );

        }

        catch (error) {

            console.error(
                "Persistent login check failed:",
                error
            );

        }

    }
);



/* ============================================================
   STUDENT LOGIN
============================================================ */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ================================================
               PUZZLE CHECK
            ================================================= */

            if (!puzzleSolved) {

                showMessage(
                    "Please complete the puzzle first."
                );

                return;

            }


            /* ================================================
               STUDENT ID
            ================================================= */

            const studentId =
                loginEmail.value
                    .trim()
                    .toUpperCase();


            /* ================================================
               PASSWORD
            ================================================= */

            const password =
                loginPassword.value;


            /* ================================================
               VALIDATE STUDENT ID
            ================================================= */

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


            /* ================================================
               PASSWORD CHECK
            ================================================= */

            if (!password) {

                showMessage(
                    "Please enter your password."
                );


                loginPassword.focus();


                return;

            }


            /* ================================================
               DISABLE LOGIN
            ================================================= */

            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Signing in...";

            }


            showMessage(
                "Checking student account...",
                "info"
            );


            try {

                /* ============================================
                   ENABLE PERSISTENT LOGIN BEFORE SIGN-IN
                ============================================ */

                await enablePersistentLogin();


                /* ============================================
                   CREATE INTERNAL FIREBASE EMAIL
                ============================================ */

                const firebaseEmail =
                    createStudentFirebaseEmail(
                        studentId
                    );


                console.log(
                    "Student Firebase email:",
                    firebaseEmail
                );


                /* ============================================
                   FIREBASE LOGIN
                ============================================ */

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


                /* ============================================
                   LOAD USER PROFILE
                ============================================ */

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


                /* ============================================
                   PROFILE MUST EXIST
                ============================================ */

                if (
                    !userSnap.exists()
                ) {

                    await signOut(
                        auth
                    );


                    clearLastDashboard();


                    showMessage(
                        "Student profile not found."
                    );


                    return;

                }


                const userData =
                    userSnap.data();


                /* ============================================
                   CHECK ROLE
                ============================================ */

                const role =
                    String(
                        userData.role || ""
                    )
                    .trim()
                    .toLowerCase();


                if (
                    role !== "student"
                ) {

                    await signOut(
                        auth
                    );


                    clearLastDashboard();


                    showMessage(
                        "This account is not a student account."
                    );


                    return;

                }


                /* ============================================
                   CHECK STATUS
                ============================================ */

                const status =
                    String(
                        userData.status || ""
                    )
                    .trim()
                    .toLowerCase();



                /* ============================================
                   REJECTED
                ============================================ */

                if (
                    status === "rejected"
                ) {

                    await signOut(
                        auth
                    );


                    clearLastDashboard();


                    showMessage(
                        "Your registration was rejected."
                    );


                    return;

                }



                /* ============================================
                   PENDING
                ============================================ */

                if (
                    status === "pending"
                ) {

                    await signOut(
                        auth
                    );


                    clearLastDashboard();


                    showMessage(
                        "Your registration is still waiting for approval."
                    );


                    return;

                }



                /* ============================================
                   APPROVED / ACTIVE
                ============================================ */

                if (
                    status === "approved" ||
                    status === "active"
                ) {

                    /*
                     * Remember this dashboard.
                     */

                    saveLastDashboard();


                    showMessage(
                        "Login successful. Opening dashboard...",
                        "success"
                    );


                    /*
                     * Redirect to the student dashboard.
                     */

                    setTimeout(
                        function () {

                            window.location.replace(
                                "student-dashboard.html"
                            );

                        },
                        500
                    );


                    return;

                }



                /* ============================================
                   UNKNOWN STATUS
                ============================================ */

                await signOut(
                    auth
                );


                clearLastDashboard();


                showMessage(
                    "Your student account status is not configured."
                );

            }

            catch (error) {

                console.error(
                    "Student login error:",
                    error
                );


                clearLastDashboard();


                showMessage(
                    firebaseErrorMessage(
                        error
                    )
                );

            }

            finally {

                if (loginButton) {

                    loginButton.disabled =
                        !puzzleSolved;

                    loginButton.textContent =
                        "Login";

                }

            }

        }
    );

}



/* ============================================================
   GLOBAL LOGOUT FUNCTION
===============================================================
   Your dashboard can call:

       logoutUser();

   This completely removes the persistent login.
============================================================ */

window.logoutUser =
    async function () {

        try {

            await signOut(
                auth
            );


            clearLastDashboard();


            window.location.replace(
                "login.html"
            );

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            showMessage(
                "Logout failed. Please try again."
            );

        }

    };



/* ============================================================
   CONSOLE
============================================================ */

console.log(
    "R Mohan Digital Student Login loaded successfully."
);


console.log(
    "Firebase persistent student login is enabled."
);


console.log(
    "Student puzzle is active only on login.html."
);
