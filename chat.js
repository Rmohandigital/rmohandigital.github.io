import {
    auth,
    db
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =========================
   ELEMENTS
========================= */

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const chatList =
    document.getElementById("chatList");

const headerName =
    document.getElementById("headerName");

const headerAvatar =
    document.getElementById("headerAvatar");

const settingsPanel =
    document.getElementById("settingsPanel");

const personModal =
    document.getElementById("personModal");

const announcementModal =
    document.getElementById("announcementModal");

const personPhone =
    document.getElementById("personPhone");

const personResult =
    document.getElementById("personResult");

const announcementBar =
    document.getElementById("announcementBar");


/* =========================
   VARIABLES
========================= */

let currentUser = null;

let currentProfile = null;

let currentChat = "general";

let unsubscribeMessages = null;


/* =========================
   AUTH
========================= */

onAuthStateChanged(
    auth,
    async user => {

        if(!user){

            window.location.href =
                "admin.html";

            return;
        }


        currentUser = user;


        try{

            const profileRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const snapshot =
                await getDoc(
                    profileRef
                );


            if(snapshot.exists()){

                currentProfile =
                    snapshot.data();

            }

            else{

                currentProfile = {

                    name:
                        user.displayName ||
                        "User",

                    email:
                        user.email || "",

                    phone:
                        ""

                };

            }


            loadMessages(
                currentChat
            );


            loadLatestAnnouncement();


            loadSavedTheme();

        }

        catch(error){

            console.error(error);

            alert(
                "Unable to load your profile."
            );

        }

    }
);


/* =========================
   LOAD MESSAGES
========================= */

function loadMessages(chatId){

    if(unsubscribeMessages){

        unsubscribeMessages();

    }


    messages.innerHTML = `
        <div class="empty-chat">
            <div class="empty-chat-icon">
                💬
            </div>
            <h3>Loading messages...</h3>
        </div>
    `;


    const messagesRef =
        collection(
            db,
            "chats",
            chatId,
            "messages"
        );


    const messagesQuery =
        query(
            messagesRef,
            orderBy(
                "createdAt",
                "asc"
            )
        );


    unsubscribeMessages =
        onSnapshot(
            messagesQuery,
            snapshot => {

                messages.innerHTML = "";


                if(snapshot.empty){

                    messages.innerHTML = `
                        <div class="empty-chat">
                            <div class="empty-chat-icon">
                                💬
                            </div>
                            <h3>
                                No messages yet
                            </h3>
                            <p>
                                Start the conversation.
                            </p>
                        </div>
                    `;

                    return;
                }


                snapshot.forEach(
                    messageDoc => {

                        const data =
                            messageDoc.data();


                        renderMessage(
                            messageDoc.id,
                            data
                        );

                    }
                );


                scrollToBottom();

            },

            error => {

                console.error(
                    "Message listener error:",
                    error
                );


                messages.innerHTML = `
                    <div class="empty-chat">
                        ❌ Unable to load messages.
                    </div>
                `;

            }
        );

}


/* =========================
   RENDER MESSAGE
========================= */

function renderMessage(
    messageId,
    data
){

    const isMine =
        data.senderId === currentUser.uid;


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "message-row " +
        (
            isMine
                ? "mine"
                : "other"
        );


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "message";


    const sender =
        escapeHTML(
            data.senderName ||
            "User"
        );


    const text =
        escapeHTML(
            data.text ||
            ""
        );


    const time =
        formatTime(
            data.createdAt
        );


    message.innerHTML = `

        ${
            !isMine
            ? `
                <div class="message-sender">
                    ${sender}
                </div>
            `
            : ""
        }

        <div class="message-text">
            ${text}
        </div>

        <div class="message-bottom">

            <span class="message-time">
                ${time}
            </span>

            <button
                class="delete-message"
                title="Delete message">
                🗑
            </button>

        </div>

    `;


    message
        .querySelector(
            ".delete-message"
        )
        .addEventListener(
            "click",
            async () => {

                const confirmed =
                    confirm(
                        "Delete this message?"
                    );


                if(!confirmed){

                    return;

                }


                try{

                    await deleteDoc(
                        doc(
                            db,
                            "chats",
                            currentChat,
                            "messages",
                            messageId
                        )
                    );

                }

                catch(error){

                    console.error(error);

                    alert(
                        "Unable to delete message."
                    );

                }

            }
        );


    row.appendChild(
        message
    );


    messages.appendChild(
        row
    );

}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage(){

    const text =
        messageInput.value.trim();


    if(!text){

        return;

    }


    if(!currentUser){

        return;

    }


    messageInput.value = "";


    sendBtn.disabled = true;


    try{

        await addDoc(

            collection(
                db,
                "chats",
                currentChat,
                "messages"
            ),

            {

                text:

                    text,

                senderId:

                    currentUser.uid,

                senderName:

                    currentProfile?.name ||
                    currentUser.email ||
                    "User",

                senderPhone:

                    currentProfile?.phone ||
                    "",

                senderRole:

                    currentProfile?.role ||
                    "",

                createdAt:

                    serverTimestamp()

            }

        );

    }

    catch(error){

        console.error(
            error
        );


        alert(
            "Message could not be sent."
        );

    }


    sendBtn.disabled = false;

}


/* =========================
   SEND EVENTS
========================= */

sendBtn.addEventListener(
    "click",
    sendMessage
);


messageInput.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Enter" &&
            !event.shiftKey
        ){

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================
   CHAT SWITCH
========================= */

document
    .querySelectorAll(".chat-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".chat-item"
                    )
                    .forEach(
                        x =>
                            x.classList.remove(
                                "active"
                            )
                    );


                item.classList.add(
                    "active"
                );


                currentChat =
                    item.dataset.chat;


                if(
                    currentChat ===
                    "announcements"
                ){

                    headerName.textContent =
                        "Announcements";

                    headerAvatar.textContent =
                        "📢";

                }

                else{

                    headerName.textContent =
                        "R Mohan Digital Group";

                    headerAvatar.textContent =
                        "👥";

                }


                loadMessages(
                    currentChat
                );


                if(
                    window.innerWidth <= 750
                ){

                    document
                        .getElementById(
                            "chatSidebar"
                        )
                        .classList.remove(
                            "open"
                        );

                }

            }
        );

    });


/* =========================
   ADD PERSON
========================= */

document
    .getElementById(
        "addPersonBtn"
    )
    .addEventListener(
        "click",
        () => {

            personModal.classList.add(
                "show"
            );

            personPhone.value = "";

            personResult.textContent = "";

        }
    );


document
    .getElementById(
        "closePersonModal"
    )
    .addEventListener(
        "click",
        () => {

            personModal.classList.remove(
                "show"
            );

        }
    );


/* =========================
   FIND PERSON BY PHONE
========================= */

document
    .getElementById(
        "findPersonBtn"
    )
    .addEventListener(
        "click",
        async () => {

            const phone =
                personPhone.value.trim();


            if(!phone){

                personResult.textContent =
                    "Enter a phone number.";

                return;

            }


            personResult.textContent =
                "Searching...";


            try{

                const usersSnapshot =
                    await getDocs(
                        collection(
                            db,
                            "users"
                        )
                    );


                let foundUser = null;


                usersSnapshot.forEach(
                    userDoc => {

                        const data =
                            userDoc.data();


                        const savedPhone =
                            String(
                                data.phone ||
                                ""
                            )
                            .replace(
                                /\s+/g,
                                ""
                            );


                        const searchPhone =
                            phone
                            .replace(
                                /\s+/g,
                                ""
                            );


                        if(
                            savedPhone ===
                            searchPhone
                        ){

                            foundUser = {

                                id:
                                    userDoc.id,

                                ...data

                            };

                        }

                    }
                );


                if(!foundUser){

                    personResult.innerHTML =
                        "❌ No registered user found with this phone number.";

                    return;

                }


                personResult.innerHTML = `

                    <div style="
                        padding:12px;
                        border:1px solid rgba(0,229,255,.2);
                        border-radius:10px;
                        background:rgba(0,229,255,.05);
                    ">

                        <strong style="color:#00e5ff;">
                            ${escapeHTML(
                                foundUser.name ||
                                "User"
                            )}
                        </strong>

                        <br>

                        <small>
                            ${escapeHTML(
                                foundUser.email ||
                                ""
                            )}
                        </small>

                        <br>

                        <small>
                            Role:
                            ${escapeHTML(
                                foundUser.role ||
                                "User"
                            )}
                        </small>

                    </div>

                    <br>

                    <button
                        id="startPrivateChat"
                        class="primary-btn"
                        style="width:100%;">
                        💬 Start Chat
                    </button>

                `;


                document
                    .getElementById(
                        "startPrivateChat"
                    )
                    .addEventListener(
                        "click",
                        () => {

                            const ids =
                                [
                                    currentUser.uid,
                                    foundUser.id
                                ]
                                .sort();


                            currentChat =
                                "private_" +
                                ids.join("_");


                            headerName.textContent =
                                foundUser.name ||
                                "Private Chat";


                            headerAvatar.textContent =
                                "👤";


                            personModal.classList.remove(
                                "show"
                            );


                            loadMessages(
                                currentChat
                            );

                        }
                    );

            }

            catch(error){

                console.error(
                    error
                );


                personResult.textContent =
                    "❌ Search failed.";

            }

        }
    );


/* =========================
   ANNOUNCEMENT
========================= */

document
    .getElementById(
        "announcementBtn"
    )
    .addEventListener(
        "click",
        () => {

            announcementModal.classList.add(
                "show"
            );

        }
    );


document
    .getElementById(
        "closeAnnouncementModal"
    )
    .addEventListener(
        "click",
        () => {

            announcementModal.classList.remove(
                "show"
            );

        }
    );


document
    .getElementById(
        "sendAnnouncementBtn"
    )
    .addEventListener(
        "click",
        async () => {

            const text =
                document
                    .getElementById(
                        "announcementText"
                    )
                    .value
                    .trim();


            if(!text){

                alert(
                    "Write an announcement."
                );

                return;

            }


            try{

                await setDoc(

                    doc(
                        db,
                        "settings",
                        "announcement"
                    ),

                    {

                        text:

                            text,

                        createdBy:

                            currentUser.uid,

                        createdByName:

                            currentProfile?.name ||
                            "User",

                        createdAt:

                            serverTimestamp()

                    }

                );


                announcementModal.classList.remove(
                    "show"
                );


                document
                    .getElementById(
                        "announcementText"
                    )
                    .value = "";


                loadLatestAnnouncement();

            }

            catch(error){

                console.error(error);

                alert(
                    "Announcement failed."
                );

            }

        }
    );


/* =========================
   LOAD ANNOUNCEMENT
========================= */

async function loadLatestAnnouncement(){

    try{

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "settings",
                    "announcement"
                )
            );


        if(
            !snapshot.exists()
        ){

            return;

        }


        const data =
            snapshot.data();


        if(data.text){

            announcementBar.textContent =
                "📢 " +
                data.text;


            announcementBar.style.display =
                "block";

        }

    }

    catch(error){

        console.error(error);

    }

}


/* =========================
   THEME
========================= */

document
    .getElementById(
        "themeBtn"
    )
    .addEventListener(
        "click",
        () => {

            settingsPanel.classList.add(
                "open"
            );

        }
    );


document
    .getElementById(
        "closeSettings"
    )
    .addEventListener(
        "click",
        () => {

            settingsPanel.classList.remove(
                "open"
            );

        }
    );


document
    .querySelectorAll(
        ".theme-option"
    )
    .forEach(
        option => {

            option.addEventListener(
                "click",
                async () => {

                    const color =
                        option.dataset.color;


                    applyTheme(
                        color
                    );


                    localStorage.setItem(
                        "chatColor",
                        color
                    );


                    /*
                     Save theme for the
                     logged-in mentor.
                    */

                    if(
                        currentProfile?.role ===
                        "mentor" ||
                        currentProfile?.role ===
                        "Mentor"
                    ){

                        try{

                            await setDoc(

                                doc(
                                    db,
                                    "settings",
                                    "chatTheme"
                                ),

                                {

                                    color:
                                        color,

                                    updatedBy:
                                        currentUser.uid,

                                    updatedAt:
                                        serverTimestamp()

                                },

                                {
                                    merge:true
                                }

                            );

                        }

                        catch(error){

                            console.error(
                                error
                            );

                        }

                    }

                }
            );

        }
    );


/* =========================
   LOAD THEME
========================= */

async function loadSavedTheme(){

    let color =
        localStorage.getItem(
            "chatColor"
        );


    try{

        const themeSnapshot =
            await getDoc(
                doc(
                    db,
                    "settings",
                    "chatTheme"
                )
            );


        if(
            themeSnapshot.exists()
        ){

            const data =
                themeSnapshot.data();


            if(data.color){

                color =
                    data.color;

            }

        }

    }

    catch(error){

        console.log(
            "Using local theme."
        );

    }


    if(color){

        applyTheme(
            color
        );

    }

}


/* =========================
   APPLY THEME
========================= */

function applyTheme(color){

    document
        .documentElement
        .style
        .setProperty(
            "--chat-color",
            color
        );


    /*
     Automatically create a softer
     transparent version.
    */

    document
        .documentElement
        .style
        .setProperty(
            "--chat-color-soft",
            hexToRGBA(
                color,
                .10
            )
        );

}


/* =========================
   RESET THEME
========================= */

document
    .getElementById(
        "resetThemeBtn"
    )
    .addEventListener(
        "click",
        () => {

            applyTheme(
                "#00e5ff"
            );


            localStorage.setItem(
                "chatColor",
                "#00e5ff"
            );

        }
    );


/* =========================
   MOBILE MENU
========================= */

document
    .getElementById(
        "mobileChatMenu"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "chatSidebar"
                )
                .classList.toggle(
                    "open"
                );

        }
    );


/* =========================
   SEARCH
========================= */

document
    .getElementById(
        "searchChats"
    )
    .addEventListener(
        "input",
        event => {

            const search =
                event.target.value
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".chat-item"
                )
                .forEach(
                    item => {

                        const name =
                            item
                                .querySelector(
                                    ".chat-item-name"
                                )
                                .textContent
                                .toLowerCase();


                        item.style.display =
                            name.includes(
                                search
                            )
                            ? "flex"
                            : "none";

                    }
                );

        }
    );


/* =========================
   EMOJI
========================= */

document
    .getElementById(
        "emojiBtn"
    )
    .addEventListener(
        "click",
        () => {

            messageInput.value += " 😊";

            messageInput.focus();

        }
    );


/* =========================
   HELPERS
========================= */

function scrollToBottom(){

    messages.scrollTop =
        messages.scrollHeight;

}


function formatTime(timestamp){

    if(
        !timestamp ||
        !timestamp.toDate
    ){

        return "Now";

    }


    return timestamp
        .toDate()
        .toLocaleTimeString(
            [],
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

}


function escapeHTML(value){

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function hexToRGBA(
    hex,
    alpha
){

    hex =
        hex.replace(
            "#",
            ""
        );


    const r =
        parseInt(
            hex.substring(
                0,
                2
            ),
            16
        );


    const g =
        parseInt(
            hex.substring(
                2,
                4
            ),
            16
        );


    const b =
        parseInt(
            hex.substring(
                4,
                6
            ),
            16
        );


    return `
        rgba(
            ${r},
            ${g},
            ${b},
            ${alpha}
        )
    `;

}
