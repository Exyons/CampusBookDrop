const passwordResetForm = document.querySelector("#passwordResetForm");
const resetPasswordBtn = document.querySelector("#resetPasswordBtn");
const passwordFeedback = document.querySelector("#passwordFeedback");

passwordResetForm.onsubmit = event => event.preventDefault();

resetPasswordBtn.addEventListener("click", async () => {
    try {
        const formData = new FormData(passwordResetForm)
        const res = await axios.post("/user/reset_password", formData);
        showToast(res.data)
        if(res.data.redirect){
            window.location = res.data.redirect;
        }
    } catch (error) {
        showToast({ error: "Cannot Contact Server!" });
    }
})

const checkPassword = () => {
    const password = document.querySelector("#InputPassword");
    password.addEventListener("input", async () => {
        try {
            const res = await axios.post("/user/reset_password/checkPassword", { password: password.value })
            if (res.data.error) {
                passwordFeedback.classList.remove("text-success")
                passwordFeedback.classList.add("text-danger")
                passwordFeedback.textContent = res.data.error;
            }
            if (res.data.success) {
                passwordFeedback.classList.remove("text-danger")
                passwordFeedback.classList.add("text-success")
                passwordFeedback.textContent = res.data.success;
            }
        } catch (error) {
            showToast({ error: "Cannot Contact Server!" });
        }
    })
}

checkPassword();

function togglePasswordVisibility() {
    const password = document.querySelector("#InputPassword");
    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}

function toggleConfirmPasswordVisibility() {
    const confirmPassword = document.querySelector("#InputConfirmPassword");
    if (confirmPassword.type === "password") {
        confirmPassword.type = "text";
    } else {
        confirmPassword.type = "password";
    }
}