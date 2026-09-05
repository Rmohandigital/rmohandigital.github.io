// ==========================================================
// R MOHAN DIGITAL - STUDENT REGISTRATION
// ==========================================================
// IMPORTANT:
// 1. OTP is completely removed.
// 2. Existing ₹50 UPI/QR is NOT changed.
// 3. Payment screenshot is required.
// 4. Student ID is generated automatically: SM12345678
// 5. Firebase Auth account is created first.
// 6. Firestore users/{UID} and students/{UID} are created.
// 7. Student remains pending until Mentor approves.
// 8. Login will use Student ID + Password.
// ==========================================================

import {
    auth,
    db
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ==========================================================
// GET HTML ELEMENTS
// ==========================================================

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const phoneInput = document.getElementById("phone");
const courseInput = document.getElementById("course");

const registerBtn = document.getElementById("registerBtn");
const paymentScreenshotInput =
    document.getElementById("paymentScreenshot");


// ==========================================================
// BASIC CHECK
// ==========================================================

if (!registerBtn) {
    console.error("Register button not found.");
}


// ==========================================================
// SETTINGS
// ==========================================================

const REGISTRATION_FEE = 50;

const STUDENT_EMAIL_DOMAIN =
    "@student.rmdigital.local";


// ==========================================================
// GENERATE STUDENT ID
// Example:
// SM12345678
// ==========================================================

function generateStudentId() {

    const number =
        Math.floor(
            10000000 +
            Math.random() * 90000000
        );

    return "SM" + number;
}


// ==========================================================
// CREATE INTERNAL LOGIN EMAIL
//
// Student enters:
// Student ID: SM12345678
//
// Firebase internally uses:
// sm12345678@student.rmdigital.local
//
// The student NEVER needs to know this email.
// ==========================================================

function createLoginEmail(studentId) {

    return (
        studentId.toLowerCase() +
        STUDENT_EMAIL_DOMAIN
    );
}


// ==========================================================
// COMPRESS PAYMENT SCREENSHOT
//
// Firebase Storage is NOT required.
// Image is saved as a compressed data URL
// inside Firestore.
//
// We keep it small to avoid Firestore's document-size limit.
// ==========================================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        if (!file) {
            reject(
                new Error("Payment screenshot is required.")
            );
            return;
        }

        if (!file.type.startsWith("image/")) {
            reject(
                new Error(
                    "Please upload a valid image."
                )
            );
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                // ------------------------------------------
                // Maximum image dimensions
                // ------------------------------------------

                const MAX_SIZE = 900;

                let width = img.width;
                let height = img.height;

                if (width > MAX_SIZE || height > MAX_SIZE) {

                    if (width > height) {

                        height =
                            Math.round(
                                height *
                                (MAX_SIZE / width)
                            );

                        width = MAX_SIZE;

                    } else {

                        width =
                            Math.round(
                                width *
                                (MAX_SIZE / height)
                            );

                        height = MAX_SIZE;
                    }
                }


                // ------------------------------------------
                // Canvas
                // ------------------------------------------

                const canvas =
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );


                // ------------------------------------------
                // Try progressively smaller JPEG
                // ------------------------------------------

                let quality = 0.70;

                let dataUrl =
                    canvas.toDataURL(
                        "image/jpeg",
                        quality
                    );


                // Reduce size if necessary
                while (
                    dataUrl.length > 700000 &&
                    quality > 0.30
                ) {

                    quality -= 0.10;

                    dataUrl =
                        canvas.toDataURL(
                            "image/jpeg",
                            quality
                        );
                }


                // ------------------------------------------
                // Final safety check
                // ------------------------------------------

                if (dataUrl.length > 750000) {

                    reject(
                        new Error(
                            "Payment screenshot is too large. Please upload a smaller image."
                        )
                    );

                    return;
                }


                resolve(dataUrl);
            };


            img.onerror = function () {

                reject(
                    new Error(
                        "Could not read the payment screenshot."
                    )
                );
            };


            img.src = event.target.result;
        };


        reader.onerror = function () {

            reject(
                new Error(
                    "Could not read the selected file."
                )
            );
        };


        reader.readAsDataURL(file);
    });
}


// ==========================================================
// VALIDATE FORM
// ==========================================================

function validateForm() {

    const name =
        nameInput?.value.trim() || "";

    const email =
        emailInput?.value.trim() || "";

    const password =
        passwordInput?.value || "";

    const phone =
        phoneInput?.value.trim() || "";

    const course =
        courseInput?.value || "";


    // ------------------------------------------
    // Name
    // ------------------------------------------

    if (!name) {

        alert("Please enter your full name.");

        nameInput?.focus();

        return false;
    }


    // ------------------------------------------
    // Email
    // ------------------------------------------

    if (!email) {

        alert("Please enter your email address.");

        emailInput?.focus();

        return false;
    }


    // ------------------------------------------
    // Basic email validation
    // ------------------------------------------

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        alert(
            "Please enter a valid email address."
        );

        emailInput?.focus();

        return false;
    }


    // ------------------------------------------
    // Password
    // ------------------------------------------

    if (!password) {

        alert("Please enter a password.");

        passwordInput?.focus();

        return false;
    }


    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        passwordInput?.focus();

        return false;
    }


    // ------------------------------------------
    // Phone
    // ------------------------------------------

    if (!phone) {

        alert("Please enter your phone number.");

        phoneInput?.focus();

        return false;
    }


    // ------------------------------------------
    // Phone validation
    // ------------------------------------------

    const cleanPhone =
        phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {

        alert(
            "Please enter a valid phone number."
        );

        phoneInput?.focus();

        return false;
    }


    // ------------------------------------------
    // Course
    // ------------------------------------------

    if (!course) {

        alert("Please select a course.");

        courseInput?.focus();

        return false;
    }


    // ------------------------------------------
    // Payment screenshot
    // ------------------------------------------

    if (
        !paymentScreenshotInput ||
        !paymentScreenshotInput.files ||
        paymentScreenshotInput.files.length === 0
    ) {

        alert(
            "Please upload your ₹50 payment screenshot."
        );

        paymentScreenshotInput?.focus();

        return false;
    }


    return true;
}


// ==========================================================
// SHOW SUCCESS SCREEN
// ==========================================================

function showRegistrationSuccess(studentId) {

    const container =
        document.querySelector(
            ".registration-details"
        );


    if (!container) {

        alert(
            "Registration completed!\n\n" +
            "Your Student ID: " +
            studentId +
            "\n\n" +
            "Please wait for Mentor approval."
        );

        return;
    }


    // ------------------------------------------
    // Replace registration form content
    // ------------------------------------------

    container.innerHTML = `

        <div
            style="
                text-align:center;
                padding:25px 10px;
            "
        >

            <div
                style="
                    font-size:55px;
                    margin-bottom:15px;
                "
            >
                ✅
            </div>


            <h2
                style="
                    margin-bottom:15px;
                "
            >
                Registration Completed!
            </h2>


            <p
                style="
                    line-height:1.7;
                    margin-bottom:20px;
                "
            >
                Your registration has been submitted
                successfully.
            </p>


            <div
                style="
                    background:rgba(0,0,0,0.25);
                    border:2px solid rgba(255,255,255,0.2);
                    border-radius:12px;
                    padding:18px;
                    margin:20px 0;
                "
            >

                <p
                    style="
                        margin:0 0 8px 0;
                        font-size:14px;
                    "
                >
                    YOUR STUDENT ID
                </p>


                <div
                    style="
                        font-size:28px;
                        font-weight:bold;
                        letter-spacing:2px;
                        word-break:break-all;
                    "
                >
                    ${studentId}
                </div>

            </div>


            <p
                style="
                    line-height:1.7;
                    margin-bottom:20px;
                "
            >
                <strong>
                    Please wait for Mentor approval.
                </strong>
                <br>
                After approval, you can login using
                your Student ID and password.
            </p>


            <button
                id="goToLoginBtn"
                type="button"
                style="
                    width:100%;
                    padding:14px;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                    font-size:16px;
                    font-weight:bold;
                "
            >
                🔐 Go to Student Login
            </button>


            <p
                style="
                    margin-top:15px;
                    font-size:12px;
                    opacity:0.8;
                "
            >
                Please remember or save your Student ID.
            </p>

        </div>

    `;


    // ------------------------------------------
    // Login button
    // ------------------------------------------

    const goToLoginBtn =
        document.getElementById(
            "goToLoginBtn"
        );


    if (goToLoginBtn) {

        goToLoginBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "login.html?studentId=" +
                    encodeURIComponent(studentId);
            }
        );
    }
}


// ==========================================================
// REGISTER STUDENT
// ==========================================================

async function registerStudent() {

    // ------------------------------------------
    // Prevent double-click
    // ------------------------------------------

    if (
        registerBtn.disabled
    ) {
        return;
    }


    // ------------------------------------------
    // Validate
    // ------------------------------------------

    if (!validateForm()) {
        return;
    }


    // ------------------------------------------
    // Get values
    // ------------------------------------------

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    const phone =
        phoneInput.value.trim();

    const course =
        courseInput.value;


    const paymentFile =
        paymentScreenshotInput.files[0];


    // ------------------------------------------
    // Disable button
    // ------------------------------------------

    registerBtn.disabled = true;

    const originalButtonText =
        registerBtn.textContent;

    registerBtn.textContent =
        "Registering...";


    try {

        // ==================================================
        // STEP 1
        // Compress payment screenshot
        // ==================================================

        registerBtn.textContent =
            "Processing payment proof...";


        const paymentScreenshot =
            await compressImage(
                paymentFile
            );


        // ==================================================
        // STEP 2
        // Generate Student ID
        // ==================================================

        const studentId =
            generateStudentId();


        // ==================================================
        // STEP 3
        // Create Firebase internal login email
        // ==================================================

        const loginEmail =
            createLoginEmail(
                studentId
            );


        console.log(
            "Generated Student ID:",
            studentId
        );

        console.log(
            "Internal login email:",
            loginEmail
        );


        // ==================================================
        // STEP 4
        // CREATE FIREBASE AUTH ACCOUNT
        //
        // IMPORTANT:
        // This happens BEFORE Firestore.
        //
        // This is the important fix for:
        // "Firestore permission denied."
        // ==================================================

        registerBtn.textContent =
            "Creating student account...";


        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                loginEmail,
                password
            );


        const user =
            userCredential.user;


        const uid =
            user.uid;


        console.log(
            "Firebase Auth account created:",
            uid
        );


        // ==================================================
        // STEP 5
        // CREATE USERS PROFILE
        // ==================================================

        registerBtn.textContent =
            "Saving student profile...";


        const userData = {

            uid: uid,

            studentId: studentId,

            name: name,

            email: email,

            // Internal Firebase login email
            loginEmail: loginEmail,

            authEmail: loginEmail,

            phone: phone,

            course: course,

            role: "student",

            status: "pending",

            active: false,

            photoURL: "",

            assignedFaculty: "",

            assignedFacultyName: "",

            paymentAmount:
                REGISTRATION_FEE,

            paymentStatus: "pending",

            paymentScreenshot:
                paymentScreenshot,

            createdAt:
                serverTimestamp(),

            registeredAt:
                serverTimestamp()
        };


        await setDoc(
            doc(
                db,
                "users",
                uid
            ),
            userData
        );


        console.log(
            "users profile created."
        );


        // ==================================================
        // STEP 6
        // CREATE STUDENT PROFILE
        // ==================================================

        registerBtn.textContent =
            "Sending request to mentor...";


        const studentData = {

            uid: uid,

            studentId: studentId,

            name: name,

            email: email,

            loginEmail: loginEmail,

            phone: phone,

            course: course,

            role: "student",

            status: "pending",

            active: false,

            photoURL: "",

            assignedFaculty: "",

            assignedFacultyName: "",

            paymentAmount:
                REGISTRATION_FEE,

            paymentStatus: "pending",

            paymentScreenshot:
                paymentScreenshot,

            createdAt:
                serverTimestamp(),

            registeredAt:
                serverTimestamp()
        };


        await setDoc(
            doc(
                db,
                "students",
                uid
            ),
            studentData
        );


        console.log(
            "students profile created."
        );


        // ==================================================
        // STEP 7
        // SIGN OUT
        //
        // Student should NOT automatically enter dashboard.
        // Mentor must approve first.
        // ==================================================

        await signOut(auth);


        // ==================================================
        // STEP 8
        // SHOW STUDENT ID
        // ==================================================

        showRegistrationSuccess(
            studentId
        );


    } catch (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );


        // ==================================================
        // FIREBASE ERROR MESSAGES
        // ==================================================

        let message =
            "Registration failed.";


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "Registration could not be completed. Please try registering again.";
        }


        else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "Password is too weak. Please use at least 6 characters.";
        }


        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "There was a problem creating your account. Please check your details.";
        }


        else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Network error. Please check your internet connection and try again.";
        }


        else if (
            error.code ===
            "permission-denied" ||
            error.code ===
            "firestore/permission-denied"
        ) {

            message =
                "Firestore permission denied. Please check your Firestore security rules.";
        }


        else if (
            error.message &&
            error.message.toLowerCase()
                .includes("permission")
        ) {

            message =
                "Firestore permission denied. Please check your Firestore security rules.";
        }


        else if (
            error.message
        ) {

            console.error(
                "Full Firebase error:",
                error.message
            );
        }


        alert(message);


        // ------------------------------------------
        // Restore button
        // ------------------------------------------

        registerBtn.disabled = false;

        registerBtn.textContent =
            originalButtonText;
    }
}


// ==========================================================
// REGISTER BUTTON EVENT
// ==========================================================

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            registerStudent();
        }
    );
}


// ==========================================================
// ENTER KEY SUPPORT
// ==========================================================

[
    nameInput,
    emailInput,
    passwordInput,
    phoneInput
].forEach(function (input) {

    if (!input) {
        return;
    }

    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                registerStudent();
            }
        }
    );
});


// ==========================================================
// DEBUG MESSAGE
// ==========================================================

console.log(
    "R Mohan Digital register.js loaded successfully."
);
