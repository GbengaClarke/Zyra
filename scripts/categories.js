import { searchBar, updateCartQuantityNotification } from "./index.js";
import { save } from "../data/saved-items.js";
import { formatMoney, formatRating } from "./utilities/money.js";
import { cart } from "../data/cart.js";
import { products } from "../data/product.js";

export function renderSavedItems() {
  let categories = save.savedItems;
  const label = document.querySelector(".js-saved-items-container");
  if (!label) {
    return;
  }
  label.innerHTML = "SAVED ITEMS";

  const url = new URL(window.location.href);

  const electronics = url.searchParams.get("electronics");
  const fashion = url.searchParams.get("fashion");
  const homeEssentials = url.searchParams.get("homeEssentials");
  const shopAll = url.searchParams.get("shopAll");
  const search = url.searchParams.get("search");

  if (!products) {
    return;
  }

  let matchingProducts = [];

  if (electronics) {
    label.innerHTML = "Electronics & Gadgets";
    const matchSet = new Set(["electronics", "appliances"]);

    products.forEach((product) => {
      if (product.keywords.some((k) => matchSet.has(k))) {
        matchingProducts.push(product);
      }
    });
    categories = matchingProducts;
  } else if (fashion) {
    label.innerHTML = "Fashion & Apparels";
    const matchSet = new Set(["apparels", "apparel", "mens", "womens"]);

    products.forEach((product) => {
      if (product.keywords.some((k) => matchSet.has(k))) {
        matchingProducts.push(product);
      }
    });
    categories = matchingProducts;
  } else if (homeEssentials) {
    label.innerHTML = "Home Essentials";
    const matchSet = new Set(["kitchen", "home", "bathroom"]);

    products.forEach((product) => {
      if (product.keywords.some((k) => matchSet.has(k))) {
        matchingProducts.push(product);
      }
    });
    categories = matchingProducts;
  } else if (search) {
    document.querySelector(".js-empty").classList.remove("invisible");
    products.forEach((product) => {
      if (
        product.keywords.some((k) => k.includes(search)) ||
        product.name.toLowerCase().includes(search)
      ) {
        document.querySelector(".js-empty").classList.add("invisible");
        matchingProducts.push(product);
      } else {
        document.querySelector(".js-empty").innerHTML =
          "Sorry, we do not have that product";

        label.innerHTML = "ITEMS";
      }
    });
    categories = matchingProducts;
  } else if (shopAll) {
    label.innerHTML = "All Products";
    products.forEach((product) => {
      matchingProducts.unshift(product);
    });
    categories = matchingProducts;
  }

  let html = "";
  categories.forEach((item) => {
    html += `<div class="product-item js-product-item" data-product-id = "${
      item.id
    }">
    <div class="product-image-container">
      <img
        src="${item.image}"
        alt=""
      />
    </div>
    <!-- text portion -->
    <p class="item-name">
    ${item.name}
    </p>
    <p class="item-price">$${formatMoney(item.priceCents)}</p>
    <div class="item-rating">
      <p class="rate">${formatRating(
        item.rating.stars
      )}<span class="star">&#9733;</span></p>
      <p class="item-count">&#40;${item.rating.count}&#41;</p>
        <div class="delete-cont js-delete-cont ${
          electronics || fashion || homeEssentials || shopAll || search
            ? "invisible"
            : ""
        }" data-product-id = "${item.id}">
                <img
                  src="images/icons/delete_24dp_5C5B5B_FILL0_wght400_GRAD0_opsz24.svg"
                  alt=""
                />
              </div>
    </div>
    <button class = "js-add-to-cart-button"  data-product-id = "${
      item.id
    }">Add to Cart</button>
  </div>`;
  });

  document.querySelector(".js-category-products-grid").innerHTML = html;

  if (
    save.savedItems.length <= 0 &&
    !fashion &&
    !homeEssentials &&
    !electronics &&
    !shopAll &&
    !search
  ) {
    document.querySelector(".js-empty").classList.remove("invisible");
  }

  // add to cart
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

  //direct to product page on click
  function clickedProduct() {
    document.querySelectorAll(".js-product-item").forEach((clickedItem) => {
      clickedItem.addEventListener("click", (e) => {
        const productId = clickedItem.dataset.productId;
        if (
          !e.target.closest(".js-add-to-cart-button") &&
          !e.target.closest(".js-delete-cont")
        ) {
          window.location.href = `product-page.html?productId=${productId}`;
        }
      });
    });
  }

  clickedProduct();

  //delete
  const deleteCont = document.querySelectorAll(".js-delete-cont");
  deleteCont.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      save.removeFromSavedItems(productId);
      renderSavedItems();
    });
  });
}

const empty = document.querySelector(".js-empty");
