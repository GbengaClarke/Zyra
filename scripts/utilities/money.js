export function formatMoney(cents) {
  return (cents / 100).toFixed(2);
}

export function formatRating(rating) {
  return rating.toFixed(1);
}
