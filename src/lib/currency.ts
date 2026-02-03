// Currency formatting utilities for Indian Rupees (₹)

export const CURRENCY_SYMBOL = '₹';
export const DELIVERY_FEE = 49; // ₹49 delivery fee
export const TAX_RATE = 0.05; // 5% GST

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(0)}`;
}

export function formatCurrencyDecimal(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
}

// Format Indian phone number
export function formatIndianPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If already has country code
  if (digits.startsWith('91') && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  // If just 10 digits
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  
  return phone;
}

// Validate Indian phone number
export function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Accept 10 digit or 12 digit (with 91 prefix)
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(digits);
  }
  return false;
}
