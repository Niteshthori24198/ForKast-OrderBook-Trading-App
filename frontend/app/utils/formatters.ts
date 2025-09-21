export const safeToFixed = (
  value: number | string,
  decimals: number = 2
): string => {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(decimals);
};

export const safeToNumber = (value: number, fallback: number = 0): number => {
  return isNaN(value) ? fallback : value;
};

export const formatPrice = (price: number): string => {
  return `$${safeToFixed(price, 2)}`;
};

export const formatQuantity = (quantity: number): string => {
  return safeToFixed(quantity, 2);
};

export const formatTotal = (price: number, quantity: number): string => {
  const total = safeToNumber(price) * safeToNumber(quantity);
  return formatPrice(total);
};
