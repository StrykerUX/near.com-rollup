import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, supported, type CD, type CDAction } from './state';

/**
 * A ONE-TIME CONFIDENTIAL DEPOSIT — the script
 * ==================================================================
 * Four chapters, twelve steps, read off `_refs/rec-Confidential deposit.MP4`.
 */

const type_ = (act: CDAction, chars: string, lead?: number, gap?: number) =>
  typing<CD, CDAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: 'Receive, and what is behind it.' },
  { id: 'important', name: 'Important', blurb: 'Three rules, two of them in red, and a box you have to tick.' },
  { id: 'configure', name: 'Configure', blurb: 'A token, and the networks that token can actually arrive on.' },
  { id: 'deposit', name: 'Deposit', blurb: 'An address that expires, and the four ways to lose the money.' },
];

const STEPS: Step<CD, CDAction>[] = [
  {
    id: 'balances', ch: 'account',
    title: 'Receive',
    note: 'The same card the other recordings open on. Receive is the door to a deposit address, confidential or otherwise.',
    beats: [{ ms: 500 }],
  },
  {
    id: 'toreceive', ch: 'account',
    title: 'One-time confidential deposit',
    note: 'Alpha, and it says so in the title. The paragraph under it is unusually frank: this exists because advanced users asked, and it comes with constraints.',
    beats: [{ ms: 2900, do: 'toReceive' }],
  },

  {
    id: 'rules', ch: 'important',
    title: 'Three rules, two in red',
    note: 'A minimum of $1. Do not send a test deposit first. Do not reuse, save, whitelist or share the address. The red ones are the two that lose your money.',
    beats: [{ ms: 2900 }],
  },
  {
    id: 'ack', ch: 'important',
    title: 'The box is the gate',
    note: 'Continue is dead until it is ticked. Not a dialog you dismiss on the way past — a control that does nothing until you have said what you understood.',
    beats: [{ ms: 2500, do: 'ack' }, { ms: 1800 }],
  },

  {
    id: 'configure', ch: 'configure',
    title: 'Token, then network',
    note: 'Two rows, and the second one is empty on purpose. The network cannot be offered until the token is known, because it is the token that decides the list.',
    beats: [{ ms: 2200, do: 'continue' }],
  },
  {
    id: 'internal', ch: 'configure',
    title: 'From another near.com user',
    note: 'The first option is not a chain at all. Receiving from inside the app skips the whole problem, and the picker says so before it lists anything else.',
    beats: [{ ms: 2200, do: 'netPicker' }],
  },
  {
    id: 'refused', ch: 'configure',
    title: 'Networks it will not take',
    note: 'Searching Tro turns up Tron under Unsupported networks, greyed. The picker names what it refuses instead of hiding it — a network you cannot find and a network that will eat your deposit look identical otherwise.',
    beats: [...type_('search', 'Tro', 1800, 400), { ms: 2600 }],
  },
  {
    id: 'switch', ch: 'configure',
    title: 'Change the token, change the answer',
    note: 'Tron is refused for USDC and supported for USDT. Same picker, same search, different token — which is why the network resets when the token changes.',
    beats: [
      { ms: 2000, do: 'netPicker' },
      { ms: 1400, do: 'tokenPicker' },
      { ms: 2000, do: 'pickToken', arg: 'USDT' },
      { ms: 1600, do: 'netPicker' },
      ...type_('search', 'Tro', 1600, 400),
      { ms: 2200, do: 'pickNet', arg: 'Tron' },
    ],
  },

  {
    id: 'issue', ch: 'deposit',
    title: 'The address is issued, not looked up',
    note: 'Continue asks for an address rather than showing one it had. The wait is short and it is real, which is why the QR arrives after the screen does.',
    beats: [{ ms: 2200, do: 'continue' }, { ms: 1900, do: 'issue' }],
  },
  {
    id: 'address', ch: 'deposit',
    title: 'Send at least $2 of USDT on Tron',
    note: 'The instruction names the asset, the amount and the network in one line, because getting any one of the three wrong has the same outcome.',
    beats: [{ ms: 2800 }],
  },
  {
    id: 'warnings', ch: 'deposit',
    title: 'The four ways to lose it',
    note: 'Wrong asset, wrong network, a test deposit first, or reusing the address. All four in red, under the code, where they are read rather than agreed to.',
    beats: [{ ms: 3000 }],
  },
  {
    id: 'expiry', ch: 'deposit',
    title: 'Valid for three days',
    note: 'And a second address can be created without killing this one. Single-use is a property of the address, not a restriction on the account.',
    beats: [{ ms: 3000 }],
  },
];

export const conDepositFlow = buildFlow<CD, CDAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'address',
  outro: 4200,
  anchor: {
    toReceive: 'rules',
    ack: 'ack',
    netPicker: 'internal',
    tokenPicker: 'switch',
    pickToken: 'switch',
    pickNet: 'issue',
    issue: 'address',
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
      case 'toReceive': return 'receive';
      case 'ack': return 'ack';
      case 'continue': return 'continue';
      /* Both pickers TOGGLE. Opening one is a press on the row; CLOSING it is
         a press on the scrim, which the shell draws and does not name — and
         the row the hand would otherwise fall back to is underneath the sheet
         doing the covering, so it would sit on top of that sheet pointing
         through it at something nobody can reach. It leaves instead. */
      case 'tokenPicker': return s.over === 'token' ? null : 'token';
      case 'netPicker': return s.over === 'network' ? null : 'network';
      case 'pickToken': return arg ? `tok:${arg}` : null;
      /* the same guard the row itself is drawn with: only the supported half
         of the list is pressable, and the refused half is on screen precisely
         to be read rather than tapped */
      case 'pickNet': return arg && supported(s).includes(arg) ? `net:${arg}` : null;
      /* Three characters into the network search, from a keyboard this mock
         never draws. The field is a picture of a field — it carries no press
         of its own — so parking the hand there would both claim the finger
         typed them and aim it at something no reader can tap. It goes off the
         glass for the run instead, the way it does while the address mints,
         and comes back for the press that follows. */
      case 'search': return null;
      /* not a press at all: Continue asked for an address and this is the app
         answering. It also fires from `auto`, with nobody at the screen. A
         hand hovering over a spinner is a lie about who is doing the work. */
      case 'issue': return null;
      case 'again': return 'again';
      /* `home` and `back` are the chevron, and no beat ever presses it */
      default: return null;
    }
  },
  /* the address issues itself once the screen is up */
  auto: (s) => (s.stage === 'deposit' && !s.issued ? { after: 1400, do: 'issue' } : null),
});
