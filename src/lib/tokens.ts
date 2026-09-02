/**
 * The swap screen's token set. Prices are demo figures, frozen at the values
 * the original build shipped with — the exchange-rate row, the fiat sub-rows
 * and the minimum-received line are all derived from them, so changing one
 * price moves four numbers on screen.
 */
export type Token = {
  sym: string;
  name: string;
  price: number;
  color: string;
  ink: string;
  chain: string;
  /** display decimals for this token's own amount */
  dp: number;
  /** demo wallet balance; absent means zero */
  bal?: number;
};

export const TOKENS: Token[] = [
  { sym: 'USDC',   name: 'USD Coin',      price: 1,        color: '#00EC97', ink: '#000', chain: 'Arbitrum', dp: 2 },
  { sym: 'USDT',   name: 'Tether',        price: 0.9998,   color: '#26A17B', ink: '#fff', chain: 'Tron',     dp: 2 },
  { sym: 'ETH',    name: 'Ethereum',      price: 2911.65,  color: '#627EEA', ink: '#fff', chain: 'Ethereum', dp: 4 },
  { sym: 'BTC',    name: 'Bitcoin',       price: 68420.1,  color: '#F7931A', ink: '#fff', chain: 'Bitcoin',  dp: 5 },
  { sym: 'SOL',    name: 'Solana',        price: 208.42,   color: '#F2F2F1', ink: '#000', chain: 'Solana',   dp: 3 },
  { sym: 'NEAR',   name: 'NEAR',          price: 1.73,     color: '#00EC97', ink: '#000', chain: 'NEAR',     dp: 2, bal: 612 },
  { sym: 'ZEC',    name: 'Zcash',         price: 503.24,   color: '#F4B728', ink: '#000', chain: 'Zcash',    dp: 6, bal: 0 },
  { sym: 'ARB',    name: 'Arbitrum',      price: 1.08,     color: '#2D374B', ink: '#fff', chain: 'Arbitrum', dp: 2 },
  { sym: 'wstETH', name: 'Wrapped stETH', price: 3402.1,   color: '#00A3FF', ink: '#fff', chain: 'Ethereum', dp: 4 },
  { sym: 'TIA',    name: 'Celestia',      price: 9.86,     color: '#7B2BF9', ink: '#fff', chain: 'Celestia', dp: 3 },
  { sym: 'DOGE',   name: 'Dogecoin',      price: 0.412,    color: '#C3A634', ink: '#000', chain: 'Dogecoin', dp: 1 },
];

export const findToken = (sym: string) => TOKENS.find((t) => t.sym === sym)!;

/**
 * Real brand glyphs (600-grid, from the provided token SVG set) render in the
 * token dot where available; every other token keeps its letter chip. Add more
 * by dropping a shape in here keyed by symbol.
 */
export type TokenGlyph = { d: string } | { points: string } | { img: string };

export const TOK_ICONS: Record<string, TokenGlyph> = {
  /**
   * TWENTY BRAND MARKS, AS FILES RATHER THAN AS TRACINGS.
   *
   * These are the official full-colour SVGs from the near-intents asset set,
   * copied into `public/logos/tokens`. Each one is a 600-grid disc with the
   * mark knocked out of it, so a token dot rendering one covers its own
   * background rather than tinting one; `token.color` is still the right brand
   * colour underneath, which is what shows for the frame before it decodes.
   *
   * THEY ARE SERVED AS `<img>`, NOT INLINED, AND THAT IS NOT A STYLE CHOICE.
   * Every file in the set carries its own `<style>` block naming the same
   * classes — `.st0` is #fff in Bitcoin and #00ec97 in NEAR. Inlined into one
   * document those rules are global and the last one parsed wins, so a picker
   * showing twenty of them would repaint most of them the wrong colour. An
   * `<img>` gets its own document, and the collision cannot happen.
   *
   * WHAT IS NOT HERE keeps its letter chip: LINK, DOT, HBAR, XMR, UNI, SHIB and
   * PEPE have no file in the set, and AAPL is a share rather than a coin. A
   * letter where the real mark exists is a worse lie than a letter where none
   * does — nobody mistakes a `D` on gold, and everybody knows the ₿.
   */
  BTC: { img: '/logos/tokens/btc.svg' },
  ETH: { img: '/logos/tokens/eth.svg' },
  USDT: { img: '/logos/tokens/usdt.svg' },
  NEAR: { img: '/logos/tokens/near.svg' },
  XRP: { img: '/logos/tokens/xrp.svg' },
  USDC: { img: '/logos/tokens/usdc.svg' },
  SOL: { img: '/logos/tokens/sol.svg' },
  BNB: { img: '/logos/tokens/bnb.svg' },
  ZEC: { img: '/logos/tokens/zec.svg' },
  DOGE: { img: '/logos/tokens/doge.svg' },
  ADA: { img: '/logos/tokens/ada.svg' },
  TRX: { img: '/logos/tokens/trx.svg' },
  AVAX: { img: '/logos/tokens/avax.svg' },
  XLM: { img: '/logos/tokens/xlm.svg' },
  SUI: { img: '/logos/tokens/sui.svg' },
  BCH: { img: '/logos/tokens/bch.svg' },
  TON: { img: '/logos/tokens/ton.svg' },
  LTC: { img: '/logos/tokens/ltc.svg' },
  ARB: { img: '/logos/tokens/arb.svg' },
  OP: { img: '/logos/tokens/op.svg' },
};
