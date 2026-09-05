// ============================================================
// R MOHAN DIGITAL
// FINAL LOGIN SYSTEM
//
// OWNER    -> Email + Password
// MENTOR   -> Email + Password
// FACULTY  -> Email + Password
// STUDENT  -> Student ID + Password
// ============================================================


import {
    auth,
    db
} from "../firebase.js";


import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    doc,
    getDoc
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================================
// VARIABLES
// ============================================================

let selectedRole = "";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupRoleButtons();

        setupLoginForm();

        setupPasswordToggle();

        setupForgotPassword();

    }
);


// ============================================================
// ROLE BUTTONS
// ============================================================

function setupRoleButtons() {

    const roleButtons =
        document.querySelectorAll(
            ".role-btn"
        );


    roleButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                // Remove previous selection

                roleButtons.forEach(btn => {

                    btn.classList.remove(
                        "selected"
                    );

                });


                // Select current role

                button.classList.add(
                    "selected"
                );


                selectedRole =
                    button.dataset.role;


                // Change login field

                updateLoginField();


                showMessage(
                    "",
                    ""
                );

            }
        );

    });

}


// ============================================================
// CHANGE EMAIL FIELD FOR STUDENT
// ============================================================

function updateLoginField() {

    const label =
        document.getElementById(
            "loginIdLabel"
        );


    const input =
        document.getElementById(
            "loginEmail"
        );


    if (!label || !input) {
        return;
    }


    // ========================================================
    // STUDENT
    // ========================================================

    if (selectedRole === "student") {

        label.textContent =
            "Student ID";


        input.type =
            "text";


        input.placeholder =
            "Example: SM12345678";


        input.autocomplete =
            "username";


        input.value = "";

    }


    // ========================================================
    // OTHER USERS
    // ========================================================

    else {

        label.textContent =
            "Email Address";


        input.type =
            "email";


        input.placeholder =
            "Enter your email";


        input.autocomplete =
            "username";

    }

}


// ============================================================
// LOGIN FORM
// ============================================================

function setupLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await loginUser();

        }
    );

}


// ============================================================
// LOGIN USER
// ============================================================

async function loginUser() {

    const loginValue =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "loginPassword"
            )
            .value;


    // ========================================================
    // ROLE CHECK
    // ========================================================

    if (!selectedRole) {

        showMessage(
            "Please select your login type first.",
            "error"
        );

        return;

    }


    // ========================================================
    // INPUT CHECK
    // ========================================================

    if (!loginValue || !password) {

        showMessage(
            selectedRole === "student"
                ? "Please enter Student ID and password."
                : "Please enter email and password.",
            "error"
        );

        return;

    }


    // ========================================================
    // STUDENT ID VALIDATION
    // ========================================================

    if (selectedRole === "student") {

        const studentId =
            loginValue
                .toUpperCase()
                .replace(/\s/g, "");


        const studentIdPattern =
            /^SM\d{8}$/;


        if (!studentIdPattern.test(studentId)) {

            showMessage(
                "Invalid Student ID. Example: SM12345678",
                "error"
            );

            return;

        }

    }


    // ========================================================
    // LOGIN BUTTON
    // ========================================================

    const loginButton =
        document.querySelector(
            ".login-btn-main"
        );


    if (loginButton) {

        loginButton.disabled =
            true;

        loginButton.textContent =
            "Logging in...";

    }


    try {

        let firebaseEmail =
            loginValue;


        // ====================================================
        // STUDENT
        //
        // Student registration creates:
        //
        // sm12345678@student.rmdigital.local
        //
        // internally.
        //
        // Student only needs to type:
        //
        // SM12345678
        // ====================================================

        if (selectedRole === "student") {

            const studentId =
                loginValue
                    .toUpperCase()
                    .replace(/\s/g, "");


            firebaseEmail =
                studentId.toLowerCase()
                +
                "@student.rmdigital.local";

        }


        // ====================================================
        // FIREBASE LOGIN
        // ====================================================

        const result =
            await signInWithEmailAndPassword(
                auth,
                firebaseEmail,
                password
            );


        const user =
            result.user;


        console.log(
            "Logged in UID:",
            user.uid
        );


        // ====================================================
        // GET USER PROFILE
        // ====================================================

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

            await signOut(auth);


            showMessage(
                "Profile not found. Please contact the administrator.",
                "error"
            );


            resetLoginButton();

            return;

        }


        const profile =
            userSnap.data();


        console.log(
            "User profile:",
            profile
        );


        // ====================================================
        // GET ROLE
        // ====================================================

        const userRole =
            String(
                profile.role || ""
            )
            .toLowerCase()
            .trim();


        const status =
            String(
                profile.status || ""
            )
            .toLowerCase()
            .trim();


        // ====================================================
        // VERIFY ROLE
        // ====================================================

        if (
            selectedRole !==
            userRole
        ) {

            await signOut(auth);


            showMessage(
                "This account does not belong to the selected login type.",
                "error"
            );


            resetLoginButton();

            return;

        }


        // ====================================================
        // OWNER
        // ====================================================

        if (
            userRole === "owner"
        ) {

            if (
                status !== "active" &&
                status !== "approved"
            ) {

                await signOut(auth);


                showMessage(
                    "Your Owner account is not active.",
                    "error"
                );


                resetLoginButton();

                return;

            }


            window.location.href =
                "admin-dashboard.html";

            return;

        }


        // ====================================================
        // MENTOR
        // ====================================================

        if (
            userRole === "mentor"
        ) {

            if (
                status !== "active" &&
                status !== "approved"
            ) {

                await signOut(auth);


                showMessage(
                    "Your Mentor account is not active.",
                    "error"
                );


                resetLoginButton();

                return;

            }


            window.location.href =
                "mentor-dashboard.html";

            return;

        }


        // ====================================================
        // FACULTY
        // ====================================================

        if (
            userRole === "faculty"
        ) {

            if (
                status !== "active" &&
                status !== "approved"
            ) {

                await signOut(auth);


                showMessage(
                    "Your Faculty account is not active.",
                    "error"
                );


                resetLoginButton();

                return;

            }


            window.location.href =
                "faculty-dashboard.html";

            return;

        }


        // ====================================================
        // STUDENT
        // ====================================================

        if (
            userRole === "student"
        ) {


            // -----------------------------------------------
            // PENDING
            // -----------------------------------------------

            if (
                status === "pending"
            ) {

                await signOut(auth);


                showMessage(
                    "Your registration is waiting for mentor approval.",
                    "error"
                );


                resetLoginButton();

                return;

            }


            // -----------------------------------------------
            // REJECTED
            // -----------------------------------------------

            if (
                status === "rejected"
            ) {

                await signOut(auth);


                showMessage(
                    "Your registration was rejected. Please contact the mentor.",
                    "error"
                );


                resetLoginButton();

                return;

            }


            // -----------------------------------------------
            // APPROVED
            // -----------------------------------------------

            if (
                status === "approved" ||
                status === "active"
            ) {

                window.location.href =
                    "student-dashboard.html";

                return;

            }


            // -----------------------------------------------
            // UNKNOWN STATUS
            // -----------------------------------------------

            await signOut(auth);


            showMessage(
                "Your student account status is not configured.",
                "error"
            );


            resetLoginButton();

            return;

        }


        // ====================================================
        // UNKNOWN ROLE
        // ====================================================

        await signOut(auth);


        showMessage(
            "Your account role is not configured.",
            "error"
        );


        resetLoginButton();

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        showMessage(
            getLoginErrorMessage(error),
            "error"
        );


        resetLoginButton();

    }

}


// ============================================================
// FORGOT PASSWORD
// ============================================================

function setupForgotPassword() {

    const button =
        document.getElementById(
            "forgotPasswordBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            await forgotPassword();

        }
    );

}


// ============================================================
// FORGOT PASSWORD
// ============================================================

async function forgotPassword() {

    const loginValue =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim();


    // ========================================================
    // ROLE NOT SELECTED
    // ========================================================

    if (!selectedRole) {

        showMessage(
            "Please select your login type first.",
            "error"
        );

        return;

    }


    // ========================================================
    // NO INPUT
    // ========================================================

    if (!loginValue) {

        showMessage(
            selectedRole === "student"
                ? "Enter your Student ID first."
                : "Enter your email address first.",
            "error"
        );

        return;

    }


    let resetEmail =
        loginValue;


    // ========================================================
    // STUDENT
    // ========================================================

    if (selectedRole === "student") {

        const studentId =
            loginValue
                .toUpperCase()
                .replace(/\s/g, "");


        if (!/^SM\d{8}$/.test(studentId)) {

            showMessage(
                "Enter a valid Student ID, for example SM12345678.",
                "error"
            );

            return;

        }


        /*
         * IMPORTANT:
         *
         * The current student registration system creates
         * the Firebase Auth account using:
         *
         * SM12345678@student.rmdigital.local
         *
         * That is an internal Firebase login email.
         *
         * Therefore Firebase cannot send a useful
         * password-reset email to the student's normal
         * email address for those existing accounts.
         *
         * We show a clear message instead of pretending
         * that the reset was sent.
         */

        showMessage(
            "For Student ID accounts created with the current registration system, please contact the mentor to reset your password.",
            "error"
        );

        return;

    }


    // ========================================================
    // OWNER / MENTOR / FACULTY
    // ========================================================

    try {

        await sendPasswordResetEmail(
            auth,
            resetEmail
        );


        showMessage(
            "Password reset email sent. Please check your email inbox.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "PASSWORD RESET ERROR:",
            error
        );


        showMessage(
            getResetErrorMessage(error),
            "error"
        );

    }

}


// ============================================================
// PASSWORD SHOW / HIDE
// ============================================================

function setupPasswordToggle() {

    const button =
        document.getElementById(
            "togglePassword"
        );


    const input =
        document.getElementById(
            "loginPassword"
        );


    if (!button || !input) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                button.textContent =
                    "🙈";

            }

            else {

                input.type =
                    "password";

                button.textContent =
                    "👁";

            }

        }
    );

}


// ============================================================
// RESET LOGIN BUTTON
// ============================================================

function resetLoginButton() {

    const loginButton =
        document.querySelector(
            ".login-btn-main"
        );


    if (loginButton) {

        loginButton.disabled =
            false;

        loginButton.textContent =
            "Login";

    }

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "loginMessage"
        );


    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        message;


    if (type === "error") {

        messageBox.style.color =
            "#dc2626";

    }

    else if (
        type === "success"
    ) {

        messageBox.style.color =
            "#16a34a";

    }

    else {

        messageBox.style.color =
            "#2563eb";

    }

}


// ============================================================
// LOGIN ERROR MESSAGES
// ============================================================

function getLoginErrorMessage(
    error
) {

    const code =
        error.code || "";


    switch (code) {

        case "auth/invalid-credential":

            return "Invalid Student ID/email or password.";


        case "auth/invalid-login-credentials":

            return "Invalid Student ID/email or password.";


        case "auth/user-not-found":

            return selectedRole === "student"
                ? "Student ID not found."
                : "No account found with this email.";


        case "auth/wrong-password":

            return "Incorrect password.";


        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/user-disabled":

            return "This account has been disabled.";


        case "auth/too-many-requests":

            return "Too many login attempts. Please try again later.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        default:

            return (
                error.message ||
                "Login failed. Please try again."
            );

    }

}


// ============================================================
// RESET PASSWORD ERROR
// ============================================================

function getResetErrorMessage(
    error
) {

    const code =
        error.code || "";


    switch (code) {

        case "auth/user-not-found":

            return "No account found with this email.";


        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/too-many-requests":

            return "Too many requests. Please try again later.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        default:

            return (
                error.message ||
                "Password reset failed."
            );

    }

}
