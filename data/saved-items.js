import { products, getProduct } from "./product.js";

class Save {
  savedItems;
  isClicked;
  constructor() {
    this.loadFromStorage();
  }

  isSaved(productId) {
    this.savedItems.forEach((item) => {
      if (item.id === productId) {
        this.isClicked = true;
      } else {
        this.isClicked = false;
      }
    });
    return this.isClicked;
  }

  addToSavedItems(productId) {
    const product = getProduct(productId);
    this.savedItems.forEach((item) => {
      if (item.id === productId) {
        return;
      }
    });
    this.savedItems.push(product);

    this.saveToStorage();
  }

  removeFromSavedItems(itemId) {
    this.savedItems.forEach((item, index) => {
      if (itemId === item.id) {
        this.savedItems.splice(index, 1);
      }
    });
    this.saveToStorage();
    return this.savedItems;
  }

  saveToStorage() {
    localStorage.setItem("zyra-save", JSON.stringify(this.savedItems));
  }

  loadFromStorage() {
    this.savedItems = JSON.parse(localStorage.getItem("zyra-save")) || [];
  }
}

export const save = new Save();
