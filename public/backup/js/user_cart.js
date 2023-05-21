const productContainer = document.querySelector(".product-container");
const productCards = document.querySelectorAll(".product-card");
const cartEmptyCard = document.querySelector(".cart-empty-card");
const placeOrderAddBooksContainer = document.querySelector(".place-order-login-btn-container");
const addBooksBtnContainer = document.querySelector(".add-books-btn-container");
const noOfProducts = document.querySelector(".no-of-products");
const placeOrderBtn = document.querySelector("#placeOrder");

noOfProducts.innerText = productsLength;

if (productsLength === 0) {
    cartEmptyCard.style.display = "block";
    placeOrderAddBooksContainer.style.display = "none";
    addBooksBtnContainer.style.display = "block";
}
else {
    cartEmptyCard.style.display = "none";
    placeOrderAddBooksContainer.style.display = "block";
    addBooksBtnContainer.style.display = "none";
}

// TODO
// You should not use global variables, use functions

if (productCards) {
    productCards.forEach(card => {
        const incBtn = card.children[0].children[1].children[0].children[2].children[1].children[0];
        const qty = card.children[0].children[1].children[0].children[2].children[1].children[1];
        const decBtn = card.children[0].children[1].children[0].children[2].children[1].children[2];
        const removeBtn = card.children[0].children[1].children[1];

        incBtn.addEventListener("click", async () => {
            try {
                const res = await axios.patch(`/user_cart/${incBtn.id}/update?q=%2B`)
                showToast(res.data)

                if (res.data.qty) {
                    qty.value = res.data.qty;
                }
                getAmounts();
            }
            catch (err) {
                showToast({ error: "Cannot Contact Server! Error changing quantity!" });
            }
        })
        decBtn.addEventListener("click", async () => {
            try {
                const res = await axios.patch(`/user_cart/${decBtn.id}/update?q=%2D`)
                showToast(res.data)

                if (res.data.qty) {
                    qty.value = res.data.qty;
                }
                getAmounts();
            }
            catch (err) {
                showToast({ error: "Cannot Contact Server! Error changing quantity!" });
            }
        });

        removeBtn.addEventListener("click", async function () {
            try {
                const res = await axios.delete(`/user_cart/${removeBtn.id}/remove`);
                productContainer.removeChild(card);
                --productsLength;
                setCartItemCount();
                noOfProducts.innerText = productsLength;
                if (productsLength <= 0) {
                    cartEmptyCard.style.display = "block";
                    placeOrderAddBooksContainer.style.display = "none";
                    addBooksBtnContainer.style.display = "block";
                }
                getAmounts();
                showToast(res.data)
            }
            catch (err) {
                showToast({ error: "Cannot Contact Server! Error Removing Product From Cart!" })
            }
        });
    })

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", async () => {
            const bookData = {
                bookIdsAndQty: []
            }
            if (productCards) {
                productCards.forEach(card => {
                    const qty = card.children[0].children[1].children[0].children[2].children[1].children[1];
                    bookData.bookIdsAndQty.push({
                        bookId: card.id,
                        cart_qty: qty.value
                    })
                })
            }
            try {
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
            } catch (err) {
                showToast({ error: "Cannot Contact Server!" });
            }
        })
    }
}

const getAmounts = async () => {
    const subtotal = document.querySelector("#subtotal")
    const deliveryCharge = document.querySelector("#deliveryCharge")
    const totalAmount = document.querySelector("#totalAmount")
    try {
        const res = await axios.get("/user_cart/getAmounts")
        // console.log(res.data)
        if (res.data.error) {
            return showToast(res.data)
        }
        subtotal.innerText = res.data.subtotal
        deliveryCharge.innerText = res.data.deliveryCharge
        totalAmount.innerText = res.data.totalAmount
    } catch (error) {
        // console.log(error)
        showToast({ error: "Cannot Fetch Amounts!" })
    }
}

getAmounts();
