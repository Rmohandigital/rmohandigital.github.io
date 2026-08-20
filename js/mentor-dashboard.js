// ==========================================
// R MOHAN DIGITAL
// MENTOR FACULTY APPROVAL SYSTEM
// ==========================================

import { auth, db } from "../firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const facultyList =
    document.getElementById("facultyList");

const mentorName =
    document.getElementById("mentorName");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// CHECK MENTOR LOGIN
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    try {

        // Get mentor profile

        const mentorRef =
            doc(db, "users", user.uid);

        const mentorSnapshot =
            await getDoc(mentorRef);


        if (!mentorSnapshot.exists()) {

            alert("Mentor profile not found.");

            await signOut(auth);

            window.location.href =
                "login.html";

            return;
        }


        const mentorData =
            mentorSnapshot.data();


        console.log(
            "Logged in user:",
            mentorData
        );


        // ==================================
        // CHECK ROLE
        // ==================================

        if (mentorData.role !== "mentor") {

            alert(
                "Access denied. Mentor account required."
            );

            await signOut(auth);

            window.location.href =
                "login.html";

            return;
        }


        // ==================================
        // CHECK STATUS
        // ==================================

        if (mentorData.status !== "Active") {

            alert(
                "Your mentor account is not active."
            );

            await signOut(auth);

            window.location.href =
                "login.html";

            return;
        }


        // ==================================
        // SHOW MENTOR NAME
        // ==================================

        mentorName.textContent =
            "Mentor: " +
            (mentorData.name || user.email);


        // ==================================
        // LOAD FACULTY
        // ==================================

        loadFaculty();


    } catch (error) {

        console.error(
            "Mentor verification error:",
            error
        );

        facultyList.innerHTML = `
            <div class="message">
                Unable to load mentor dashboard.
            </div>
        `;

    }

});


// ==========================================
// LOAD FACULTY
// ==========================================

async function loadFaculty() {

    facultyList.innerHTML = `
        <div class="loading">
            Loading faculty...
        </div>
    `;


    try {

        const usersRef =
            collection(db, "users");


        const snapshot =
            await getDocs(usersRef);


        facultyList.innerHTML = "";


        let facultyFound = false;


        snapshot.forEach((userDocument) => {

            const data =
                userDocument.data();


            // Only faculty accounts

            if (data.role !== "faculty") {
                return;
            }


            facultyFound = true;


            createFacultyCard(
                userDocument.id,
                data
            );

        });


        if (!facultyFound) {

            facultyList.innerHTML = `
                <div class="message">
                    No faculty registrations found.
                </div>
            `;

        }


    } catch (error) {

        console.error(
            "Faculty loading error:",
            error
        );


        facultyList.innerHTML = `
            <div class="message">
                Error loading faculty.
                Please check Firestore permissions.
            </div>
        `;

    }

}


// ==========================================
// CREATE FACULTY CARD
// ==========================================

function createFacultyCard(uid, data) {

    const card =
        document.createElement("div");


    card.className =
        "faculty-card";


    const name =
        data.name || "Unknown Faculty";


    const email =
        data.email || "No email";


    const status =
        data.status || "Pending";


    let statusClass =
        "pending";


    if (status === "Active") {

        statusClass =
            "active";

    }

    else if (status === "Rejected") {

        statusClass =
            "rejected";

    }


    card.innerHTML = `

        <h3>${escapeHTML(name)}</h3>

        <p>
            <strong>Email:</strong>
            ${escapeHTML(email)}
        </p>

        <p>
            <strong>Role:</strong>
            Faculty
        </p>

        <span class="status ${statusClass}">
            ${escapeHTML(status)}
        </span>

    `;


    // ==================================
    // BUTTONS
    // ==================================

    const buttons =
        document.createElement("div");


    buttons.className =
        "buttons";


    // ==================================
    // ACCEPT BUTTON
    // ==================================

    if (status !== "Active") {

        const acceptButton =
            document.createElement("button");


        acceptButton.className =
            "accept-btn";


        acceptButton.textContent =
            "✓ Accept";


        acceptButton.onclick =
            async function () {

                await acceptFaculty(
                    uid,
                    name,
                    acceptButton
                );

            };


        buttons.appendChild(
            acceptButton
        );

    }


    // ==================================
    // REJECT BUTTON
    // ==================================

    if (status !== "Rejected") {

        const rejectButton =
            document.createElement("button");


        rejectButton.className =
            "reject-btn";


        rejectButton.textContent =
            "✕ Reject";


        rejectButton.onclick =
            async function () {

                await rejectFaculty(
                    uid,
                    name,
                    rejectButton
                );

            };


        buttons.appendChild(
            rejectButton
        );

    }


    card.appendChild(buttons);


    facultyList.appendChild(card);

}


// ==========================================
// ACCEPT FACULTY
// ==========================================

async function acceptFaculty(
    uid,
    name,
    button
) {

    const confirmation =
        confirm(
            "Accept " +
            name +
            " as faculty?"
        );


    if (!confirmation) {
        return;
    }


    button.disabled = true;

    button.textContent =
        "Accepting...";


    try {

        const facultyRef =
            doc(db, "users", uid);


        await updateDoc(
            facultyRef,
            {
                status: "Active"
            }
        );


        alert(
            name +
            " has been accepted successfully!"
        );


        // Reload list

        loadFaculty();


    } catch (error) {

        console.error(
            "Accept faculty error:",
            error
        );


        alert(
            "Could not accept faculty.\n\n" +
            error.message
        );


        button.disabled = false;

        button.textContent =
            "✓ Accept";

    }

}


// ==========================================
// REJECT FACULTY
// ==========================================

async function rejectFaculty(
    uid,
    name,
    button
) {

    const confirmation =
        confirm(
            "Reject " +
            name +
            "?"
        );


    if (!confirmation) {
        return;
    }


    button.disabled = true;

    button.textContent =
        "Rejecting...";


    try {

        const facultyRef =
            doc(db, "users", uid);


        await updateDoc(
            facultyRef,
            {
                status: "Rejected"
            }
        );


        alert(
            name +
            " has been rejected."
        );


        loadFaculty();


    } catch (error) {

        console.error(
            "Reject faculty error:",
            error
        );


        alert(
            "Could not reject faculty.\n\n" +
            error.message
        );


        button.disabled = false;

        button.textContent =
            "✕ Reject";

    }

}


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}