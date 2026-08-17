window.toggleLoginPassword = function () {

    const password =
        document.getElementById("loginPassword");

    const button =
        document.querySelector(".toggle-password");

    if (password.type === "password") {

        password.type = "text";
        button.textContent = "🙈";

    } else {

        password.type = "password";
        button.textContent = "👁";

    }
};