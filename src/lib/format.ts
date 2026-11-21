// Price formatters. Prices are decimal strings ("649.00"); convert with money() first.
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const rs = (n: number) => "Rs. " + Math.round(n).toLocaleString("en-IN");
