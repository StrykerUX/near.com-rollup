import { buildFlow, type Chapter, type Step } from '@/components/demo/shell/flow';
import { INTO, STEPS, actions, initial, type EA, type EAAction } from './state';

/**
 * EARN — THE SHORT CUT
 * ==================================================================
 * REBUILT OFF 1–30s of `rec-Earn + being able to send:pay from your earn
 * balance.MP4`, read at two frames a second and at twenty across each
 * transition. What that segment contains, in order:
 *
 *   the account home, with Crypto, Perps and Earn
 *   the Earn row lights, and the vaults are there
 *   the Taler row lights, and its sheet comes up
 *   Use max, and the whole USD Coin lot is in the field
 *   Deposit, three rows ticking, a reference id
 *   Close, and Taler's balance carries the deposit
 *
 * IT USED TO START ON THE EARN PAGE, with no account of how anyone got there —
 * and then invented two scenes the recording does not have: a Staking pane it
 * never opens and a Positions tab that exists in no frame. Both are gone. What
 * replaces them is the front of the recording, which is the chapter's argument
 * stated as a gesture: the yield is a room in the account, not a separate
 * product, and you reach it by pressing a balance.
 *
 * NOBODY TYPES ANYTHING IN THIS CUT. The old scene 2 typed `15000` into a
 * wallet that held an invented 18,400; the recording taps **Use max** on the
 * smaller of the two USD Coin lots the account chapter lists two faces
 * earlier. One gesture where there were five keystrokes, and one wallet where
 * there were two.
 *
 * THE PRESS IS A BEAT, NOT A TRANSITION. `set: { lit }` lights the row for
 * ~200ms and the transition that follows puts it out. On a screen with no
 * cursor that lighter fill is the entire causal chain a viewer gets — see the
 * note in 24-demo-app.css.
 *
 * THE ARITHMETIC. Beats play at `PACE` (1.25); `check:flows` asserts it.
 *
 *   scene 1    2,900ms   the account, and the row that goes to the yield
 *   scene 2    3,180ms   two vaults, their rates, and what you already hold
 *   scene 3    3,100ms   the disclosure, and the whole lot in one tap
 *   scene 4    4,400ms   one press, three rows, a reference id
 *   scene 5    2,200ms   closed, and the balance carries it
 *   outro      2,000ms   the same frame again, for the loop
 *   ─────────────────
 *             17,780ms  ×1.25 = 22,225ms on screen
 *
 * SHORTER THAN THE 23,475 IT REPLACES, which matters more here than anywhere:
 * `W_REST` in lib/schedule.ts is identical for all four cards by construction,
 * so a chapter that grows buys the same dwell for the other three and moves the
 * shipped page's composition. Two invented scenes went; one real one arrived.
 */

const CHAPTERS: Chapter[] = [
  { id: 'acct', name: 'From the account', blurb: '' },
  { id: 'page', name: 'The vaults', blurb: '' },
  { id: 'in', name: 'Into one', blurb: '' },
  { id: 'sign', name: 'One press', blurb: '' },
];

const STEPS_: Step<EA, EAAction>[] = [
  /* ---- scene 1 · 2,900ms ----------------------------------------------
     The account home, held long enough to be read, and then the press. The
     220ms comes out of the hold rather than being added to it: the recording
     lights the row for about that and the vaults are on the next frame. */
  {
    id: 'home', ch: 'acct',
    title: 'Earn is a row on your account',
    note: 'Not a tab and not another app: the third balance on the account home, with the blended rate it is already paying, and an arrow that goes somewhere.',
    beats: [
      { ms: 2000 },
      { ms: 220, set: { lit: 'earn' } },
      { ms: 680, do: 'toEarn' },
    ],
  },

  /* ---- scene 2 · 3,180ms ----------------------------------------------
     Two rows, each carrying its TVL and its rate under the name and the
     balance you already hold on the right, which is the whole of what this
     screen has to say. Then the row that opens. */
  {
    id: 'page', ch: 'page',
    title: 'Two vaults, and what they pay',
    note: 'Professionally managed, with the rate on the row — and the balance you already hold in each on the right.',
    beats: [
      { ms: 2280 },
      { ms: 200, set: { lit: 'vault:' + INTO } },
      { ms: 700, do: 'openVault', arg: INTO },
    ],
  },

  /* ---- scene 3 · 3,100ms ----------------------------------------------
     The disclosure gets the longest quiet beat in the cut, because it is the
     screen's argument: who runs the vault, what it holds, and all three fees,
     before there is any figure in the field at all. */
  {
    id: 'in', ch: 'in',
    title: 'The whole disclosure, then one tap',
    note: 'Who runs it, what it holds and all three fees are on screen before an amount is. Then Use max, because six decimals of your own balance is not a figure anybody types.',
    beats: [
      { ms: 1600 },
      { ms: 200, set: { lit: 'max' } },
      { ms: 700, do: 'max' },
      /* the rest after the value lands, as everywhere in this family */
      { ms: 600 },
    ],
  },

  /* ---- scene 4 · 4,400ms ----------------------------------------------
     `step` runs one past the last row so all three read as done, and then it
     STOPS: the sheet holds its reference id and a white Close until something
     presses it. The recording waits there. */
  {
    id: 'sign', ch: 'sign',
    title: 'Confirmed, and it is in',
    note: 'Confirm in wallet, depositing, deposited — with the reference id the app prints, and a sheet that waits to be dismissed rather than dismissing itself.',
    beats: [
      { ms: 200, set: { lit: 'deposit' } },
      { ms: 620, do: 'confirm' },
      { ms: 620, do: 'step' },
      { ms: 620, do: 'step' },
      { ms: 700, do: 'step' },
      /* all three ticked, and the Close button arrives under them */
      { ms: 800, do: 'step' },
      { ms: 840 },
    ],
  },

  /* ---- scene 5 · 2,200ms ----------------------------------------------
     Where the chapter ends, and it ends on a number that moved. Taler was
     $1,047 when the sheet opened and is $1,069 when it closes — the deposit,
     on the row it went into, on the screen the reader started from. */
  {
    id: 'done', ch: 'sign',
    title: 'And the row carries it',
    note: 'Taler was $1,047 when the sheet opened. It is $1,069 when it closes, which is the only thing this chapter had to prove.',
    beats: [
      { ms: 200, set: { lit: 'close' } },
      { ms: 620, do: 'close' },
      { ms: 1380 },
    ],
  },
];

export const earnV5Flow = buildFlow<EA, EAAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS_,
  /* reduced motion gets the frame the chapter is about: the vault's whole
     disclosure with the lot already in the field */
  restStep: 'in',
  outro: 2000,
  anchor: {
    toEarn: 'page',
    openVault: 'in',
    max: 'in',
    confirm: 'sign',
    step: 'sign',
    close: 'done',
  },
  /* a settlement is not waiting for anyone */
  auto: (s) => (s.submitting && !s.settled ? { after: 620, do: 'step' } : null),
});

export { STEPS };
