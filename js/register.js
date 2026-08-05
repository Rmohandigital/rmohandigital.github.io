import { db } from "../firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const registerBtn = document.getElementById("registerBtn");


registerBtn.addEventListener("click", async () => {


    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const course = document.getElementById("course").value;


    if(
        name === "" ||
        email === "" ||
        password === "" ||
        phone === "" ||
        course === ""
    ){

        alert("Please fill all details");
        return;

    }


    try{


        await addDoc(collection(db,"students"),{

            name:name,
            email:email,
            password:password,
            phone:phone,
            course:course,

            status:"Pending",

            createdAt:serverTimestamp()

        });


        alert(
            "Registration submitted successfully! Wait for approval."
        );


        window.location.href="login.html";


    }
    catch(error){

        console.log(error);

        alert(
            "Registration failed. Try again."
        );

    }


});
