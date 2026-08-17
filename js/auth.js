// ==========================================
// R MOHAN DIGITAL - STUDENT AUTHENTICATION
// ==========================================

import { auth } from "../firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

window.toggleLoginPassword = function () {

    const password =
        document.getElementById("loginPassword");

    const button =
        document.querySelector(".toggle-password");


    if (password.type === "password") {

        password.type = "text";
        button.textContent = "🙈";

    } else {

        password.type = "password";
        button.textContent = "👁";

    }

};


// ==========================================
// STUDENT LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail")
        .value
        .trim();

    const password =
        document.getElementById("loginPassword")
        .value;


    // ==========================================
    // CHECK EMPTY FIELDS
    // ==========================================

    if (email === "" || password === "") {

        loginMessage.style.color = "red";

        loginMessage.textContent =
            "Please enter email and password.";

        return;

    }


    // ==========================================
    // LOGIN MESSAGE
    // ==========================================

    loginMessage.style.color = "#2563eb";

    loginMessage.textContent =
        "Logging in...";


    try {

        // ==========================================
        // FIREBASE LOGIN
        // ==========================================

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "Student logged in:",
            user.uid
        );


        // ==========================================
        // SUCCESS
        // ==========================================

        loginMessage.style.color = "green";

        loginMessage.textContent =
            "Login successful!";


        // ==========================================
        // OPEN DASHBOARD
        // ==========================================

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 800);


    } catch (error) {

        console.error(
            "Firebase Login Error:",
            error
        );


        loginMessage.style.color = "red";


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
                "Please enter a valid email address.";

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
                "Login failed. Please try again.";

        }

    }

});
