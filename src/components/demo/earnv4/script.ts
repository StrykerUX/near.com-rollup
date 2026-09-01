import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type EA, type EAAction } from '@/components/demo/earn/state';

/**
 * EARN v4 — the cut you would put in front of a room
 * ==================================================================
 * The same machine as `demo/earn`, played by the same device. What changes is
 * the camera and the copy: nine moments instead of seventeen steps, one line
 * beside the phone instead of a rail of notes under it.
 *
 * REGROUPED, NEVER REWRITTEN. Every beat below is the earn script's, verbatim
 * and in its original order — the guards are what make this flow legal, and the
 * sequence is what satisfies them. A vault sheet will not open from the account
 * screen, `deposit` refuses an empty amount, and `pickPay` refuses unless the
 * picker is up. So the merge is a matter of where the step boundaries fall and
 * nothing else. What is written fresh is the chapters, the titles, the notes,
 * three callouts and two shots.
 *
 * THE BEATS ARE LONGER. Seventeen steps could afford two seconds a beat because
 * the rail carried the argument and a reader set their own pace against it.
 * Here the copy arrives with the moment and leaves with it, so every beat has to
 * outlast the eye travelling from the headline to the glass and back. A cut that
 * lands before the reader has arrived is a cut nobody saw.
 *
 * TWO SHOTS, NOT NINE. The darkening is kept for the two places where a reader
 * would otherwise be looking at the wrong half of the screen: the "Use max"
 * control, which is a small word beside a balance and is where 22.555228 comes
 * from, and the Gauntlet row inside the Pay with picker, which is the entire
 * point of the recording and is four rows down a sheet. Everywhere else the app
 * says it on its own — a sheet arrives, a checklist ticks, a figure grows. An
 * effect that comes every step stops being an instruction and becomes wallpaper.
 * Both shots also fall away by themselves: `Focus` refuses a control inside a
 * closed layer, so the cutout lifts the moment the passkey replaces the vault
 * sheet and the moment the picker closes on the pick.
 *
 * THE SHAPE THAT HAD TO SURVIVE is the second half. This is not a deposit demo:
 * it is a deposit and then, back on the account card, that same vault position
 * being spent as an asset in a send. Steps 6 through 9 are that half, and
 * `paywith` is left as a moment of its own rather than folded into the token
 * choice — it is the argument the first five steps exist to set up.
 */

const type_ = (act: EAAction, chars: string, lead?: number, gap?: number) =>
  typing<EA, EAAction>(act, chars, lead, gap);

/* the chapter is the eyebrow over the headline, so each one names the moment
   its own steps are in rather than the section they were filed under. The
   blurbs are dropped: V4Stage prints the name and nothing else. */
const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: '' },
  { id: 'vaults', name: 'The vaults', blurb: '' },
  { id: 'deposit', name: 'The deposit', blurb: '' },
  { id: 'back', name: 'Both numbers', blurb: '' },
  { id: 'spend', name: 'Paying out of yield', blurb: '' },
];

const STEPS: Step<EA, EAAction>[] = [
  {
    id: 'earn', ch: 'account',
    title: 'A balance that is already working',
    note: 'The Earn row quotes 5.1% blended rather than any one vault, because the money is in more than one place. One tap opens what is behind it.',
    beats: [{ ms: 3000 }, { ms: 3400, do: 'toEarn' }],
  },

  {
    id: 'vaults', ch: 'vaults',
    title: 'Two strategies, priced against each other',
    note: 'Staking is a network position and keeps its own tab. In Vaults, Gauntlet holds $432.92M at 4.52% and Taler $854.15K at 5.80% — the bigger rate on the smaller book is the trade the table is showing you.',
    beats: [
      { ms: 2800, do: 'tab', arg: 'staking' },
      { ms: 2600, do: 'tab', arg: 'vaults' },
      { ms: 3200 },
    ],
  },
  {
    id: 'sheet', ch: 'vaults',
    title: 'Every fee stated before the amount field',
    note: 'Curated by Gauntlet, built on Ethereum, 4.52% against $432.92M — and all three fees, deposit, withdrawal and 10% of the yield, named before the sheet asks for anything. One sheet holds both directions: money that can only go in is not a vault.',
    beats: [
      { ms: 3000, do: 'openVault', arg: 'gauntlet' },
      { ms: 2800, do: 'side', arg: 'Withdraw' },
      { ms: 2400, do: 'side', arg: 'Deposit' },
    ],
  },

  {
    id: 'deposit', ch: 'deposit',
    title: 'The whole balance, to six decimals',
    note: 'Use max fills 22.555228 USDC — the figure the wallet actually holds, not the two-decimal one on the row above it. A passkey signs it, and nothing moves until the signature comes back.',
    /* the small word beside the balance, and the only place the six decimals
       come from. The cutout lifts on its own when the passkey sheet replaces
       the vault sheet, because the control it is framing goes with it. */
    shot: { on: 'max' },
    callout: '22.555228 USDC',
    beats: [
      { ms: 2600, do: 'max' },
      { ms: 2400 },
      { ms: 2800, do: 'deposit' },
      { ms: 1800, do: 'step' },
      { ms: 1600, do: 'step' },
      { ms: 1400, do: 'step' },
    ],
  },
  {
    id: 'settle', ch: 'deposit',
    title: 'Confirm, depositing, deposited',
    note: 'Three states rather than one spinner, and a reference ID under them for the day one of them needs chasing.',
    beats: [
      { ms: 2000, do: 'step' },
      { ms: 2000, do: 'step' },
      { ms: 2000, do: 'step' },
      { ms: 2800 },
    ],
  },

  {
    id: 'after', ch: 'back',
    title: 'Both numbers move, or neither counts',
    note: 'Closing returns to the list with Gauntlet up by exactly the deposit, $1,343 to $1,366 at the rounding the row uses. The account card moved with it — $2,389.54 became $2,412.10 — because a deposit that only changes the screen you made it on is one you have to go looking for afterwards.',
    callout: '$2,389.54 → $2,412.10',
    beats: [
      { ms: 2600, do: 'close' },
      { ms: 2800 },
      { ms: 2800, do: 'home' },
      { ms: 3000 },
    ],
  },

  {
    id: 'route', ch: 'spend',
    title: 'A warning that knows its route',
    note: 'Universal Send opens from the card the money just landed on: any token, any network, paid with any asset you own. NEAR to the NEAR network raises the exchange-credit notice as a checkbox rather than a dialog, and choosing ZEC sets the network to Zcash and takes the warning with it.',
    beats: [
      { ms: 3000, do: 'toSend' },
      { ms: 2800, do: 'ack' },
      { ms: 2400, do: 'ack' },
      { ms: 2800, do: 'tokenPicker' },
      { ms: 2800, do: 'pickToken', arg: 'ZEC' },
    ],
  },
  {
    id: 'paywith', ch: 'spend',
    title: 'Your vaults, listed above your tokens',
    note: 'This is the feature. The Pay with picker offers both vault balances as things that can pay, and Gauntlet is showing $1,365.59 — the 22.555228 included. Nothing was withdrawn to get here.',
    /* four rows down a sheet, and the one row the whole recording is about */
    shot: { on: 'pay:gauntlet' },
    callout: 'Gauntlet · $1,365.59',
    beats: [
      { ms: 3000, do: 'payPicker' },
      { ms: 3200, do: 'pickPay', arg: 'gauntlet' },
      { ms: 2000 },
    ],
  },
  {
    id: 'amount', ch: 'spend',
    title: '100 ZEC, paid out of a yield position',
    note: 'The amount is in the token being sent and the balance under it is in the asset paying for it, so the app is holding both sides of a conversion nobody asked for. Review send stays grey, and it is right to: there is no recipient, because this screen is demonstrating what it can pay with rather than completing a payment.',
    beats: [
      /* the pad has to be UP before digits land in the figure above it. The
         script typed straight into the amount with nothing on screen to type
         with, which reads as the number filling itself in. */
      { ms: 2200, do: 'focus', arg: 'send' },
      ...type_('skey', '100', 1600, 340),
      { ms: 1800, do: 'done' },
      { ms: 2200 },
      { ms: 3000 },
    ],
  },
];

export const earnV4Flow = buildFlow<EA, EAAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'paywith',
  outro: 5200,
  /**
   * THE SAME ANCHORS, RE-POINTED AT THE MOMENTS THAT SWALLOWED THEM.
   *
   * An anchor names the step a reader's own gesture drops them into, and the
   * step's first beat is treated as the one they just fired — so an anchor is
   * only exact when the step it names BEGINS with that transition. Merging
   * steps moves some beats off the front of a step, and three of these are now
   * approximate:
   *
   *   · `max` and `deposit` both land on `deposit`, whose first beat is `max`.
   *     Pressing Use max resumes into the hold and then the signature, which is
   *     better than the original (it anchored `max` past the deposit press
   *     entirely); pressing Deposit replays a `max` the machine has already
   *     applied and a `deposit` its own modal guard refuses, then the `step`
   *     beats carry the passkey through.
   *   · `tokenPicker` lands on `route`, which now opens with `toSend`. A reader
   *     who opens the token list themselves gets the script's own `tokenPicker`
   *     two beats later, which closes it again. The cost of keeping `paywith`
   *     whole, and `paywith` is the reason this recording exists.
   *
   * Everything else is exact: `close` opens `after`, `toSend` opens `route`,
   * `payPicker` opens `paywith`, and `pickPay` hands over to `amount`.
   */
  anchor: {
    toEarn: 'vaults',
    openVault: 'sheet',
    max: 'deposit',
    deposit: 'deposit',
    close: 'after',
    toSend: 'route',
    tokenPicker: 'route',
    pickToken: 'paywith',
    payPicker: 'paywith',
    pickPay: 'amount',
  },
  /**
   * WHERE EACH TRANSITION IS PRESSED.
   *
   * Copied from `demo/earn` unchanged, because it is a fact about the device
   * and not about this cut: the same controls sit in the same places, and the
   * hand still has to be on one before the beat that presses it fires.
   */
  target: (a, arg, s) => {
    switch (a) {
      case 'toEarn': return 'row:earn';
      case 'home': return 'back';
      case 'tab': return `tab:${arg}`;
      case 'openVault': return `vault:${arg ?? 'gauntlet'}`;
      case 'side': return `side:${arg}`;
      case 'max': return 'max';
      case 'deposit': return 'deposit';
      case 'close': return 'close';
      case 'toSend': return 'send';
      case 'tokenPicker': return 'row:token';
      case 'pickToken': return `pick:${arg}`;
      case 'payPicker': return 'paysel';
      case 'pickPay': return `pay:${arg}`;
      case 'ack': return 'ack';
      case 'focus': return arg === 'send' ? 'amount' : null;
      case 'skey': return arg ? `key:${arg}` : null;
      case 'done': return 'done';
      /* `step` runs six times to drive the passkey and then the checklist, and
         only the first of them is a person pressing anything. The rest are the
         network coming back — a hand hovering over a checklist that is ticking
         itself is a lie about who is doing the work. */
      case 'step': return s.over === 'passkey' && s.auth === 'ask' ? 'passkey' : null;
      default: return null;
    }
  },
  auto: (s) => {
    if (s.over === 'passkey') return { after: s.auth === 'done' ? 700 : 1100, do: 'step' };
    if (s.step >= 0 && !s.deposited) return { after: 1500, do: 'step' };
    return null;
  },
});
