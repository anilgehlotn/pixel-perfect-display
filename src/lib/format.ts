// Price formatters. Shopify returns amounts as decimal strings; convert with Number() first.
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const rs = (n: number) => "Rs. " + Math.round(n).toLocaleString("en-IN");
