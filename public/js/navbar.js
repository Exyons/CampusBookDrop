(() => {
    'use strict'

    const navbar = document.querySelector(".navbar");
    const navbarContainer = document.querySelector(".navbar-container");
    const brandLogoParent = document.querySelector(".brand-logo-parent");
    const brandLogo = document.querySelector(".navbar-brand-logo");
    const navbarBtn = document.querySelector(".navbar-toggler");
    const searchBarContainer = document.querySelector(".search-bar-container");
    const searchBar = document.querySelector(".search-bar");
    const searchIcon = document.querySelector(".search-icon");
    const navIcons = document.querySelector(".navbar-icons");

    const cartItemCount = document.querySelector("#cartItemCount");

    const width = 991;

    function RevertNavbarChanges() {
        brandLogoParent.append(brandLogo);
        navbar.appendChild(navIcons);
        navbar.classList.add("rounded-5");
    }

    function ModifyNavbar() {
        if (window.innerWidth <= width) {
            navbar.insertBefore(brandLogo, navbarBtn);
            navbar.insertBefore(navIcons, navbarBtn);
            navbar.classList.remove("rounded-5");
        }
        else {
            RevertNavbarChanges();
        }
    }

    function ShowSearchBar() {
        if (searchBarContainer.classList.contains("hidden")) {
            searchBarContainer.classList.remove("hidden");
            searchBar.focus();
        }
        else {
            searchBarContainer.classList.add("hidden");
        }
    }

    window.addEventListener("load", ModifyNavbar);

    const setCartItemCount = async () => {
        try {
            const res = await axios.get("/user_cart/itemcount");
            cartItemCount.innerText = res.data.count;
        } catch (err) {
            console.log(err);
        }
    }

    setCartItemCount();

    window.addEventListener("resize", ModifyNavbar);
    searchIcon.addEventListener("click", ShowSearchBar);

    if (document.title !== "Your Cart") {
        document.body.onscroll = () => {
            navbarContainer.classList.add("sticky-top");
            if (window.scrollY === 0)
                navbar.classList.remove("shadow");
            else
                navbar.classList.add("shadow");
        }
    }
})()