const otpField = document.querySelector("#inputOtp");
const otpForm = document.querySelector(".otp-form");
const signUpBtn = document.querySelector(".sign-up-btn");
const signUpForm = document.querySelector("#signUpForm");
const verifyOtpBtn = document.querySelector(".verify-otp-btn");
const resendOtpBtn = document.querySelector(".resend-otp-btn");

const otpFormBootstrapModal = new bootstrap.Modal(otpFormModal);
signUpForm.onsubmit = event => event.preventDefault();
otpForm.onsubmit = event => event.preventDefault();

otpFormModal.addEventListener('shown.bs.modal', () => {
    otpField.focus();
})

function ChangeValue() {
    if (this.value < 0) {
        this.value = "";
    }
    if (!parseInt(this.value)) {
        this.value = "";
    }
    if (`${this.value}`.length > 6) {
        this.value = parseInt(`${this.value}`.slice(0, 6));
    }
    if (`${this.value}`.length === 6) {
        verifyOtpBtn.focus();
    }
}

// there is already bootstrap validation working
// signUpBtn.addEventListener("click", (event) => {
//     if (!signUpForm.checkValidity()) {
//         event.preventDefault()
//         event.stopPropagation()
//     }
//     signUpForm.classList.add('was-validated')
// })

verifyOtpBtn.addEventListener("click", (event) => {
    if (!otpForm.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    }
    otpForm.classList.add('was-validated')
})


signUpBtn.addEventListener("click", async () => {
    if (signUpForm.checkValidity()) {
        try {
            const otpRes = await axios.post("/user/send_otp", { mobileNumber: signUpForm.elements["mobile"].value });
            if (otpRes.data.success) {
                signUpBtn.disabled = true;
                otpFormBootstrapModal.show();
            }
            else {
                showToast(otpRes.data);
            }
        } catch (error) {
            showToast({ error: "Cannot contact Server!" });
        }
    }
})

otpField.addEventListener("input", ChangeValue);

verifyOtpBtn.addEventListener("click", async () => {
    try {
        const res = await axios.post("/user/verify_otp", { code: otpForm.elements["inputOtp"].value });
        showToast(res.data);
        if (res.data.success) {
            otpFormBootstrapModal.hide();
            // signUpBtn.disabled = true;
            showToast(res.data);
            const signUpFormData = new FormData(signUpForm);
            const formRes = await axios.post("/user/sign_up", signUpFormData);
            showToast(formRes.data);
            // Redirect to home after 
            if (formRes.data.redirect) {
                window.location = formRes.data.redirect;
            }
        }
    } catch (error) {
        // console.log(error);
        showToast({ error: "Cannot Contact Server! Try Again!" });
    }
})
resendOtpBtn.addEventListener("click", async () => {
    try {
        const res = await axios.post("/user/resend_otp", { mobileNumber: signUpForm.elements["mobile"].value });
        showToast(res.data);
    } catch (error) {
        showToast({ error: "Cannot Contact Server! Try Again!" });
    }
})

const checkUsernamePasswordAndEmail = () => {
    const username = document.querySelector("#InputUsername");
    const password = document.querySelector("#InputPassword");
    const usernameFeedback = document.querySelector("#usernameFeedback");
    const email = document.querySelector("#InputEmail");
    const emailFeedback = document.querySelector("#emailFeedback");
    const passwordFeedback = document.querySelector("#passwordFeedback");
    username.addEventListener("input", async () => {
        if (username.checkValidity()) {
            try {
                const res = await axios.post("/user/sign_up/checkUsername", { username: username.value })
                if (res.data.success) {
                    username.classList.add("valid");
                    signUpBtn.disabled = !(password.classList.contains("valid") && email.classList.contains("valid") && username.classList.contains("valid"));
                    usernameFeedback.classList.remove("text-danger")
                    usernameFeedback.classList.add("text-success")
                    usernameFeedback.textContent = res.data.success
                }
                else {
                    username.classList.remove("valid");
                    signUpBtn.disabled = true;
                    usernameFeedback.classList.remove("text-success")
                    usernameFeedback.classList.add("text-danger")
                    usernameFeedback.textContent = res.data.error
                }
            } catch (error) {
                usernameFeedback.textContent = "Cannot Contact Server!";
            }
        }
    })
    email.addEventListener("input", async () => {
        if (email.checkValidity()) {
            try {
                const res = await axios.post("/user/sign_up/checkEmail", { email: email.value })
                if (res.data.success) {
                    email.classList.add("valid");
                    signUpBtn.disabled = !(password.classList.contains("valid") && email.classList.contains("valid") && username.classList.contains("valid"));
                    emailFeedback.classList.remove("text-danger")
                    emailFeedback.classList.add("text-success")
                    emailFeedback.textContent = res.data.success
                }
                else {
                    email.classList.remove("valid");
                    signUpBtn.disabled = true;
                    emailFeedback.classList.remove("text-success")
                    emailFeedback.classList.add("text-danger")
                    emailFeedback.textContent = res.data.error
                }
            } catch (error) {
                emailFeedback.textContent = "Cannot Contact Server!";
            }
        }
    })
    password.addEventListener("input", async () => {
        // if (password.checkValidity()) {
        try {
            const res = await axios.post("/user/sign_up/checkPassword", { password: password.value })
            if (res.data.success) {
                password.classList.add("valid");
                signUpBtn.disabled = !(password.classList.contains("valid") && email.classList.contains("valid") && username.classList.contains("valid"));
                passwordFeedback.classList.remove("text-danger")
                passwordFeedback.classList.add("text-success")
                passwordFeedback.textContent = res.data.success
            }
            else {
                password.classList.remove("valid");
                signUpBtn.disabled = true;
                passwordFeedback.classList.remove("text-success")
                passwordFeedback.classList.add("text-danger")
                passwordFeedback.textContent = res.data.error
            }
        } catch (error) {
            passwordFeedback.textContent = "Cannot Contact Server!";
        }
        // }
    })
}

checkUsernamePasswordAndEmail()

function togglePasswordVisibility() {
    const password = document.querySelector("#InputPassword");
    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}