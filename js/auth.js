// ==========================================
// R MOHAN DIGITAL
// LOGIN & ROLE SYSTEM
// OWNER + MENTOR + FACULTY + STUDENT
// ==========================================

import { auth, db } from "../firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ==========================================
// SELECTED LOGIN ROLE
// ==========================================

let selectedRole = "";


// ==========================================
// ROLE BUTTONS
// ==========================================
//
// Your login.html should have buttons with:
//
// data-role="owner"
// data-role="mentor"
// data-role="faculty"
// data-role="student"
//
// Example:
//
// <button class="role-btn" data-role="owner">
//     👑 Owner
// </button>
//

const roleButtons =
    document.querySelectorAll(
        ".role-btn"
    );


roleButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                // Remove selection
                roleButtons.forEach(
                    btn => {
                        btn.classList.remove(
                            "selected"
                        );
                    }
                );


                // Select clicked button
                this.classList.add(
                    "selected"
                );


                selectedRole =
                    String(
                        this.dataset.role || ""
                    )
                    .trim()
                    .toLowerCase();


                console.log(
                    "Selected login role:",
                    selectedRole
                );


                const loginMessage =
                    document.getElementById(
                        "loginMessage"
                    );


                if (loginMessage) {

                    loginMessage.style.color =
                        "#00e5ff";

                    loginMessage.textContent =
                        "Selected: " +
                        this.textContent.trim();

                }

            }
        );

    }
);


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

window.toggleLoginPassword =
function () {

    const password =
        document.getElementById(
            "loginPassword"
        );

    const button =
        document.querySelector(
            ".toggle-password"
        );


    if (!password || !button) {
        return;
    }


    if (
        password.type ===
        "password"
    ) {

        password.type =
            "text";

        button.textContent =
            "🙈";

    }

    else {

        password.type =
            "password";

        button.textContent =
            "👁";

    }

};


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==================================
            // GET INPUTS
            // ==================================

            const emailInput =
                document.getElementById(
                    "loginEmail"
                );


            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                console.error(
                    "Login input fields not found."
                );

                return;

            }


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            // ==================================
            // EMPTY CHECK
            // ==================================

            if (
                !email ||
                !password
            ) {

                loginMessage.style.color =
                    "red";

                loginMessage.textContent =
                    "Please enter email and password.";

                return;

            }


            // ==================================
            // ROLE SELECTION CHECK
            // ==================================

            if (!selectedRole) {

                loginMessage.style.color =
                    "red";

                loginMessage.textContent =
                    "Please select Owner, Mentor, Faculty or Student.";

                return;

            }


            loginMessage.style.color =
                "#00e5ff";

            loginMessage.textContent =
                "Logging in...";


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


                // ==================================
                // GET USER PROFILE
                // ==================================

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userSnapshot =
                    await getDoc(
                        userRef
                    );


                // ==================================
                // PROFILE NOT FOUND
                // ==================================

                if (
                    !userSnapshot.exists()
                ) {

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "Your Firebase profile is not found.";

                    console.error(
                        "Missing users document:",
                        user.uid
                    );

                    return;

                }


                // ==================================
                // USER DATA
                // ==================================

                const userData =
                    userSnapshot.data();


                console.log(
                    "Firebase user data:",
                    userData
                );


                // ==================================
                // ROLE
                // ==================================

                const role =
                    String(
                        userData.role || ""
                    )
                    .trim()
                    .toLowerCase();


                // ==================================
                // STATUS
                // ==================================

                const status =
                    String(
                        userData.status || ""
                    )
                    .trim()
                    .toLowerCase();


                console.log(
                    "Database role:",
                    role
                );


                console.log(
                    "Database status:",
                    status
                );


                // ==================================
                // ROLE NOT CONFIGURED
                // ==================================

                if (!role) {

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "Your account role is not configured.";

                    return;

                }


                // ==================================
                // SELECTED ROLE MATCH
                // ==================================

                let rolesMatch = false;


                // OWNER
                if (
                    selectedRole ===
                    "owner"
                ) {

                    if (
                        role === "owner" ||
                        role === "admin"
                    ) {

                        rolesMatch = true;

                    }

                }


                // MENTOR
                else if (
                    selectedRole ===
                    "mentor"
                ) {

                    if (
                        role === "mentor"
                    ) {

                        rolesMatch = true;

                    }

                }


                // FACULTY
                else if (
                    selectedRole ===
                    "faculty"
                ) {

                    if (
                        role === "faculty"
                    ) {

                        rolesMatch = true;

                    }

                }


                // STUDENT
                else if (
                    selectedRole ===
                    "student"
                ) {

                    if (
                        role === "student"
                    ) {

                        rolesMatch = true;

                    }

                }


                // ==================================
                // WRONG ROLE
                // ==================================

                if (!rolesMatch) {

                    loginMessage.style.color =
                        "red";

                    loginMessage.textContent =
                        "This account does not belong to the selected role.";

                    console.error(
                        "Selected role:",
                        selectedRole,
                        "Database role:",
                        role
                    );

                    return;

                }


                // ==================================
                // STATUS CHECK
                // ==================================

                if (
                    status !== "active"
                ) {

                    loginMessage.style.color =
                        "red";


                    if (
                        status ===
                        "pending"
                    ) {

                        loginMessage.textContent =
                            "Your account is pending approval.";

                    }

                    else if (
                        status ===
                        "rejected"
                    ) {

                        loginMessage.textContent =
                            "Your account has been rejected.";

                    }

                    else {

                        loginMessage.textContent =
                            "Your account is not active.";

                    }


                    return;

                }


                // ==================================
                // LOGIN SUCCESS
                // ==================================

                loginMessage.style.color =
                    "#00ff88";

                loginMessage.textContent =
                    "Login successful!";


                // ==================================
                // REDIRECT
                // ==================================

                setTimeout(
                    function () {


                        // ==========================
                        // OWNER
                        // ==========================

                        if (
                            role === "owner" ||
                            role === "admin"
                        ) {

                            window.location.href =
                                "admin-dashboard.html";

                            return;

                        }


                        // ==========================
                        // MENTOR
                        // ==========================

                        if (
                            role === "mentor"
                        ) {

                            window.location.href =
                                "mentor-dashboard.html";

                            return;

                        }


                        // ==========================
                        // FACULTY
                        // ==========================

                        if (
                            role === "faculty"
                        ) {

                            window.location.href =
                                "faculty-dashboard.html";

                            return;

                        }


                        // ==========================
                        // STUDENT
                        // ==========================

                        if (
                            role === "student"
                        ) {

                            window.location.href =
                                "dashboard.html";

                            return;

                        }


                    },
                    600
                );


            }

            catch (error) {

                console.error(
                    "Firebase login error:",
                    error
                );


                loginMessage.style.color =
                    "red";


                // ==================================
                // FIREBASE ERROR MESSAGES
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
                    "auth/user-not-found"
                ) {

                    loginMessage.textContent =
                        "No account found with this email.";

                }

                else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    loginMessage.textContent =
                        "Incorrect password.";

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

                }

            }

        }
    );

}