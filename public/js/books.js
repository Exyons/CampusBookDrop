const programmeFilterLinks = document.querySelectorAll(".programme-filter-lnk");
const branchFilterLinks = document.querySelectorAll(".branch-filter-lnk");
const productBody = document.querySelectorAll(".product-body")
const programmeFilterNavbar = document.querySelector(".programme-filter-navbar");
const branchFilterNavbar = document.querySelector(".branch-filter-navbar");
const semesterFilterNavbar = document.querySelector(".semester-filter-navbar");
const yearFilterNavbar = document.querySelector(".year-filter-navbar");
const filterBtn = document.querySelector(".filter-btn");
const filterBody = document.querySelector(".filter");
const productCardContainer = document.querySelector(".product-card-container");
const loadingSymbolContainer = document.querySelector(".loading-symbol-container");
const submitFilterOptionsBtn = document.querySelector(".submit-filter-options");

const semesterCheckBoxes = document.querySelectorAll(".sem-checkbox");
const semesterCheckBoxLabels = document.querySelectorAll(".sem-checkbox-label");

const yearCheckBoxes = document.querySelectorAll(".year-checkbox");
const yearCheckBoxLabels = document.querySelectorAll(".year-checkbox-label");

const branchCheckBoxes = document.querySelectorAll(".branch-checkbox");
const branchCheckBoxLabels = document.querySelectorAll(".branch-checkbox-label");

const programmeCheckBoxes = document.querySelectorAll(".prog-checkbox");
const programmeCheckBoxLabels = document.querySelectorAll(".prog-checkbox-label");

const priceCheckBoxes = document.querySelectorAll(".price-checkbox");
const priceCheckBoxLabels = document.querySelectorAll(".price-checkbox-label");

const changeStylesAndSendFilterData = (checkBox) => {
    checkBox.addEventListener("change", () => {
        if (checkBox.checked) {
            checkBox.labels[0].classList.add("selected")
        }
        else {
            checkBox.labels[0].classList.remove("selected")
        }
    })
}

const getSelectedOptionsAndSend = async () => {
    const selectedOptions = { programme: [], branch: [], price: [], semester: [], year: [] }

    semesterCheckBoxLabels.forEach(label => {
        if (label.classList.contains("selected")) {
            selectedOptions.semester.push(label.innerText);
        }
    })
    yearCheckBoxLabels.forEach(label => {
        if (label.classList.contains("selected")) {
            selectedOptions.year.push(label.innerText);
        }
    })
    branchCheckBoxLabels.forEach(label => {
        if (label.classList.contains("selected")) {
            selectedOptions.branch.push(label.innerText);
        }
    })
    programmeCheckBoxLabels.forEach(label => {
        if (label.classList.contains("selected")) {
            // Here I am sending id because Im storing programme in id
            selectedOptions.programme.push(label.innerText);
        }
    })
    priceCheckBoxLabels.forEach(label => {
        if (label.classList.contains("selected")) {
            selectedOptions.price.push(label.innerText);
        }
    })
    // Show toast if user did not slelcted any filter but submitted
    let atleastOneSelected = false;
    for (const key of Object.keys(selectedOptions)) {
        if (selectedOptions[key].length) {
            atleastOneSelected = true;
        }
    }

    if (!atleastOneSelected) {
        window.addEventListener("scroll", infiniteScroll);
        return
    }
    else {
        window.removeEventListener("scroll", infiniteScroll);
    }

    try {
        const res = await axios.post("/books/filter", selectedOptions);
        window.removeEventListener('scroll', infiniteScroll);
        // Then add filteres the products on page
        // showToast({ success: "Something Done" });
        // console.log(res.data);
        productCardContainer.textContent = ''
        if (!res.data.length) {
            const notFoundHeading = document.createElement("h1");
            notFoundHeading.classList.add("text-center");
            notFoundHeading.innerText = "No matching books found!";
            // productCardContainer.replaceChildren(notFoundHeading);
            productCardContainer.appendChild(notFoundHeading);
        }
        else {
            for (const templateString of res.data) {
                const productCard = document.createElement("div");
                productCard.classList.add("col");
                productCard.innerHTML = templateString;
                productCardContainer.appendChild(productCard);
            }
            addEventListenerToAddToCartBtns();
        }
    } catch (error) {
        // console.log(error);
        showToast({ error: "Cannot Contact Server! Try Again!" });
    }
}

submitFilterOptionsBtn.addEventListener("click", () => {
    // loadingSymbolContainer.parentNode.removeChild(loadingSymbolContainer);
    getSelectedOptionsAndSend();
})

semesterCheckBoxes.forEach(checkBox => {
    changeStylesAndSendFilterData(checkBox, semesterCheckBoxLabels);
})

yearCheckBoxes.forEach(checkBox => {
    changeStylesAndSendFilterData(checkBox, yearCheckBoxLabels);
})

branchCheckBoxes.forEach(checkBox => {
    changeStylesAndSendFilterData(checkBox, branchCheckBoxLabels);
})

programmeCheckBoxes.forEach(checkBox => {
    changeStylesAndSendFilterData(checkBox, programmeCheckBoxLabels);
})

priceCheckBoxes.forEach(checkBox => {
    changeStylesAndSendFilterData(checkBox, priceCheckBoxLabels);
})

const addEventListenerToAddToCartBtns = () => {
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
    for (const Btn of addToCartBtns) {
        // If there is already eventlistener added on addtocartbtn, do not add again
        if (!Btn.classList.contains("added-listener")) {
            Btn.classList.add("added-listener");
            Btn.addEventListener("click", async () => {
                // const productBody = Btn.parentElement.parentElement;
                const btnContainer = Btn.parentElement;
                try {
                    const res = await axios.post(`/user_cart/${Btn.id}/add`);
                    if (res.data.success) {
                        const link = document.createElement("a");
                        link.href = "/user_cart";
                        link.classList.add("btn", "btn-sm", "btn-outline-secondary", "go-to-cart-btn");
                        link.innerText = "Go To Cart";
                        btnContainer.appendChild(link);
                        btnContainer.removeChild(Btn);
                        setCartItemCount();
                    }
                    showToast(res.data);
                } catch (err) {
                    showToast({ error: "Error Adding Product to Cart!" });
                }
            })
        }
    }
}

const addEventListenerToAddToBuyNowBtns = () => {
    const buyNowBtns = document.querySelectorAll(".buy-now-btn");
    for (const btn of buyNowBtns) {
        if (!btn.classList.contains("added-listener")) {
            btn.classList.add("added-listener");
            btn.addEventListener("click", async () => {
                // const productBody = Btn.parentElement.parentElement;
                try {
                    // When pressing buy now button, the cart_qty will always be one
                    const bookData = {
                        bookIdsAndQty: [
                            {
                                bookId: btn.id,
                                cart_qty: 1
                            }
                        ]
                    }
                    // Receive a token from server
                    // Send that that token back to server for verfication
                    // If that token is valid then only show order placing page 
                    const resToken = await axios.post("/order_placing/getToken");
                    if (resToken.data.redirect) {
                        window.location = resToken.data.redirect;
                    }
                    const { token } = resToken.data;
                    const res = await axios.post("/order_placing", { data: bookData, token });
                    showToast(res.data)
                    if (res.data.redirect) {
                        window.location = res.data.redirect;
                    }
                } catch (error) {
                    console.log(error)
                    showToast({ error: "Cannot Contact Server!" });
                }
            })
        }
    }
}

// When page loads add the event listeners
addEventListenerToAddToCartBtns();
addEventListenerToAddToBuyNowBtns();

const infiniteScroll = async () => {
    const margin = 5;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - margin) {
        // user has scrolled to the bottom of the page, load more data
        // console.log("Bottom of page");
        try {
            const res = await axios.get("/books/loadBooks");
            // console.log(res.data);
            showToast(res.data)
            if (res.data.success) {
                loadingSymbolContainer.classList.add("d-none");
                window.removeEventListener("scroll", infiniteScroll);
            }
            else {
                for (const templateString of res.data) {
                    const productCard = document.createElement("div");
                    productCard.classList.add("col");
                    productCard.innerHTML = templateString;
                    productCardContainer.appendChild(productCard);
                }
                addEventListenerToAddToCartBtns();
                addEventListenerToAddToBuyNowBtns();
            }
        } catch (error) {
            console.log(error)
            showToast({ error: "Cannot fetch books from server!" });
        }
    }
};

window.addEventListener('scroll', infiniteScroll);
// Fetch books when page loads
window.onload = async () => {
    try {
        const res = await axios.get("/books/loadBooks");

        for (const templateString of res.data) {
            const productCard = document.createElement("div");
            productCard.classList.add("col");
            productCard.innerHTML = templateString;
            productCardContainer.appendChild(productCard);
        }
        addEventListenerToAddToCartBtns();
        addEventListenerToAddToBuyNowBtns();
        showToast(res.data)
    } catch (error) {
        showToast({ error: "Cannot fetch books from server!" });
    }
}

filterBtn.addEventListener("click", async () => {
    if (!filterBody.style.visibility || filterBody.style.visibility == "hidden") {
        // filterBody.style.display = "block";
        filterBody.style.visibility = "visible";
        filterBody.style.opacity = "1";
        filterBody.style.height = "100%";
    }
    else {
        // filterBody.style.display = "none";
        filterBody.style.visibility = "hidden";
        filterBody.style.opacity = "0";
        filterBody.style.height = "0";
    }
})



