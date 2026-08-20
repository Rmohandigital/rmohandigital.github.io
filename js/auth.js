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
// GET LOGIN FORM
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
    // FIRST: CHECK NORMAL "users" COLLECTION
    // ======================================

    try {

        const normalQuery = query(
            collection(db, "users"),
            where("email", "==", user.email)
        );

        const normalSnapshot =
            await getDocs(normalQuery);

        if (!normalSnapshot.empty) {

            const profileDoc =
                normalSnapshot.docs[0];

            return {
                id: profileDoc.id,
                data: profileDoc.data()
            };

        }

    } catch (error) {

        console.log(
            "Normal users collection check:",
            error
        );

    }


    // ======================================
    // SECOND: CHECK YOUR FACULTY COLLECTIONS
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
                "Checking " +
                collectionName +
                ":",
                error
            );

        }

    }


    // ======================================
    // USER NOT FOUND
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
                // FIREBASE AUTH LOGIN
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
                    "User logged in:",
                    user.uid
                );


                console.log(
                    "User email:",
                    user.email
                );


                // ==================================
                // FIND PROFILE
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


                console.log(
                    "User profile:",
                    userData
                );


                console.log(
                    "User role:",
                    role
                );


                console.log(
                    "User status:",
                    status
                );


                console.log(
                    "Profile collection:",
                    profile.collection ||
                    "users"
                );


                console.log(
                    "Profile document ID:",
                    profile.id
                );


                // ==================================
                // CHECK ACCOUNT STATUS
                // ==================================

                if (
                    status &&
                    status !== "active"
                ) {

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "Your account is not active. Please contact the administrator.";

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
                            role ===
                            "faculty"
                        ) {

                            window.location.href =
                                "faculty-dashboard.html";

                        }


                        // ==========================
                        // MENTOR
                        // ==========================

                        else if (
                            role ===
                            "mentor"
                        ) {

                            window.location.href =
                                "admin.html";

                        }


                        // ==========================
                        // ADMIN
                        // ==========================

                        else if (
                            role ===
                            "admin"
                        ) {

                            window.location.href =
                                "admin.html";

                        }


                        // ==========================
                        // STUDENT
                        // ==========================

                        else if (
                            role ===
                            "student"
                        ) {

                            window.location.href =
                                "dashboard.html";

                        }


                        // ==========================
                        // UNKNOWN ROLE
                        // ==========================

                        else {

                            loginMessage.style.color =
                                "red";

                            loginMessage.textContent =
                                "Your account role is not configured.";

                            console.error(
                                "Unknown role:",
                                role
                            );

                        }

                    },
                    800
                );


            } catch (error) {

                // ==================================
                // ERROR
                // ==================================

                console.error(
                    "Firebase Login Error:",
                    error
                );


                loginMessage.style.color =
                    "red";


                // ==================================
                // INVALID LOGIN
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
                        "Too many attempts. Please try again later.";

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
                        "Login failed. Please try again.";

                }

            }

        }
    );

}