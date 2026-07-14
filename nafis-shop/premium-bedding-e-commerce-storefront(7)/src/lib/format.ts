export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "۰ تومان";
  // For amounts >= 1 million, use "X.X میلیون تومان" for readability
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${formatted} میلیون تومان`;
  }
  // Format with commas, e.g. 950,000
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "،");
  return `${toPersianDigits(formatted)} تومان`;
}

export function toPersianDigits(input: string | number): string {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return input
    .toString()
    .replace(/[0-9]/g, (w) => persianNumbers[+w]);
}
