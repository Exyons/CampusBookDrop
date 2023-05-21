const toggelPasswordVisibilty = () => {
    const passwordVisibilityBtn = document.querySelector("#passwordVisibilityBtn")
    passwordVisibilityBtn.addEventListener("click", () => {
        const password = document.querySelector("#InputPassword");
        const openEyeIcon = document.querySelector("#openEye");
        const closeEyeIcon = document.querySelector("#closeEye");
        if (password.type === "password") {
            openEyeIcon.classList.replace("d-block", "d-none");
            closeEyeIcon.classList.replace("d-none", "d-block");
            closeEyeIcon.classList.add("selected");
            password.type = "text";
        } else {
            closeEyeIcon.classList.replace("d-block", "d-none");
            closeEyeIcon.classList.remove("selected");
            openEyeIcon.classList.replace("d-none", "d-block");
            password.type = "password";
        }
    })   
}

toggelPasswordVisibilty();