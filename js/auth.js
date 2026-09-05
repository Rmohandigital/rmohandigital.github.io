// ======================================================
// R MOHAN DIGITAL - FINAL LOGIN SYSTEM
// Owner / Mentor / Faculty = Email + Password
// Student = Student ID + Password
// ======================================================

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const $ = id => document.getElementById(id);

let selectedRole = "student";

/* ======================================================
   ROLE BUTTONS
====================================================== */

document.querySelectorAll(".role-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".role-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedRole =
            String(button.dataset.role || "student").toLowerCase();

        updateLoginMode();
    });

});


/* ======================================================
   LOGIN MODE
====================================================== */

function updateLoginMode() {

    const emailInput = $("email");
    const emailLabel =
        document.querySelector('label[for="email"]');

    if (!emailInput) return;

    if (selectedRole === "student") {

        if (emailLabel) {
            emailLabel.textContent = "Student ID";
        }

        emailInput.placeholder = "Enter Student ID";

        // Keep automatically supplied student ID
        const urlParams = new URLSearchParams(
            window.location.search
        );

        const studentId = urlParams.get("studentId");

        if (studentId) {
            emailInput.value = studentId;
        }

    } else {

        if (emailLabel) {
            emailLabel.textContent = "Email Address";
        }

        emailInput.placeholder = "Enter your email";

    }
}


/* ======================================================
   AUTOMATIC STUDENT ID FROM REGISTRATION
====================================================== */

window.addEventListener("DOMContentLoaded", () => {

    const params =
        new URLSearchParams(window.location.search);

    const studentId =
        params.get("studentId");

    if (studentId && $("email")) {

        // Automatically select Student
        const studentButton =
            document.querySelector(
                '.role-btn[data-role="student"]'
            );

        if (studentButton) {

            document.querySelectorAll(".role-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            studentButton.classList.add("active");

            selectedRole = "student";
        }

        $("email").value = studentId;

        updateLoginMode();

        // Put cursor in password field
        setTimeout(() => {

            if ($("password")) {
                $("password").focus();
            }

        }, 300);
    }

});


/* ======================================================
   LOGIN
====================================================== */

const loginBtn = $("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", async () => {

        const loginValue =
            $("email")?.value.trim();

        const password =
            $("password")?.value;

        if (!loginValue) {

            alert(
                selectedRole === "student"
                    ? "Please enter your Student ID."
                    : "Please enter your email."
            );

            return;
        }

        if (!password) {

            alert("Please enter your password.");

            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Logging in...";

        try {

            /* ==================================================
               STUDENT LOGIN
            ================================================== */

            if (selectedRole === "student") {

                const studentId =
                    loginValue.toUpperCase();

                console.log(
                    "Student login:",
                    studentId
                );

                // Find student by Student ID
                const studentQuery = query(
                    collection(db, "users"),
                    where("studentId", "==", studentId)
                );

                const studentSnapshot =
                    await getDocs(studentQuery);

                if (studentSnapshot.empty) {

                    alert(
                        "Student ID not found.\n\n" +
                        "Please check your Student ID."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                const studentDoc =
                    studentSnapshot.docs[0];

                const studentData =
                    studentDoc.data();

                /* ----------------------------------------------
                   Check account status
                ---------------------------------------------- */

                const status =
                    String(
                        studentData.status || ""
                    ).toLowerCase();

                if (
                    status === "pending" ||
                    status === "waiting"
                ) {

                    alert(
                        "Your registration is still waiting for mentor approval."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                if (
                    status === "rejected"
                ) {

                    alert(
                        "Your student registration was rejected."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                if (
                    status !== "approved" &&
                    studentData.active !== true
                ) {

                    alert(
                        "Your student account is not active yet."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                /* ----------------------------------------------
                   Student Auth email
                ---------------------------------------------- */

                const loginEmail =
                    studentData.loginEmail ||
                    studentData.email;

                if (!loginEmail) {

                    alert(
                        "Student login information is incomplete."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                /* ----------------------------------------------
                   Firebase login
                ---------------------------------------------- */

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        loginEmail,
                        password
                    );

                const uid =
                    credential.user.uid;

                /* ----------------------------------------------
                   Verify Firebase UID profile
                ---------------------------------------------- */

                const userSnap =
                    await getDoc(
                        doc(db, "users", uid)
                    );

                if (!userSnap.exists()) {

                    await signOut(auth);

                    alert(
                        "Student profile was not found."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                const finalData =
                    userSnap.data();

                const finalStatus =
                    String(
                        finalData.status || ""
                    ).toLowerCase();

                if (
                    finalStatus !== "approved" &&
                    finalData.active !== true
                ) {

                    await signOut(auth);

                    alert(
                        "Your student account is not approved yet."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                /* ----------------------------------------------
                   SUCCESS
                ---------------------------------------------- */

                window.location.href =
                    "student-dashboard.html";

                return;
            }


            /* ==================================================
               OWNER / MENTOR / FACULTY LOGIN
            ================================================== */

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    loginValue,
                    password
                );

            const user =
                credential.user;

            const profileSnap =
                await getDoc(
                    doc(db, "users", user.uid)
                );

            if (!profileSnap.exists()) {

                await signOut(auth);

                alert(
                    "Your account profile was not found."
                );

                loginBtn.disabled = false;
                loginBtn.textContent = "Login";

                return;
            }

            const data =
                profileSnap.data();

            const role =
                String(
                    data.role || ""
                ).toLowerCase();

            const status =
                String(
                    data.status || ""
                ).toLowerCase();


            /* ----------------------------------------------
               OWNER
            ---------------------------------------------- */

            if (
                selectedRole === "owner"
            ) {

                if (
                    role !== "owner" &&
                    role !== "admin"
                ) {

                    await signOut(auth);

                    alert(
                        "This account is not an Owner account."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                window.location.href =
                    "admin-dashboard.html";

                return;
            }


            /* ----------------------------------------------
               MENTOR
            ---------------------------------------------- */

            if (
                selectedRole === "mentor"
            ) {

                if (role !== "mentor") {

                    await signOut(auth);

                    alert(
                        "This account is not a Mentor account."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                if (
                    status !== "active" &&
                    data.active !== true
                ) {

                    await signOut(auth);

                    alert(
                        "Your mentor account is not active."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                window.location.href =
                    "mentor-dashboard.html";

                return;
            }


            /* ----------------------------------------------
               FACULTY
            ---------------------------------------------- */

            if (
                selectedRole === "faculty"
            ) {

                if (role !== "faculty") {

                    await signOut(auth);

                    alert(
                        "This account is not a Faculty account."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                if (
                    status !== "active" &&
                    data.active !== true
                ) {

                    await signOut(auth);

                    alert(
                        "Your faculty account is not active."
                    );

                    loginBtn.disabled = false;
                    loginBtn.textContent = "Login";

                    return;
                }

                window.location.href =
                    "faculty-dashboard.html";

                return;
            }


            /* ----------------------------------------------
               UNKNOWN ROLE
            ---------------------------------------------- */

            await signOut(auth);

            alert(
                "Your account role is not configured."
            );

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            let message =
                "Login failed.";

            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message =
                    "Invalid Student ID/email or password.";

            } else if (
                error.code ===
                "auth/wrong-password"
            ) {

                message =
                    "Incorrect password.";

            } else if (
                error.code ===
                "auth/user-not-found"
            ) {

                message =
                    "Account not found.";

            } else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                message =
                    "Too many login attempts. Please try again later.";

            } else if (
                error.code ===
                "permission-denied"
            ) {

                message =
                    "Firestore permission denied. Check your Firestore rules.";

            } else if (error.message) {

                message =
                    error.message;
            }

            alert(message);

        } finally {

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

        }

    });

}


/* ======================================================
   SHOW / HIDE PASSWORD
====================================================== */

const togglePassword =
    $("togglePassword");

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const password =
                $("password");

            if (!password) return;

            if (
                password.type === "password"
            ) {

                password.type = "text";
                togglePassword.textContent = "🙈";

            } else {

                password.type = "password";
                togglePassword.textContent = "👁";

            }

        }
    );

}


/* ======================================================
   FORGOT PASSWORD
====================================================== */

const forgotPassword =
    $("forgotPassword");

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async () => {

            const value =
                $("email")?.value.trim();

            if (!value) {

                alert(
                    selectedRole === "student"
                        ? "Enter your Student ID first."
                        : "Enter your email address first."
                );

                return;
            }

            try {

                let email = value;

                /* ------------------------------------------
                   Student forgot password
                ------------------------------------------ */

                if (
                    selectedRole === "student"
                ) {

                    const studentId =
                        value.toUpperCase();

                    const q =
                        query(
                            collection(db, "users"),
                            where(
                                "studentId",
                                "==",
                                studentId
                            )
                        );

                    const snap =
                        await getDocs(q);

                    if (snap.empty) {

                        alert(
                            "Student ID not found."
                        );

                        return;
                    }

                    const data =
                        snap.docs[0].data();

                    email =
                        data.loginEmail ||
                        data.email;

                    if (!email) {

                        alert(
                            "No recovery email is available for this student account."
                        );

                        return;
                    }
                }

                /* ------------------------------------------
                   Send Firebase reset email
                ------------------------------------------ */

                await sendPasswordResetEmail(
                    auth,
                    email
                );

                alert(
                    "Password reset link has been sent to your registered email."
                );

            } catch (error) {

                console.error(
                    "PASSWORD RESET ERROR:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to send password reset email."
                );
            }

        }
    );

}


/* ======================================================
   INITIAL MODE
====================================================== */

updateLoginMode();
