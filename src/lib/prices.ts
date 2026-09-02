/**
 * THE TOUR'S PRICES, ONCE
 * ==================================================================
 * Five figures, read on 2 September 2026, and every screen in the product tour
 * is arithmetic on top of them: the assets list, the perps ticket and its book,
 * the swap quote, the earn deposit. Two files quoting one coin is exactly the
 * pair that drifts, and it has happened here before — `tokens.ts` said
 * $68,420.10 for Bitcoin while `/demo/perps-v5` marked $79,567.50, two prices
 * for one coin on two faces of the same scroll.
 *
 * IT IS ITS OWN FILE BECAUSE OF THE IMPORT GRAPH, not because a constant needs
 * a home. The account chapter is the natural place for a wallet's prices, and
 * putting them there made a cycle: own → earn → the swap catalogue → own, with
 * the catalogue reading a price at module scope and finding the table still in
 * its temporal dead zone. Nothing imports back into this file, so nothing can.
 *
 * NEAR IS $1.84 AND NOT $1.90, WHICH IS THE MARKET. The reference screenshot of
 * the app's own Assets screen prints `1555.3148 NEAR` against `$2,861.78`, and
 * that division is 1.8400 exactly. Where the app and the market disagree the
 * app wins: the demo has to look like the product, not like a ticker.
 *
 * AAPL IS A SHARE AND IS PRICED LIKE ONE — $325.64, the close on the same day.
 *
 * `lib/tokens.ts` keeps its own, older figures. It serves the v1–v4 flows,
 * which were built against their own recordings and should not move because
 * this table did.
 */
export const PRICE: Record<string, number> = {
  BTC: 77118.98,
  NEAR: 1.84,
  ZEC: 797.02,
  USDC: 1,
  AAPL: 325.64,
};
