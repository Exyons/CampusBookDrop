const newOrderAddressForm = document.querySelector("#newOrderAddressForm");
const addressContainer = document.querySelector(".address-position-container");
const paymentContainer = document.querySelector(".payment-postion-container");
const confirmationContainer = document.querySelector(".confirmation-postion-container");
const checkoutBtn = document.querySelector("#checkoutBtn");
const addressSelectRadio = document.querySelectorAll(".address-select-radio");
const orderAddressCard = document.querySelectorAll(".order-address-card");
const paymentRecieptImageForm = document.querySelector("#paymentRecieptImageForm");
const progressBarContainer = document.querySelector(".progress-bar-container")
const placeOrderBtn = document.querySelector("#placeOrderBtn");
const paymentRecieptImage = document.querySelector("#paymentRecieptImage");

const addressCheckIcon = document.querySelector("#addressCheckIcon");
const paymentCheckIcon = document.querySelector("#paymentCheckIcon");
const confirmationCheckIcon = document.querySelector("#confirmationCheckIcon");

const showPaymentPosition = () => {
    addressContainer.style.display = "none";
    paymentContainer.style.display = "block"
}

const showConfirmationPosition = () => {
    paymentContainer.style.display = "none"
    confirmationContainer.style.display = "block";
}

const doPayment = () => {
    let isRecieptImageUploaded = false;

    paymentRecieptImage.addEventListener("change", async () => {
        const file = paymentRecieptImage.files[0];
        progressBarContainer.style.display = "none";

        // TODO 
        // add checks to identify width and height of image is more than 200px

        //Check the file properties.
        if (file) {
            if (!file.type.match('image.*')) {
                showToast({ error: "You cannot upload this file because its not an image." });
                return;
            }

            if (file.size >= 1000000) {
                showToast({ error: "You cannot upload this file because its size exceeds the maximum limit of 1 MB." });
                return;
            }
        }

        // I am sending request at every value change in file input
        // I want to remove the uploaded file if user does not submits the form
        const imageFormData = new FormData(paymentRecieptImageForm);
        progressBarContainer.style.display = "block";
        try {
            const res = await axios.post("/order_placing/recieptImageUpload", imageFormData);
            showToast(res.data);
            if(res.data.error){
                paymentRecieptImage.value = "";
            }
            isRecieptImageUploaded = true;
        } catch (error) {
            paymentRecieptImage.value = "";
            showToast({ error: "Cannot contact server. Try Again" });
        }
        progressBarContainer.style.display = "none";
    })
    // showToast({success: "Yes!"})
    const completeOrder = async () => {
        if (paymentRecieptImageForm.checkValidity()) {
            if (!isRecieptImageUploaded) {
                showToast({ error: "Upload an image of the receipt!" });
            }
            else {
                // showToast({ success: "Thank You for Your Order!" });
                // This bookId is defined in the payment partial
                try {
                    const res = await axios.post("/order_placing/confirmation");
                    if (res.data.success) {
                        showConfirmationPosition();
                        try {
                            const resDeleteCart = await axios.delete("/user_cart/destroy")
                            if (resDeleteCart.data.error) {
                                showToast(resDeleteCart.data)
                            }
                        } catch (error) {
                            showToast({ error: "Cannot Contact Server To Clear Cart!" })
                        }
                    }
                    showToast(res.data);
                } catch (error) {
                    console.log(error);
                    showToast({ error: "Cannot Contact Server!" });
                }
            }
        }
    }
    placeOrderBtn.addEventListener("click", () => {
        // showToast({success: "Yes Yes!"})
        completeOrder();
    })
}

if (newOrderAddressForm) {
    newOrderAddressForm.onsubmit = event => event.preventDefault();
    checkoutBtn.addEventListener("click", async () => {
        try {
            const formData = new FormData(newOrderAddressForm)
            const res = await axios.post("/order_placing/save_address", formData)
            showToast(res.data);
            showPaymentPosition();
            doPayment();
        } catch (error) {
            showToast({ error: "Cannot contact server!" });
        }
    })
}

if (orderAddressCard.length) {
    addressSelectRadio[0].checked = true;
    let selectedAddressId = addressSelectRadio[0].id;
    addressSelectRadio.forEach(radio => {
        if (radio.checked) {
            selectedAddressId = radio.id;
        }
    })
    const addressCardCheckoutBtn = document.querySelector("#addressCardCheckoutBtn");
    addressCardCheckoutBtn.addEventListener("click", async () => {
        try {
            const res = await axios.post("/order_placing/select_address", { addressId: selectedAddressId })
            if (res.data.success) {
                showPaymentPosition();
                doPayment();
            }
        } catch (error) {
            showToast({ error: "Cannot Contact Server!" })
        }
    })
}
const getAmounts = async () => {
    const subtotal = document.querySelector("#subtotal")
    const deliveryCharge = document.querySelector("#deliveryCharge")
    const totalAmount = document.querySelector("#totalAmount")
    try {
        const res = await axios.get("/order_placing/getAmounts")
        // console.log(res.data)
        if (res.data.error) {
            return showToast(res.data)
        }
        subtotal.innerText = res.data.subtotal
        deliveryCharge.innerText = res.data.deliveryCharge
        totalAmount.innerText = res.data.totalAmount
    } catch (error) {
        // console.log(error)
        placeOrderBtn.disabled = true;
        showToast({ error: "Cannot Fetch Amounts!" })
    }
}

getAmounts();