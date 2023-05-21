const addEventListenerToAddToCartBtns = () => {
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    addToCartBtn.addEventListener("click", async () => {
        const btnContainer = addToCartBtn.parentElement;
        try {
            const res = await axios.post(`/user_cart/${addToCartBtn.id}/add`);
            const link = document.createElement("a");
            link.href = "/user_cart";
            link.classList.add("btn", "btn-secondary", "go-to-cart-btn");
            link.innerText = "Go To Cart";
            btnContainer.appendChild(link);
            btnContainer.removeChild(addToCartBtn);
            setCartItemCount();
            showToast(res.data);
        } catch (err) {
            showToast({ error: "Error Adding Product to Cart!" });
        }
    })
}

const addEventListenerToAddToBuyNowBtns = () => {
    const buyNowBtns = document.querySelectorAll(".buy-now-btn");
    for (const btn of buyNowBtns) {
        if (!btn.classList.contains("added-listener")) {
            btn.classList.add("added-listener");
            btn.addEventListener("click", async () => {
                btn.classList.remove("btn-outline-success")
                btn.removeChild(btn.children["buyNowBtnText"] )
                btn.children["buyNowSpinner"].classList.replace("d-none", "d-block");
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

addEventListenerToAddToBuyNowBtns();
addEventListenerToAddToCartBtns();