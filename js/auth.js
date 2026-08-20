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

    button.addEventListener("click", () => {

        roleButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedRole =
            button.dataset.role;

        loginMessage.textContent = "";

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
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==================================
            // ROLE CHECK
            // ==================================

            if (!selectedRole) {

                loginMessage.style.color =
                    "#facc15";

                loginMessage.textContent =
                    "Please select your login type.";

                return;
            }


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            if (!email || !password) {

                loginMessage.style.color =
                    "#ef4444";

                loginMessage.textContent =
                    "Please enter email and password.";

                return;
            }


            loginButton.disabled = true;

            loginButton.textContent =
                "Checking...";


            loginMessage.style.color =
                "#38bdf8";

            loginMessage.textContent =
                "Verifying your account...";


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


                // ==================================
                // FIRESTORE PROFILE
                // ==================================

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnapshot =
                    await getDoc(userRef);


                if (!userSnapshot.exists()) {

                    await signOut(auth);

                    loginMessage.style.color =
                        "#ef4444";

                    loginMessage.textContent =
                        "Your Firebase profile was not found.";

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";

                    return;
                }


                const userData =
                    userSnapshot.data();


                const role =
                    userData.role;

                const status =
                    userData.status;


                console.log(
                    "Profile:",
                    userData
                );


                // ==================================
                // ROLE VERIFICATION
                // ==================================

                if (role !== selectedRole) {

                    await signOut(auth);

                    loginMessage.style.color =
                        "#ef4444";

                    loginMessage.textContent =
                        "This account does not have " +
                        selectedRole +
                        " access.";

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";

                    return;
                }


                // ==================================
                // STATUS
                // ==================================

                if (status !== "Active") {

                    await signOut(auth);

                    loginMessage.style.color =
                        "#facc15";


                    if (
                        role === "faculty" &&
                        status === "Pending"
                    ) {

                        loginMessage.textContent =
                            "Your faculty account is waiting for mentor approval.";

                    }

                    else if (
                        role === "faculty" &&
                        status === "Rejected"
                    ) {

                        loginMessage.textContent =
                            "Your faculty application has been rejected.";

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
                // SUCCESS
                // ==================================

                loginMessage.style.color =
                    "#22c55e";

                loginMessage.textContent =
                    "Login successful!";


                // ==================================
                // REDIRECTION
                // ==================================

                setTimeout(() => {


                    // OWNER

                    if (role === "admin") {

                        window.location.href =
                            "admin-dashboard.html";

                        return;
                    }


                    // MENTOR

                    if (role === "mentor") {

                        window.location.href =
                            "mentor-dashboard.html";

                        return;
                    }


                    // EDITOR

                    if (role === "editor") {

                        window.location.href =
                            "editor-dashboard.html";

                        return;
                    }


                    // FACULTY

                    if (role === "faculty") {

                        window.location.href =
                            "faculty-dashboard.html";

                        return;
                    }


                    loginMessage.style.color =
                        "#ef4444";

                    loginMessage.textContent =
                        "Invalid account role.";

                }, 600);


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.style.color =
                    "#ef4444";


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
                    "auth/too-many-requests"
                ) {

                    loginMessage.textContent =
                        "Too many login attempts. Try again later.";

                }

                else {

                    loginMessage.textContent =
                        "Login failed. Please try again.";

                    console.error(error);

                }


                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";

            }

        }
    );

}