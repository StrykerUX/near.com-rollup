import { PRICE } from '@/lib/prices';

/**
 * THE DESTINATION PICKER'S LIST
 * ==================================================================
 * THIS IS THE ONE THING ON THIS SCREEN THAT WAS NOT READ OFF A FRAME, and it
 * says so here rather than anywhere else.
 *
 * `rec-Swap.MP4` shows the picker at 0:45 and it holds FIVE tokens — ZEC,
 * NEAR, SOL, BTC, ETH — which is what `demo/swap/state.ts` carries and marks
 * with the frame it came from. The brief asks for a long list, scrolled, with
 * at least the top twenty-five. There is no frame of that, so it had to come
 * from somewhere.
 *
 * WHAT IT DID NOT COME FROM IS INVENTION. These are the largest assets by
 * market capitalisation, in that order, with the symbols and names they
 * actually trade under and the brand colours they actually use. Every row is
 * checkable against any exchange. What is chosen rather than observed is only
 * WHICH assets near.com's picker offers and in what order — and if the real
 * list differs, this file is the only thing that changes.
 *
 * NEAR AND ZEC ARE PLACED, NOT RANKED. Both are on the recording's own
 * five-row picker, so the app plainly offers them; ranking them by market cap
 * would push NEAR far enough down that the screen the brief describes — tap
 * BTC, swap it for NEAR — would need a search rather than a scroll. They sit
 * where the recording implies the app puts its own assets: near the top.
 *
 * PRICES ARE ONLY WHERE THEY ARE NEEDED. A picker row shows a symbol and a
 * name; nothing on it is priced. Only the pairs this cut actually quotes carry
 * a price — the resting pair USDT/ZEC and the one it swaps into, NEAR —
 * and the other twenty-three do not. A table of twenty-five prices nobody reads is twenty-five numbers that
 * can go stale and be wrong on screen.
 */

export type Asset = {
  sym: string;
  name: string;
  /** the brand's own colour; the dot falls back to a letter chip without one */
  color: string;
  ink: string;
  /** only the pair this cut quotes carries one — see the note above */
  price?: number;
};

/**
 * THE PRICES ARE THE ACCOUNT CHAPTER'S, NOT THIS FILE'S.
 *
 * `lib/prices.ts` carries one table for the whole tour — five figures read on
 * 2 September 2026 — because every screen here is arithmetic on top of them and
 * two files quoting one coin is exactly the pair that drifts. It happened once
 * already: `tokens.ts` said $68,420.10 for Bitcoin while `/demo/perps-v5`
 * marked $79,567.50, two prices for one coin on two faces of the same scroll.
 * `tokens.ts` still serves the older flows, which were built against their own
 * recordings and keep their own figures.
 */
export const BTC_PRICE = PRICE.BTC;
export const NEAR_PRICE = PRICE.NEAR;
export const ZEC_PRICE = PRICE.ZEC;

export const CATALOGUE: Asset[] = [
  { sym: 'BTC', name: 'Bitcoin', color: '#F7931A', ink: '#fff', price: BTC_PRICE },
  { sym: 'ETH', name: 'Ethereum', color: '#627EEA', ink: '#fff' },
  /* PRICED BECAUSE IT IS SPENT. A dollar-pegged token resolving through the
     `?? 1` fallback gives the right answer for the wrong reason, and the day
     something else is spent the fallback is what breaks. */
  { sym: 'USDT', name: 'Tether', color: '#26A17B', ink: '#fff' },
  { sym: 'NEAR', name: 'NEAR', color: '#00EC97', ink: '#000', price: NEAR_PRICE },
  { sym: 'XRP', name: 'XRP', color: '#23292F', ink: '#fff' },
  { sym: 'USDC', name: 'USD Coin', color: '#2775CA', ink: '#fff', price: PRICE.USDC },
  { sym: 'SOL', name: 'Solana', color: '#9945FF', ink: '#fff' },
  { sym: 'BNB', name: 'BNB', color: '#F0B90B', ink: '#000' },
  /* PRICED BECAUSE THE FORM OPENS ON IT. The screen's resting pair is
     USDT into ZEC, so this is a quoted pair now and not a name on a list.
     503.24 is `lib/tokens.ts`'s figure, which is where Zcash was priced when
     the account chapter still held some. */
  { sym: 'ZEC', name: 'Zcash', color: '#F4B728', ink: '#000', price: ZEC_PRICE },
  { sym: 'DOGE', name: 'Dogecoin', color: '#C2A633', ink: '#000' },
  { sym: 'ADA', name: 'Cardano', color: '#0033AD', ink: '#fff' },
  { sym: 'TRX', name: 'TRON', color: '#EB0029', ink: '#fff' },
  { sym: 'LINK', name: 'Chainlink', color: '#2A5ADA', ink: '#fff' },
  { sym: 'AVAX', name: 'Avalanche', color: '#E84142', ink: '#fff' },
  { sym: 'XLM', name: 'Stellar', color: '#14B6E7', ink: '#000' },
  { sym: 'SUI', name: 'Sui', color: '#4DA2FF', ink: '#fff' },
  { sym: 'BCH', name: 'Bitcoin Cash', color: '#0AC18E', ink: '#fff' },
  { sym: 'TON', name: 'Toncoin', color: '#0098EA', ink: '#fff' },
  { sym: 'LTC', name: 'Litecoin', color: '#BFBBBB', ink: '#000' },
  { sym: 'DOT', name: 'Polkadot', color: '#E6007A', ink: '#fff' },
  { sym: 'HBAR', name: 'Hedera', color: '#222222', ink: '#fff' },
  { sym: 'XMR', name: 'Monero', color: '#FF6600', ink: '#fff' },
  { sym: 'UNI', name: 'Uniswap', color: '#FF007A', ink: '#fff' },
  { sym: 'SHIB', name: 'Shiba Inu', color: '#FFA409', ink: '#000' },
  { sym: 'PEPE', name: 'Pepe', color: '#3D8130', ink: '#fff' },
  { sym: 'ARB', name: 'Arbitrum', color: '#2D374B', ink: '#fff' },
  { sym: 'OP', name: 'Optimism', color: '#FF0420', ink: '#fff' },
];

export const assetOf = (sym: string) => CATALOGUE.find((a) => a.sym === sym)!;
export const indexOf = (sym: string) => CATALOGUE.findIndex((a) => a.sym === sym);
