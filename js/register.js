import { auth, db } from "../firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const registerBtn = document.getElementById("registerBtn");


registerBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value.trim();
    const course = document.getElementById("course").value;


    // Check fields
    if (
        name === "" ||
        email === "" ||
        password === "" ||
        phone === "" ||
        course === ""
    ) {

        alert("Please fill all details.");
        return;

    }


    // Basic password check
    if (password.length < 6) {

        alert("Password must contain at least 6 characters.");
        return;

    }


    registerBtn.disabled = true;
    registerBtn.textContent = "Creating Account...";


    try {

        // ==========================================
        // CREATE FIREBASE AUTHENTICATION ACCOUNT
        // ==========================================

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;


        // ==========================================
        // CREATE STUDENT FIRESTORE PROFILE
        // ==========================================

        await setDoc(
            doc(db, "students", user.uid),
            {

                uid: user.uid,

                name: name,

                email: email,

                phone: phone,

                course: course,

                status: "Pending",

                progress: 0,

                createdAt: serverTimestamp()

            }
        );


        // ==========================================
        // SUCCESS
        // ==========================================

        alert(
            "Registration successful! Your account has been created."
        );


        window.location.href = "login.html";


    } catch (error) {

        console.error("Registration Error:", error);


        if (error.code === "auth/email-already-in-use") {

            alert(
                "This email is already registered. Please login instead."
            );

        }

        else if (error.code === "auth/invalid-email") {

            alert(
                "Please enter a valid email address."
            );

        }

        else if (error.code === "auth/weak-password") {

            alert(
                "Password is too weak. Use at least 6 characters."
            );

        }

        else {

            alert(
                "Registration failed: " + error.message
            );

        }


        registerBtn.disabled = false;
        registerBtn.textContent = "Register";

    }

});
