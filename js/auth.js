// ============================================================
// R MOHAN DIGITAL
// FINAL LOGIN SYSTEM
// Student / Faculty / Mentor / Owner
// ============================================================

import {
    auth,
    db
} from "../firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
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


    roleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    // Remove previous selection
                    roleButtons.forEach(
                        btn => {
                            btn.classList.remove(
                                "selected"
                            );
                        }
                    );


                    // Select current button
                    button.classList.add(
                        "selected"
                    );


                    selectedRole =
                        button.dataset.role;


                    showMessage(
                        "",
                        ""
                    );

                }
            );

        }
    );

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

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();


    const password =
        document
            .getElementById("loginPassword")
            .value;


    // ========================================================
    // CHECK ROLE
    // ========================================================

    if (!selectedRole) {

        showMessage(
            "Please select your login type first.",
            "error"
        );

        return;

    }


    // ========================================================
    // CHECK INPUTS
    // ========================================================

    if (!email || !password) {

        showMessage(
            "Please enter email and password.",
            "error"
        );

        return;

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

        // ====================================================
        // FIREBASE LOGIN
        // ====================================================

        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
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
        // VERIFY SELECTED ROLE
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
        // ========================================================

        if (
            userRole === "student"
        ) {

            // ------------------------------------------------
            // PENDING
            // ------------------------------------------------

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


            // ------------------------------------------------
            // REJECTED
            // ------------------------------------------------

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


            // ------------------------------------------------
            // APPROVED
            // ------------------------------------------------

            if (
                status === "approved" ||
                status === "active"
            ) {

                window.location.href =
                    "student-dashboard.html";

                return;

            }


            // ------------------------------------------------
            // UNKNOWN STATUS
            // ------------------------------------------------

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
    else if (type === "success") {

        messageBox.style.color =
            "#16a34a";

    }
    else {

        messageBox.style.color =
            "#2563eb";

    }

}


// ============================================================
// FIREBASE ERROR MESSAGES
// ============================================================

function getLoginErrorMessage(error) {

    const code =
        error.code || "";


    switch (code) {

        case "auth/invalid-credential":

            return "Invalid email or password.";


        case "auth/invalid-login-credentials":

            return "Invalid email or password.";


        case "auth/user-not-found":

            return "No account found with this email.";


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
// PASSWORD SHOW / HIDE
// Your existing login.html already calls this function.
// ============================================================

window.toggleLoginPassword =
    function () {

        const passwordInput =
            document.getElementById(
                "loginPassword"
            );


        if (!passwordInput) {
            return;
        }


        if (
            passwordInput.type ===
            "password"
        ) {

            passwordInput.type =
                "text";

        }
        else {

            passwordInput.type =
                "password";

        }

    };
