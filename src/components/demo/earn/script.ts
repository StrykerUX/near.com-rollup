import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type EA, type EAAction } from './state';

/**
 * EARN — the script
 * ==================================================================
 * Four chapters, seventeen steps. The first three put money into a vault; the
 * fourth spends out of one, which is the half the recording is named after.
 *
 * ONE DELIBERATE DEPARTURE FROM THE RECORDING, which deposits into Taler and
 * then pays out of Gauntlet — leaving the second half looking like a
 * coincidence, two unrelated vaults that happen to sit in the same list. This
 * deposits into Gauntlet and pays out of Gauntlet, so the balance the Pay with
 * picker offers is the one the reader just watched grow. Same feature, argued
 * rather than merely shown. What it costs is Gauntlet's fee sheet, which the
 * recording never opens — `state.ts` says so where those figures are written.
 *
 * The deposit also returns to the account card before Universal Send opens,
 * rather than going there from the vault list, because the Earn row is where a
 * deposit and a payment are the same money.
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
    note: 'Gauntlet USDC: curated by Gauntlet, built on Ethereum, 4.52% against $432.92M. The sheet names who runs it and where before it names the yield, and states all three fees — deposit, withdrawal, performance — before asking for anything. Taler carries a Promo chip against a 0% performance fee; this one carries none, and charges 10% of the yield it earns.',
    beats: [{ ms: 2400, do: 'openVault', arg: 'gauntlet' }],
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
    note: 'Closing returns to the list with Gauntlet up by the deposit — $1,343 to $1,366 at the rounding the row uses. Nothing was rounded on the way in: the balance behind it carries all six decimals of the 22.555228.',
    beats: [{ ms: 2000, do: 'close' }, { ms: 2400 }],
  },
  {
    id: 'card', ch: 'deposit',
    title: 'And so is the account',
    note: 'Earn is the sum of both vaults, so the card moved with them: $2,389.54 became $2,412.10. A deposit that only changes the screen you made it on is a deposit you have to go looking for afterwards.',
    beats: [{ ms: 2200, do: 'home' }, { ms: 2400 }],
  },

  {
    id: 'send', ch: 'spend',
    title: 'Universal Send',
    note: 'Send any token to any network, pay with any asset you own. Three rows — token, network, recipient — and the amount under them. It opens from the account card, which is where the money just landed.',
    beats: [{ ms: 2400, do: 'toSend' }],
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
    note: 'This is the feature, and the deposit is what makes it land. The picker offers both vault balances above the wallet tokens, and the one being picked is Gauntlet — $1,365.59, the 22.555228 included. Nothing was withdrawn to get here: paying out of yield is a choice made in passing, not a plan you have to make first.',
    beats: [
      { ms: 2400, do: 'payPicker' },
      { ms: 2600, do: 'pickPay', arg: 'gauntlet' },
    ],
  },
  {
    id: 'amount', ch: 'spend',
    title: '100 ZEC, paid from Gauntlet',
    note: 'The amount is in the token being sent; the balance under it is in the asset paying for it — the same Gauntlet vault, deposit and all. The app is holding both sides of a conversion nobody had to ask for.',
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
