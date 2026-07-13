export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "۰ تومان";
  // Format with commas, e.g. 6,800,000
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "،");
  return `${toPersianDigits(formatted)} تومان`;
}

export function toPersianDigits(input: string | number): string {
  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return input
    .toString()
    .replace(/[0-9]/g, (w) => persianNumbers[+w]);
}
