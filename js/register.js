// ============================================================
// R MOHAN DIGITAL
// STUDENT REGISTRATION - FINAL VERSION
// ============================================================
// OTP VERIFICATION REMOVED
//
// Registration flow:
//
// Name
// Email
// Phone
// Password
// Course
// ₹50 UPI / QR
// Payment Screenshot
//        ↓
// Firebase creates account
//        ↓
// Student ID generated
//        ↓
// SM12345678
//        ↓
// Student status = Pending
//        ↓
// Mentor approves
//        ↓
// Student logs in using:
// Student ID + Password
// ============================================================


// ============================================================
// FIREBASE
// ============================================================

import {
    auth,
    db
} from "../firebase.js";

import {
    createUserWithEmailAndPassword,
    signOut
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================================
// HTML ELEMENTS
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

const registerBtn =
    document.getElementById("registerBtn");

const paymentScreenshot =
    document.getElementById("paymentScreenshot");


// ============================================================
// CHECK REQUIRED ELEMENTS
// ============================================================

if (!nameInput) {
    console.error("Name input not found.");
}

if (!emailInput) {
    console.error("Email input not found.");
}

if (!passwordInput) {
    console.error("Password input not found.");
}

if (!phoneInput) {
    console.error("Phone input not found.");
}

if (!courseInput) {
    console.error("Course input not found.");
}

if (!registerBtn) {
    console.error("Register button not found.");
}


// ============================================================
// GENERATE STUDENT ID
// ============================================================
//
// Example:
//
// SM12345678
//
// SM = Student Mohan
// 8 digits = unique random number
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
// CHECK WHETHER STUDENT ID ALREADY EXISTS
// ============================================================

async function studentIDExists(studentID) {

    try {

        const usersQuery =
            query(
                collection(db, "users"),
                where("studentId", "==", studentID)
            );

        const usersSnapshot =
            await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
            return true;
        }


        const studentsQuery =
            query(
                collection(db, "students"),
                where("studentId", "==", studentID)
            );

        const studentsSnapshot =
            await getDocs(studentsQuery);

        if (!studentsSnapshot.empty) {
            return true;
        }


        return false;

    } catch (error) {

        console.error(
            "Student ID check error:",
            error
        );

        return false;
    }
}


// ============================================================
// CREATE UNIQUE STUDENT ID
// ============================================================

async function createUniqueStudentID() {

    let studentID = "";

    let exists = true;

    let attempts = 0;


    while (exists && attempts < 10) {

        studentID =
            generateStudentID();

        exists =
            await studentIDExists(studentID);

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
// NORMALIZE PHONE NUMBER
// ============================================================

function normalizePhone(phone) {

    let value =
        String(phone || "")
            .replace(/\D/g, "");

    // Remove India country code if entered
    if (value.startsWith("91") && value.length === 12) {

        value =
            value.substring(2);
    }

    return value;
}


// ============================================================
// VALIDATE PHONE
// ============================================================

function validatePhone(phone) {

    const cleanPhone =
        normalizePhone(phone);

    return /^[6-9][0-9]{9}$/.test(
        cleanPhone
    );
}


// ============================================================
// VALIDATE PASSWORD
// ============================================================

function validatePassword(password) {

    return (
        typeof password === "string" &&
        password.length >= 6
    );
}


// ============================================================
// VALIDATE EMAIL
// ============================================================

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


// ============================================================
// COMPRESS PAYMENT SCREENSHOT
// ============================================================
//
// Firebase Storage is NOT required here.
//
// The screenshot is compressed and stored in Firestore.
//
// This avoids the Storage "Upgrade" problem.
//
// Maximum target size is kept below Firestore document limit.
// ============================================================

function compressImage(
    file,
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.65
) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "Payment screenshot is required."
                    )
                );

                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                reject(
                    new Error(
                        "Please upload a valid image."
                    )
                );

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


                            // Resize
                            if (
                                width > maxWidth ||
                                height > maxHeight
                            ) {

                                const ratio =
                                    Math.min(
                                        maxWidth / width,
                                        maxHeight / height
                                    );

                                width =
                                    Math.round(
                                        width * ratio
                                    );

                                height =
                                    Math.round(
                                        height * ratio
                                    );
                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;

                            canvas.height =
                                height;


                            const context =
                                canvas.getContext(
                                    "2d"
                                );


                            context.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );


                            const compressed =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    quality
                                );


                            // Safety check
                            if (
                                compressed.length >
                                850000
                            ) {

                                const smaller =
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        0.45
                                    );

                                resolve(
                                    smaller
                                );

                            } else {

                                resolve(
                                    compressed
                                );
                            }
                        };


                    img.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Unable to read the screenshot."
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
                            "Unable to read the selected file."
                        )
                    );
                };


            reader.readAsDataURL(file);
        }
    );
}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type = "error"
) {

    let box =
        document.getElementById(
            "registrationMessage"
        );


    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "registrationMessage";


        box.style.marginTop =
            "15px";

        box.style.padding =
            "12px";

        box.style.borderRadius =
            "10px";

        box.style.fontSize =
            "14px";

        box.style.textAlign =
            "center";


        registerBtn
            .parentElement
            .appendChild(box);
    }


    box.textContent =
        message;


    if (type === "success") {

        box.style.background =
            "#dcfce7";

        box.style.color =
            "#166534";

        box.style.border =
            "1px solid #86efac";

    } else {

        box.style.background =
            "#fee2e2";

        box.style.color =
            "#991b1b";

        box.style.border =
            "1px solid #fca5a5";
    }
}


// ============================================================
// DISABLE REGISTER BUTTON
// ============================================================

function setRegisterLoading(
    loading
) {

    if (!registerBtn) {
        return;
    }


    if (loading) {

        registerBtn.disabled =
            true;

        registerBtn.dataset.originalText =
            registerBtn.textContent;

        registerBtn.textContent =
            "Registering...";

        registerBtn.style.opacity =
            "0.7";

        registerBtn.style.cursor =
            "not-allowed";

    } else {

        registerBtn.disabled =
            false;

        registerBtn.textContent =
            registerBtn.dataset.originalText ||
            "Register";

        registerBtn.style.opacity =
            "1";

        registerBtn.style.cursor =
            "pointer";
    }
}


// ============================================================
// MAIN REGISTRATION
// ============================================================

async function registerStudent() {

    // --------------------------------------------------------
    // Prevent double click
    // --------------------------------------------------------

    if (
        registerBtn &&
        registerBtn.disabled
    ) {
        return;
    }


    try {

        setRegisterLoading(true);


        // ====================================================
        // GET VALUES
        // ====================================================

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;

        const phone =
            normalizePhone(
                phoneInput.value
            );

        const course =
            courseInput.value;


        // ====================================================
        // BASIC VALIDATION
        // ====================================================

        if (!name) {

            showMessage(
                "Please enter your full name."
            );

            setRegisterLoading(false);

            return;
        }


        if (!validateEmail(email)) {

            showMessage(
                "Please enter a valid email address."
            );

            setRegisterLoading(false);

            return;
        }


        if (!validatePassword(password)) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            setRegisterLoading(false);

            return;
        }


        if (!validatePhone(phone)) {

            showMessage(
                "Please enter a valid 10-digit Indian mobile number."
            );

            setRegisterLoading(false);

            return;
        }


        if (!course) {

            showMessage(
                "Please select your course."
            );

            setRegisterLoading(false);

            return;
        }


        // ====================================================
        // PAYMENT SCREENSHOT
        // ====================================================

        if (
            !paymentScreenshot ||
            !paymentScreenshot.files ||
            !paymentScreenshot.files.length
        ) {

            showMessage(
                "Please upload your ₹50 payment screenshot."
            );

            setRegisterLoading(false);

            return;
        }


        const screenshotFile =
            paymentScreenshot.files[0];


        // ====================================================
        // LIMIT ORIGINAL FILE
        // ====================================================

        if (
            screenshotFile.size >
            10 * 1024 * 1024
        ) {

            showMessage(
                "Payment screenshot is too large. Please select an image below 10 MB."
            );

            setRegisterLoading(false);

            return;
        }


        // ====================================================
        // CREATE UNIQUE STUDENT ID
        // ====================================================

        showMessage(
            "Creating your Student ID...",
            "success"
        );


        const studentID =
            await createUniqueStudentID();


        console.log(
            "Generated Student ID:",
            studentID
        );


        // ====================================================
        // COMPRESS SCREENSHOT
        // ====================================================

        showMessage(
            "Preparing payment screenshot...",
            "success"
        );


        const paymentImage =
            await compressImage(
                screenshotFile
            );


        // ====================================================
        // CREATE INTERNAL FIREBASE LOGIN EMAIL
        // ====================================================
        //
        // IMPORTANT:
        //
        // The student will NOT see this email.
        //
        // They will login using:
        //
        // SM12345678
        // +
        // Password
        //
        // The internal email is only used by Firebase
        // Authentication.
        //
        // ====================================================

        const firebaseLoginEmail =
            studentID.toLowerCase() +
            "@student.rmdigital.local";


        // ====================================================
        // CREATE FIREBASE AUTH ACCOUNT
        // ====================================================

        showMessage(
            "Creating your account...",
            "success"
        );


        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                firebaseLoginEmail,
                password
            );


        const user =
            userCredential.user;


        const uid =
            user.uid;


        console.log(
            "Firebase UID:",
            uid
        );


        // ====================================================
        // USERS PROFILE
        // ====================================================

        const userData = {

            uid: uid,

            studentId:
                studentID,

            name:
                name,

            email:
                email,

            loginEmail:
                firebaseLoginEmail,

            phone:
                phone,

            course:
                course,

            role:
                "student",

            status:
                "pending",

            active:
                false,

            photoURL:
                "",

            assignedFaculty:
                "",

            assignedFacultyName:
                "",

            paymentAmount:
                50,

            paymentStatus:
                "pending",

            paymentScreenshot:
                paymentImage,

            createdAt:
                serverTimestamp()
        };


        // ====================================================
        // SAVE USERS DOCUMENT
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
        // STUDENT DOCUMENT
        // ====================================================

        const studentData = {

            uid:
                uid,

            studentId:
                studentID,

            name:
                name,

            email:
                email,

            loginEmail:
                firebaseLoginEmail,

            phone:
                phone,

            course:
                course,

            photoURL:
                "",

            status:
                "pending",

            assignedFaculty:
                "",

            assignedFacultyName:
                "",

            paymentAmount:
                50,

            paymentStatus:
                "pending",

            paymentScreenshot:
                paymentImage,

            createdAt:
                serverTimestamp()
        };


        // ====================================================
        // SAVE STUDENT DOCUMENT
        // ====================================================

        await setDoc(
            doc(
                db,
                "students",
                uid
            ),
            studentData
        );


        // ====================================================
        // REGISTRATION COMPLETE
        // ====================================================

        showMessage(
            "Registration completed successfully!",
            "success"
        );


        // ====================================================
        // SHOW STUDENT ID
        // ====================================================

        const successBox =
            document.createElement("div");


        successBox.style.position =
            "fixed";

        successBox.style.left =
            "50%";

        successBox.style.top =
            "50%";

        successBox.style.transform =
            "translate(-50%, -50%)";

        successBox.style.width =
            "min(90%, 500px)";

        successBox.style.padding =
            "30px";

        successBox.style.background =
            "#ffffff";

        successBox.style.borderRadius =
            "20px";

        successBox.style.boxShadow =
            "0 20px 60px rgba(0,0,0,.4)";

        successBox.style.textAlign =
            "center";

        successBox.style.zIndex =
            "99999";


        successBox.innerHTML = `

            <div style="
                font-size:50px;
                margin-bottom:10px;
            ">
                ✅
            </div>

            <h2 style="
                color:#2563EB;
                margin-bottom:15px;
            ">
                Registration Completed!
            </h2>

            <p style="
                color:#444;
                margin-bottom:10px;
            ">
                Your Student ID is:
            </p>

            <div style="
                background:#eff6ff;
                border:2px solid #2563EB;
                color:#1d4ed8;
                font-size:28px;
                font-weight:bold;
                padding:15px;
                border-radius:12px;
                letter-spacing:2px;
                margin:15px 0;
            ">
                ${studentID}
            </div>

            <p style="
                color:#555;
                line-height:1.6;
            ">
                Please save this Student ID.
                <br>
                You will use this ID and your password
                to login.
            </p>

            <p style="
                color:#d97706;
                font-weight:bold;
                margin-top:15px;
            ">
                ⏳ Please wait for mentor approval.
            </p>

            <button
                id="successLoginButton"
                style="
                    margin-top:20px;
                    width:100%;
                    padding:14px;
                    border:none;
                    border-radius:10px;
                    background:#2563EB;
                    color:white;
                    font-size:16px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Go To Login
            </button>

        `;


        document.body.appendChild(
            successBox
        );


        const successLoginButton =
            document.getElementById(
                "successLoginButton"
            );


        successLoginButton.onclick =
            async function() {

                try {

                    await signOut(auth);

                } catch (e) {

                    console.log(
                        "Sign out after registration:",
                        e
                    );
                }


                window.location.href =
                    "login.html";
            };


    } catch (error) {

        console.error(
            "REGISTRATION ERROR:",
            error
        );


        // ====================================================
        // FIREBASE ERROR HANDLING
        // ====================================================

        let message =
            "Registration failed. Please try again.";


        switch (error.code) {

            case "auth/email-already-in-use":

                message =
                    "This email is already registered. Please use another email.";

                break;


            case "auth/weak-password":

                message =
                    "Password is too weak. Please use at least 6 characters.";

                break;


            case "auth/invalid-email":

                message =
                    "The email address is invalid.";

                break;


            case "auth/network-request-failed":

                message =
                    "Network error. Please check your internet connection.";

                break;


            case "permission-denied":

                message =
                    "Firebase permission denied. Please check Firestore rules.";

                break;


            default:

                if (
                    error.message &&
                    error.message.includes(
                        "Missing or insufficient permissions"
                    )
                ) {

                    message =
                        "Firebase Firestore permission denied. Please check your Firestore rules.";

                } else {

                    message =
                        error.message ||
                        message;
                }

                break;
        }


        showMessage(
            message,
            "error"
        );


        // ====================================================
        // IMPORTANT:
        // If Firestore save fails after Auth account creation,
        // the Auth account already exists.
        // ====================================================

        if (
            error.code ===
            "permission-denied"
        ) {

            console.error(
                "Firestore permission error."
            );
        }


    } finally {

        setRegisterLoading(false);
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

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            document.activeElement !==
            registerBtn
        ) {

            // Don't submit while typing
            // in textarea-like elements.

            if (
                document.activeElement.tagName ===
                "INPUT"
            ) {

                return;
            }
        }
    }
);
