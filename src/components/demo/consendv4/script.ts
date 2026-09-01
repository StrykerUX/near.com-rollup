import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type CS, type CSAction } from '@/components/demo/consend/state';

/**
 * CONFIDENTIAL SEND v4 — the cut you would put in front of a room
 * ==================================================================
 * The same machine as `/demo/confidential-send`, played from further back.
 * The step-by-step page argues; this one shows — one line of copy beside the
 * phone, and on two moments everything but the subject darkened.
 *
 * SIX, NOT EIGHT. The other cut has a step for the account and a step for the
 * way into the send, and a step for the picker and a step for the pick. Read
 * aloud those are one thought each: *it starts where everything starts*, and
 * *ZEC is in the list, and it brings its chain with it*. A cut is a handful of
 * moments, not a transcript of the beats, so the pairs are merged and nothing
 * is added to fill the gap. This flow was always the shortest of the five —
 * ten seconds of recording — and padding it to the length of the perps cut
 * would be arguing against its own finding.
 *
 * THE BEATS ARE THE OTHER SCRIPT'S BEATS, verbatim and in order. Each one
 * fires a guarded transition — `pick` refuses unless the sheet is open, `ack`
 * refuses unless the route is the one that raises the notice — and the
 * sequence is what satisfies those guards. Only the milliseconds are ours:
 * they are close to double, because a moment that lands before the eye has
 * arrived is a moment nobody saw.
 *
 * TWO SHOTS. The cutout is an instruction, and an instruction given on every
 * step is just the house style. It is spent on the notice, which is small and
 * sits under a form a reader is still scanning, and on ZEC's row in the token
 * list, which is the entire claim of the page and is otherwise four identical
 * rows down a sheet. Everything else the screen says on its own: a pad
 * dropping, a sheet arriving, a network filling itself in.
 */

const type_ = (act: CSAction, chars: string, lead?: number, gap?: number) =>
  typing<CS, CSAction>(act, chars, lead, gap);

/* the chapter is the eyebrow over the headline, so it names where the phone
   is rather than the section a note was filed under */
const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'The account', blurb: '' },
  { id: 'send', name: 'Universal Send', blurb: '' },
  { id: 'asset', name: 'The token list', blurb: '' },
  { id: 'amount', name: 'The amount', blurb: '' },
];

const STEPS: Step<CS, CSAction>[] = [
  {
    id: 'open', ch: 'account',
    title: 'One account, one Send button',
    note: 'Crypto, perps and earn on a single card, with one Send under all of it. The transfer that moves a shielded asset opens the same screen as the one that moves NEAR.',
    beats: [{ ms: 3000 }, { ms: 3400, do: 'toSend' }],
  },

  {
    id: 'rows', ch: 'send',
    title: 'Any token, any network, one screen',
    note: 'Send any token to any network, paying with any asset you own. The pad drops away and the whole instruction is three rows and an amount.',
    beats: [{ ms: 3200, do: 'done' }],
  },
  {
    id: 'warn', ch: 'send',
    title: 'A notice that belongs to one route',
    note: 'NEAR sent to the NEAR network is the transfer some exchanges will not credit, so the warning is raised there and nowhere else. A checkbox inside the flow, not a dialog across it.',
    /* the box, not the sentence above it, would light half the warning and
       none of the point — so the cutout takes the whole notice, the way the
       perps cut frames the leverage row rather than the figure inside it */
    shot: { on: '.dwarn' },
    beats: [{ ms: 3600, do: 'ack' }, { ms: 2600, do: 'ack' }],
  },

  {
    id: 'asset', ch: 'asset',
    title: 'ZEC sits between Tether and Solana',
    note: 'A shielded asset is not filed under a mode of its own — it is a token, in the token list. Choosing it sets Zcash on the row below, and the exchange notice leaves with the route it belonged to.',
    /* the row is only lit while the sheet is open; `pick` closes it, the
       cutout finds nothing to frame and the screen comes back up whole, which
       is the pick reading as a pick */
    shot: { on: 'tok:ZEC' },
    callout: 'ZEC → Zcash',
    beats: [{ ms: 3000, do: 'picker' }, { ms: 2800, do: 'pick', arg: 'ZEC' }, { ms: 3000 }],
  },

  {
    id: 'amount', ch: 'amount',
    title: '1 ZEC, priced at $801',
    note: 'Denominated in the asset being sent, converted underneath in dollars. Nothing on this screen changed because the asset is shielded, which is the whole demonstration.',
    callout: '1 ZEC · $801',
    beats: [...type_('key', '1', 2800), { ms: 2200, do: 'done' }, { ms: 1800 }],
  },
  {
    id: 'missing', ch: 'amount',
    title: 'The button waits for a recipient',
    note: 'Review send needs somebody to send to, and this recording never picks one. What it proves is that the shielded path and the ordinary one are the same path, right down to what is missing from both.',
    /* a trailing hold with no transition: the last frame is the argument, and
       it needs longer on screen than the beat that produced it */
    beats: [{ ms: 3200 }, { ms: 2800 }],
  },
];

export const conSendV4Flow = buildFlow<CS, CSAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'amount',
  outro: 5000,
  /* the same gestures land in the same places; the ids are this cut's, since
     two of the other script's steps are one step here */
  anchor: {
    toSend: 'rows',
    ack: 'warn',
    picker: 'asset',
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
