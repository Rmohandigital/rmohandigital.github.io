// ============================================================
// R MOHAN DIGITAL
// FINAL STUDENT REGISTRATION SYSTEM
//
// Student registration:
// Name + Email + Password + Phone + Course
// ₹50 UPI / QR Payment
// Payment Screenshot
// No OTP
// Automatic Student ID: SM12345678
// Mentor approval required
// Go To Login -> Student ID automatically filled
// ============================================================

import { auth, db } from "../firebase.js";

import {
    createUserWithEmailAndPassword,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================================
// ELEMENTS
// ============================================================

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const phoneInput =
    document.getElementById("phone");

const courseInput =
    document.getElementById("course");

const paymentScreenshotInput =
    document.getElementById("paymentScreenshot");

const registerBtn =
    document.getElementById("registerBtn");


// ============================================================
// CHECK ELEMENTS
// ============================================================

if (!nameInput ||
    !emailInput ||
    !passwordInput ||
    !phoneInput ||
    !courseInput ||
    !paymentScreenshotInput ||
    !registerBtn) {

    console.error(
        "Registration form elements are missing."
    );
}


// ============================================================
// STUDENT ID GENERATOR
// Example:
// SM12345678
// ============================================================

function generateStudentID() {

    const randomNumber =
        Math.floor(
            10000000 +
            Math.random() * 90000000
        );

    return "SM" + randomNumber;
}


// ============================================================
// CHECK IF STUDENT ID ALREADY EXISTS
// ============================================================

async function studentIDExists(studentID) {

    try {

        const q =
            query(
                collection(db, "users"),
                where(
                    "studentId",
                    "==",
                    studentID
                )
            );

        const snapshot =
            await getDocs(q);

        return !snapshot.empty;

    } catch (error) {

        console.error(
            "Student ID check error:",
            error
        );

        throw error;
    }
}


// ============================================================
// CREATE UNIQUE STUDENT ID
// ============================================================

async function createUniqueStudentID() {

    let studentID;
    let exists = true;

    let attempts = 0;

    while (exists && attempts < 10) {

        studentID =
            generateStudentID();

        exists =
            await studentIDExists(
                studentID
            );

        attempts++;
    }

    if (exists) {

        throw new Error(
            "Unable to generate a unique Student ID. Please try again."
        );
    }

    return studentID;
}


// ============================================================
// COMPRESS PAYMENT SCREENSHOT
//
// Firebase Storage is NOT required.
// The screenshot is converted to a small JPEG
// and saved inside Firestore.
// ============================================================

function compressImage(
    file,
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.65
) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                resolve("");

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    const img =
                        new Image();

                    img.onload =
                        function() {

                            let width =
                                img.width;

                            let height =
                                img.height;


                            // ------------------------------
                            // RESIZE
                            // ------------------------------

                            if (
                                width >
                                maxWidth
                            ) {

                                height =
                                    height *
                                    (maxWidth /
                                    width);

                                width =
                                    maxWidth;
                            }

                            if (
                                height >
                                maxHeight
                            ) {

                                width =
                                    width *
                                    (maxHeight /
                                    height);

                                height =
                                    maxHeight;
                            }


                            // ------------------------------
                            // CANVAS
                            // ------------------------------

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                Math.round(width);

                            canvas.height =
                                Math.round(height);


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            ctx.drawImage(
                                img,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );


                            // ------------------------------
                            // JPEG
                            // ------------------------------

                            const dataURL =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    quality
                                );

                            resolve(
                                dataURL
                            );
                        };


                    img.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Unable to read the payment screenshot."
                                )
                            );

                        };


                    img.src =
                        event.target.result;
                };


            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Unable to read selected file."
                        )
                    );

                };


            reader.readAsDataURL(file);
        }
    );
}


// ============================================================
// VALIDATE PAYMENT SCREENSHOT
// ============================================================

function validatePaymentScreenshot() {

    const file =
        paymentScreenshotInput.files[0];

    if (!file) {

        alert(
            "Please upload your payment screenshot."
        );

        return false;
    }


    // Maximum original file size = 8 MB

    if (
        file.size >
        8 * 1024 * 1024
    ) {

        alert(
            "Payment screenshot must be 8 MB or smaller."
        );

        return false;
    }


    // Allowed types

    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg"
    ];

    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Please upload a PNG or JPG payment screenshot."
        );

        return false;
    }

    return true;
}


// ============================================================
// BASIC VALIDATION
// ============================================================

function validateForm() {

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const phone =
        phoneInput.value.trim();

    const course =
        courseInput.value;


    // ------------------------------
    // NAME
    // ------------------------------

    if (!name) {

        alert(
            "Please enter your full name."
        );

        nameInput.focus();

        return false;
    }


    if (name.length < 2) {

        alert(
            "Please enter a valid name."
        );

        nameInput.focus();

        return false;
    }


    // ------------------------------
    // EMAIL
    // ------------------------------

    if (!email) {

        alert(
            "Please enter your email address."
        );

        emailInput.focus();

        return false;
    }


    // Simple email validation

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        !emailPattern.test(email)
    ) {

        alert(
            "Please enter a valid email address."
        );

        emailInput.focus();

        return false;
    }


    // ------------------------------
    // PASSWORD
    // ------------------------------

    if (!password) {

        alert(
            "Please create a password."
        );

        passwordInput.focus();

        return false;
    }


    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        passwordInput.focus();

        return false;
    }


    // ------------------------------
    // PHONE
    // ------------------------------

    if (!phone) {

        alert(
            "Please enter your phone number."
        );

        phoneInput.focus();

        return false;
    }


    // Remove spaces / symbols
    const cleanPhone =
        phone.replace(
            /[\s\-()+]/g,
            ""
        );


    if (
        cleanPhone.length < 10
    ) {

        alert(
            "Please enter a valid phone number."
        );

        phoneInput.focus();

        return false;
    }


    // ------------------------------
    // COURSE
    // ------------------------------

    if (!course) {

        alert(
            "Please select a course."
        );

        courseInput.focus();

        return false;
    }


    // ------------------------------
    // PAYMENT
    // ------------------------------

    if (
        !validatePaymentScreenshot()
    ) {

        return false;
    }


    return true;
}


// ============================================================
// SHOW SUCCESS SCREEN
// ============================================================

function showRegistrationSuccess(
    studentID,
    studentName
) {

    const container =
        document.querySelector(
            ".register-container"
        );


    if (!container) {

        alert(
            "Registration completed!\n\n" +
            "Student ID: " +
            studentID
        );

        window.location.href =
            "login.html?studentId=" +
            encodeURIComponent(
                studentID
            );

        return;
    }


    // --------------------------------------------
    // SUCCESS SCREEN
    // --------------------------------------------

    container.innerHTML = `

        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:50px 25px;
        ">

            <div style="
                width:85px;
                height:85px;
                margin:0 auto 20px;
                border-radius:50%;
                background:#16a34a;
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:42px;
                box-shadow:0 0 30px rgba(22,163,74,.4);
            ">
                ✓
            </div>


            <h1 style="
                color:#2563EB;
                margin-bottom:12px;
            ">
                Registration Completed!
            </h1>


            <p style="
                color:#555;
                font-size:16px;
                margin-bottom:25px;
            ">
                Welcome ${escapeHTML(studentName)}.
            </p>


            <div style="
                max-width:450px;
                margin:0 auto;
                background:#0f172a;
                color:white;
                padding:25px;
                border-radius:15px;
                box-shadow:0 0 25px rgba(37,99,235,.3);
            ">

                <p style="
                    color:#cbd5e1;
                    margin-bottom:8px;
                ">
                    Your Student ID
                </p>


                <div style="
                    font-size:30px;
                    font-weight:bold;
                    letter-spacing:2px;
                    color:#38bdf8;
                    margin-bottom:20px;
                ">
                    ${escapeHTML(studentID)}
                </div>


                <p style="
                    color:#cbd5e1;
                    line-height:1.6;
                ">
                    Save this Student ID.
                    You will use it with your password
                    to log in.
                </p>

            </div>


            <div style="
                max-width:450px;
                margin:20px auto;
                padding:15px;
                border-radius:10px;
                background:#eff6ff;
                color:#1e3a8a;
            ">

                ⏳
                <strong>
                    Please wait for mentor approval.
                </strong>

                <br>

                You can log in after your registration
                has been approved.

            </div>


            <button
                id="goToStudentLogin"
                style="
                    width:100%;
                    max-width:450px;
                    padding:15px;
                    border:none;
                    border-radius:10px;
                    background:#2563EB;
                    color:white;
                    font-size:17px;
                    font-weight:bold;
                    cursor:pointer;
                    margin-top:10px;
                "
            >
                🎓 Go To Student Login
            </button>


            <p style="
                margin-top:15px;
                color:#777;
                font-size:13px;
            ">
                Your Student ID will automatically
                appear on the login page.
            </p>

        </div>
    `;


    // --------------------------------------------
    // GO TO LOGIN
    // --------------------------------------------

    const loginButton =
        document.getElementById(
            "goToStudentLogin"
        );


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "login.html?studentId=" +
                    encodeURIComponent(
                        studentID
                    );

            }
        );
    }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(value || "")
        .replace(
            /[&<>"']/g,
            character => {

                const map = {

                    "&":"&amp;",
                    "<":"&lt;",
                    ">":"&gt;",
                    '"':"&quot;",
                    "'":"&#039;"

                };

                return map[
                    character
                ];
            }
        );
}


// ============================================================
// REGISTER STUDENT
// ============================================================

async function registerStudent() {

    // --------------------------------------------
    // VALIDATE
    // --------------------------------------------

    if (!validateForm()) {
        return;
    }


    // --------------------------------------------
    // GET VALUES
    // --------------------------------------------

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim()
            .toLowerCase();

    const password =
        passwordInput.value;

    const phone =
        phoneInput.value.trim();

    const course =
        courseInput.value;


    // --------------------------------------------
    // DISABLE BUTTON
    // --------------------------------------------

    registerBtn.disabled = true;

    registerBtn.textContent =
        "Creating Registration...";


    let createdUser = null;


    try {

        // ====================================================
        // 1. CHECK EMAIL BEFORE CREATING ACCOUNT
        // ====================================================

        registerBtn.textContent =
            "Checking information...";


        const existingEmailQuery =
            query(
                collection(db, "users"),
                where(
                    "email",
                    "==",
                    email
                )
            );


        const existingEmailSnapshot =
            await getDocs(
                existingEmailQuery
            );


        if (
            !existingEmailSnapshot.empty
        ) {

            throw new Error(
                "This email is already registered. Please use another email or go to Login."
            );
        }


        // ====================================================
        // 2. CREATE UNIQUE STUDENT ID
        // ====================================================

        registerBtn.textContent =
            "Generating Student ID...";


        const studentID =
            await createUniqueStudentID();


        console.log(
            "Generated Student ID:",
            studentID
        );


        // ====================================================
        // 3. COMPRESS PAYMENT SCREENSHOT
        // ====================================================

        registerBtn.textContent =
            "Processing Payment Screenshot...";


        const paymentFile =
            paymentScreenshotInput.files[0];


        const paymentScreenshot =
            await compressImage(
                paymentFile,
                900,
                900,
                0.60
            );


        if (
            !paymentScreenshot
        ) {

            throw new Error(
                "Payment screenshot could not be processed."
            );
        }


        console.log(
            "Payment screenshot processed."
        );


        // ====================================================
        // 4. CREATE FIREBASE AUTH ACCOUNT
        //
        // IMPORTANT:
        // We use the student's REAL EMAIL.
        //
        // This allows Forgot Password to send the
        // reset link to the student's registered email.
        // ====================================================

        registerBtn.textContent =
            "Creating Student Account...";


        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        createdUser =
            credential.user;


        const uid =
            createdUser.uid;


        console.log(
            "Firebase Auth UID:",
            uid
        );


        // ====================================================
        // 5. USER PROFILE
        // ====================================================

        registerBtn.textContent =
            "Saving Student Profile...";


        const userData = {

            uid: uid,

            studentId: studentID,

            name: name,

            email: email,

            // Used by the login system
            loginEmail: email,

            phone: phone,

            course: course,

            role: "student",

            // Mentor must approve
            status: "pending",

            active: false,

            photoURL: "",

            assignedFaculty: "",

            assignedFacultyName: "",

            // Payment information
            paymentAmount: 50,

            paymentStatus: "pending",

            paymentScreenshot:
                paymentScreenshot,

            // Registration information
            registrationType:
                "Student Registration",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        // ====================================================
        // 6. SAVE USERS/{AUTH UID}
        // ====================================================

        await setDoc(
            doc(
                db,
                "users",
                uid
            ),
            userData
        );


        // ====================================================
        // 7. SAVE STUDENTS/{AUTH UID}
        //
        // Both documents use Firebase Auth UID.
        // This is important for mentor approval.
        // ====================================================

        await setDoc(
            doc(
                db,
                "students",
                uid
            ),
            userData
        );


        // ====================================================
        // 8. SAVE REGISTRATION LOOKUP
        //
        // This gives us an easy way to search by Student ID.
        // ====================================================

        await setDoc(
            doc(
                db,
                "studentIds",
                studentID
            ),
            {

                studentId:
                    studentID,

                uid:
                    uid,

                name:
                    name,

                email:
                    email,

                status:
                    "pending",

                createdAt:
                    serverTimestamp()

            }
        );


        // ====================================================
        // 9. SUCCESS
        // ====================================================

        console.log(
            "Student registration saved successfully."
        );


        // Firebase account does not need to remain logged in
        // after registration.
        await signOut(auth);


        showRegistrationSuccess(
            studentID,
            name
        );


    } catch (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );


        // ====================================================
        // IF AUTH ACCOUNT WAS CREATED BUT FIRESTORE FAILED
        // ====================================================

        if (
            createdUser
        ) {

            console.warn(
                "Auth account was created. Firestore save may need administrator attention."
            );
        }


        // ====================================================
        // FIREBASE ERROR MESSAGES
        // ====================================================

        let message =
            "Registration failed.";


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "This email is already registered.\n\nPlease use another email or go to Login.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "The email address is invalid.";

        } else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "Password is too weak. Please use at least 6 characters.";

        } else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Network error. Please check your internet connection.";

        } else if (
            error.code ===
            "permission-denied"
        ) {

            message =
                "Firestore permission denied.\n\nPlease check your Firestore security rules.";

        } else if (
            error.message
        ) {

            message =
                error.message;
        }


        alert(
            message
        );


        // ====================================================
        // RESET BUTTON
        // ====================================================

        registerBtn.disabled = false;

        registerBtn.textContent =
            "Register";
    }
}


// ============================================================
// REGISTER BUTTON
// ============================================================

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        registerStudent
    );
}


// ============================================================
// ENTER KEY SUPPORT
// ============================================================

[
    nameInput,
    emailInput,
    passwordInput,
    phoneInput
].forEach(input => {

    if (!input) return;

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                registerStudent();
            }
        }
    );

});


// ============================================================
// PAYMENT SCREENSHOT PREVIEW / VALIDATION
// ============================================================

if (
    paymentScreenshotInput
) {

    paymentScreenshotInput.addEventListener(
        "change",
        () => {

            const file =
                paymentScreenshotInput.files[0];

            if (!file) {
                return;
            }


            if (
                file.size >
                8 * 1024 * 1024
            ) {

                alert(
                    "Payment screenshot must be 8 MB or smaller."
                );

                paymentScreenshotInput.value =
                    "";

                return;
            }


            const allowedTypes = [
                "image/png",
                "image/jpeg",
                "image/jpg"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a PNG or JPG image."
                );

                paymentScreenshotInput.value =
                    "";

                return;
            }


            console.log(
                "Payment screenshot selected:",
                file.name
            );
        }
    );
}


// ============================================================
// PASSWORD SHOW / HIDE
//
// Your old register.html already calls:
//
// onclick="togglePassword()"
//
// Because this file is a module, expose the function
// through window so the old HTML can call it.
// ============================================================

window.togglePassword =
    function() {

        const password =
            document.getElementById(
                "password"
            );

        const button =
            document.getElementById(
                "passwordToggle"
            );


        if (
            !password
        ) {
            return;
        }


        if (
            password.type ===
            "password"
        ) {

            password.type =
                "text";


            if (button) {

                button.textContent =
                    "🙈";

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );
            }

        } else {

            password.type =
                "password";


            if (button) {

                button.textContent =
                    "👁";

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }
        }
    };


// ============================================================
// PAGE READY
// ============================================================

console.log(
    "R Mohan Digital registration system loaded."
);

console.log(
    "Student registration uses Student ID + Password."
);

console.log(
    "OTP verification is disabled."
);
