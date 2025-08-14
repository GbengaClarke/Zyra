import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

export const deliveryOptions = [
  {
    id: "1",
    days: 7,
    priceCents: 0,
  },
  {
    id: "2",
    days: 3,
    priceCents: 499,
  },
  {
    id: "3",
    days: 1,
    priceCents: 999,
  },
];

export function getDeliveryOption(productId) {
  let matchingOption;
  deliveryOptions.forEach((option) => {
    if (option.id === productId) {
      matchingOption = option;
    }
  });
  return matchingOption;
}

export function formatDeliveryDate(option) {
  let dateString = "";
  const today = dayjs();

  let rawDate = today.add(option.days, "days");

  while (
    rawDate.format("dddd") === "Saturday" ||
    rawDate.format("dddd") === "Sunday"
  ) {
    rawDate = rawDate.add(1, "day");
  }

  return (dateString = rawDate.format("dddd, MMMM D"));
}

export function format2DeliveryDate(option) {
  let dateString = "";
  const today = dayjs();

  let rawDate = today.add(option.days, "days");

  while (
    rawDate.format("dddd") === "Saturday" ||
    rawDate.format("dddd") === "Sunday"
  ) {
    rawDate = rawDate.add(1, "day");
  }

  return (dateString = rawDate.format("MMMM D"));
}
