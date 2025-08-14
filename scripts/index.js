import { products, loadProductsFetch } from "../data/product.js";
import { formatMoney, formatRating } from "./utilities/money.js";
import { cart } from "../data/cart.js";
import {
  renderProductHtml,
  addedNotification,
  renderYouMayAlsoLike,
} from "./product-page.js";
import { renderSavedItems } from "./categories.js";
import { renderCartItems, renderOrderSummary } from "./checkout.js";
import { renderOrdersPage } from "../data/order.js";

async function mainPageFunctions() {
  await loadProductsFetch();
  renderNewArrivalsHTML();
  renderTopSellerHTML();
  renderProductHtml();
  addedNotification();
  renderYouMayAlsoLike();
  renderSavedItems();
  renderCartItems();
  renderOrderSummary();
  renderOrdersPage();
}

mainPageFunctions();

function renderNewArrivalsHTML() {
  const carouselWrapper = document.querySelector(".js-carousel-wrapper");

  if (!carouselWrapper) {
    return;
  }

  let html = "";

  products.forEach((product, index) => {
    const matchingItem = cart.getMatchingItems(product.id);
    const quantity = matchingItem ? matchingItem.quantity : 0;

    if (!product.new) {
      return;
    }

    if (product.new.includes("yes")) {
      html += `<div class="carousel-item js-carousel-item" data-product-id = "${
        product.id
      }">
                <div class="carousel-item-info">
                  <div class="item-image-info">
                    <img
                      src="${product.image}"
                      alt=""
                    />
                    <div class="add2cart js-add2cart ${
                      quantity ? "invisible" : ""
                    }" data-product-id = "${product.id}">&#43; Add</div>
  
                    <div
                      class="add-to-cart-container js-add-to-cart-container ${
                        quantity ? "visible-flex" : "invisible"
                      }"
                    >

                    
                      <div class="product-quantity js-stand-alone-product-quantity ${
                        quantity ? "visible" : "invisible"
                      }">${quantity}</div>
  
                      <div class="product-quantity-range js-product-quantity-range center-align ${
                        quantity ? "invisible" : ""
                      }" data-product-id = "${product.id}">
                        <button class="decrease-button js-decrease-button rounded-button">
                          &minus;
                        </button>
                        <div class="js-range-product-quantity product-quantity" >${quantity}</div>
                        <button class="increase-button js-increase-button rounded-button" >
                          &#43;
                        </button>
                      </div>
                    </div>
                  </div>
                  <!-- text portion -->
                  <p class="item-name">
                    ${product.name}
                  </p>
                  <p class="item-price"> $${formatMoney(product.priceCents)}</p>
                  <div class="item-rating">
                    <p class="rate"> ${formatRating(
                      product.rating.stars
                    )} <span class="star">&#9733;</span></p>
                    <p class="item-count">&#40;${product.rating.count}&#41;</p>
                  </div>
                </div>
              </div>`;
    }
  });
  carouselWrapper.innerHTML = html;

  document
    .querySelectorAll(".js-stand-alone-product-quantity")
    .forEach((btn, index) => {
      btn.addEventListener("click", () => {
        btn.classList.replace("visible", "invisible");

        const productQuantityRange = document.querySelectorAll(
          ".js-product-quantity-range"
        );
        productQuantityRange[index].classList.remove("invisible");
      });
    });

  // carousel add to cart button dynamics
  const add2cartButtons = document.querySelectorAll(".js-add2cart");
  const carouselRangeContainers = document.querySelectorAll(
    ".js-add-to-cart-container"
  );
  add2cartButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      button.classList.add("invisible");
      carouselRangeContainers[index].classList.remove("invisible");

      //add new arrival item to cart
      const productId = button.dataset.productId;
      cart.addToCart(productId);
      updateCartQuantityNotification();

      //change this getmatch?
      const matchingItem = cart.getMatchingItems(productId);

      const quantityElement = document.querySelectorAll(
        ".js-range-product-quantity"
      );

      quantityElement[index].innerHTML = matchingItem.quantity;

      console.log(cart.cartItems);
    });
  });

  //quantity ase and increase range

  const range = document.querySelectorAll(".js-product-quantity-range");

  range.forEach((product, index) => {
    const productId = product.dataset.productId;
    const increaseBtn = product.querySelector(".js-increase-button");
    const decreaseBtn = product.querySelector(".js-decrease-button");
    const quantityDisplay = product.querySelector(".js-range-product-quantity");

    const updateQuantityDisplay = () => {
      const matchingItem = cart.getMatchingItems(productId);
      quantityDisplay.innerHTML = matchingItem ? matchingItem.quantity : 0;

      cart.saveToStorage();
    };

    increaseBtn.addEventListener("click", () => {
      cart.addToCart(productId);
      updateQuantityDisplay();
      updateCartQuantityNotification();
    });

    decreaseBtn.addEventListener("click", () => {
      cart.decreaseCartQuantity(productId);
      updateQuantityDisplay();
      const matchingItem = cart.getMatchingItems(productId);

      if (!matchingItem || matchingItem.quantity <= 0) {
        cart.deleteFromCart(productId);
      }

      updateCartQuantityNotification();
    });
  });

  // scroll
  function scroll() {
    const carousel = document.querySelector(".carousel-container");

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;

    let scrolll = 300;

    if (carousel.scrollLeft >= maxScroll - 1) {
      carousel.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      carousel.scrollBy({ left: scrolll, behavior: "smooth" });
    }
  }

  function scrollArrow() {
    const rightArrow = document.querySelector(".chevron-container");
    if (!rightArrow) {
      return;
    }
    rightArrow.addEventListener("click", scroll);
  }

  scrollArrow();

  //direct to product page on click
  function clickedProduct() {
    document.querySelectorAll(".js-carousel-item").forEach((clickedItem) => {
      clickedItem.addEventListener("click", (event) => {
        const productId = clickedItem.dataset.productId;
        if (
          !event.target.closest(".js-add-to-cart-container") &&
          !event.target.closest(".js-add2cart")
        ) {
          window.location.href = `product-page.html?productId=${productId}`;
        }
      });
    });
  }

  clickedProduct();
}

//render Top seller products

function renderTopSellerHTML() {
  const productGrid = document.querySelector(".js-products-grid");

  if (!productGrid) {
    return;
  }

  let html = "";

  products.forEach((product, index) => {
    html += `<div class="product-item js-product-item" data-product-id = "${
      product.id
    }">
            <div class="product-image-container">
              <img
                src="${product.image}"
                alt=""
              />
            </div>
            <!-- text portion -->
            <p class="item-name">
            ${product.name}
            </p>
            <p class="item-price">$${formatMoney(product.priceCents)}</p>
            <div class="item-rating">
              <p class="rate">${formatRating(
                product.rating.stars
              )} <span class="star">&#9733;</span></p>
              <p class="item-count">&#40;${product.rating.count}&#41;</p>
            </div>
            <button class = "js-add-to-cart-button add-to-cart-button" data-product-id = "${
              product.id
            }">Add to Cart</button>
          </div>`;
  });

  productGrid.innerHTML = html;

  //top products add to cart
  const addToCartButton = document.querySelectorAll(".js-add-to-cart-button");
  addToCartButton.forEach((button, index) => {
    let timeoutId;

    button.addEventListener("click", () => {
      const productId = button.dataset.productId;

      cart.addToCart(productId);

      button.style.backgroundColor = "green";
      button.innerHTML = "Added!";

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        button.style.backgroundColor = "black";
        button.innerHTML = "Add to Cart";
      }, 1000);

      updateCartQuantityNotification();
    });
  });

  updateCartQuantityNotification();

  //load more festure
  let itemsFirstLoad = 19;
  let itemsPerLoad = 10;
  let loopBegining = 0;

  const allProducts = document.querySelectorAll(".js-product-item");

  for (let i = loopBegining; i <= itemsFirstLoad; i++) {
    allProducts[i].style.display = "flex";
  }

  document.querySelector(".js-load-more").addEventListener("click", () => {
    loopBegining += itemsFirstLoad;
    itemsPerLoad += itemsFirstLoad;
    for (let i = loopBegining; i <= itemsPerLoad && i < products.length; i++) {
      allProducts[i].style.display = "flex";

      if (i >= products.length - 1) {
        document.querySelector(".js-load-more").classList.add("invisible");
      }
    }
  });

  //direct to product page on click
  function clickedProduct() {
    document.querySelectorAll(".js-product-item").forEach((clickedItem) => {
      clickedItem.addEventListener("click", (e) => {
        const productId = clickedItem.dataset.productId;
        if (!e.target.closest(".js-add-to-cart-button")) {
          window.location.href = `product-page.html?productId=${productId}`;
        }
      });
    });
  }

  clickedProduct();
}

export function updateCartQuantityNotification() {
  document.querySelector(".notification-icon").innerHTML =
    cart.totalCartQuantity();

  if (cart.totalCartQuantity() === 0) {
    document.querySelector(".notification-icon").classList.add("invisible");
  } else {
    document.querySelector(".notification-icon").classList.remove("invisible");
  }
}

function mediaQuery() {
  const maxWidth767 = window.matchMedia("(max-width:767px)");

  if (maxWidth767.matches) {
    const slidewrap = document.querySelector(".js-slide-wrap");
    if (!slidewrap) {
      return;
    }

    const copy = slidewrap.cloneNode(true);

    document.querySelector(".slider2").appendChild(copy);
  }
}

mediaQuery();

// search bar effect

export function searchBar() {
  document.querySelector(".js-search-icon").addEventListener("click", () => {
    document
      .querySelector(".js-hamburger-container")
      .classList.add("invisible");
    document.querySelector(".js-jibby").classList.add("invisible");
    document.querySelector(".js-icons-container").classList.add("invisible");

    const inputElement = document.querySelector(".js-search-input");
    inputElement.focus();
    document
      .querySelector(".js-search-bar-container")
      .classList.remove("invisible");
  });

  //actual search
  const inputElement = document.querySelector(".js-search-input");
  document
    .querySelector(".js-search-products")
    .addEventListener("click", () => {
      const searchText = inputElement.value.toLowerCase();
      window.location.href = `categories.html?search=${searchText}`;
    });

  inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === "Return") {
      const searchText = inputElement.value.toLowerCase();
      window.location.href = `categories.html?search=${searchText}`;
    }
  });

  // cancel returns icons
  document.querySelector(".js-cancel").addEventListener("click", () => {
    document
      .querySelector(".js-hamburger-container")
      .classList.remove("invisible");
    document.querySelector(".js-jibby").classList.remove("invisible");
    document.querySelector(".js-icons-container").classList.remove("invisible");

    document
      .querySelector(".js-search-bar-container")
      .classList.add("invisible");
  });
}

searchBar();

// header profile click
export function headProfileClick() {
  const personIcon = document.querySelector(".js-person-icon-container");
  const popUp = document.querySelector(".js-pop-up");

  personIcon.addEventListener("click", () => {
    popUp.classList.toggle("invisible");
  });

  document.addEventListener("click", (e) => {
    if (!personIcon.contains(e.target) && !popUp.contains(e.target)) {
      popUp.classList.add("invisible");
    }
  });

  document.addEventListener("scroll", (e) => {
    if (!personIcon.contains(e.target) && !popUp.contains(e.target)) {
      popUp.classList.add("invisible");
    }
  });
}
headProfileClick();

//main page slider
function carouselSlider() {
  const wrapper = document.querySelector(".slider-wrapper");

  if (!wrapper) {
    return;
  }

  let value = 0;
  const totalSlide = 7;

  const dots = document.querySelectorAll(".dot");

  setInterval(() => {
    wrapper.style.transform = `translateX(-${value * 100}vw)`;
    wrapper.style.transition = "transform 0.5s ease-in-out";

    dots.forEach((dot) => dot.classList.remove("active"));

    if (dots[value]) {
      dots[value].classList.add("active");
    }
    value++;

    if (value === totalSlide) {
      setTimeout(() => {
        value = 0;
        wrapper.style.transform = "translateX(0vw)";
        wrapper.style.transition = "none";

        dots.forEach((dot) => dot.classList.remove("active"));
        dots[0].classList.add("active");
      }, 500);
    }
  }, 3000);
}

carouselSlider();

//close side bar (unfshd)
// const checkbox = document.getElementById("hamburger");
// const hamburgerButton = document.querySelector(".js-hamburger-container");
// const sidebar = document.querySelector(".js-sidebar");

// document.addEventListener("click", (event) => {
//   if (!event.target.closest(".js-sidebar")) {
//     checkbox.checked = !checkbox.checked;
//   }
// });
