import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type EA, type EAAction } from './state';

/**
 * EARN — the script
 * ==================================================================
 * Four chapters, sixteen steps. The first three put money into a vault; the
 * fourth spends out of one, which is the half the recording is named after.
 */

const type_ = (act: EAAction, chars: string, lead?: number, gap?: number) =>
  typing<EA, EAAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: 'The blended rate on the card, and what is behind it.' },
  { id: 'vaults', name: 'The vaults', blurb: 'Two strategies, their size, their rate and their fees.' },
  { id: 'deposit', name: 'Depositing', blurb: 'A wallet balance moved into a vault, and the balance that moves.' },
  { id: 'spend', name: 'Paying out of yield', blurb: 'The part that makes the rest of it worth doing.' },
];

const STEPS: Step<EA, EAAction>[] = [
  {
    id: 'balances', ch: 'account',
    title: 'A blended APY',
    note: 'The Earn row does not quote one rate: it quotes the blend of everything behind it, because the money is in more than one place.',
    beats: [{ ms: 500 }],
  },
  {
    id: 'toearn', ch: 'account',
    title: 'Into Earn',
    note: 'Beta, and honest about it. The screen leads with what it is for: put your idle assets to work.',
    beats: [{ ms: 2900, do: 'toEarn' }],
  },

  {
    id: 'tabs', ch: 'vaults',
    title: 'Vaults and Staking',
    note: 'Two ways to earn, kept apart. Staking is a network position; a vault is a strategy someone else runs for you, and they carry different risks.',
    beats: [
      { ms: 2500, do: 'tab', arg: 'staking' },
      { ms: 2100, do: 'tab', arg: 'vaults' },
    ],
  },
  {
    id: 'list', ch: 'vaults',
    title: 'Size, rate, and your balance',
    note: 'Gauntlet holds $432.92M at 4.52%. Taler holds $854.15K at 5.80%. The bigger rate on the smaller vault is the trade the table is showing you.',
    beats: [{ ms: 2900 }],
  },
  {
    id: 'sheet', ch: 'vaults',
    title: 'Who runs it, and what it charges',
    note: 'The vault names its curator and its chain before it names its yield, and states all three fees — deposit, withdrawal, performance — before asking for anything.',
    beats: [{ ms: 2400, do: 'openVault', arg: 'taler' }],
  },

  {
    id: 'sides', ch: 'deposit',
    title: 'Deposit or Withdraw',
    note: 'One sheet, both directions. Money that can only go in is not a vault, it is a donation.',
    beats: [
      { ms: 2400, do: 'side', arg: 'Withdraw' },
      { ms: 2000, do: 'side', arg: 'Deposit' },
    ],
  },
  {
    id: 'max', ch: 'deposit',
    title: 'Use max',
    note: '22.555228 USDC — the whole wallet balance. The figure the button fills is the one to six decimals, not the one on the row.',
    beats: [{ ms: 2200, do: 'max' }, { ms: 1500 }],
  },
  {
    id: 'sign', ch: 'deposit',
    title: 'Sign with a passkey',
    note: 'The same signature every one of these recordings uses. No password, and nothing moves until it comes back.',
    beats: [
      { ms: 2000, do: 'deposit' },
      { ms: 1200, do: 'step' },
      { ms: 1200, do: 'step' },
      { ms: 1000, do: 'step' },
    ],
  },
  {
    id: 'settle', ch: 'deposit',
    title: 'Confirm · Depositing · Deposited',
    note: 'Three parts, and a reference ID under them for the day one of them needs chasing.',
    beats: [
      { ms: 1600, do: 'step' },
      { ms: 1800, do: 'step' },
      { ms: 1700, do: 'step' },
      { ms: 2000 },
    ],
  },
  {
    id: 'after', ch: 'deposit',
    title: 'The vault is bigger by exactly that',
    note: 'Closing returns to the list with Taler up by the deposit. Nothing was rounded on the way through.',
    beats: [{ ms: 2000, do: 'close' }, { ms: 2400 }],
  },

  {
    id: 'send', ch: 'spend',
    title: 'Universal Send',
    note: 'Send any token to any network, pay with any asset you own. Three rows — token, network, recipient — and the amount under them.',
    beats: [{ ms: 2600, do: 'home' }, { ms: 1600, do: 'toSend' }],
  },
  {
    id: 'warn', ch: 'spend',
    title: 'A warning that knows where it applies',
    note: 'NEAR to the NEAR network raises it: some exchanges will not credit that transfer. It is a checkbox, not a dialog, and it goes away when the route changes.',
    beats: [{ ms: 2400, do: 'ack' }, { ms: 2000, do: 'ack' }],
  },
  {
    id: 'token', ch: 'spend',
    title: 'Pick the token, get the network',
    note: 'Choosing ZEC sets the network to Zcash on its own. A token that could still be on any network is a token you have not finished choosing.',
    beats: [
      { ms: 2000, do: 'tokenPicker' },
      { ms: 2200, do: 'pickToken', arg: 'ZEC' },
    ],
  },
  {
    id: 'paywith', ch: 'spend',
    title: 'Pay with — Your vaults',
    note: 'This is the feature. The picker offers the two vault balances above the wallet tokens: paying out of yield is a choice made in passing, not a withdrawal you have to plan first.',
    beats: [
      { ms: 2400, do: 'payPicker' },
      { ms: 2600, do: 'pickPay', arg: 'gauntlet' },
    ],
  },
  {
    id: 'amount', ch: 'spend',
    title: '100 ZEC, paid from Gauntlet',
    note: 'The amount is in the token being sent; the balance under it is in the asset paying for it. The app is holding both sides of a conversion nobody had to ask for.',
    beats: [...type_('skey', '100', 1800, 260), { ms: 2000 }],
  },
  {
    id: 'missing', ch: 'spend',
    title: 'What is still missing',
    note: 'Review send stays grey, and it is right to: there is no recipient yet. The recording never picks one either — the screen is demonstrating what it can pay with, not completing a payment.',
    beats: [{ ms: 2600 }],
  },
];

export const earnFlow = buildFlow<EA, EAAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'paywith',
  outro: 4000,
  anchor: {
    toEarn: 'tabs',
    openVault: 'sides',
    max: 'sign',
    deposit: 'sign',
    close: 'after',
    toSend: 'send',
    tokenPicker: 'token',
    pickToken: 'paywith',
    payPicker: 'paywith',
    pickPay: 'amount',
  },
  auto: (s) => {
    if (s.over === 'passkey') return { after: s.auth === 'done' ? 700 : 1100, do: 'step' };
    if (s.step >= 0 && !s.deposited) return { after: 1500, do: 'step' };
    return null;
  },
});
