import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type SW, type SWAction } from './state';

/**
 * SWAP — the script
 * ==================================================================
 * Five chapters, eighteen steps, read off `_refs/rec-Swap.MP4` at one frame
 * per second.
 */

const type_ = (act: SWAction, chars: string, lead?: number, gap?: number) =>
  typing<SW, SWAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: 'One card, and the row that holds the tokens.' },
  { id: 'assets', name: 'Assets', blurb: 'What the wallet holds, and what each balance can do.' },
  { id: 'swap', name: 'The swap', blurb: 'Amount, destination, and the price you are being offered.' },
  { id: 'sign', name: 'Signing', blurb: 'A passkey, then the trade settling in three parts.' },
  { id: 'earn', name: 'The chip on the row', blurb: 'A leftover balance put to work without leaving the list.' },
];

const STEPS: Step<SW, SWAction>[] = [
  /* ---- 1 · the account ------------------------------------------------ */
  {
    id: 'balances', ch: 'account',
    title: 'Crypto, Perps, Earn',
    note: 'The same card every one of these recordings opens on. $6,764.84 of tokens, $1,053.89 in perps, $2,347.81 earning.',
    beats: [{ ms: 500 }],
  },
  {
    id: 'toassets', ch: 'account',
    title: 'Into the tokens',
    note: 'The Crypto row opens Assets. Nothing here is a separate app — the wallet, the market and the vaults are three views of one balance.',
    beats: [{ ms: 2900, do: 'toAssets' }],
  },

  /* ---- 2 · assets ----------------------------------------------------- */
  {
    id: 'buckets', ch: 'assets',
    title: 'Main and Confidential',
    note: 'The header splits the balance in two: $64.95 in the open, $6,699.90 confidential. Confidential is where this wallet actually keeps its money.',
    beats: [
      { ms: 2600, do: 'bucket', arg: 'main' },
      { ms: 2000, do: 'bucket', arg: 'conf' },
    ],
  },
  {
    id: 'rows', ch: 'assets',
    title: 'Every row carries a yield',
    note: 'Tether USD, and two USD Coin balances on different chains. Each one wears an Earn 5.8% chip — the vault is offered where the balance already is.',
    beats: [{ ms: 2600 }],
  },
  {
    id: 'actions', ch: 'assets',
    title: 'What a balance can do',
    note: 'The row does not open a token page. It opens the four things you can do with the token: Swap, Send, Earn, Move to Main.',
    beats: [{ ms: 2400, do: 'actions', arg: 'USDT' }],
  },

  /* ---- 3 · the swap --------------------------------------------------- */
  {
    id: 'toswap', ch: 'swap',
    title: 'Swap',
    note: 'Two fields and an arrow. The token you are spending is already filled in, because you arrived from its row.',
    beats: [{ ms: 2500, do: 'toSwap' }],
  },
  {
    id: 'max', ch: 'swap',
    title: 'The whole balance',
    note: 'Tapping the balance fills it: 6,635.6169 USDT. The quote underneath updates from that number, not from a rounded version of it.',
    beats: [{ ms: 2300, do: 'max' }, { ms: 1400 }],
  },
  {
    id: 'picker', ch: 'swap',
    title: 'Choosing what to buy',
    note: 'The picker leads with what you hold, then everything else. ZEC is the default and the reason this screen exists at all.',
    beats: [{ ms: 2000, do: 'picker' }],
  },
  {
    id: 'search', ch: 'swap',
    title: 'Two letters is enough',
    note: 'The search filters a real catalogue. Typing Ne narrows it to Near, which is what this trade is actually for.',
    beats: [
      ...type_('search', 'Ne', 1600, 320),
      { ms: 1500, do: 'pick', arg: 'NEAR' },
    ],
  },
  {
    id: 'quote', ch: 'swap',
    title: 'The price, stated three ways',
    note: 'The rate, the maximum slippage you are accepting, and the number you will receive if that slippage happens in full. The third one is the only promise.',
    beats: [{ ms: 2800 }],
  },

  /* ---- 4 · signing ---------------------------------------------------- */
  {
    id: 'review', ch: 'sign',
    title: 'Review trade',
    note: 'The sheet restates both sides in full precision and repeats the three rows. Nothing new is introduced at the moment of committing.',
    beats: [{ ms: 2400, do: 'review' }],
  },
  {
    id: 'passkey', ch: 'sign',
    title: 'Sign with a passkey',
    note: 'Face ID against the passkey saved for near.com. No password, no seed phrase, and nothing moves until it comes back.',
    beats: [
      { ms: 2600, do: 'swap' },
      { ms: 1200, do: 'authOk' },
      { ms: 1300, do: 'step' },
      { ms: 900, do: 'step' },
    ],
  },
  {
    id: 'settle', ch: 'sign',
    title: 'Finding best price · Executing · Complete',
    note: 'The route is found, then executed, then confirmed. Three states, because a swap that crosses chains genuinely has three.',
    beats: [
      { ms: 1600, do: 'step' },
      { ms: 1900, do: 'step' },
      { ms: 1800, do: 'step' },
      { ms: 2200 },
    ],
  },

  /* ---- 5 · the chip --------------------------------------------------- */
  {
    id: 'back', ch: 'earn',
    title: 'The wallet, after',
    note: 'The USDT row is gone and 3,535.3148 NEAR stands in its place. The two USD Coin balances never moved — and still wear their chips.',
    beats: [{ ms: 2600, do: 'again' }, { ms: 2200 }],
  },
  {
    id: 'vault', ch: 'earn',
    title: 'Quick Earn with Taler USDC',
    note: 'The chip opens the vault behind it: 5.80% APY on $854,153, with the deposit, withdrawal and performance fees stated before you are asked for anything.',
    beats: [{ ms: 2400, do: 'vault' }],
  },
  {
    id: 'vmax', ch: 'earn',
    title: 'Use max',
    note: '41.723488 USDC — the whole row. A balance too small to think about is exactly the one worth automating.',
    beats: [{ ms: 2200, do: 'vmax' }, { ms: 1500 }],
  },
  {
    id: 'vdeposit', ch: 'earn',
    title: 'Confirm · Depositing · Deposited',
    note: 'Another passkey, then the same three-part settlement, and a reference ID you can copy if it ever needs chasing.',
    beats: [
      { ms: 2000, do: 'deposit' },
      { ms: 1200, do: 'vstep' },
      { ms: 1200, do: 'vstep' },
      { ms: 1000, do: 'vstep' },
      { ms: 1600, do: 'vstep' },
      { ms: 1700, do: 'vstep' },
      { ms: 1900, do: 'vstep' },
    ],
  },
  {
    id: 'vdone', ch: 'earn',
    title: 'One row lighter, and earning',
    note: 'Closing returns to the wallet with the deposited balance gone from it. It is in the vault now, and the total says so.',
    beats: [{ ms: 2000, do: 'close' }],
  },
];

export const swapFlow = buildFlow<SW, SWAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'quote',
  outro: 4000,
  anchor: {
    toAssets: 'buckets',
    actions: 'actions',
    toSwap: 'toswap',
    max: 'picker',
    picker: 'search',
    pick: 'quote',
    review: 'review',
    swap: 'passkey',
    again: 'back',
    vault: 'vmax',
    vmax: 'vdeposit',
    deposit: 'vdeposit',
    close: 'vdone',
  },
  /* both settlements tick on their own when no clock is running */
  auto: (s) => {
    if (s.signing) {
      return { after: s.auth === 'done' ? 700 : 1100, do: s.signing === 'vault' ? 'vstep' : 'step' };
    }
    /* a checklist that has reached its last row and moved the balances is
       finished; asking it to tick again is asking for a refusal */
    if (s.step >= 0 && !s.swapped) return { after: 1500, do: 'step' };
    if (s.vstep >= 0 && !s.earned) return { after: 1500, do: 'vstep' };
    return null;
  },
});
