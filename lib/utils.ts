export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    AED: "AED",
    USD: "$",
    EUR: "€",
    SAR: "SAR",
    TRY: "₺",
    GBP: "£",
  };

  const symbol = symbols[currency] || currency;

  if (currency === "USD" || currency === "EUR" || currency === "GBP") {
    return `${symbol}${amount.toLocaleString("en-US")}`;
  }

  return `${amount.toLocaleString("en-US")} ${symbol}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDurationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}د`;
  if (mins === 0) return `${hours}س`;
  return `${hours}س ${mins}د`;
}

export function convertPrice(amount: number, from: string, to: string): number {
  const rates: Record<string, number> = {
    AED: 1,
    USD: 0.27,
    EUR: 0.25,
    SAR: 1.02,
    TRY: 7.8,
    GBP: 0.21,
  };

  const inAed = amount / (rates[from] || 1);
  return Math.round(inAed * (rates[to] || 1));
}
