import { auth, db } from "../firebase.js";

import {
    createUserWithEmailAndPassword,
    RecaptchaVerifier,
    linkWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const registerBtn =
    document.getElementById("registerBtn");


// ==========================================
// OTP UI
// ==========================================

const otpBox = document.createElement("div");

otpBox.style.display = "none";
otpBox.style.marginTop = "15px";

otpBox.innerHTML = `

    <label style="
        display:block;
        margin-bottom:7px;
        font-weight:600;
    ">
        Enter OTP
    </label>

    <input
        type="text"
        id="phoneOTP"
        placeholder="Enter 6-digit OTP"
        maxlength="6"
        inputmode="numeric"
        style="
            width:100%;
            height:46px;
            padding:12px 14px;
            border:1px solid #ccc;
            border-radius:8px;
            box-sizing:border-box;
            font-size:15px;
            outline:none;
        "
    >

    <button
        type="button"
        id="verifyOTPBtn"
        style="
            width:100%;
            margin-top:10px;
            padding:12px;
            border:none;
            border-radius:8px;
            background:#2563eb;
            color:white;
            font-size:15px;
            font-weight:600;
            cursor:pointer;
        "
    >
        Verify OTP
    </button>

    <div
        id="otpMessage"
        style="
            margin-top:10px;
            font-size:14px;
            font-weight:600;
        "
    ></div>
`;


registerBtn.parentNode.insertBefore(
    otpBox,
    registerBtn
);


// ==========================================
// RECAPTCHA CONTAINER
// ==========================================

const recaptchaBox = document.createElement("div");

recaptchaBox.id = "recaptcha-container";

recaptchaBox.style.marginTop = "15px";

recaptchaBox.style.display = "none";

otpBox.parentNode.insertBefore(
    recaptchaBox,
    otpBox
);


let confirmationResult = null;
let recaptchaVerifier = null;
let currentUser = null;


// ==========================================
// REGISTER / SEND OTP
// ==========================================

registerBtn.addEventListener(
    "click",
    async () => {

        const name =
            document.getElementById("name")
            .value
            .trim();

        const email =
            document.getElementById("email")
            .value
            .trim();

        const password =
            document.getElementById("password")
            .value;

        const phone =
            document.getElementById("phone")
            .value
            .trim();

        const course =
            document.getElementById("course")
            .value;


        // ==========================================
        // CHECK FIELDS
        // ==========================================

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


        if (password.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;
        }


        // ==========================================
        // PHONE NUMBER
        // ==========================================

        let phoneNumber = phone.replace(/\s+/g, "");


        if (phoneNumber.startsWith("0")) {

            phoneNumber =
                "+91" +
                phoneNumber.substring(1);

        }

        else if (
            /^[6-9]\d{9}$/.test(phoneNumber)
        ) {

            phoneNumber =
                "+91" + phoneNumber;

        }


        if (
            !/^\+91[6-9]\d{9}$/.test(
                phoneNumber
            )
        ) {

            alert(
                "Please enter a valid Indian mobile number."
            );

            return;
        }


        registerBtn.disabled = true;

        registerBtn.textContent =
            "Creating Account...";


        try {

            // ==========================================
            // CREATE EMAIL/PASSWORD ACCOUNT
            // ==========================================

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            currentUser =
                userCredential.user;


            // ==========================================
            // CREATE RECAPTCHA
            // ==========================================

            recaptchaBox.style.display =
                "block";


            if (!recaptchaVerifier) {

                recaptchaVerifier =
                    new RecaptchaVerifier(
                        auth,
                        "recaptcha-container",
                        {
                            size: "normal"
                        }
                    );

            }


            // ==========================================
            // SEND PHONE OTP
            // ==========================================

            confirmationResult =
                await linkWithPhoneNumber(
                    currentUser,
                    phoneNumber,
                    recaptchaVerifier
                );


            // ==========================================
            // SHOW OTP BOX
            // ==========================================

            otpBox.style.display =
                "block";


            registerBtn.style.display =
                "none";


            alert(
                "OTP sent to " + phoneNumber
            );


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            registerBtn.disabled =
                false;

            registerBtn.textContent =
                "Register";


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                alert(
                    "This email is already registered. Please login instead."
                );

            }

            else if (
                error.code ===
                "auth/credential-already-in-use"
            ) {

                alert(
                    "This phone number is already registered."
                );

            }

            else if (
                error.code ===
                "auth/invalid-phone-number"
            ) {

                alert(
                    "Invalid phone number."
                );

            }

            else {

                alert(
                    "Unable to send OTP: " +
                    error.message
                );

            }

        }

    }
);


// ==========================================
// VERIFY OTP
// ==========================================

document.addEventListener(
    "click",
    async (event) => {

        if (
            event.target.id !==
            "verifyOTPBtn"
        ) {
            return;
        }


        const otp =
            document.getElementById("phoneOTP")
            .value
            .trim();

        const otpMessage =
            document.getElementById("otpMessage");


        if (!/^\d{6}$/.test(otp)) {

            otpMessage.style.color =
                "red";

            otpMessage.textContent =
                "Please enter the 6-digit OTP.";

            return;
        }


        const verifyBtn =
            document.getElementById(
                "verifyOTPBtn"
            );


        verifyBtn.disabled = true;

        verifyBtn.textContent =
            "Verifying...";


        try {

            // ==========================================
            // VERIFY OTP
            // ==========================================

            await confirmationResult.confirm(
                otp
            );


            otpMessage.style.color =
                "green";

            otpMessage.textContent =
                "Phone verified successfully!";


            // ==========================================
            // CREATE STUDENT PROFILE
            // ==========================================

            await setDoc(
                doc(
                    db,
                    "students",
                    currentUser.uid
                ),
                {

                    uid: currentUser.uid,

                    name:
                        document.getElementById(
                            "name"
                        ).value.trim(),

                    email:
                        document.getElementById(
                            "email"
                        ).value.trim(),

                    phone:
                        document.getElementById(
                            "phone"
                        ).value.trim(),

                    course:
                        document.getElementById(
                            "course"
                        ).value,

                    phoneVerified: true,

                    status: "Pending",

                    progress: 0,

                    createdAt:
                        serverTimestamp()

                }
            );


            alert(
                "Registration successful! Your phone is verified. Your account is now waiting for admin approval."
            );


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );


            verifyBtn.disabled =
                false;

            verifyBtn.textContent =
                "Verify OTP";


            if (
                error.code ===
                "auth/invalid-verification-code"
            ) {

                otpMessage.style.color =
                    "red";

                otpMessage.textContent =
                    "Incorrect OTP. Please try again.";

            }

            else {

                otpMessage.style.color =
                    "red";

                otpMessage.textContent =
                    "OTP verification failed.";

            }

        }

    }
);