// ============================================================
// R MOHAN DIGITAL
// TEAM LOGIN AUTHENTICATION
// File: js/admin-auth.js
//
// Used ONLY by admin.html
//
// Roles:
//   Owner
//   Mentor
//   Editor
//   Faculty
//
// IMPORTANT:
// - NO student login code
// - NO student puzzle
// - NO password eye code
// - Password eye is handled by admin.html
// - Role selection is handled by admin.html
// ============================================================


import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase.js";


// ============================================================
// DOM ELEMENTS
// ============================================================

const loginEmail =
    document.getElementById("loginEmail");


const loginPassword =
    document.getElementById("loginPassword");


const loginButton =
    document.getElementById("loginButton");


const loginMessage =
    document.getElementById("loginMessage");


// ============================================================
// MESSAGE FUNCTION
// ============================================================

function showMessage(message, type = "error") {

    if (!loginMessage) {
        return;
    }


    loginMessage.textContent = message;


    if (type === "success") {

        loginMessage.style.color =
            "#22c55e";

    } else if (type === "info") {

        loginMessage.style.color =
            "#38bdf8";

    } else if (type === "warning") {

        loginMessage.style.color =
            "#facc15";

    } else {

        loginMessage.style.color =
            "#f87171";
    }

}


// ============================================================
// NORMALIZE ROLE
// ============================================================

function normalizeRole(role) {

    if (!role) {
        return "";
    }


    return String(role)
        .trim()
        .toLowerCase();

}


// ============================================================
// ROLE DISPLAY NAME
// ============================================================

function roleDisplayName(role) {

    const normalized =
        normalizeRole(role);


    switch (normalized) {

        case "admin":
        case "owner":
            return "Owner";


        case "mentor":
            return "Mentor";


        case "faculty":
            return "Faculty";


        case "editor":
            return "Editor";


        default:
            return "Team Member";
    }

}


// ============================================================
// GET SELECTED ROLE
//
// admin.html stores the selected role in:
//
// window.selectedLoginRole
// ============================================================

function getSelectedRole() {

    return normalizeRole(
        window.selectedLoginRole
    );

}


// ============================================================
// CHECK ROLE
// ============================================================

function roleMatches(
    selectedRole,
    firebaseRole
) {

    const selected =
        normalizeRole(selectedRole);


    const firebase =
        normalizeRole(firebaseRole);


    // --------------------------------------------------------
    // OWNER
    //
    // The Owner button uses data-role="admin".
    //
    // Firebase may contain either:
    // owner
    // admin
    // --------------------------------------------------------

    if (selected === "admin") {

        return (
            firebase === "admin" ||
            firebase === "owner"
        );

    }


    // --------------------------------------------------------
    // OTHER ROLES
    // --------------------------------------------------------

    return selected === firebase;

}


// ============================================================
// REDIRECT TO DASHBOARD
// ============================================================

function redirectUser(role) {

    const normalized =
        normalizeRole(role);


    // --------------------------------------------------------
    // OWNER / ADMIN
    // --------------------------------------------------------

    if (
        normalized === "owner" ||
        normalized === "admin"
    ) {

        window.location.href =
            "admin-dashboard.html";

        return;
    }


    // --------------------------------------------------------
    // MENTOR
    // --------------------------------------------------------

    if (normalized === "mentor") {

        window.location.href =
            "mentor-dashboard.html";

        return;
    }


    // --------------------------------------------------------
    // FACULTY
    // --------------------------------------------------------

    if (normalized === "faculty") {

        window.location.href =
            "faculty-dashboard.html";

        return;
    }


    // --------------------------------------------------------
    // EDITOR
    // --------------------------------------------------------

    if (normalized === "editor") {

        window.location.href =
            "editor-dashboard.html";

        return;
    }


    // --------------------------------------------------------
    // UNKNOWN
    // --------------------------------------------------------

    showMessage(
        "Dashboard is not configured for this role."
    );

}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function firebaseErrorMessage(error) {

    if (!error) {

        return "Login failed.";

    }


    console.error(
        "Firebase error code:",
        error.code
    );


    switch (error.code) {

        case "auth/invalid-credential":

            return (
                "Incorrect email or password."
            );


        case "auth/invalid-login-credentials":

            return (
                "Incorrect email or password."
            );


        case "auth/user-not-found":

            return (
                "Team account not found."
            );


        case "auth/wrong-password":

            return (
                "Incorrect password."
            );


        case "auth/invalid-email":

            return (
                "Please enter a valid email address."
            );


        case "auth/user-disabled":

            return (
                "This account has been disabled."
            );


        case "auth/too-many-requests":

            return (
                "Too many login attempts. Please try again later."
            );


        case "auth/network-request-failed":

            return (
                "Network error. Check your internet connection."
            );


        case "auth/api-key-not-valid":

            return (
                "Firebase API key is invalid. " +
                "Please check js/firebase.js."
            );


        case "auth/operation-not-allowed":

            return (
                "Email/password login is not enabled in Firebase."
            );


        default:

            return (
                error.message ||
                "Unable to login."
            );
    }

}


// ============================================================
// TEAM LOGIN
// ============================================================

async function teamLogin() {

    // --------------------------------------------------------
    // GET ROLE
    // --------------------------------------------------------

    const selectedRole =
        getSelectedRole();


    // --------------------------------------------------------
    // CHECK ROLE
    // --------------------------------------------------------

    if (!selectedRole) {

        showMessage(
            "Please select Mentor, Owner, Editor or Faculty first.",
            "warning"
        );

        return;
    }


    // --------------------------------------------------------
    // GET EMAIL
    // --------------------------------------------------------

    const email =
        loginEmail
            ? loginEmail.value.trim()
            : "";


    // --------------------------------------------------------
    // GET PASSWORD
    // --------------------------------------------------------

    const password =
        loginPassword
            ? loginPassword.value
            : "";


    // --------------------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------------------

    if (!email) {

        showMessage(
            "Please enter your email address.",
            "warning"
        );


        if (loginEmail) {
            loginEmail.focus();
        }


        return;
    }


    // --------------------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------------------

    if (!password) {

        showMessage(
            "Please enter your password.",
            "warning"
        );


        if (loginPassword) {
            loginPassword.focus();
        }


        return;
    }


    // --------------------------------------------------------
    // DISABLE LOGIN BUTTON
    // --------------------------------------------------------

    if (loginButton) {

        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";
    }


    showMessage(
        "Checking your account...",
        "info"
    );


    try {

        // ====================================================
        // FIREBASE AUTHENTICATION
        // ====================================================

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        console.log(
            "Firebase team login successful:",
            user.uid
        );


        // ====================================================
        // LOAD FIRESTORE USER PROFILE
        // ====================================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnap =
            await getDoc(userRef);


        // ====================================================
        // PROFILE NOT FOUND
        // ====================================================

        if (!userSnap.exists()) {

            await signOut(auth);


            showMessage(
                "Profile not found. Please contact the Owner."
            );


            return;
        }


        // ====================================================
        // USER DATA
        // ====================================================

        const userData =
            userSnap.data();


        console.log(
            "Team user profile:",
            userData
        );


        // ====================================================
        // FIRESTORE ROLE
        // ====================================================

        const firebaseRole =
            normalizeRole(
                userData.role
            );


        console.log(
            "Selected role:",
            selectedRole
        );


        console.log(
            "Firebase role:",
            firebaseRole
        );


        // ====================================================
        // ROLE CHECK
        // ====================================================

        if (
            !roleMatches(
                selectedRole,
                firebaseRole
            )
        ) {

            await signOut(auth);


            showMessage(
                "This account is not registered as " +
                roleDisplayName(selectedRole) +
                "."
            );


            return;
        }


        // ====================================================
        // ACCOUNT STATUS
        // ====================================================

        const status =
            normalizeRole(
                userData.status
            );


        const active =
            userData.active === true;


        console.log(
            "Account status:",
            status
        );


        console.log(
            "Account active:",
            active
        );


        // ====================================================
        // OWNER / ADMIN
        //
        // Owner is allowed to login without requiring
        // status="active".
        // ====================================================

        if (
            firebaseRole === "owner" ||
            firebaseRole === "admin"
        ) {

            showMessage(
                "Owner login successful.",
                "success"
            );


            try {

                sessionStorage.setItem(
                    "teamRole",
                    firebaseRole
                );


                sessionStorage.setItem(
                    "teamName",
                    userData.name || ""
                );


                sessionStorage.setItem(
                    "teamEmail",
                    user.email || email
                );

            } catch (storageError) {

                console.warn(
                    "Session storage error:",
                    storageError
                );

            }


            setTimeout(
                function () {

                    redirectUser(
                        firebaseRole
                    );

                },
                400
            );


            return;
        }


        // ====================================================
        // MENTOR
        // ====================================================

        if (firebaseRole === "mentor") {

            if (
                status !== "active" &&
                !active
            ) {

                await signOut(auth);


                showMessage(
                    "Your mentor account is not active."
                );


                return;
            }


            showMessage(
                "Mentor login successful.",
                "success"
            );


            try {

                sessionStorage.setItem(
                    "teamRole",
                    "mentor"
                );


                sessionStorage.setItem(
                    "teamName",
                    userData.name || ""
                );


                sessionStorage.setItem(
                    "teamEmail",
                    user.email || email
                );

            } catch (storageError) {

                console.warn(
                    "Session storage error:",
                    storageError
                );

            }


            setTimeout(
                function () {

                    redirectUser(
                        firebaseRole
                    );

                },
                400
            );


            return;
        }


        // ====================================================
        // FACULTY
        // ====================================================

        if (firebaseRole === "faculty") {

            if (
                status !== "active" &&
                status !== "approved" &&
                !active
            ) {

                await signOut(auth);


                showMessage(
                    "Your faculty account is not active."
                );


                return;
            }


            showMessage(
                "Faculty login successful.",
                "success"
            );


            try {

                sessionStorage.setItem(
                    "teamRole",
                    "faculty"
                );


                sessionStorage.setItem(
                    "teamName",
                    userData.name || ""
                );


                sessionStorage.setItem(
                    "teamEmail",
                    user.email || email
                );

            } catch (storageError) {

                console.warn(
                    "Session storage error:",
                    storageError
                );

            }


            setTimeout(
                function () {

                    redirectUser(
                        firebaseRole
                    );

                },
                400
            );


            return;
        }


        // ====================================================
        // EDITOR
        // ====================================================

        if (firebaseRole === "editor") {

            if (
                status !== "active" &&
                status !== "approved" &&
                !active
            ) {

                await signOut(auth);


                showMessage(
                    "Your editor account is not active."
                );


                return;
            }


            showMessage(
                "Editor login successful.",
                "success"
            );


            try {

                sessionStorage.setItem(
                    "teamRole",
                    "editor"
                );


                sessionStorage.setItem(
                    "teamName",
                    userData.name || ""
                );


                sessionStorage.setItem(
                    "teamEmail",
                    user.email || email
                );

            } catch (storageError) {

                console.warn(
                    "Session storage error:",
                    storageError
                );

            }


            setTimeout(
                function () {

                    redirectUser(
                        firebaseRole
                    );

                },
                400
            );


            return;
        }


        // ====================================================
        // UNKNOWN ROLE
        // ====================================================

        await signOut(auth);


        showMessage(
            "Your account role is not configured."
        );


    } catch (error) {

        console.error(
            "Team login error:",
            error
        );


        showMessage(
            firebaseErrorMessage(error)
        );


    } finally {

        if (loginButton) {

            loginButton.disabled = false;

            loginButton.textContent =
                "Team Login";
        }

    }

}


// ============================================================
// LOGIN BUTTON
// ============================================================

if (loginButton) {

    loginButton.addEventListener(
        "click",
        teamLogin
    );

}


// ============================================================
// ENTER KEY
// ============================================================

if (loginPassword) {

    loginPassword.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                teamLogin();

            }

        }
    );

}


// ============================================================
// INITIAL CONSOLE
// ============================================================

console.log(
    "R Mohan Digital Team Login loaded successfully."
);


console.log(
    "Student puzzle is NOT loaded on admin.html."
);


console.log(
    "Password eye is controlled by admin.html."
);


console.log(
    "Role selection is controlled by admin.html."
);
