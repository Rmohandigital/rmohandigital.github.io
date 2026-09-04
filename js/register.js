// ============================================================
// R MOHAN DIGITAL - FINAL STUDENT REGISTRATION
// Existing QR / UPI Payment + Payment Screenshot
// Added: Phone Number OTP Verification
// ============================================================

import {
    auth,
    db,
    storage
} from "../firebase.js";

import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    EmailAuthProvider,
    linkWithCredential,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";


// ============================================================
// VARIABLES
// ============================================================

let confirmationResult = null;

let phoneVerified = false;

let recaptchaVerifier = null;

let otpSection = null;

let registerBtn = null;


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    registerBtn =
        document.getElementById("registerBtn");

    createOTPSection();

    if (registerBtn) {

        registerBtn.addEventListener(
            "click",
            registerStudent
        );

    }

});


// ============================================================
// CREATE OTP UI
// This is added automatically.
// Your original register.html does NOT need to be redesigned.
// ============================================================

function createOTPSection() {

    const phoneInput =
        document.getElementById("phone");

    if (!phoneInput) {
        console.error("Phone input not found.");
        return;
    }


    const phoneGroup =
        phoneInput.closest(".input-group");


    if (!phoneGroup) {
        console.error("Phone input group not found.");
        return;
    }


    // Prevent duplicate creation
    if (
        document.getElementById(
            "phoneVerificationBox"
        )
    ) {
        return;
    }


    const box =
        document.createElement("div");

    box.id =
        "phoneVerificationBox";


    box.style.marginTop = "10px";


    box.innerHTML = `

        <button
            type="button"
            id="sendOtpBtn"
            style="
                width:100%;
                padding:12px;
                border:none;
                border-radius:10px;
                background:#16a34a;
                color:white;
                font-size:16px;
                cursor:pointer;
                margin-top:5px;
            "
        >
            📱 Send OTP
        </button>


        <div
            id="otpSection"
            style="
                display:none;
                margin-top:12px;
            "
        >

            <input
                type="text"
                id="otpInput"
                maxlength="6"
                inputmode="numeric"
                placeholder="Enter 6 digit OTP"
                style="
                    width:100%;
                    height:50px;
                    padding:14px;
                    border:1px solid #ccc;
                    border-radius:10px;
                    font-size:16px;
                    outline:none;
                "
            >


            <button
                type="button"
                id="verifyOtpBtn"
                style="
                    width:100%;
                    padding:12px;
                    border:none;
                    border-radius:10px;
                    background:#2563EB;
                    color:white;
                    font-size:16px;
                    cursor:pointer;
                    margin-top:10px;
                "
            >
                ✅ Verify OTP
            </button>

        </div>


        <div
            id="otpStatus"
            style="
                margin-top:8px;
                font-size:14px;
                text-align:center;
            "
        ></div>


        <div
            id="recaptcha-container"
            style="margin-top:10px;"
        ></div>

    `;


    phoneGroup.appendChild(box);


    otpSection =
        document.getElementById(
            "otpSection"
        );


    document
        .getElementById("sendOtpBtn")
        .addEventListener(
            "click",
            sendOTP
        );


    document
        .getElementById("verifyOtpBtn")
        .addEventListener(
            "click",
            verifyOTP
        );

}


// ============================================================
// STATUS MESSAGE
// ============================================================

function otpStatus(
    message,
    type = "normal"
) {

    const element =
        document.getElementById(
            "otpStatus"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    if (type === "success") {

        element.style.color =
            "#16a34a";

    }
    else if (type === "error") {

        element.style.color =
            "#dc2626";

    }
    else {

        element.style.color =
            "#2563EB";

    }

}


// ============================================================
// GET PHONE NUMBER
// ============================================================

function getPhoneNumber() {

    const phone =
        document
            .getElementById("phone")
            .value
            .trim();


    if (!phone) {

        alert(
            "Please enter your phone number first."
        );

        return null;

    }


    let formattedPhone =
        phone;


    // India number:
    // 9876543210
    // becomes:
    // +919876543210

    if (
        /^[6-9][0-9]{9}$/.test(phone)
    ) {

        formattedPhone =
            "+91" + phone;

    }


    if (
        !formattedPhone.startsWith("+")
    ) {

        alert(
            "Please enter phone number with country code.\nExample: +919876543210"
        );

        return null;

    }


    return formattedPhone;

}


// ============================================================
// RECAPTCHA
// ============================================================

function setupRecaptcha() {

    if (recaptchaVerifier) {
        return;
    }


    recaptchaVerifier =
        new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "normal",

                callback: () => {

                    console.log(
                        "reCAPTCHA verified."
                    );

                },

                "expired-callback": () => {

                    otpStatus(
                        "reCAPTCHA expired. Please verify again.",
                        "error"
                    );

                }

            }
        );

}


// ============================================================
// SEND OTP
// ============================================================

async function sendOTP() {

    const phone =
        getPhoneNumber();


    if (!phone) {
        return;
    }


    try {

        setupRecaptcha();


        otpStatus(
            "Sending OTP...",
            "normal"
        );


        const sendButton =
            document.getElementById(
                "sendOtpBtn"
            );


        sendButton.disabled =
            true;


        sendButton.textContent =
            "Sending OTP...";


        confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phone,
                recaptchaVerifier
            );


        otpSection.style.display =
            "block";


        sendButton.textContent =
            "OTP Sent ✓";


        otpStatus(
            "OTP sent to " + phone,
            "success"
        );


    }
    catch (error) {

        console.error(
            "OTP ERROR:",
            error
        );


        const sendButton =
            document.getElementById(
                "sendOtpBtn"
            );


        sendButton.disabled =
            false;


        sendButton.textContent =
            "📱 Send OTP";


        otpStatus(
            getFirebaseErrorMessage(error),
            "error"
        );


        // Reset reCAPTCHA
        try {

            if (recaptchaVerifier) {

                recaptchaVerifier.clear();

                recaptchaVerifier =
                    null;

            }

        }
        catch (e) {

            console.log(e);

        }

    }

}


// ============================================================
// VERIFY OTP
// ============================================================

async function verifyOTP() {

    const otp =
        document
            .getElementById("otpInput")
            .value
            .trim();


    if (!otp) {

        otpStatus(
            "Please enter the OTP.",
            "error"
        );

        return;

    }


    if (
        !/^[0-9]{6}$/.test(otp)
    ) {

        otpStatus(
            "OTP must contain 6 digits.",
            "error"
        );

        return;

    }


    if (!confirmationResult) {

        otpStatus(
            "Please send OTP first.",
            "error"
        );

        return;

    }


    try {

        const verifyButton =
            document.getElementById(
                "verifyOtpBtn"
            );


        verifyButton.disabled =
            true;


        verifyButton.textContent =
            "Verifying...";


        await confirmationResult.confirm(
            otp
        );


        phoneVerified =
            true;


        verifyButton.textContent =
            "Phone Verified ✓";


        verifyButton.style.background =
            "#16a34a";


        document
            .getElementById("otpInput")
            .disabled = true;


        document
            .getElementById("sendOtpBtn")
            .style.display = "none";


        otpStatus(
            "✅ Phone number verified successfully.",
            "success"
        );


    }
    catch (error) {

        console.error(
            "VERIFY OTP ERROR:",
            error
        );


        const verifyButton =
            document.getElementById(
                "verifyOtpBtn"
            );


        verifyButton.disabled =
            false;


        verifyButton.textContent =
            "✅ Verify OTP";


        otpStatus(
            "Incorrect OTP. Please try again.",
            "error"
        );

    }

}


// ============================================================
// MAIN REGISTRATION
// ============================================================

async function registerStudent() {

    // --------------------------------------------------------
    // PHONE OTP CHECK
    // --------------------------------------------------------

    if (!phoneVerified) {

        alert(
            "Please verify your phone number with OTP before registering."
        );

        return;

    }


    // --------------------------------------------------------
    // GET VALUES
    // --------------------------------------------------------

    const name =
        document
            .getElementById("name")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    const phone =
        document
            .getElementById("phone")
            .value
            .trim();


    const course =
        document
            .getElementById("course")
            .value;


    const screenshotInput =
        document.getElementById(
            "paymentScreenshot"
        );


    const screenshot =
        screenshotInput &&
        screenshotInput.files
            ? screenshotInput.files[0]
            : null;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
        !name ||
        !email ||
        !password ||
        !phone ||
        !course
    ) {

        alert(
            "Please fill all registration details."
        );

        return;

    }


    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        return;

    }


    if (!screenshot) {

        alert(
            "Please upload your payment screenshot."
        );

        return;

    }


    // --------------------------------------------------------
    // BUTTON
    // --------------------------------------------------------

    registerBtn.disabled =
        true;


    registerBtn.textContent =
        "Creating Registration...";


    try {

        // ====================================================
        // PHONE USER IS CURRENTLY SIGNED IN
        // ====================================================

        const phoneUser =
            auth.currentUser;


        if (!phoneUser) {

            throw new Error(
                "Phone verification session expired. Please verify OTP again."
            );

        }


        // ====================================================
        // LINK EMAIL + PASSWORD
        // ====================================================

        const credential =
            EmailAuthProvider.credential(
                email,
                password
            );


        const userCredential =
            await linkWithCredential(
                phoneUser,
                credential
            );


        const user =
            userCredential.user;


        console.log(
            "Student Firebase UID:",
            user.uid
        );


        // ====================================================
        // PAYMENT SCREENSHOT
        // ====================================================

        const screenshotExtension =
            screenshot.name
                .split(".")
                .pop()
                .toLowerCase();


        const screenshotPath =
            "paymentScreenshots/" +
            user.uid +
            "_" +
            Date.now() +
            "." +
            screenshotExtension;


        const screenshotRef =
            ref(
                storage,
                screenshotPath
            );


        await uploadBytes(
            screenshotRef,
            screenshot
        );


        const screenshotURL =
            await getDownloadURL(
                screenshotRef
            );


        // ====================================================
        // STUDENT USER PROFILE
        // ====================================================

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {

                uid:
                    user.uid,

                name:
                    name,

                email:
                    email,

                phone:
                    phone,

                course:
                    course,

                role:
                    "student",

                status:
                    "pending",

                assignedFaculty:
                    "",

                photoURL:
                    "",

                paymentScreenshot:
                    screenshotURL,

                paymentStatus:
                    "pending",

                createdAt:
                    serverTimestamp()

            }
        );


        // ====================================================
        // STUDENT REQUEST
        // ====================================================

        await setDoc(
            doc(
                db,
                "students",
                user.uid
            ),
            {

                uid:
                    user.uid,

                name:
                    name,

                email:
                    email,

                phone:
                    phone,

                course:
                    course,

                role:
                    "student",

                status:
                    "pending",

                assignedFaculty:
                    "",

                photoURL:
                    "",

                paymentScreenshot:
                    screenshotURL,

                paymentStatus:
                    "pending",

                createdAt:
                    serverTimestamp()

            }
        );


        // ====================================================
        // SUCCESS MESSAGE
        // ====================================================

        showRegistrationSuccess();


    }
    catch (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );


        registerBtn.disabled =
            false;


        registerBtn.textContent =
            "Register";


        alert(
            getFirebaseErrorMessage(error)
        );

    }

}


// ============================================================
// SUCCESS SCREEN
// ============================================================

function showRegistrationSuccess() {

    const container =
        document.querySelector(
            ".registration-details"
        );


    if (!container) {

        alert(
            "Registration completed successfully. Please wait for mentor approval."
        );

        return;

    }


    container.innerHTML = `

        <div
            style="
                text-align:center;
                padding:30px 15px;
            "
        >

            <div
                style="
                    font-size:65px;
                    margin-bottom:15px;
                "
            >
                ✅
            </div>


            <h2
                style="
                    color:#16a34a;
                    margin-bottom:15px;
                "
            >
                Registration Completed!
            </h2>


            <p
                style="
                    font-size:17px;
                    line-height:1.7;
                    color:#333;
                "
            >
                Your registration has been submitted successfully.
            </p>


            <p
                style="
                    font-size:17px;
                    line-height:1.7;
                    color:#2563EB;
                    font-weight:bold;
                "
            >
                Please wait for mentor approval.
            </p>


            <p
                style="
                    font-size:14px;
                    color:#666;
                    margin-top:15px;
                "
            >
                You will be able to access your student dashboard
                after your request is accepted by the mentor.
            </p>


            <a
                href="login.html"
                style="
                    display:inline-block;
                    margin-top:25px;
                    padding:13px 30px;
                    background:#2563EB;
                    color:white;
                    text-decoration:none;
                    border-radius:10px;
                    font-weight:bold;
                "
            >
                Go to Login
            </a>

        </div>

    `;

}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getFirebaseErrorMessage(error) {

    if (!error) {

        return "Something went wrong.";

    }


    const code =
        error.code || "";


    switch (code) {

        case "auth/invalid-phone-number":

            return "Invalid phone number. Use format +919876543210.";


        case "auth/too-many-requests":

            return "Too many OTP attempts. Please try again later.";


        case "auth/quota-exceeded":

            return "OTP service limit has been reached. Please try again later.";


        case "auth/invalid-verification-code":

            return "Incorrect OTP. Please enter the correct OTP.";


        case "auth/code-expired":

            return "OTP expired. Please request a new OTP.";


        case "auth/email-already-in-use":

            return "This email is already registered.";


        case "auth/credential-already-in-use":

            return "This phone number or email is already linked to another account.";


        case "auth/provider-already-linked":

            return "This account is already registered.";


        case "auth/weak-password":

            return "Password must contain at least 6 characters.";


        case "auth/operation-not-allowed":

            return "Phone or Email authentication is not enabled in Firebase.";


        case "storage/unauthorized":

            return "Payment screenshot upload was blocked by Firebase Storage rules.";


        case "permission-denied":

            return "Firebase permission denied. Please check Firestore rules.";


        default:

            return error.message ||
                "Registration failed. Please try again.";

    }

}
