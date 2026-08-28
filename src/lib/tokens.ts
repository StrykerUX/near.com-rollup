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
export type TokenGlyph = { d: string } | { points: string };

export const TOK_ICONS: Record<string, TokenGlyph> = {
  NEAR: {
    d: 'M429.68,135.21c-12.21,0-23.54,6.33-29.93,16.73l-68.89,102.28c-2.24,3.37-1.33,7.92,2.04,10.16,2.73,1.82,6.35,1.6,8.84-.54l67.81-58.82c1.13-1.01,2.86-.91,3.88.22.46.52.7,1.18.7,1.87v184.15c0,1.52-1.23,2.74-2.75,2.74-.82,0-1.59-.36-2.1-.99l-204.99-245.37c-6.68-7.88-16.48-12.42-26.8-12.43h-7.16c-19.39,0-35.11,15.72-35.11,35.11v259.36c0,19.39,15.72,35.11,35.11,35.11,12.21,0,23.54-6.33,29.93-16.73l68.89-102.28c2.24-3.37,1.33-7.92-2.04-10.16-2.73-1.82-6.35-1.6-8.84.54l-67.81,58.82c-1.13,1.01-2.86.91-3.88-.22-.46-.52-.7-1.18-.7-1.87v-184.2c0-1.52,1.23-2.74,2.75-2.74.81,0,1.59.36,2.1.99l204.96,245.42c6.68,7.88,16.48,12.42,26.8,12.43h7.16c19.39,0,35.12-15.7,35.14-35.09V170.32c0-19.39-15.72-35.11-35.11-35.11h0Z',
  },
  ZEC: {
    points:
      '407.01 160.77 407.01 206.4 280.06 378.63 407.01 378.63 407.01 439.19 325.16 439.19 325.16 489.36 274.84 489.36 274.84 439.19 192.99 439.19 192.99 393.56 319.82 221.33 192.99 221.33 192.99 160.77 274.84 160.77 274.84 110.44 325.16 110.44 325.16 160.77 407.01 160.77',
  },
};
