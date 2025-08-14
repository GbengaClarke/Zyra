import { getProduct } from "../data/product.js";
import { updateCartQuantityNotification } from "./index.js";
import { cart } from "../data/cart.js";
import { formatMoney } from "./utilities/money.js";
import { range } from "./product-page.js";
import {
  deliveryOptions,
  getDeliveryOption,
  formatDeliveryDate,
} from "../data/deliveryOptions.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import { orders } from "../data/order.js";

updateCartQuantityNotification();

export function renderShoppingCartQuantity() {
  const quantity = document.querySelector(".js-shopping-cart-quantity");

  if (quantity && cart.totalCartQuantity() > 1) {
    quantity.innerHTML = `&#40;${cart.totalCartQuantity()} items&#41;`;
  } else if (quantity && cart.totalCartQuantity() === 1) {
    quantity.innerHTML = `&#40;${cart.totalCartQuantity()} item&#41;`;
  } else if (quantity && cart.totalCartQuantity() === 0) {
    quantity.innerHTML = ``;

    const minWidth850 = window.matchMedia("(min-width:850px)");

    if (minWidth850.matches) {
      document.querySelector(".js-checkout-flex").style.flexDirection = "row";
    }
  }
}

export function renderCartItems() {
  renderShoppingCartQuantity();

  let html = "";

  cart.cartItems.forEach((item) => {
    const product = getProduct(item.productId);

    const option = getDeliveryOption(item.deliveryOptionId);

    const dateString = formatDeliveryDate(option);
    //
    html += `<div class="cart-product-item js-cart-product-item js-cart-product-item-${
      product.id
    }" data-product-id = "${product.id}">
                <div class="delivery-date js-delivery-date">
                  Delivery date&#58; ${dateString}
                </div>
                <div class="product-details">
                  <div class="cart-product-info-cont">
                    <div class="img-cont">
                      <img
                        src="${product.image}"
                        alt=""
                      />
                    </div>

                    <div class="text-info-cont">
                      <p>
                       ${product.name}
                      </p>

                      <p class="price">$${formatMoney(product.priceCents)}</p>
                      <div class="range-delete-cont">
                        <div class="cart-product-quantity-range js-alike-product-quantity-range" data-product-id = "${
                          product.id
                        }">
                          <button class="decrease-button js-decrease-button-${
                            product.id
                          }
                           js-alike-decrease-button  rounded-button">
                            &minus;
                          </button>
                          <div class="product-quantity js-alike-range-product-quantity">${
                            item.quantity
                          }</div>
                          <button class="js-alike-increase-button increase-button rounded-button">
                            &#43;
                          </button>
                        </div>

                        <button class="delete-icon js-delete-icon-${
                          product.id
                        }">
                          <img
                            src="images/icons/delete_24dp_5C5B5B_FILL0_wght400_GRAD0_opsz24.svg"
                            alt=""
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="delivery-options">
                    <div class="delivery-options-title">
                      Choose a delivery option:
                    </div>
                    ${renderDeliveryOptions(item, product)}
                  </div>
                </div>
              </div>`;
  });
  const productsContainer = document.querySelector(".js-products-container");
  if (!productsContainer) {
    return;
  }
  productsContainer.innerHTML = html;

  //render delivery options
  function renderDeliveryOptions(item, product) {
    let html = "";

    deliveryOptions.forEach((option) => {
      const today = dayjs();

      const dateString = formatDeliveryDate(option);

      const cost =
        formatMoney(option.priceCents) === "0.00"
          ? "FREE"
          : `$${formatMoney(option.priceCents)} -`;

      const checkedOption =
        option.id === item.deliveryOptionId ? "checked" : "";

      html += `<div class="delivery-option js-delivery-option" data-product-id = "${product.id}" data-delivery-id = "${option.id}">
                <input
                  type="radio"
                  ${checkedOption}
                  class="delivery-option-input" />
                <div>
                  <div class="delivery-option-date">${dateString}</div>
                  <div class="delivery-option-price">${cost} Shipping</div>
                </div>
              </div>`;
    });
    return html;
  }

  document.querySelectorAll(".js-delivery-option").forEach((deliveryOption) => {
    deliveryOption.addEventListener("click", () => {
      const productId = deliveryOption.dataset.productId;

      const deliveryId = deliveryOption.dataset.deliveryId;

      cart.updateDeliveryOption(productId, deliveryId);
      renderCartItems();
      renderShoppingCartQuantity();
      renderOrderSummary();
    });
  });

  range();

  //delete bin
  document
    .querySelectorAll(".js-cart-product-item")
    .forEach((itemContainer) => {
      const productId = itemContainer.dataset.productId;

      document
        .querySelector(`.js-delete-icon-${productId}`)
        .addEventListener("click", () => {
          cart.deleteFromCart(productId);
          renderCartItems();
          updateCartQuantityNotification();
          renderShoppingCartQuantity();
          renderOrderSummary();
        });
    });
}

export function renderOrderSummary() {
  const summaryElement = document.querySelector(".js-order-summary-container");
  if (!summaryElement) {
    return;
  }
  let productPriceCents = 0;
  let shippingCost = 0;

  cart.cartItems.forEach((item) => {
    const product = getProduct(item.productId);

    productPriceCents += product.priceCents * item.quantity;

    let deliveryOptions = getDeliveryOption(item.deliveryOptionId);

    shippingCost += deliveryOptions.priceCents;
  });

  const beforeTax = productPriceCents + shippingCost;
  const estimatedTax = beforeTax * 0.1;
  const orderTotal = beforeTax + estimatedTax;

  summaryElement.innerHTML = `
  <p class="order-summary-text">Order Summary</p>
  <div class="item-quantity summary">
    <p>
      Items
      <span class="js-item-qty">&#40;${cart.totalCartQuantity()}&#41;</span>&#58;
    </p>
    <p>$${formatMoney(productPriceCents)}</p>
  </div>
  <div class="shipping-cost summary">
    <p>Shipping Cost:</p>
    <p>$${formatMoney(shippingCost)}</p>
  </div>
  <div class="total-before-tax summary">
    <p>Total before Tax &#58;</p>
    <p>$${formatMoney(beforeTax)}</p>
  </div>
  <div class="estimated-tax summary">
    <p>Estimated Tax &#40;10%&#41;&#58;</p>
    <p>$${formatMoney(estimatedTax)}</p>
  </div>
  <div class="order-total summary">
    <p>Order Total&#58;</p>
    <p>$${formatMoney(orderTotal)}</p>
  </div>
  <button class="place-order-btn js-place-order-btn">Place your Order</button>`;

  let order = [];
  const orderTime = dayjs();

  function generateOrderId() {
    let id = "";
    for (let i = 0; i < 4; i++) {
      let part = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      id += part + (i < 3 ? "-" : "");
    }
    return id;
  }

  function createOrder(products) {
    order = {
      id: generateOrderId(),
      orderTime: orderTime,
      products: products,
      totalCostCents: orderTotal,
    };
  }

  document
    .querySelector(".place-order-btn")
    .addEventListener("click", async () => {
      // try {
      //   const response = await fetch("https://supersimplebackend.dev/orders", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ cart: cart.cartItems }),
      //   });

      //   const order = await response.json();

      //   if (response.ok) {
      //     orders.addOrder(order);
      //   }
      //   console.log(orders.allorders);
      // } catch (error) {
      //   console.log(error);
      // }

      createOrder(cart.cartItems);
      if (cart.cartItems.length > 0) {
        orders.addOrder(order);
        window.location.href = "orders.html";
      }
    });
}
