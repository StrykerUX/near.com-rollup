/** en-US grouping with a fixed number of decimals, matched to the app's figures. */
export const fmt = (n: number, dp = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
