// ============================================
// R MOHAN DIGITAL
// STUDENT LOGIN SYSTEM
// ============================================

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================
// PAGE ELEMENTS
// ============================================

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const togglePassword =
    document.getElementById("togglePassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const puzzleGrid =
    document.getElementById("puzzleGrid");

const targetNumber =
    document.getElementById("targetNumber");

const puzzleStatus =
    document.getElementById("puzzleStatus");


// ============================================
// CHECK REQUIRED ELEMENTS
// ============================================

console.log(
    "R Mohan Digital Student Login starting..."
);

if (!loginForm) {
    console.error("loginForm not found.");
}

if (!loginEmail) {
    console.error("loginEmail not found.");
}

if (!loginPassword) {
    console.error("loginPassword not found.");
}


// ============================================
// GET STUDENT ID FROM REGISTRATION URL
// ============================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const studentIdFromURL =
    urlParams.get("studentId");


// ============================================
// AUTOMATIC STUDENT ID
// ============================================

if (studentIdFromURL) {

    const studentId =
        studentIdFromURL
            .trim()
            .toUpperCase();


    // Check correct format

    if (/^SM\d{8}$/.test(studentId)) {

        loginEmail.value =
            studentId;


        // Student ID came from registration,
        // so don't allow editing.

        loginEmail.readOnly =
            true;


        console.log(
            "Student ID received from registration:",
            studentId
        );

    } else {

        console.warn(
            "Invalid Student ID received:",
            studentIdFromURL
        );

    }

} else {

    console.log(
        "No Student ID in URL. Student can enter ID manually."
    );

}


// ============================================
// PASSWORD SHOW / HIDE
// ============================================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                togglePassword.textContent =
                    "🙈";

            } else {

                loginPassword.type =
                    "password";

                togglePassword.textContent =
                    "👁";

            }

        }
    );

}


// ============================================
// CREATE INTERNAL FIREBASE EMAIL
// ============================================
//
// Student enters:
//
// SM86216678
//
// Firebase internally uses:
//
// sm86216678@student.rmdigital.local
//
// The student never needs to know
// the internal email.
// ============================================

function createStudentLoginEmail(
    studentId
) {

    return (
        studentId
            .trim()
            .toLowerCase()
        +
        "@student.rmdigital.local"
    );

}


// ============================================
// MESSAGE FUNCTION
// ============================================

function showMessage(
    message,
    type = "error"
) {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent =
        message;


    if (type === "success") {

        loginMessage.style.color =
            "#16a34a";

    } else {

        loginMessage.style.color =
            "#dc2626";

    }

}


// ============================================
// PUZZLE GAME
// ============================================

let puzzleSolved =
    false;


// ============================================
// CREATE PUZZLE
// ============================================

function createPuzzle() {

    if (
        !puzzleGrid ||
        !targetNumber
    ) {

        console.error(
            "Puzzle elements not found."
        );

        return;

    }


    puzzleSolved =
        false;


    loginButton.disabled =
        true;

    loginButton.textContent =
        "Complete Puzzle First";


    puzzleStatus.textContent =
        "Complete the puzzle to continue.";

    puzzleStatus.style.color =
        "#64748b";


    puzzleGrid.innerHTML =
        "";


    // ----------------------------------------
    // NUMBERS
    // ----------------------------------------

    const numbers = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
    ];


    // ----------------------------------------
    // RANDOM TARGET
    // ----------------------------------------

    const target =
        numbers[
            Math.floor(
                Math.random() *
                numbers.length
            )
        ];


    targetNumber.textContent =
        target;


    // ----------------------------------------
    // SHUFFLE NUMBERS
    // ----------------------------------------

    numbers.sort(
        () =>
            Math.random() - 0.5
    );


    // ----------------------------------------
    // CREATE BUTTONS
    // ----------------------------------------

    numbers.forEach(
        number => {

            const tile =
                document.createElement(
                    "button"
                );


            tile.type =
                "button";


            tile.className =
                "puzzle-tile";


            tile.textContent =
                number;


            tile.addEventListener(
                "click",
                () => {

                    // Puzzle already solved

                    if (puzzleSolved) {
                        return;
                    }


                    // --------------------------------
                    // CORRECT
                    // --------------------------------

                    if (
                        number === target
                    ) {

                        tile.classList.add(
                            "correct"
                        );


                        puzzleSolved =
                            true;


                        puzzleStatus.textContent =
                            "✓ Puzzle completed! You can login now.";

                        puzzleStatus.style.color =
                            "#16a34a";


                        loginButton.disabled =
                            false;


                        loginButton.textContent =
                            "Login";


                        console.log(
                            "Puzzle completed."
                        );

                    }


                    // --------------------------------
                    // WRONG
                    // --------------------------------

                    else {

                        tile.classList.add(
                            "wrong"
                        );


                        puzzleStatus.textContent =
                            "Try again! Find " +
                            target;

                        puzzleStatus.style.color =
                            "#dc2626";


                        setTimeout(
                            () => {

                                tile.classList.remove(
                                    "wrong"
                                );

                            },
                            500
                        );

                    }

                }
            );


            puzzleGrid.appendChild(
                tile
            );

        }
    );

}


// ============================================
// START PUZZLE
// ============================================

createPuzzle();


// ============================================
// STUDENT LOGIN
// ============================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // --------------------------------
            // PUZZLE CHECK
            // --------------------------------

            if (!puzzleSolved) {

                showMessage(
                    "Please complete the puzzle first."
                );

                return;

            }


            // --------------------------------
            // GET VALUES
            // --------------------------------

            const studentId =
                loginEmail.value
                    .trim()
                    .toUpperCase();


            const password =
                loginPassword.value;


            // --------------------------------
            // STUDENT ID VALIDATION
            // --------------------------------

            if (
                !/^SM\d{8}$/.test(
                    studentId
                )
            ) {

                showMessage(
                    "Invalid Student ID. Example: SM12345678"
                );

                return;

            }


            // --------------------------------
            // PASSWORD VALIDATION
            // --------------------------------

            if (!password) {

                showMessage(
                    "Please enter your password."
                );

                return;

            }


            // --------------------------------
            // DISABLE LOGIN
            // --------------------------------

            loginButton.disabled =
                true;

            loginButton.textContent =
                "Logging in...";


            showMessage("");


            try {

                // =================================
                // CREATE INTERNAL FIREBASE EMAIL
                // =================================

                const firebaseEmail =
                    createStudentLoginEmail(
                        studentId
                    );


                console.log(
                    "Student ID:",
                    studentId
                );


                console.log(
                    "Firebase login email:",
                    firebaseEmail
                );


                // =================================
                // FIREBASE AUTH LOGIN
                // =================================

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        firebaseEmail,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "Firebase login successful:",
                    user.uid
                );


                // =================================
                // GET USER PROFILE
                // =================================

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


                // =================================
                // PROFILE NOT FOUND
                // =================================

                if (
                    !userSnapshot.exists()
                ) {

                    showMessage(
                        "Student profile was not found."
                    );


                    await auth.signOut();

                    return;

                }


                const userData =
                    userSnapshot.data();


                console.log(
                    "Student profile:",
                    userData
                );


                // =================================
                // CHECK ROLE
                // =================================

                const role =
                    String(
                        userData.role || ""
                    )
                    .trim()
                    .toLowerCase();


                if (
                    role !== "student"
                ) {

                    showMessage(
                        "This account is not a student account."
                    );


                    await auth.signOut();

                    return;

                }


                // =================================
                // CHECK STATUS
                // =================================

                const status =
                    String(
                        userData.status || ""
                    )
                    .trim()
                    .toLowerCase();


                console.log(
                    "Student status:",
                    status
                );


                // =================================
                // PENDING
                // =================================

                if (
                    status === "pending"
                ) {

                    showMessage(
                        "Your registration is waiting for mentor approval."
                    );


                    await auth.signOut();

                    return;

                }


                // =================================
                // REJECTED
                // =================================

                if (
                    status === "rejected"
                ) {

                    showMessage(
                        "Your student registration was rejected."
                    );


                    await auth.signOut();

                    return;

                }


                // =================================
                // APPROVED
                // =================================

                if (
                    status === "approved" ||
                    status === "active"
                ) {

                    showMessage(
                        "Login successful! Opening Student Dashboard...",
                        "success"
                    );


                    console.log(
                        "Student approved."
                    );


                    // Small delay so the
                    // success message is visible.

                    setTimeout(
                        () => {

                            window.location.href =
                                "student-dashboard.html";

                        },
                        700
                    );


                    return;

                }


                // =================================
                // UNKNOWN STATUS
                // =================================

                showMessage(
                    "Your student account status is not configured."
                );


                await auth.signOut();


            } catch (error) {

                console.error(
                    "STUDENT LOGIN ERROR:",
                    error
                );


                // =================================
                // FIREBASE ERRORS
                // =================================

                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    showMessage(
                        "Invalid Student ID or password."
                    );

                }

                else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    showMessage(
                        "Student ID not found."
                    );

                }

                else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    showMessage(
                        "Incorrect password."
                    );

                }

                else if (
                    error.code ===
                    "auth/invalid-api-key"
                ) {

                    showMessage(
                        "Firebase API key is invalid."
                    );

                }

                else if (
                    error.code ===
                    "auth/network-request-failed"
                ) {

                    showMessage(
                        "Network connection failed. Please check your internet connection."
                    );

                }

                else if (
                    error.code ===
                    "auth/operation-not-allowed"
                ) {

                    showMessage(
                        "Firebase Email/Password login is not enabled."
                    );

                }

                else {

                    showMessage(
                        "Login failed: " +
                        error.message
                    );

                }

            }

            finally {

                // --------------------------------
                // RESTORE BUTTON
                // --------------------------------

                if (puzzleSolved) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login";

                } else {

                    loginButton.disabled =
                        true;

                    loginButton.textContent =
                        "Complete Puzzle First";

                }

            }

        }
    );

}


// ============================================
// FINAL LOG
// ============================================

console.log(
    "R Mohan Digital Student Login loaded successfully."
);
