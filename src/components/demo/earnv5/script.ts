import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { AMOUNT, INTO, STEPS, actions, initial, type EA, type EAAction } from './state';

const type_ = (act: EAAction, chars: string, lead?: number, gap?: number) =>
  typing<EA, EAAction>(act, chars, lead, gap);

/**
 * EARN — THE SHORT CUT
 * ==================================================================
 * REBUILT OFF 1–30s of `rec-Earn + being able to send:pay from your earn
 * balance.MP4`, read at two frames a second and at twenty across each
 * transition. What that segment contains, in order:
 *
 *   the account home, with Crypto, Perps and Earn
 *   the Earn row lights, and the vaults are there
 *   the Gauntlet row lights, and its sheet comes up
 *   fifteen thousand typed into it
 *   Deposit, three rows ticking, a reference id
 *   Close, and Gauntlet's balance carries the deposit
 *   the Staking tab, and the NEAR that has been working all along
 *
 * IT USED TO START ON THE EARN PAGE, with no account of how anyone got there —
 * and then invented two scenes the recording does not have: a Staking pane it
 * never opens and a Positions tab that exists in no frame. Both are gone. What
 * replaces them is the front of the recording, which is the chapter's argument
 * stated as a gesture: the yield is a room in the account, not a separate
 * product, and you reach it by pressing a balance.
 *
 * IT DEPOSITS INTO GAUNTLET, THE ROW AT THE TOP, at the client's direction —
 * and 15,000 of the 18,400 the account holds, which is a fraction and a thing
 * you type. `Use max` was the gesture while this cut spent a whole 22.555228
 * lot; it is drawn and live and the script no longer uses it.
 *
 * THE PRESS IS A BEAT, NOT A TRANSITION. `set: { lit }` lights the row for
 * ~200ms and the transition that follows puts it out. On a screen with no
 * cursor that lighter fill is the entire causal chain a viewer gets — see the
 * note in 24-demo-app.css.
 *
 * THE ARITHMETIC. Beats play at `PACE` (1.25); `check:flows` asserts it.
 *
 *   scene 1    1,600ms   the account, and the row that goes to the yield
 *   scene 2    3,180ms   two vaults, their rates, and what you already hold
 *   scene 3    3,100ms   the disclosure, and fifteen thousand typed into it
 *   scene 4    4,400ms   one press, three rows, a reference id
 *   scene 5    1,600ms   closed, and the balance carries it
 *   scene 6    3,000ms   the other tab, and the stake behind it
 *   outro      2,000ms   the same frame again, for the loop
 *   ─────────────────
 *             18,880ms  ×1.25 = 23,600ms on screen
 *
 * SCENE 1 WAS 2,900 AND THE CLIP WAS 25,225. The 1,300 came out of a hold on a
 * screen the reader has already met three times; see the note on that scene.
 *
 * THE STAKING SCENE IS THE ONE THING HERE NO FRAME SHOWS. `Staking` has been
 * on the tab row since the first pass — it is in every frame of the recording —
 * and the recording never presses it. The reference for what is behind it is
 * one line of a sidebar in a screenshot of a different screen: `Join NEAR@3.33,
 * earn rewards`. The rate is that; the pane is designed. See `STAKE_APY`.
 */

const CHAPTERS: Chapter[] = [
  { id: 'acct', name: 'From the account', blurb: '' },
  { id: 'page', name: 'The vaults', blurb: '' },
  { id: 'in', name: 'Into one', blurb: '' },
  { id: 'sign', name: 'One press', blurb: '' },
  { id: 'stake', name: 'And the stake', blurb: '' },
];

const STEPS_: Step<EA, EAAction>[] = [
  /* ---- scene 1 · 1,600ms ----------------------------------------------
     The account home, and then the press. The 220ms comes out of the hold
     rather than being added to it: the recording lights the row for about that
     and the vaults are on the next frame.

     THE HOLD IS 700 AND IT WAS 2,000. Nothing on this screen moves — no figure
     is answering, no sheet is arriving — and by the time a reader reaches this
     chapter they have met the account home three times: it is chapter 02 in
     full, it is where the swap chapter's loop returns to, and it is here. What
     this frame owes is not a read but an ANSWER: where the earn page came
     from, which is a row on the account with an arrow on it. An answer does not
     need two seconds, and swap's own opening scene settled at exactly this
     number for exactly this reason.

     The 1,300 comes OFF the clip rather than moving into another scene. A beat
     that is doing nothing is not a beat to spend elsewhere — the same call the
     swap cut made when it took 1,960 out of its list scene. */
  {
    id: 'home', ch: 'acct',
    title: 'Earn is a row on your account',
    note: 'Not a tab and not another app: the third balance on the account home, with the blended rate it is already paying, and an arrow that goes somewhere.',
    beats: [
      { ms: 700 },
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
    note: 'Who runs it, what it holds and all three fees are on screen before an amount is. Then fifteen thousand of the eighteen four hundred the account holds — a decision rather than a sweep.',
    beats: [
      { ms: 1400 },
      /* AND IT IS TYPED. `Use max` was right while this cut spent a whole
         22.555228 lot — six decimals of somebody's own balance is not a figure
         anyone enters by hand. It puts 15,000 of 18,400 to work now, which is a
         fraction and a thing you type. */
      ...type_('key', AMOUNT, 380, 160),
      /* the rest after the value lands, as everywhere in this family */
      { ms: 680 },
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
    note: 'Gauntlet was $8,650 when the sheet opened. It is $23,650 when it closes, which is the only thing this chapter had to prove.',
    beats: [
      { ms: 200, set: { lit: 'close' } },
      { ms: 620, do: 'close' },
      { ms: 780 },
    ],
  },

  /* ---- scene 6 · 3,000ms ----------------------------------------------
     THE OTHER TAB, AND THE CHAPTER HAD NEVER OPENED IT. `Staking` has been on
     screen since the first pass — it is in every frame of the recording — and
     the recording never presses it, so neither did this. What is behind it is
     the second half of what Earn means: a vault is somebody managing your
     dollars, and a stake is you securing the network with your own NEAR. One
     press, and then a hold, because there is no flow here to run: it has been
     working the whole time. */
  {
    id: 'stake', ch: 'stake',
    title: 'And the other half of Earn',
    note: 'Twenty thousand NEAR, staked and accruing at the rate the app itself quotes. No flow to run — it has been working the whole time.',
    beats: [
      { ms: 200, set: { lit: 'tab:staking' } },
      { ms: 700, do: 'tab', arg: 'staking' },
      { ms: 2100 },
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
    tab: 'stake',
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
