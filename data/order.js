import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import { formatMoney } from "../scripts/utilities/money.js";
import { getProduct } from "./product.js";
import { updateCartQuantityNotification } from "../scripts/index.js";
import { cart } from "./cart.js";
import { getDeliveryOption, format2DeliveryDate } from "./deliveryOptions.js";

class Orders {
  allorders = [];

  constructor() {
    this.loadFromStorage();
  }

  addOrder(order) {
    this.allorders.unshift(order);
    this.saveToStorage();
  }

  deleteOrder(itemId) {
    this.allorders.forEach((order, index) => {
      if (itemId === order.id) {
        this.allorders.splice(index, 1);
      }
    });
    this.saveToStorage();
    return this.allorders;
  }

  saveToStorage() {
    localStorage.setItem("zyra-order", JSON.stringify(this.allorders));
  }

  loadFromStorage() {
    this.allorders = JSON.parse(localStorage.getItem("zyra-order")) || [];
  }
}

export const orders = new Orders();

export function renderOrdersPage() {
  const container = document.querySelector(".js-orders-gap");
  const emptyNotification = document.querySelector(".js-order-empty");

  if (!emptyNotification) {
    return;
  }

  if (orders.allorders.length <= 0) {
    container.remove();
    emptyNotification.classList.remove("invisible");
  } else {
    emptyNotification.classList.add("invisible");
  }

  let matchingItem;
  let html = "";

  orders.allorders.forEach((order) => {
    html += `
    <div class="order-container js-order-container-${order.id}">
    <div class="top-portion-header">
      <div>
        <h4>Order Placed:</h4>
        <p>${dayjs(order.orderTime).format("MMMM D")}</p>
      </div>
      <div>
        <h4>Total:</h4>
        <p>$${formatMoney(order.totalCostCents)}</p>
      </div>
      <div>
        <h4>Order Id:</h4>
        <p>${order.id}</p>
      </div>
    </div>

    <div class="lower-portion-with-orders js-lower-portion-with-orders-${
      order.id
    }">
      ${renderItems(order)}
    </div>
   </div>`;

    if (container) {
      container.innerHTML = html;
    }
  });

  function renderItems(order) {
    let html2 = "";

    order.products.forEach((productItem) => {
      matchingItem = getProduct(productItem.productId);

      const option = getDeliveryOption(productItem.deliveryOptionId);

      const now = dayjs();
      const nowFormated = now.format("MMMM D");

      html2 += `
    <div class="order">
                  <div class="img-contr">
                    <img
                      src=${matchingItem.image}
                      alt=""
                    />
                  </div>
                  <div class="info">
                    <p>
                    ${matchingItem.name}
                    </p>
                    <p> ${
                      nowFormated >= format2DeliveryDate(option)
                        ? "Arrived on:"
                        : "Arriving on:"
                    } <span>${format2DeliveryDate(option)}</span></p>
                    <div class="quantity-buy-again-cont js-buy-again-button-${
                      productItem.productId
                    } js-buy-again-button" data-product-id="${
        productItem.productId
      }">
                      <p>Quantity: <span>${productItem.quantity}</span></p>
                      <button>Buy Again</button>
                    </div>
                  </div>
                </div>`;
    });

    return html2;
  }
  document.querySelectorAll(".js-buy-again-button").forEach((button, index) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      cart.addToCart(productId);
      updateCartQuantityNotification();
    });
  });
}
