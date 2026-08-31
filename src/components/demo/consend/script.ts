import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type CS, type CSAction } from './state';

/**
 * CONFIDENTIAL SEND — the script
 * ==================================================================
 * Four chapters, eight steps. The recording is ten seconds long and this page
 * is short to match: there is no separate confidential flow to walk through,
 * which is the whole finding.
 */

const type_ = (act: CSAction, chars: string, lead?: number, gap?: number) =>
  typing<CS, CSAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: 'Send, from the same card as everything else.' },
  { id: 'send', name: 'Universal Send', blurb: 'Three rows, and a notice that knows where it applies.' },
  { id: 'asset', name: 'A shielded asset', blurb: 'Picked from the same list as every other token.' },
  { id: 'amount', name: 'The amount', blurb: 'And the one thing still missing.' },
];

const STEPS: Step<CS, CSAction>[] = [
  {
    id: 'balances', ch: 'account',
    title: 'Send',
    note: 'No confidential mode to switch into, and no second app. The send that moves a shielded asset starts on the button that moves everything else.',
    beats: [{ ms: 500 }],
  },
  {
    id: 'tosend', ch: 'account',
    title: 'Universal Send',
    note: 'Send any token to any network, pay with any asset you own. That sentence is the product, and it is printed under the title.',
    beats: [{ ms: 2800, do: 'toSend' }],
  },

  {
    id: 'rows', ch: 'send',
    title: 'Token, network, recipient',
    note: 'Three rows and an amount. The recipient is empty, and it is the reason the button at the bottom is grey the whole way through.',
    beats: [{ ms: 2700, do: 'done' }],
  },
  {
    id: 'warn', ch: 'send',
    title: 'A notice with a scope',
    note: 'NEAR to the NEAR network raises it: some exchanges will not credit that transfer. It is a checkbox rather than a dialog, and it belongs to this route only.',
    beats: [{ ms: 2400, do: 'ack' }, { ms: 2200, do: 'ack' }],
  },

  {
    id: 'picker', ch: 'asset',
    title: 'One list, shielded or not',
    note: 'ZEC sits between Tether and Solana. A confidential asset is not filed somewhere else — it is a token, in the token list.',
    beats: [{ ms: 2200, do: 'picker' }],
  },
  {
    id: 'pick', ch: 'asset',
    title: 'The network comes with it',
    note: 'Choosing ZEC sets Zcash, and the exchange notice disappears with the route it belonged to. Two rows moved from one tap.',
    beats: [{ ms: 2400, do: 'pick', arg: 'ZEC' }, { ms: 2000 }],
  },

  {
    id: 'amount', ch: 'amount',
    title: '1 ZEC, $801',
    note: 'The amount is denominated in the asset being sent, priced underneath in dollars. Nothing about the screen changed because the asset is shielded.',
    beats: [...type_('key', '1', 1800), { ms: 1600, do: 'done' }, { ms: 1800 }],
  },
  {
    id: 'missing', ch: 'amount',
    title: 'Still grey, and rightly so',
    note: 'Review send needs a recipient, and the recording never picks one. What it demonstrates is that the shielded path and the ordinary one are the same path.',
    beats: [{ ms: 2800 }],
  },
];

export const conSendFlow = buildFlow<CS, CSAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'amount',
  outro: 4000,
  anchor: {
    toSend: 'rows',
    ack: 'warn',
    picker: 'pick',
    pick: 'amount',
  },
  /**
   * WHERE EACH TRANSITION IS PRESSED.
   *
   * The machine says what happens; this says where on the glass. The deck
   * resolves the NEXT beat's target while the clock is still counting down to
   * it, so the hand is already on the control when the state changes — which
   * is the difference between a screen whose state changes and a screen
   * somebody is using.
   */
  target: (a, arg, s) => {
    switch (a) {
      case 'toSend': return 'send';
      /* the row opens the picker, and the same transition closes it — but then
         the thing pressed is the scrim, which the shell draws and does not
         name, and the row it would otherwise aim at is under the sheet doing
         the covering. Here the script only ever opens it; `pick` is what
         closes it, on a row of its own. */
      case 'picker': return s.over === 'token' ? null : 'row:token';
      case 'pick': return arg ? `tok:${arg}` : null;
      case 'ack': return 'ack';
      /* the keypad names its own keys and its own ✓ — see `Keypad` */
      case 'key': return arg ? `key:${arg}` : null;
      case 'done': return 'done';
      /* `focus` is the amount field taking the keypad back, and `home` is the
         chevron; no beat presses either */
      default: return null;
    }
  },
});
