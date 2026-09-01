import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, supported, type CD, type CDAction } from '@/components/demo/condeposit/state';

/**
 * CONFIDENTIAL DEPOSIT v4 — the cut you would put in front of a room
 * ==================================================================
 * The same machine as `/demo/confidential-deposit`, beat for beat. What changes
 * is the camera and the copy.
 *
 * The step-by-step version explains: twelve steps, each naming one thing the
 * screen does, with a rail of notes to read them off. This one SHOWS: seven
 * moments, a single line of copy beside the phone, and — on three of them —
 * everything but the subject darkened.
 *
 * REGROUPED, NOT REWRITTEN. Every beat below is the step-by-step script's,
 * verbatim and in its order; the only thing this file rearranges is where the
 * step boundaries fall and what is said over them. That is not tidiness. Each
 * beat fires a guarded transition — `continue` refuses until the box is ticked,
 * `pickNet` refuses a network the token does not support, `search` does nothing
 * unless the picker is open — and the sequence IS what satisfies those guards.
 * A beat invented for the cut is a beat the machine throws away, and the rest
 * of the flow then plays against a state that never happened.
 *
 * WHAT IT REFUSES TO DROP is the refusing. This flow's substance is that its
 * rules are load-bearing: the green condition and the red ways-to-lose-it are
 * two different kinds of line and not one list, the network picker names the
 * chains it will not take instead of hiding them, and the address at the end
 * expires. A marketing cut that smooths that away is selling a different
 * product — a deposit screen, rather than this one.
 *
 * THREE SHOTS, NOT SEVEN. `shot` darkens everything but one control, and an
 * effect that arrives every step stops being an instruction and becomes the
 * house style. It is kept for the three moments where a reader would otherwise
 * be looking at the wrong half of the glass: a button on a card of balances, a
 * row that is empty on purpose, and a network changing sides. Everywhere else
 * the screen carries itself — a sheet arriving, a box ticking, a code minting.
 *
 * The beats are longer than the step-by-step's. There is no rail here to read
 * ahead in, so each moment has to be legible in the time it is on screen, and a
 * moment that lands before the eye has arrived is a moment nobody saw.
 */

const type_ = (act: CDAction, chars: string, lead?: number, gap?: number) =>
  typing<CD, CDAction>(act, chars, lead, gap);

/* the chapter is the eyebrow over the headline, so each one names the moment
   its own steps are in rather than the section they were filed under. The
   blurbs the step-by-step version carries are dropped: this cut has one line of
   copy at a time, and a second line under the eyebrow would be two. */
const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: '' },
  { id: 'rules', name: 'The rules', blurb: '' },
  { id: 'configure', name: 'Token and network', blurb: '' },
  { id: 'deposit', name: 'The address', blurb: '' },
];

const STEPS: Step<CD, CDAction>[] = [
  {
    id: 'receive', ch: 'account',
    title: 'An address that works exactly once',
    note: 'Receive opens a one-time confidential deposit — alpha, and the screen says so in its own title. The paragraph under it is unusually frank: this exists because advanced users asked, and it arrives with constraints.',
    /* the cutout frames Receive on a card of four balances, then lets go on its
       own the moment the screen changes and there is no such button any more —
       which is the whole flow opening up, done by the shot rather than narrated */
    shot: { on: 'receive' },
    beats: [{ ms: 3000 }, { ms: 3600, do: 'toReceive' }, { ms: 3400 }],
  },

  {
    id: 'gate', ch: 'rules',
    title: 'Continue does nothing until you agree',
    note: 'One rule in green — a dollar minimum — and two in red: do not send a test deposit first, do not reuse or share the address. The button under them is dead until the box is ticked, which makes the reading a step rather than a dialog you dismiss on the way past.',
    beats: [{ ms: 3200, do: 'ack' }, { ms: 2800 }],
  },

  {
    id: 'configure', ch: 'configure',
    title: 'The token decides which networks exist',
    note: 'Two rows, and the second is empty on purpose. A network cannot be offered before the token is known, because it is the token that decides the list.',
    /* the empty row is the point, and an empty row is exactly what an eye skips
       past on a screen that also has a token, a stepper and a button on it */
    shot: { on: 'network' },
    beats: [{ ms: 3600, do: 'continue' }],
  },
  {
    id: 'picker', ch: 'configure',
    title: 'It names the chains it will not take',
    note: 'The list opens on something that is not a chain at all — receiving from another near.com user, which skips the problem entirely. Search Tron and it appears under Unsupported networks, greyed and unpressable, because a network you cannot find and a network that will eat your deposit look identical otherwise.',
    callout: 'Tron · Unsupported',
    beats: [{ ms: 3200, do: 'netPicker' }, ...type_('search', 'Tro', 2000, 420), { ms: 3400 }],
  },
  {
    id: 'switch', ch: 'configure',
    title: 'Same search, other token, other answer',
    note: 'Tron is refused for USDC and supported for USDT. Same picker, same three letters — which is why changing the token clears the network instead of quietly keeping one the new token cannot use.',
    /* `net:Tron` does not exist for most of this step: for USDC it is in the
       unsupported half, which carries no `data-tap` at all. So the frame stays
       wide while the token is being changed and closes on the row at the exact
       moment it becomes a row you can press. The absence is the timing. */
    shot: { on: 'net:Tron' },
    beats: [
      { ms: 2800, do: 'netPicker' },
      { ms: 1800, do: 'tokenPicker' },
      { ms: 2400, do: 'pickToken', arg: 'USDT' },
      { ms: 2200, do: 'netPicker' },
      ...type_('search', 'Tro', 1800, 420),
      { ms: 2800, do: 'pickNet', arg: 'Tron' },
    ],
  },

  {
    id: 'address', ch: 'deposit',
    title: 'Send at least $2 of USDT on Tron',
    note: 'Continue asks for an address rather than showing one it had all along, so the code arrives a moment after the screen does. The line above it names the asset, the amount and the network together, because getting any one of the three wrong has the same outcome.',
    beats: [{ ms: 3000, do: 'continue' }, { ms: 2000, do: 'issue' }, { ms: 4000 }],
  },
  {
    id: 'warnings', ch: 'deposit',
    title: 'Four ways to lose it, and three days',
    note: 'Wrong asset, wrong network, a test deposit first, reusing the address — all four in red under the code, where they are read rather than agreed to. The address expires in three days, and asking for another one does not kill this one: single-use is a property of the address, not a restriction on the account.',
    callout: 'Valid for 3 days',
    beats: [{ ms: 3800 }, { ms: 3400 }, { ms: 2800 }],
  },
];

export const conDepositV4Flow = buildFlow<CD, CDAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  /**
   * The frame reduced motion is given, and it is deliberately not the step
   * called `address`: that step OPENS on the Continue that asks for the code,
   * so its entrance is a spinner. `warnings` opens on the issued screen — code,
   * address, all four red lines and the expiry — which is the one still frame
   * that carries the whole flow.
   */
  restStep: 'warnings',
  outro: 5200,
  /**
   * WHERE A READER'S GESTURE PUTS THE PLAYHEAD.
   *
   * The same map the step-by-step version has, re-pointed at this cut's step
   * ids: firing an anchored transition treats that step's FIRST beat as the
   * thing the reader just did and resumes from the one after it. Which is why
   * the boundaries above fall where they do — `ack` starts `gate` and
   * `netPicker` starts `picker` precisely so a reader who ticks the box or
   * opens the picker by hand hands the script a state it can carry on from,
   * instead of a script whose next beat toggles their gesture straight back off.
   *
   * Two moved with the re-cut and mean exactly what they meant before:
   * `toReceive` now names the step it lives inside — the beat it resumes on is
   * `toReceive` itself, which its own guard turns into a no-op once the screen
   * has changed — and `issue` names the step that follows the minting, which is
   * `warnings` here and was `address` there.
   */
  anchor: {
    toReceive: 'receive',
    ack: 'gate',
    netPicker: 'picker',
    tokenPicker: 'switch',
    pickToken: 'switch',
    pickNet: 'address',
    issue: 'warnings',
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
