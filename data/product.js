class Product {
  name;
  id;
  image;
  keywords;
  priceCents;
  rating;
  description;
  type;

  constructor(productDetails) {
    this.name = productDetails.name;
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.keywords = productDetails.keywords;
    this.priceCents = productDetails.priceCents;
    this.rating = productDetails.rating;
    this.description = productDetails.description;
    this.type = productDetails.type;
  }
}

class Applicances extends Product {
  constructor(productDetails) {
    super(productDetails);
  }
}
class Apparels extends Product {
  constructor(productDetails) {
    super(productDetails);
  }
}
class HomeEssentials extends Product {
  constructor(productDetails) {
    super(productDetails);
  }
}

export let products;

export async function loadProductsFetch() {
  try {
    // load products API

    // const res = await fetch("https://supersimplebackend.dev/products/");
    // const resproducts = await res.json();

    // const res2 = await fetch("../backend/fakeapi.json");

    // const res2products = await res2.json();

    // products = [...res2products, ...resproducts];

    // load products locally
    
    const response2 = await fetch("./backend/products.json");

    products = await response2.json();
  } catch (error) {
    console.log(`server error occured: ${error}`);
  }

  products = products.map((productDetails) => {
    if (
      productDetails.keywords.some((k) =>
        ["electronics", "appliances"].includes(k)
      )
    ) {
      return new Applicances(productDetails);
    } else if (
      productDetails.type === "clothing" ||
      productDetails.keywords.some((k) =>
        ["apparels", "mens", "womens"].includes(k)
      )
    ) {
      return new Apparels(productDetails);
    } else if (
      productDetails.keywords.some((k) =>
        ["kitchen", "home", "bathroom"].includes(k)
      )
    ) {
      return new HomeEssentials(productDetails);
    }
    return (products = new Product(productDetails));
  });

  //new arrivals
  const newProductsIndex = [11, 32, 20, 33, 43, 36, 30, 25];

  newProductsIndex.forEach((productIndex) => {
    const itemm = products[productIndex];
    itemm.new = [];
    products[productIndex].new.unshift("yes");
  });
}

export function getProduct(productId) {
  let matchingProduct;
  products.forEach((product) => {
    if (productId === product.id) {
      matchingProduct = product;
    }
  });
  return matchingProduct;
}

loadProductsFetch();

