const navbar = document.querySelector(".navbar");
const navbarContainer = document.querySelector(".navbar-container");

const brandLogoParent = document.querySelector(".brand-logo-parent");
const brandLogo = document.querySelector(".navbar-brand-logo");
const navbarBtn = document.querySelector(".navbar-toggler");
const navLnks = document.querySelectorAll(".nav-item");
const searchBarContainer = document.querySelector(".search-bar-container");
const searchBar = document.querySelector(".search-bar");
const searchIcon = document.querySelector(".search-icon");
const navIcons = document.querySelector(".navbar-icons");

const cartItemCount = document.querySelector("#cartItemCount");

const width = 991;
const searchBarMarginBottom = "30px";

// const searchBarMarginTop = "0px";

function RevertNavbarChanges() {
    brandLogoParent.append(brandLogo);
    navbar.appendChild(navIcons);
    // navbar.insertBefore(searchBarContainer, navIcons);
    navbar.classList.add("rounded-5");
    // searchBarContainer.style.display = "block";
    // for (let item of navLnks) {
    //     item.style.marginBottom = "0";
    // }
    // searchBarContainer.style.marginTop = "0";
    // brandLogoParent.style.marginTop = "0";
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
        // this.classList.add("pressed");
        searchBarContainer.classList.remove("hidden");
        searchBar.focus();
    }
    else {
        // this.classList.remove("pressed");
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
// navbarBtn.addEventListener("click", ChangeNavbarSpacing);
searchIcon.addEventListener("click", ShowSearchBar);

if (document.title !== "Your Cart"){
    document.body.onscroll = () => {
        navbarContainer.classList.add("sticky-top");
        if (window.scrollY === 0)
            navbar.classList.remove("shadow");
        else
            navbar.classList.add("shadow");
    }
}


