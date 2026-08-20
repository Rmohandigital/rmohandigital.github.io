// ==========================================
// R MOHAN DIGITAL - LOGIN & ROLE SYSTEM
// ==========================================

import { auth, db } from "../firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ==========================================
// SHOW / HIDE PASSWORD
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

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


// ==========================================
// FIND USER PROFILE
// ==========================================

async function findUserProfile(user) {

    // ======================================
    // CHECK "users" COLLECTION
    // ======================================

    try {

        const usersQuery = query(
            collection(db, "users"),
            where("email", "==", user.email)
        );

        const usersSnapshot =
            await getDocs(usersQuery);


        if (!usersSnapshot.empty) {

            const profileDoc =
                usersSnapshot.docs[0];

            return {
                id: profileDoc.id,
                data: profileDoc.data(),
                collection: "users"
            };

        }

    } catch (error) {

        console.log(
            "Error checking users collection:",
            error
        );

    }


    // ======================================
    // CHECK FACULTY COLLECTIONS
    // ======================================

    const facultyCollections = [
        "users H",
        "users j1",
        "users j2"
    ];


    for (
        const collectionName
        of facultyCollections
    ) {

        try {

            const facultyQuery = query(
                collection(db, collectionName),
                where("email", "==", user.email)
            );


            const facultySnapshot =
                await getDocs(facultyQuery);


            if (!facultySnapshot.empty) {

                const facultyDoc =
                    facultySnapshot.docs[0];

                return {
                    id: facultyDoc.id,
                    data: facultyDoc.data(),
                    collection: collectionName
                };

            }

        } catch (error) {

            console.log(
                "Error checking " +
                collectionName +
                ":",
                error
            );

        }

    }


    // ======================================
    // PROFILE NOT FOUND
    // ======================================

    return null;

}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ==================================
            // GET EMAIL
            // ==================================

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            // ==================================
            // GET PASSWORD
            // ==================================

            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            // ==================================
            // CHECK EMPTY
            // ==================================

            if (
                email === "" ||
                password === ""
            ) {

                loginMessage.style.color =
                    "red";

                loginMessage.textContent =
                    "Please enter email and password.";

                return;

            }


            // ==================================
            // LOGIN MESSAGE
            // ==================================

            loginMessage.style.color =
                "#2563eb";

            loginMessage.textContent =
                "Logging in...";


            try {

                // ==================================
                // FIREBASE AUTHENTICATION
                // ==================================

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "================================"
                );

                console.log(
                    "USER LOGGED IN"
                );

                console.log(
                    "UID:",
                    user.uid
                );

                console.log(
                    "EMAIL:",
                    user.email
                );

                console.log(
                    "================================"
                );


                // ==================================
                // FIND FIRESTORE PROFILE
                // ==================================

                const profile =
                    await findUserProfile(user);


                // ==================================
                // PROFILE NOT FOUND
                // ==================================

                if (!profile) {

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "Account profile not found. Please contact the administrator.";

                    alert(
                        "Firebase login succeeded, but no Firestore profile was found for:\n\n" +
                        user.email
                    );

                    return;

                }


                // ==================================
                // USER DATA
                // ==================================

                const userData =
                    profile.data;


                const role =
                    userData.role;


                const status =
                    userData.status;


                // ==================================
                // DEBUG INFORMATION
                // ==================================

                console.log(
                    "PROFILE COLLECTION:",
                    profile.collection
                );

                console.log(
                    "PROFILE DOCUMENT ID:",
                    profile.id
                );

                console.log(
                    "PROFILE DATA:",
                    userData
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
                // IMPORTANT DEBUG POPUP
                // ==================================

                alert(
                    "LOGIN PROFILE FOUND\n\n" +

                    "Email: " +
                    user.email +

                    "\n\nRole: " +
                    role +

                    "\n\nStatus: " +
                    status +

                    "\n\nCollection: " +
                    profile.collection +

                    "\n\nDocument ID: " +
                    profile.id
                );


                // ==================================
                // CHECK STATUS
                // ==================================

                if (
                    status &&
                    status.toLowerCase() !== "active"
                ) {

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "Your account is not active.";

                    return;

                }


                // ==================================
                // LOGIN SUCCESS
                // ==================================

                loginMessage.style.color =
                    "green";

                loginMessage.textContent =
                    "Login successful!";


                // ==================================
                // ROLE REDIRECTION
                // ==================================

                setTimeout(
                    () => {

                        // ==========================
                        // FACULTY
                        // ==========================

                        if (
                            role &&
                            role.toLowerCase() ===
                            "faculty"
                        ) {

                            window.location.href =
                                "faculty-dashboard.html";

                            return;

                        }


                        // ==========================
                        // ADMIN
                        // ==========================

                        if (
                            role &&
                            role.toLowerCase() ===
                            "admin"
                        ) {

                            window.location.href =
                                "admin-dashboard.html";

                            return;

                        }


                        // ==========================
                        // MENTOR
                        // ==========================

                        if (
                            role &&
                            role.toLowerCase() ===
                            "mentor"
                        ) {

                            window.location.href =
                                "admin-dashboard.html";

                            return;

                        }


                        // ==========================
                        // STUDENT
                        // ==========================

                        if (
                            role &&
                            role.toLowerCase() ===
                            "student"
                        ) {

                            window.location.href =
                                "dashboard.html";

                            return;

                        }


                        // ==========================
                        // UNKNOWN ROLE
                        // ==========================

                        loginMessage.style.color =
                            "red";

                        loginMessage.textContent =
                            "Your account role is not configured.";

                    },
                    800
                );


            } catch (error) {

                // ==================================
                // FIREBASE ERROR
                // ==================================

                console.error(
                    "Firebase Login Error:",
                    error
                );


                loginMessage.style.color =
                    "red";


                // ==================================
                // INVALID CREDENTIAL
                // ==================================

                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    loginMessage.textContent =
                        "Incorrect email or password.";

                }


                // ==================================
                // INVALID EMAIL
                // ==================================

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    loginMessage.textContent =
                        "Please enter a valid email address.";

                }


                // ==================================
                // TOO MANY REQUESTS
                // ==================================

                else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    loginMessage.textContent =
                        "Too many login attempts. Please try again later.";

                }


                // ==================================
                // PERMISSION DENIED
                // ==================================

                else if (
                    error.code ===
                    "permission-denied"
                ) {

                    loginMessage.textContent =
                        "Permission denied. Please contact the administrator.";

                }


                // ==================================
                // OTHER ERROR
                // ==================================

                else {

                    loginMessage.textContent =
                        "Login failed: " +
                        error.message;

                }

            }

        }
    );

}