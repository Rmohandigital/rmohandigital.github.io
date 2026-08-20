// ==========================================
// R MOHAN DIGITAL
// CONTROL CENTER LOGIN
// MENTOR / OWNER / EDITOR / FACULTY
// ==========================================

import { auth, db } from "../firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");


// ==========================================
// SELECTED ROLE
// ==========================================

let selectedRole = null;


// ==========================================
// ROLE BUTTONS
// ==========================================

const roleButtons =
    document.querySelectorAll(".role-btn");


roleButtons.forEach(button => {

    button.addEventListener("click", function () {

        // Remove previous selection

        roleButtons.forEach(btn => {
            btn.classList.remove("selected");
        });


        // Select this button

        this.classList.add("selected");


        // Get role

        selectedRole =
            String(this.dataset.role || "")
                .trim()
                .toLowerCase();


        console.log(
            "Selected login role:",
            selectedRole
        );


        if (loginMessage) {

            loginMessage.textContent = "";

        }

    });

});


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

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==================================
            // CHECK ROLE
            // ==================================

            if (!selectedRole) {

                loginMessage.style.color =
                    "#facc15";

                loginMessage.textContent =
                    "Please select Mentor, Owner, Editor or Faculty.";

                return;
            }


            // ==================================
            // GET EMAIL
            // ==================================

            const emailInput =
                document.getElementById("loginEmail");


            const passwordInput =
                document.getElementById("loginPassword");


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            // ==================================
            // EMPTY CHECK
            // ==================================

            if (!email || !password) {

                loginMessage.style.color =
                    "#ef4444";

                loginMessage.textContent =
                    "Please enter email and password.";

                return;
            }


            // ==================================
            // LOGIN START
            // ==================================

            loginButton.disabled = true;

            loginButton.textContent =
                "Checking...";


            loginMessage.style.color =
                "#38bdf8";

            loginMessage.textContent =
                "Verifying your account...";


            try {

                // ==================================
                // FIREBASE AUTHENTICATION
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
                // FIRESTORE USER PROFILE
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

                    await signOut(auth);


                    loginMessage.style.color =
                        "#ef4444";


                    loginMessage.textContent =
                        "Firebase profile not found for this account.";


                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";


                    return;
                }


                // ==================================
                // GET DATA
                // ==================================

                const userData =
                    userSnapshot.data();


                console.log(
                    "Firestore profile:",
                    userData
                );


                // ==================================
                // CLEAN FIRESTORE VALUES
                // ==================================

                // IMPORTANT:
                // trim() removes accidental spaces

                const role =
                    String(
                        userData.role || ""
                    )
                    .trim()
                    .toLowerCase();


                const status =
                    String(
                        userData.status || ""
                    )
                    .trim()
                    .toLowerCase();


                const name =
                    String(
                        userData.name || ""
                    )
                    .trim();


                console.log(
                    "Clean role:",
                    role
                );


                console.log(
                    "Clean status:",
                    status
                );


                // ==================================
                // ROLE MATCH
                // ==================================

                if (role !== selectedRole) {

                    await signOut(auth);


                    loginMessage.style.color =
                        "#ef4444";


                    // Better messages

                    if (role === "admin") {

                        loginMessage.textContent =
                            "This account has Owner/Admin access. Please select Owner.";

                    }

                    else if (role === "mentor") {

                        loginMessage.textContent =
                            "This account has Mentor access. Please select Mentor.";

                    }

                    else if (role === "editor") {

                        loginMessage.textContent =
                            "This account has Editor access. Please select Editor.";

                    }

                    else if (role === "faculty") {

                        loginMessage.textContent =
                            "This account has Faculty access. Please select Faculty.";

                    }

                    else {

                        loginMessage.textContent =
                            "Your account role is not configured correctly.";

                    }


                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";


                    return;
                }


                // ==================================
                // STATUS CHECK
                // ==================================

                if (status !== "active") {

                    await signOut(auth);


                    loginMessage.style.color =
                        "#facc15";


                    if (
                        role === "faculty" &&
                        status === "pending"
                    ) {

                        loginMessage.textContent =
                            "Your faculty account is waiting for mentor approval.";

                    }

                    else if (
                        role === "faculty" &&
                        status === "rejected"
                    ) {

                        loginMessage.textContent =
                            "Your faculty application has been rejected.";

                    }

                    else if (
                        role === "mentor" &&
                        status === "pending"
                    ) {

                        loginMessage.textContent =
                            "Your mentor account is waiting for activation.";

                    }

                    else if (
                        role === "editor" &&
                        status === "pending"
                    ) {

                        loginMessage.textContent =
                            "Your editor account is waiting for activation.";

                    }

                    else {

                        loginMessage.textContent =
                            "Your account is not active.";

                    }


                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";


                    return;
                }


                // ==================================
                // LOGIN SUCCESS
                // ==================================

                loginMessage.style.color =
                    "#22c55e";


                loginMessage.textContent =
                    "Welcome " +
                    (name || user.email) +
                    "! Login successful.";


                console.log(
                    "LOGIN SUCCESS"
                );


                console.log(
                    "ROLE:",
                    role
                );


                console.log(
                    "STATUS:",
                    status
                );


                // ==================================
                // REDIRECTION
                // ==================================

                setTimeout(function () {


                    // ==================================
                    // OWNER
                    // ==================================

                    if (role === "admin") {

                        window.location.href =
                            "admin-dashboard.html";

                        return;
                    }


                    // ==================================
                    // MENTOR
                    // ==================================

                    if (role === "mentor") {

                        window.location.href =
                            "mentor-dashboard.html";

                        return;
                    }


                    // ==================================
                    // EDITOR
                    // ==================================

                    if (role === "editor") {

                        window.location.href =
                            "editor-dashboard.html";

                        return;
                    }


                    // ==================================
                    // FACULTY
                    // ==================================

                    if (role === "faculty") {

                        window.location.href =
                            "faculty-dashboard.html";

                        return;
                    }


                    // ==================================
                    // UNKNOWN
                    // ==================================

                    loginMessage.style.color =
                        "#ef4444";


                    loginMessage.textContent =
                        "Unable to determine dashboard.";

                }, 700);


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                loginMessage.style.color =
                    "#ef4444";


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
                    "auth/user-disabled"
                ) {

                    loginMessage.textContent =
                        "This Firebase account has been disabled.";

                }

                else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    loginMessage.textContent =
                        "Too many attempts. Please try again later.";

                }

                else {

                    loginMessage.textContent =
                        "Login failed: " +
                        error.message;

                }


                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";

            }

        }
    );

}