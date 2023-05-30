const resetPasswordLnkBtn = document.querySelector("#resetPasswordLnkBtn");
const resetPasswordEmailForm = document.querySelector("#resetPasswordEmailForm");

resetPasswordLnkBtn.addEventListener("click", async () => {
    const email = document.querySelector("#InputEmail");
    if (resetPasswordEmailForm.checkVisibility()) {
        try {
            resetPasswordLnkBtn.disabeld=true;
            const res = await axios.post("/user/forgot_password", { email: email.value })
            window.location = res.data.redirect
        } catch (error) {
            resetPasswordLnkBtn.disabeld=false;
            showToast({error: "Cannot Contact Server!"})
        }
    }
})