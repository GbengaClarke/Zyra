import { searchBar, updateCartQuantityNotification } from "./index.js";
import { cart } from "../data/cart.js";
import { getProduct, products } from "../data/product.js";
import { formatMoney, formatRating } from "./utilities/money.js";
import { save } from "../data/saved-items.js";
import { renderShoppingCartQuantity, renderOrderSummary } from "./checkout.js";

export function renderProductHtml() {
  const url = new URL(window.location.href);

  const productId = url.searchParams.get("productId");

  const item = getProduct(productId);
  if (!item) {
    return;
  }

  const productSectionElement = document.querySelector(".js-product-section");
  const matchingItem = cart.getMatchingItems(productId);

  // console.log(save.isSaved(productId));

  productSectionElement.innerHTML = `        <div class="clicked-product-image-container">
          <img
            src="${item.image}"
            alt="product image"
          />
          <div class="added-to-saved-items js-added-to-saved-items">
            Added to Saved Items
          </div>
        </div>

        <div class="clicked-product-info">
          <p class="name">
          ${item.name}
          </p>
          <p class="price">$${formatMoney(item.priceCents)}</p>
          <div class="rating">
            <div class="star-cont">
              <img src="images/ratings/rating-${
                item.rating.stars * 10
              }.png" alt="" />
            </div>
            <p>&#40;${item.rating.count} Verified Ratings&#41;</p>

            <span class="material-symbols-outlined js-favorite ${
              save.isClicked ? "filled-love" : ""
            } " data-product-id="${item.id}">
              favorite
            </span>
          </div>
        </div>

        <div class="clicked-product-quantity-range">
          <div>
            Quantity
            <button class="decrease-button js-product-decrease-button rounded-button">&minus;</button>
            <div class="product-quantity js-clicked-product-quantity">${
              matchingItem ? matchingItem.quantity : 0
            }</div>
            <button class="increase-button js-product-increase-button rounded-button">&#43;</button>
          </div>
        </div>

        <div class="clicked-services-cont">
          <div class="service">
            <div class="service-img-container">
              <img
                src="images/icons/health_and_safety_24dp_5C5B5B_FILL0_wght400_GRAD0_opsz24.svg"
                alt=""
              />
            </div>
            <div>
              <h4>Safe Payment</h4>
              <p>
                We ship all orders through trusted carriers and provide
                real-time tracking once your package is dispatched. You can
                count on timely and reliable delivery every time.
              </p>
            </div>
          </div>
          <div class="service">
            <div class="service-img-container">
              <img
                src="images/icons/rewarded_ads_24dp_5C5B5B_FILL0_wght400_GRAD0_opsz24.svg"
                alt=""
              />
            </div>
            <div>
              <h4>Quality & Authenticity</h4>
              <p>
                All our products are 100% genuine, sourced from verified
                suppliers. Each item is thoroughly inspected to ensure top
                quality before it leaves our hands.
              </p>
            </div>
          </div>
          <div class="service">
            <div class="service-img-container">
              <img
                src="images/icons/delivery_truck_speed_24dp_5C5B5B_FILL0_wght400_GRAD0_opsz24.svg"
                alt=""
              />
            </div>
            <div>
              <h4>Secure Shipping & Delivery</h4>
              <p>
                Every order is securely packed using protective, tamper-proof
                materials to prevent damage. In the rare case of a delivery
                issue, we offer free replacements for damaged items.
              </p>
            </div>
          </div>
        </div>`;

  favoriteIcon();

  const productQuantity = document.querySelector(
    ".js-clicked-product-quantity"
  );

  document
    .querySelector(".js-product-decrease-button")
    .addEventListener("click", () => {
      const updatedMatchingItem = cart.getMatchingItems(productId);

      if (!updatedMatchingItem) {
        return;
      }

      cart.decreaseCartQuantity(productId);
      updateCartQuantityNotification();

      if (updatedMatchingItem.quantity === 0) {
        cart.deleteFromCart(updatedMatchingItem.productId);
      }

      productQuantity.innerHTML = updatedMatchingItem.quantity;
    });

  document
    .querySelector(".js-product-increase-button")
    .addEventListener("click", () => {
      cart.addToCart(productId);
      updateCartQuantityNotification();
      cart.cartItems.forEach((item) => {
        if (item.productId === productId) {
          productQuantity.innerHTML = item.quantity;
        }
      });
    });

  document.querySelector(".js-clicked-price").innerHTML = `$${formatMoney(
    item.priceCents
  )}`;
}

searchBar();
updateCartQuantityNotification();

// favorite icon (saved-items)
const url = new URL(window.location.href);

const productId = url.searchParams.get("productId");

save.savedItems.forEach((item) => {
  if (item.id === productId) {
    save.isClicked = true;
  }
});
let clicked = save.isClicked;

function favoriteIcon() {
  const favoriteButton = document.querySelector(".js-favorite");
  let timeoutId;

  if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
      const productId = favoriteButton.dataset.productId;
      if (clicked) {
        save.removeFromSavedItems(productId);
        clicked = false;
        console.log(save.savedItems);

        document.querySelector(".js-added-to-saved-items").style.opacity = "0";
        favoriteButton.classList.remove("filled-love");
      } else {
        favoriteButton.classList.add("filled-love");

        save.addToSavedItems(productId);
        clicked = true;

        console.log(save.savedItems);

        document.querySelector(".js-added-to-saved-items").style.opacity = "1";

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          document.querySelector(".js-added-to-saved-items").style.opacity =
            "0";
        }, 2000);
      }
    });
  }
}

export function renderYouMayAlsoLike() {
  const thisProduct = getProduct(productId);
  if (!thisProduct) return [];

  const similar = products.filter((product) => {
    if (product.id === thisProduct.id) return false;
    return thisProduct.keywords.some((k) => product.keywords.includes(k));
  });

  const newProducts = products.filter((product) => {
    if (product.id === productId) {
      return false;
    }
    return product.new;
  });

  let alikeProducts;
  if (similar.length <= 4) {
    alikeProducts = [...similar, ...newProducts];
  } else {
    alikeProducts = similar;
  }

  const carouselWrapper = document.querySelector(".js-alike-carousel-wrapper");

  let html = "";

  alikeProducts.forEach((product) => {
    const matchingItem = cart.getMatchingItems(product.id);
    const quantity = matchingItem ? matchingItem.quantity : 0;

    html += `<div class="carousel-item js-alike-carousel-item" data-product-id = "${
      product.id
    }">
              <div class="carousel-item-info">
                <div class="item-image-info">
                  <img
                    src="${product.image}"
                    alt=""
                  />
                  <div class="add2cart js-alike-add2cart ${
                    quantity ? "invisible" : ""
                  }" data-product-id = "${product.id}">&#43; Add</div>

                  <div
                    class="add-to-cart-container js-alike-add-to-cart-container ${
                      quantity ? "visible-flex" : "invisible"
                    }"
                  >

                    <div class="product-quantity js-alike-stand-alone-product-quantity ${
                      quantity ? "visible" : "invisible"
                    }">${quantity}</div>

                    <div class="product-quantity-range js-alike-product-quantity-range center-align ${
                      quantity ? "invisible" : ""
                    }" data-product-id = "${product.id}">
                      <button class="decrease-button js-alike-decrease-button  rounded-button">
                        &minus;
                      </button>
                      <div class="js-alike-range-product-quantity product-quantity">${quantity}</div>
                      <button class="js-alike-increase-button increase-button rounded-button">
                        &#43;
                      </button>
                    </div>
                  </div>
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
              </div>
            </div>`;
  });
  carouselWrapper.innerHTML = html;

  document
    .querySelectorAll(".js-alike-stand-alone-product-quantity")
    .forEach((btn, index) => {
      btn.addEventListener("click", () => {
        btn.classList.replace("visible", "invisible");

        const productQuantityRange = document.querySelectorAll(
          ".js-alike-product-quantity-range"
        );
        productQuantityRange[index].classList.remove("invisible");
      });
    });

  // carousel add to cart button dynamics
  const add2cartButtons = document.querySelectorAll(".js-alike-add2cart");
  const carouselRangeContainers = document.querySelectorAll(
    ".js-alike-add-to-cart-container"
  );
  add2cartButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      button.classList.add("invisible");
      carouselRangeContainers[index].classList.remove("invisible");

      //add item to cart
      const productId = button.dataset.productId;
      cart.addToCart(productId);
      updateCartQuantityNotification();

      //change this getmatch?
      const matchingItem = cart.getMatchingItems(productId);

      const quantityElement = document.querySelectorAll(
        ".js-alike-range-product-quantity"
      );

      quantityElement[index].innerHTML = matchingItem.quantity;

      console.log(cart.cartItems);
    });
  });

  //quantity decrease and increase range

  range();

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
    document
      .querySelectorAll(".js-alike-carousel-item")
      .forEach((clickedItem) => {
        clickedItem.addEventListener("click", (event) => {
          const productId = clickedItem.dataset.productId;
          if (
            !event.target.closest(".js-alike-add-to-cart-container") &&
            !event.target.closest(".js-alike-add2cart")
          ) {
            window.location.href = `product-page.html?productId=${productId}`;
          }
        });
      });
  }
  clickedProduct();
}
//fixed-add-to-cart button and its notification on click
export function addedNotification() {
  const url = new URL(window.location.href);

  const productId = url.searchParams.get("productId");

  const item = getProduct(productId);
  let timeoutId;
  const addtocartbtn = document.querySelector(".js-add-to-cart");

  if (!addtocartbtn) {
    return;
  }

  addtocartbtn.addEventListener("click", () => {
    if (!addtocartbtn) {
      return;
    }

    cart.addToCart(productId);
    updateCartQuantityNotification();
    const matchingItem = cart.getMatchingItems(productId);

    const productQuantity = document.querySelector(
      ".js-clicked-product-quantity"
    );

    productQuantity.innerHTML = matchingItem.quantity;

    document.querySelector(".js-added").style.right = "0";
    clearTimeout(timeoutId);

    document.querySelector(".js-added").classList.remove("invisible");

    timeoutId = setTimeout(() => {
      document.querySelector(".js-added").style.right = "-100%";
    }, 1000);

    // bigger screen notification
    const minWidth1200px = window.matchMedia("(min-width:1200px)");

    if (minWidth1200px.matches) {
      document.querySelector(".js-added").classList.add("invisible");
      document.querySelector(".js-addedd").classList.remove("invisible");

      document.querySelector(".js-addedd").style.opacity = "1";
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        document.querySelector(".js-addedd").style.opacity = "0";
      }, 1000);
    }
  });
}

//range
export function range() {
  const range = document.querySelectorAll(".js-alike-product-quantity-range");

  range.forEach((product, index) => {
    const productId = product.dataset.productId;
    const increaseBtn = product.querySelector(".js-alike-increase-button");
    const decreaseBtn = product.querySelector(".js-alike-decrease-button");
    const quantityDisplay = product.querySelector(
      ".js-alike-range-product-quantity"
    );

    const updateQuantityDisplay = () => {
      const matchingItem = cart.getMatchingItems(productId);
      quantityDisplay.innerHTML = matchingItem ? matchingItem.quantity : 0;

      cart.saveToStorage();
    };

    increaseBtn.addEventListener("click", () => {
      cart.addToCart(productId);
      updateQuantityDisplay();
      updateCartQuantityNotification();
      renderShoppingCartQuantity();
      renderOrderSummary();
    });

    decreaseBtn.addEventListener("click", () => {
      cart.decreaseCartQuantity(productId);
      updateQuantityDisplay();
      const matchingItem = cart.getMatchingItems(productId);

      if (!matchingItem || matchingItem.quantity <= 0) {
        cart.deleteFromCart(productId);

        const itemElement = document.querySelector(
          `.js-cart-product-item-${productId}`
        );
        if (itemElement) {
          itemElement.remove();
        }
      }
      updateCartQuantityNotification();
      renderShoppingCartQuantity();
      renderOrderSummary();
    });
  });
}
