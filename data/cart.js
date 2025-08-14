class Cart {
  cartItems;

  constructor() {
    this.loadFromStorage();
  }

  addToCart(itemId) {
    let matchingItems;

    this.cartItems.forEach((item) => {
      if (item.productId === itemId) {
        return (matchingItems = item);
      }
    });

    if (matchingItems) {
      matchingItems.quantity++;
    } else {
      this.cartItems.push({
        productId: itemId,
        quantity: 1,
        deliveryOptionId: "1",
      });
    }

    this.saveToStorage();
  }

  deleteFromCart(itemId) {
    this.cartItems.forEach((item, index) => {
      if (itemId === item.productId) {
        this.cartItems.splice(index, 1);
      }
    });
    this.saveToStorage();
    return this.cartItems;
  }

  decreaseCartQuantity(itemId) {
    let cartProduct;
    this.cartItems.forEach((item) => {
      if (itemId === item.productId) {
        cartProduct = item;
        if (cartProduct.quantity > 0) {
          cartProduct.quantity--;
        }
      }
    });
    this.saveToStorage();
  }

  totalCartQuantity() {
    this.totalQuantity = 0;
    this.cartItems.forEach((item) => {
      this.totalQuantity += item.quantity;
    });
    return this.totalQuantity;
  }

  saveToStorage() {
    localStorage.setItem("zyra-cart", JSON.stringify(this.cartItems));
  }

  loadFromStorage() {
    this.cartItems = JSON.parse(localStorage.getItem("zyra-cart")) || [];

    if (!this.cartItems) {
      this.cartItems = [
        {
          productId: "aaa65ef3-8d6f-4eb3-bc9b-a6ea49047d8f",
          quantity: 2,
          deliveryOptionId: "2",
        },
        {
          productId: "5555",
          quantity: 1,
          deliveryOptionId: "1",
        },
      ];
    }
  }

  getMatchingItems(productId) {
    let matchingItem;

    this.cartItems.forEach((item) => {
      if (item.productId === productId) {
        matchingItem = item;
      }
    });
    return matchingItem;
  }

  updateDeliveryOption(productId, deliveryId) {
    this.cartItems.forEach((item) => {
      if (productId === item.productId) {
        item.deliveryOptionId = deliveryId;
      }
    });
    this.saveToStorage();
  }
}

export const cart = new Cart();
