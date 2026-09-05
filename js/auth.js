// ============================================
// R MOHAN DIGITAL - LOGIN SYSTEM
// ============================================

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================
// ELEMENTS
// ============================================

const loginForm = document.getElementById("loginForm");

const loginEmail = document.getElementById("loginEmail");

const loginPassword = document.getElementById("loginPassword");

const loginIdLabel = document.getElementById("loginIdLabel");

const loginMessage = document.getElementById("loginMessage");

const togglePassword =
    document.getElementById("togglePassword");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");

const forgotWrapper =
    document.getElementById("forgotWrapper");

const loginButton =
    document.getElementById("loginButton");

const roleButtons =
    document.querySelectorAll(".role-btn");


// ============================================
// CURRENT ROLE
// ============================================

let selectedRole = null;


// ============================================
// SHOW MESSAGE
// ============================================

function showMessage(message, type = "error") {

    loginMessage.textContent = message;

    if (type === "success") {

        loginMessage.style.color = "#16a34a";

    } else {

        loginMessage.style.color = "#dc2626";

    }

}


// ============================================
// SELECT LOGIN ROLE
// ============================================

function selectRole(role) {

    selectedRole = role;


    // Remove selected from all buttons

    roleButtons.forEach(button => {

        button.classList.remove("selected");

    });


    // Select current button

    const selectedButton =
        document.querySelector(
            `.role-btn[data-role="${role}"]`
        );

    if (selectedButton) {

        selectedButton.classList.add("selected");

    }


    // ========================================
    // STUDENT LOGIN
    // ========================================

    if (role === "student") {

        loginIdLabel.textContent =
            "Student ID";

        loginEmail.placeholder =
            "Enter your Student ID";

        loginEmail.autocomplete =
            "username";


        // Students use Student ID + password

        if (
            loginEmail.value &&
            !loginEmail.value.toUpperCase().startsWith("SM")
        ) {

            loginEmail.value = "";

        }


        // Student forgot password is hidden
        // because student authentication uses
        // an internal Firebase login email.

        if (forgotWrapper) {

            forgotWrapper.style.display = "none";

        }

    }

    // ========================================
    // OWNER / MENTOR / FACULTY
    // ========================================

    else {

        loginIdLabel.textContent =
            "Email Address";

        loginEmail.placeholder =
            "Enter your email";

        loginEmail.autocomplete =
            "username";


        if (forgotWrapper) {

            forgotWrapper.style.display = "block";

        }

    }

}


// ============================================
// ROLE BUTTON CLICK
// ============================================

roleButtons.forEach(button => {

    button.addEventListener("click", () => {

        const role =
            button.getAttribute("data-role");

        selectRole(role);

    });

});


// ============================================
// PASSWORD SHOW / HIDE
// ============================================

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (loginPassword.type === "password") {

            loginPassword.type = "text";

            togglePassword.textContent = "🙈";

        } else {

            loginPassword.type = "password";

            togglePassword.textContent = "👁";

        }

    });

}


// ============================================
// STUDENT INTERNAL LOGIN EMAIL
// ============================================
//
// Your registration system creates Firebase Auth
// using:
//
// SM12345678
// ↓
// sm12345678@student.rmdigital.local
//
// Student does NOT need to know this email.
// They only enter their Student ID.
// ============================================

function createStudentLoginEmail(studentId) {

    return (
        studentId
            .trim()
            .toLowerCase()
        + "@student.rmdigital.local"
    );

}


// ============================================
// LOGIN
// ============================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    showMessage("");


    // ========================================
    // ROLE CHECK
    // ========================================

    if (!selectedRole) {

        showMessage(
            "Please select Owner, Mentor, Faculty or Student."
        );

        return;

    }


    let loginValue =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    // ========================================
    // VALIDATION
    // ========================================

    if (!loginValue) {

        showMessage(
            selectedRole === "student"
                ? "Please enter your Student ID."
                : "Please enter your email."
        );

        return;

    }


    if (!password) {

        showMessage(
            "Please enter your password."
        );

        return;

    }


    // ========================================
    // STUDENT VALIDATION
    // ========================================

    if (selectedRole === "student") {

        loginValue =
            loginValue.toUpperCase();


        if (!/^SM\d{8}$/.test(loginValue)) {

            showMessage(
                "Invalid Student ID. Example: SM12345678"
            );

            return;

        }

    }


    // ========================================
    // DISABLE BUTTON
    // ========================================

    loginButton.disabled = true;

    loginButton.textContent =
        "Logging in...";


    try {

        let firebaseEmail;


        // ====================================
        // STUDENT
        // ====================================

        if (selectedRole === "student") {

            firebaseEmail =
                createStudentLoginEmail(
                    loginValue
                );

        }

        // ====================================
        // OTHER USERS
        // ====================================

        else {

            firebaseEmail =
                loginValue.toLowerCase();

        }


        console.log(
            "Login role:",
            selectedRole
        );

        console.log(
            "Firebase login email:",
            firebaseEmail
        );


        // ====================================
        // FIREBASE LOGIN
        // ====================================

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


        // ====================================
        // GET USER PROFILE
        // ====================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            showMessage(
                "Your profile was not found in the system."
            );

            await auth.signOut();

            return;

        }


        const userData =
            userSnapshot.data();


        console.log(
            "User profile:",
            userData
        );


        // ====================================
        // NORMALIZE ROLE
        // ====================================

        const databaseRole =
            String(
                userData.role || ""
            )
            .trim()
            .toLowerCase();


        const databaseStatus =
            String(
                userData.status || ""
            )
            .trim()
            .toLowerCase();


        // ====================================
        // CHECK SELECTED ROLE
        // ====================================

        if (
            selectedRole !== databaseRole &&
            !(
                selectedRole === "owner" &&
                (
                    databaseRole === "admin" ||
                    databaseRole === "owner"
                )
            )
        ) {

            showMessage(
                "This account does not have " +
                selectedRole +
                " access."
            );

            await auth.signOut();

            return;

        }


        // ====================================
        // OWNER
        // ====================================

        if (databaseRole === "owner" ||
            databaseRole === "admin") {

            showMessage(
                "Login successful. Opening Owner dashboard...",
                "success"
            );

            setTimeout(() => {

                window.location.href =
                    "admin-dashboard.html";

            }, 500);

            return;

        }


        // ====================================
        // MENTOR
        // ====================================

        if (databaseRole === "mentor") {

            if (
                databaseStatus !== "active" &&
                userData.active !== true
            ) {

                showMessage(
                    "Your mentor account is not active."
                );

                await auth.signOut();

                return;

            }


            showMessage(
                "Login successful. Opening Mentor dashboard...",
                "success"
            );

            setTimeout(() => {

                window.location.href =
                    "mentor-dashboard.html";

            }, 500);

            return;

        }


        // ====================================
        // FACULTY
        // ====================================

        if (databaseRole === "faculty") {

            if (
                databaseStatus !== "active" &&
                databaseStatus !== "approved" &&
                userData.active !== true
            ) {

                showMessage(
                    "Your faculty account is not active."
                );

                await auth.signOut();

                return;

            }


            showMessage(
                "Login successful. Opening Faculty dashboard...",
                "success"
            );

            setTimeout(() => {

                window.location.href =
                    "faculty-dashboard.html";

            }, 500);

            return;

        }


        // ====================================
        // STUDENT
        // ====================================

        if (databaseRole === "student") {


            // --------------------------------
            // PENDING
            // --------------------------------

            if (
                databaseStatus === "pending"
            ) {

                showMessage(
                    "Your registration is waiting for mentor approval."
                );

                await auth.signOut();

                return;

            }


            // --------------------------------
            // REJECTED
            // --------------------------------

            if (
                databaseStatus === "rejected"
            ) {

                showMessage(
                    "Your student registration was rejected."
                );

                await auth.signOut();

                return;

            }


            // --------------------------------
            // APPROVED
            // --------------------------------

            if (
                databaseStatus === "approved" ||
                databaseStatus === "active"
            ) {

                showMessage(
                    "Login successful. Opening Student dashboard...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "student-dashboard.html";

                }, 500);

                return;

            }


            // --------------------------------
            // UNKNOWN STATUS
            // --------------------------------

            showMessage(
                "Your student account status is not configured."
            );

            await auth.signOut();

            return;

        }


        // ====================================
        // UNKNOWN ROLE
        // ====================================

        showMessage(
            "Your account role is not configured."
        );

        await auth.signOut();


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        // ====================================
        // FIREBASE ERROR MESSAGES
        // ====================================

        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            showMessage(
                selectedRole === "student"
                    ? "Invalid Student ID or password."
                    : "Invalid email or password."
            );

        }

        else if (
            error.code ===
            "auth/user-not-found"
        ) {

            showMessage(
                selectedRole === "student"
                    ? "Student ID not found."
                    : "Account not found."
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
            "auth/too-many-requests"
        ) {

            showMessage(
                "Too many login attempts. Please try again later."
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

        loginButton.disabled = false;

        loginButton.textContent =
            "Login";

    }

});


// ============================================
// FORGOT PASSWORD
// ============================================

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener(
        "click",
        async () => {

            if (!selectedRole) {

                showMessage(
                    "Please select Owner, Mentor or Faculty first."
                );

                return;

            }


            if (selectedRole === "student") {

                showMessage(
                    "Students log in using Student ID and password."
                );

                return;

            }


            const email =
                loginEmail.value.trim();


            if (!email) {

                showMessage(
                    "Enter your email address first."
                );

                return;

            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showMessage(
                    "Password reset email sent. Check your inbox.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "PASSWORD RESET ERROR:",
                    error
                );


                showMessage(
                    "Password reset failed: " +
                    error.message
                );

            }

        }
    );

}


// ============================================
// AUTOMATIC STUDENT LOGIN
// ============================================
//
// When registration redirects:
//
// login.html?studentId=SM86216678
//
// automatically:
//
// 1. Select Student
// 2. Fill Student ID
// ============================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const studentIdFromURL =
    urlParams.get("studentId");


if (studentIdFromURL) {

    const studentId =
        studentIdFromURL
            .trim()
            .toUpperCase();


    if (/^SM\d{8}$/.test(studentId)) {

        console.log(
            "Student ID received from registration:",
            studentId
        );


        // Select Student automatically

        selectRole("student");


        // Fill Student ID automatically

        loginEmail.value =
            studentId;


        // Put cursor in password

        loginPassword.focus();

    }

}


// ============================================
// DEFAULT LOGIN
// ============================================
//
// If there is no studentId in the URL,
// nothing is selected automatically.
// User can select the required role.
// ============================================

console.log(
    "R Mohan Digital auth.js loaded successfully."
);
