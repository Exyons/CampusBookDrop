const dashboardLinks = document.querySelectorAll(".dashboard-lnk");
const contents = document.querySelectorAll(".content");
const addressCards = document.querySelectorAll(".address-card");
const sellerBookCards = document.querySelectorAll(".seller-book-card");
const accountDetailsForm = document.querySelector(".account-details-form");
const dashboardNavbar = document.querySelector(".dashboard-navbar");
const dashboardContainer = document.querySelector(".dashboard-container");
const editAccountDetailsBtn = document.querySelector(".edit-account-details-btn");
const editThumbnailBtn = document.querySelector(".edit-thumbnail-btn");
const addressContainer = document.querySelector(".address-container");
const addNewAddressBtn = document.querySelector(".add-new-address");
const addressModalTitle = document.querySelector(".address-modal-title");
const bookModalTitle = document.querySelector(".book-modal-title");
const addressFormSubmitBtn = document.querySelector(".address-submit-btn");
const bookFormSubmitBtn = document.querySelector(".book-submit-btn");
const addressForm = document.querySelector(".address-form");
const bookDetailsForm = document.querySelector(".book-details-form");
const bookImageForm = document.querySelector(".book-image-form");
const addressFormModal = document.querySelector(".address-form-modal");
const bookFormModal = document.querySelector(".book-form-modal");
const addressFormInput = document.querySelector('#inputName');
const bookFormInput = document.querySelector('#inputBookTitle');
const progressBarContainer = document.querySelector(".progress-bar-container");
const bookImageFile = document.querySelector("#bookImage");
const booUploadStatus = document.querySelector(".upload-status-info")
const showReceiptBtns = document.querySelectorAll(".show-receipt-btn");
const userThumbnailForm = document.querySelector("#userThumbnailForm")

const hostels = { TH: "Tilak Hostel", PH: "Patel Hostel", MH: "Malviya Hostel", SVBH: "SVB Hostel" };

const addressFormBootstrapModal = new bootstrap.Modal(addressFormModal);
const bookFormBootstrapModal = new bootstrap.Modal(bookFormModal);

accountDetailsForm.onsubmit = event => event.preventDefault();
addressForm.onsubmit = event => event.preventDefault();
userThumbnailForm.onsubmit = event => event.preventDefault();

addressFormSubmitBtn.addEventListener("click", (event) => {
    if (!addressForm.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    }
    addressForm.classList.add('was-validated')
})

editAccountDetailsBtn.addEventListener("click", (event) => {
    if (!accountDetailsForm.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    }
    accountDetailsForm.classList.add('was-validated')
})

let isImageUploaded = false;
if (bookDetailsForm) {
    bookFormSubmitBtn.addEventListener("click", (event) => {
        if (!bookDetailsForm.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
        }
        bookDetailsForm.classList.add('was-validated')
    })

    bookFormModal.addEventListener('shown.bs.modal', () => {
        bookFormInput.focus();
    })

    bookFormModal.addEventListener("hide.bs.modal", () => {
        // After the modal is closed I am removing the validations done in form
        bookDetailsForm.classList.remove('was-validated');
    })

    bookImageFile.addEventListener("change", async () => {
        const file = bookImageFile.files[0];
        progressBarContainer.style.display = "none";

        // TODO 
        // add checks to identify width and height of image is more than 200px

        //Check the file properties.
        if (file) {
            if (!file.type.match('image.*')) {
                showToast({ error: "You cannot upload this file because its not an image." });
                return;
            }

            if (file.size >= 2000000) {
                showToast({ error: "You cannot upload this file because its size exceeds the maximum limit of 2 MB." });
                return;
            }
        }

        // I am sending request at every value change in file input
        // I want to remove the uploaded file if user does not submits the form
        const imageFormData = new FormData(bookImageForm);
        progressBarContainer.style.display = "block";
        try {
            const res = await axios.post("/user/books/imageUpload", imageFormData);
            showToast(res.data);
            isImageUploaded = true;
        } catch (error) {
            showToast({ error: "Cannot contact server. Try Again" });
        }
        progressBarContainer.style.display = "none";
    })
}


addressFormModal.addEventListener('shown.bs.modal', () => {
    addressFormInput.focus();
})

addressFormModal.addEventListener("hide.bs.modal", () => {
    // After the modal is closed I am removing the validations done in form
    addressForm.classList.remove('was-validated');
})

function ChangeStyles() {
    for (let child of dashboardNavbar.children) {
        if (child.style.borderLeft) {
            child.classList.add("selected");
        }
    }
    dashboardNavbar.style.flexDirection = "row";
}

function AddBottomBorder(ref) {
    ref.classList.add("selected");
    for (let child of dashboardNavbar.children) {
        if (child !== ref) {
            child.classList.remove("selected");
        }
    }
}

function ShowContent(ref) {
    if (ref.classList.contains("selected")) {
        for (let content of contents) {

            if (content.classList[1] === ref.classList[1]) {
                content.style.display = "flex";
            }
            else {
                content.style.display = "none";
            }
        }
    }
}

function PerformActions() {
    AddBottomBorder(this);
    ShowContent(this);
}

// Changing the content box to show the contents of the navbar item which has selected class
for (let link of dashboardLinks) {
    if (link.classList.contains("selected")) {
        for (let content of contents) {
            if (content.classList[1] === link.classList[1]) {
                content.style.display = "flex";
            }
            else {
                content.style.display = "none";
            }
        }
    }
    link.addEventListener("click", PerformActions);
}

editAccountDetailsBtn.addEventListener("click", async () => {
    const accountFormData = new FormData(accountDetailsForm);
    for (const elem of accountDetailsForm.elements) {
        if (elem !== editAccountDetailsBtn) {
            elem.disabled = !elem.disabled;
        }
    }
    // At server side check if details provided are valid or not
    // Because user can enter anything
    if (editAccountDetailsBtn.innerText === "Update Details") {
        editAccountDetailsBtn.innerText = "Edit Details";
        try {
            const res = await axios.patch(`/user/account/${editAccountDetailsBtn.id}/update`, accountFormData);
            showToast(res.data);
        } catch (err) {
            showToast({ error: "Error Updating Details" })
        }
    }
    else {
        editAccountDetailsBtn.innerText = "Update Details";
    }
})

let isThumbnailUploaded = false;
editThumbnailBtn.addEventListener("click", async () => {
    const userThumbnailFile = document.querySelector("#userThumbnail");
    const accountProgressBar = document.querySelector(".account-progress-bar-container");
    if (userThumbnailForm.classList.contains("d-none")) {
        userThumbnailForm.classList.replace("d-none", "d-block");
    }
    else {
        userThumbnailForm.classList.replace("d-block", "d-none");
    }
    // if (accountProgressBar.classList.contains("d-none")) {
    //     accountProgressBar.classList.remove("d-none");
    //     accountProgressBar.classList.add("d-block");
    // }
    // else {
    //     accountProgressBar.classList.remove("d-block");
    //     accountProgressBar.classList.add("d-none");
    // }
    userThumbnailFile.addEventListener("change", async () => {
        const file = userThumbnailFile.files[0];
        accountProgressBar.classList.replace("d-block", "d-none");

        // TODO 
        // add checks to identify width and height of image is more than 200px

        //Check the file properties.
        if (file) {
            if (!file.type.match('image.*')) {
                showToast({ error: "You cannot upload this file because its not an image." });
                return;
            }

            if (file.size >= 1000000) {
                showToast({ error: "You cannot upload this file because its size exceeds the maximum limit of 2 MB." });
                return;
            }
        }

        // I am sending request at every value change in file input
        // I want to remove the uploaded file if user does not submits the form
        const imageFormData = new FormData(userThumbnailForm);
        accountProgressBar.classList.replace("d-none", "d-block");
        try {
            const res = await axios.post("/user/account/uploadThumbnail", imageFormData);
            showToast(res.data);
            isThumbnailUploaded = true;
        } catch (error) {
            showToast({ error: "Cannot contact server. Try Again" });
        }
        accountProgressBar.classList.replace("d-block", "d-none");
    })

    if (editThumbnailBtn.innerText === "Save") {
        if (isThumbnailUploaded) {
            try {
                const res = await axios.post(`/user/account/${editThumbnailBtn.id}/saveThumbnail`);
                editThumbnailBtn.innerText = "Change";
                showToast(res.data);
            } catch (error) {
                console.log(error);
                showToast({ error: "Cannot Contact Server to save thumbnail!" })
            }
        }
        else {
            showToast({ error: "Upload an Image First!" });
        }
    }
    else {
        editThumbnailBtn.innerText = "Save";
    }
})

const addAddress = async () => {
    // If according to bootstrap the form vlaues were valid, send AJAX more like AJAJ request
    if (addressForm.checkValidity()) {
        const addressFormData = new FormData(addressForm);
        try {
            const res = await axios.post("/user/address", addressFormData);
            showToast(res.data);
            addressFormBootstrapModal.hide();
        } catch (error) {
            showToast({ error: "Cannot Contact Server! Error when adding the address!" });
        }
    }
}

const editAddress = async (evt) => {
    const { addressCard } = evt.currentTarget;
    if (addressForm.checkValidity()) {
        const addressFormData = new FormData(addressForm);
        try {
            const res = await axios.patch(`/user/address/${addressCard.id}`, addressFormData);
            showToast(res.data);
            addressFormBootstrapModal.hide();
            addressCard.children["addressDetails"].children["name"].innerText = addressForm.elements["inputName"].value;
            addressCard.children["addressDetails"].children["mobileContainer"].children["mobile"].innerText = addressForm.elements["inputNumber"].value;
            addressCard.children["addressDetails"].children["roomContainer"].children["room"].innerText = addressForm.elements["room"].value;
            addressCard.children["addressDetails"].children["hostel"].children[0].innerText = hostels[addressForm.elements["hostel"].value];
        } catch (error) {
            showToast({ error: "Cannot Contact Server! Error when updating the address! Try Again" });
        }
    }
}

if (addressCards) {
    addressCards.forEach(addressCard => {
        const editAddressBtn = addressCard.children[0].children[0];
        const deleteAddressBtn = addressCard.children[0].children[1];

        editAddressBtn.addEventListener("click", () => {
            addressModalTitle.innerText = "Edit Address";
            // Adding the values to the edit address form
            addressForm.elements["inputName"].value = addressCard.children["addressDetails"].children["name"].innerText;
            addressForm.elements["inputNumber"].value = addressCard.children["addressDetails"].children["mobileContainer"].children["mobile"].innerText
            addressForm.elements["room"].value = addressCard.children["addressDetails"].children["roomContainer"].children["room"].innerText

            const hostelKey = Object.keys(hostels).find(key => { // FInding out the key from a value in hostels object
                if (hostels[key] === addressCard.children["addressDetails"].children["hostel"].children[0].innerText) {
                    return key;
                }
            })

            for (const child of addressForm.elements["hostel"].children) {
                if (child.value === hostelKey) {
                    child.selected = "true"
                }
            }
            addressFormSubmitBtn.removeEventListener("click", addAddress);
            addressFormSubmitBtn.addEventListener("click", editAddress);
            addressFormSubmitBtn.addressCard = addressCard;

        })
        if (deleteAddressBtn) {
            deleteAddressBtn.addEventListener("click", async () => {
                try {
                    const res = await axios.delete(`/user/address/${addressCard.id}`)
                    showToast(res.data);
                } catch (error) {
                    showToast({ error: "Cannot Contact Server! Error when deleting the address Try Again" });
                }
            })
        }
    })
}

addNewAddressBtn.addEventListener("click", () => {
    addressModalTitle.innerText = "Add New Address";
    for (const element of addressForm.elements) {
        element.value = "";
    }
    // Hostel will already be selected, so need to add logic to select it

    // TODo
    // When adding new address, add new addressCard 

    // This is done to remove all event listeners from the element
    addressFormSubmitBtn.removeEventListener("click", editAddress);
    addressFormSubmitBtn.addEventListener("click", addAddress);
})

const addBook = async () => {
    if (bookDetailsForm.checkValidity()) {
        if (isImageUploaded) {
            const detailsFormData = new FormData(bookDetailsForm);
            try {
                const res = await axios.post("/user/books/details", detailsFormData);
                showToast(res.data);
            } catch (error) {
                showToast({ error: "Cannot contact server. Try Again" });
                return
            }
            bookFormBootstrapModal.hide();
            isImageUploaded = false;
        }
        else {
            showToast({ error: "Upload an image of the book you are adding!" });
        }
    }
}

const editBook = async (evt) => {
    const { bookCard } = evt.currentTarget;
    if (bookDetailsForm.checkValidity()) {
        const detailsFormData = new FormData(bookDetailsForm);
        try {
            const res = await axios.patch(`/user/books/${bookCard.id}`, detailsFormData);
            showToast(res.data);
            bookFormBootstrapModal.hide();
            // Now updating the book card values
            bookCard.children["bookDetails"].children["bookTitle"].innerText = bookDetailsForm.elements["inputBookTitle"].value
            bookCard.children["bookDetails"].children["bookDescription"].innerText = bookDetailsForm.elements["inputBookDescription"].value
            bookCard.children["bookDetails"].children[2].children["bookPrice"].innerText = bookDetailsForm.elements["inputBookPrice"].value 
            bookCard.children["bookDetails"].children[3].children["bookQty"].innerText = bookDetailsForm.elements["inputBookQty"].value
            bookCard.children["bookDetails"].children[4].children["bookYear"].innerText = bookDetailsForm.elements["selectYear"].value
            bookCard.children["bookDetails"].children[5].children["bookSemester"].innerText = bookDetailsForm.elements["selectSemester"].value
            bookCard.children["bookDetails"].children[7].children["bookBranch"].innerText = bookDetailsForm.elements["selectBranch"].value
            bookCard.children["bookDetails"].children[8].children["bookCondition"].innerText = bookDetailsForm.elements["inputBookCondition"].value
            bookCard.children["bookDetails"].children[9].children["bookDamages"].innerText = bookDetailsForm.elements["inputBookDamages"].value
            bookCard.children["bookDetails"].children[6].children["bookProgramme"].innerText = bookDetailsForm.elements["selectProgramme"].value;
        } catch (error) {
            console.log(error)
            showToast({ error: "Cannot Contact Server! Error when updating the book! Try Again" });
        }
    }
}

if (sellerBookCards) { // Because there can be zero books added by seller, I dont want an error
    sellerBookCards.forEach(bookCard => {
        const editBookBtn = bookCard.children["bookDetails"].children["bookConfigBtns"].children[0];
        const deleteBookBtn = bookCard.children["bookDetails"].children["bookConfigBtns"].children[1];

        editBookBtn.addEventListener("click", () => {
            bookModalTitle.innerText = "Edit Book";
            bookDetailsForm.elements["inputBookTitle"].value = bookCard.children["bookDetails"].children["bookTitle"].innerText
            bookDetailsForm.elements["inputBookDescription"].value = bookCard.children["bookDetails"].children["bookDescription"].innerText
            bookDetailsForm.elements["inputBookPrice"].value = parseInt(bookCard.children["bookDetails"].children[2].children["bookPrice"].innerText)
            bookDetailsForm.elements["inputBookQty"].value = bookCard.children["bookDetails"].children[3].children["bookQty"].innerText
            bookDetailsForm.elements["selectYear"].value = bookCard.children["bookDetails"].children[4].children["bookYear"].innerText
            bookDetailsForm.elements["selectSemester"].value = bookCard.children["bookDetails"].children[5].children["bookSemester"].innerText
            bookDetailsForm.elements["selectProgramme"].value = bookCard.children["bookDetails"].children[6].children["bookProgramme"].innerText
            bookDetailsForm.elements["selectBranch"].value = bookCard.children["bookDetails"].children[7].children["bookBranch"].innerText
            bookDetailsForm.elements["inputBookCondition"].value = bookCard.children["bookDetails"].children[8].children["bookCondition"].innerText
            bookDetailsForm.elements["inputBookDamages"].value = bookCard.children["bookDetails"].children[9].children["bookDamages"].innerText
    
            for (const child of bookDetailsForm.elements["selectProgramme"].children) {
                if (child.value === bookCard.children["bookDetails"].children[6].children["bookProgramme"].innerText) {
                    child.selected = "true"
                }
            }
            bookFormSubmitBtn.removeEventListener("click", addBook);
            bookFormSubmitBtn.addEventListener("click", editBook);
            bookFormSubmitBtn.bookCard = bookCard;
        })
        deleteBookBtn.addEventListener("click", async () => {
            try {
                const res = await axios.delete(`/user/books/${bookCard.id}`)
                showToast(res.data);
            } catch (error) {
                showToast({ error: "Cannot Contact Server! Error when deleting the Book! Try Again" });
            }
        })
    })
    const addNewBookBtn = document.querySelector(".add-new-book");
    if (addNewBookBtn) {
        addNewBookBtn.addEventListener("click", () => {
            bookModalTitle.innerText = "Add New Book";
            for (const element of bookDetailsForm.elements) {
                element.value = "";
            }
            bookFormSubmitBtn.removeEventListener("click", editBook);
            bookFormSubmitBtn.addEventListener("click", addBook);
        })
    }
}

// if (showReceiptBtns.length) {
//     showReceiptBtns.forEach(btn => {
//         btn.addEventListener("click", async () => {
//             try {
//                 const res = await axios.get(`/user/orders/download/receiptImage?orderId=${btn.id}`);
//                 if (res.data.success) {
//                     // SHow Image in a modal 
//                     // and make it so it can be downloaded
//                 }
//             } catch (error) {
//                 showToast({ error: "Cannot Contact Server!" })
//             }
//         })
//     })
// }

const teenBindiBtn = document.querySelectorAll(".teen-bindi");
if (teenBindiBtn.length) {
    teenBindiBtn.forEach(btn => {
        // The way I am implementing to show the teen bindi body requires 
        // the button to already have class of pressed
        btn.classList.add("pressed");
        btn.addEventListener("click", () => {
            const teenBindiBody = document.querySelectorAll(".teen-bindi-body");
            teenBindiBody.forEach(body => {
                if (btn.id === body.id) {
                    if (btn.classList.contains("pressed")) {
                        body.style.display = "block";
                        btn.classList.remove("pressed")
                    }
                    else {
                        body.style.display = "none";
                        btn.classList.add("pressed");
                    }
                }
            })
        })
    })
}

const showDeliveryOptionsBtn = document.querySelectorAll(".show-delivery-options-btn");
if (showDeliveryOptionsBtn.length) {
    showDeliveryOptionsBtn.forEach(btn => {
        // The way I am implementing to show the teen bindi body requires 
        // the button to already have class of pressed
        // btn.disabled = ["locked", "delivered", "pickedup"].includes(order.delivery_status)
        btn.classList.add("pressed");
        btn.addEventListener("click", () => {
            const showDeliveryOptionsBody = document.querySelectorAll(".show-delivery-options-body");
            showDeliveryOptionsBody.forEach(body => {
                if (btn.id === body.id) {
                    if (btn.classList.contains("pressed")) {
                        body.style.display = "block";
                        btn.classList.remove("pressed")
                    }
                    else {
                        body.style.display = "none";
                        btn.classList.add("pressed");
                    }
                }
            })
        })
    })
}

const lockOrderBtn = document.querySelectorAll(".lock-order-btn")
if (lockOrderBtn.length) {
    lockOrderBtn.forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                const res = await axios.post("/user/delivery/status", { status: "locked", id: btn.id })
                showToast(res.data)
            } catch (error) {
                console.log(error)
                showToast({ error: "Cannot Contact Server!" });
            }
        })
    })
}

const deliveredOrderBtn = document.querySelectorAll(".delivered-btn")
if (deliveredOrderBtn.length) {
    deliveredOrderBtn.forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                const res = await axios.post("/user/delivery/status", { status: "delivered", id: btn.id, orderId: btn.parentElement.id })
                showToast(res.data)
            } catch (error) {
                showToast({ error: "Cannot Contact Server!" });
            }
        })
    })
}

const pickedupOrderBtn = document.querySelectorAll(".pickedup-btn")
if (pickedupOrderBtn.length) {
    pickedupOrderBtn.forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                const res = await axios.post("/user/delivery/status", { status: "pickedup", id: btn.id, orderId: btn.parentElement.id })
                showToast(res.data)
            } catch (error) {
                showToast({ error: "Cannot Contact Server!" });
            }
        })
    })
}

const checkUsernamePasswordAndEmail = () => {
    const username = document.querySelector("#username");
    const usernameFeedback = document.querySelector("#usernameFeedback");
    const email = document.querySelector("#userEmail");
    const emailFeedback = document.querySelector("#emailFeedback");
    username.addEventListener("input", async () => {
        if (username.checkValidity()) {
            try {
                const res = await axios.post("/user/sign_up/checkUsername", { username: username.value })
                if (res.data.success) {
                    username.classList.add("valid");
                    // signUpBtn.disabled = !(email.classList.contains("valid") && username.classList.contains("valid"));
                    usernameFeedback.classList.remove("text-danger")
                    usernameFeedback.classList.add("text-success")
                    usernameFeedback.textContent = res.data.success
                }
                else {
                    username.classList.remove("valid");
                    // signUpBtn.disabled = true;
                    usernameFeedback.classList.remove("text-success")
                    usernameFeedback.classList.add("text-danger")
                    usernameFeedback.textContent = res.data.error
                }
            } catch (error) {
                console.log(error)
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
                    // signUpBtn.disabled = !(email.classList.contains("valid") && username.classList.contains("valid"));
                    emailFeedback.classList.remove("text-danger")
                    emailFeedback.classList.add("text-success")
                    emailFeedback.textContent = res.data.success
                }
                else {
                    email.classList.remove("valid");
                    // signUpBtn.disabled = true;
                    emailFeedback.classList.remove("text-success")
                    emailFeedback.classList.add("text-danger")
                    emailFeedback.textContent = res.data.error
                }
            } catch (error) {
                emailFeedback.textContent = "Cannot Contact Server!";
            }
        }
    })
}

checkUsernamePasswordAndEmail()

const upiIdForm = document.querySelector("#upiIdForm");
if (upiIdForm) {
    const saveUpiIdBtn = document.querySelector("#saveUPIidBtn");
    upiIdForm.onsubmit = event => event.preventDefault();
    saveUpiIdBtn.addEventListener("click", async () => {
        try {
            const sellerUpiId = upiIdForm.elements.sellerUPIid.value;
            const res = await axios.post("/user/sellerPaymentDetails", { sellerUpiId })
            showToast(res.data)
        } catch (error) {
            // console.log(error);
            showToast({ error: "Cannot Contact Server!" })
        }
    })
}