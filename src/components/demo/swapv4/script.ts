import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initial, type SW, type SWAction } from '@/components/demo/swap/state';

/**
 * SWAP v4 — the cut you would put in front of a room
 * ==================================================================
 * The same machine as `/demo/swap`, and — beat for beat, in the same order —
 * the same script. What changes is where the cuts fall.
 *
 * The step-by-step version has eighteen steps because it is explaining: every
 * screen gets its own line, and the line names the number that moved. That is
 * the right shape for something a reader scrubs through. It is the wrong shape
 * for something that plays. Eighteen headlines in ninety seconds is a slide
 * deck, and nobody reads a slide deck; nine is a film.
 *
 * SO THE BEATS ARE REGROUPED, NEVER REWRITTEN. Every `do` below appears in the
 * order `swap/script.ts` fires it, because the machine is a chain of guarded
 * transitions and the sequence IS what satisfies the guards — `search` refuses
 * unless the picker is open, `review` refuses unless the amount is ready,
 * `vstep` refuses unless something is settling. An invented beat is a beat
 * that no-ops, and a no-op in the middle of a film is a screen that stopped.
 * What is new here is only the copy, the chapters and the framing.
 *
 * THE BEATS ARE LONGER. Two moments merged into one moment means one line of
 * copy has to carry both, and a viewer has to read that line before the thing
 * it names has gone. A cut that lands before the eye has arrived is a cut
 * nobody saw.
 *
 * THREE SHOTS, NOT NINE. `shot` darkens everything but its subject, which
 * makes it an instruction — and an instruction that arrives every step is
 * house style rather than an instruction. It is kept for the three moments
 * where the subject is a strip of text a viewer would otherwise scan straight
 * past: the confidential half of the header, the balance line under the
 * amount field, and two letters landing in a search box. Everything else is
 * carried by what the app does on its own — a sheet arriving, a checklist
 * ticking, a row disappearing.
 */

const type_ = (act: SWAction, chars: string, lead?: number, gap?: number) =>
  typing<SW, SWAction>(act, chars, lead, gap);

/* the chapter is the eyebrow over the headline, so each one names the moment
   its own steps are in rather than the section they were filed under */
const CHAPTERS: Chapter[] = [
  { id: 'wallet', name: 'The wallet', blurb: '' },
  { id: 'assets', name: 'What it holds', blurb: '' },
  { id: 'trade', name: 'The swap', blurb: '' },
  { id: 'sign', name: 'Signing', blurb: '' },
  { id: 'earn', name: 'The chip', blurb: '' },
];

const STEPS: Step<SW, SWAction>[] = [
  {
    id: 'account', ch: 'wallet',
    title: 'Three kinds of money, one account',
    note: '$6,764.84 in tokens, $1,053.89 in perps, $2,347.81 already earning. Not three apps with three balances — three views of one.',
    beats: [{ ms: 3000 }, { ms: 3400, do: 'toAssets' }],
  },
  {
    id: 'confidential', ch: 'assets',
    title: 'Most of this wallet is confidential',
    /* Main is pressed first and Confidential second, so the cutout is sitting
       on the half the hand is travelling towards. The two segments are
       adjacent, which means the darkened one is still legible at the edge of
       the light — the comparison is the point, and a cutout that hid it would
       be arguing with its own step. */
    shot: { on: 'seg:conf' },
    note: '$64.95 sits in the open and $6,699.90 sits confidential. The private half is the default here, not a mode you go and find.',
    beats: [
      { ms: 2800, do: 'bucket', arg: 'main' },
      { ms: 2800, do: 'bucket', arg: 'conf' },
    ],
  },
  {
    id: 'row', ch: 'assets',
    /* the leading beat with no `do` is the old `rows` step: it was a pause to
       read the list, and merging it here keeps that pause exactly where it was
       — it is now the hold the previous step ends on */
    title: 'Every balance arrives with a yield on it',
    note: 'Tether USD and two USD Coin balances, each wearing an Earn 5.8% chip. A row does not open a token page; it opens the four things you can do with the token, and Swap carries it through already filled in.',
    beats: [
      { ms: 3200 },
      { ms: 3000, do: 'actions', arg: 'USDT' },
      { ms: 3400, do: 'toSwap' },
    ],
  },

  {
    id: 'amount', ch: 'trade',
    title: 'The whole balance, to the last decimal',
    /* the balance line is six point-sizes down and hard right of a field the
       eye is already parked on; without the cutout this beat reads as the
       number appearing by itself */
    shot: { on: 'max' },
    callout: '6,635.616976 USDT',
    note: 'Tapping the balance fills every one of 6,635.616976 USDT. The quote underneath is priced off that figure, not off a rounded version of it.',
    beats: [{ ms: 3000, do: 'max' }, { ms: 2600 }],
  },
  {
    id: 'pick', ch: 'trade',
    title: 'Two letters, then the price stated three ways',
    /* letters landing in a field are the one thing on this screen that is
       genuinely small, and the cutout releases itself: `pick` closes the
       picker, the sheet stops being open, and the quote it reveals is read
       with the whole screen lit */
    shot: { on: 'search' },
    note: 'The search filters a real catalogue down to Near. What comes back is the rate, the 0.50% slippage you are accepting, and the number you receive if that slippage happens in full — the last of which is the only promise.',
    beats: [
      { ms: 2800, do: 'picker' },
      ...type_('search', 'Ne', 1900, 360),
      { ms: 2200, do: 'pick', arg: 'NEAR' },
      { ms: 3600 },
    ],
  },

  {
    id: 'sign', ch: 'sign',
    title: 'Signed with a passkey, not a seed phrase',
    note: 'The sheet restates both legs in full precision and repeats the same three rows. Nothing new is introduced at the moment of committing, and Face ID against the passkey saved for near.com is the whole signature.',
    beats: [
      { ms: 3000, do: 'review' },
      /* the hand has to cross the whole screen to the passkey button, and the
         sheet it is on is still sliding for the first half of that — so this
         lead stays where the step-by-step cut had it rather than growing with
         the rest */
      { ms: 3200, do: 'swap' },
      { ms: 1600, do: 'authOk' },
      { ms: 1400, do: 'step' },
      { ms: 1000, do: 'step' },
    ],
  },
  {
    id: 'settle', ch: 'sign',
    title: 'Three states, because the swap really has three',
    /* the figure is on screen for the whole moment — the settling view prints
       the outgoing leg and the incoming one, and `again` lands on the row that
       replaced Tether with the same number */
    callout: '3,535.3148 NEAR · $6,611.04',
    note: 'Finding best price, executing, complete. Then the wallet again, with 3,535.3148 NEAR standing where the Tether row was — and the two USD Coin balances untouched beneath it.',
    beats: [
      { ms: 1700, do: 'step' },
      { ms: 2000, do: 'step' },
      { ms: 1900, do: 'step' },
      { ms: 2600 },
      { ms: 3200, do: 'again' },
      { ms: 2800 },
    ],
  },

  {
    id: 'vault', ch: 'earn',
    title: 'The chip on the row opens the vault behind it',
    note: '5.80% APY on $854,153, with the deposit, withdrawal and performance fees stated before anything is asked for. Use max takes the whole leftover row, and it signs the way the swap signed.',
    beats: [
      { ms: 3000, do: 'vault' },
      { ms: 2800, do: 'vmax' },
      { ms: 2000 },
      { ms: 2600, do: 'deposit' },
      /* the same journey as the swap's signature, so it gets the same lead:
         this first `vstep` IS the passkey being pressed, not the network
         answering. The five after it are the network. */
      { ms: 1600, do: 'vstep' },
      { ms: 1300, do: 'vstep' },
      { ms: 1100, do: 'vstep' },
      { ms: 1700, do: 'vstep' },
      { ms: 1800, do: 'vstep' },
      { ms: 2000, do: 'vstep' },
    ],
  },
  {
    id: 'earned', ch: 'earn',
    title: 'One row lighter, and earning',
    callout: '41.723488 USDC · 5.80% APY',
    note: 'Closing returns to the wallet with the deposited balance gone from the list, because it is in the vault now and the total says so. A balance too small to think about is exactly the one worth automating.',
    beats: [{ ms: 2800, do: 'close' }, { ms: 3400 }],
  },
];

export const swapV4Flow = buildFlow<SW, SWAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  /**
   * Reduced motion gets one frame, and it should be the one that carries the
   * most claim. The step-by-step cut names `quote` for that; here `quote` was
   * merged into a moment that BEGINS with the picker sheet open, and a sheet
   * is a worse still than what is under it. `sign` opens on the review sheet
   * instead: both legs at full precision, the rate, the slippage and the
   * minimum received, all in one frame.
   */
  restStep: 'sign',
  outro: 5000,
  /**
   * The same anchors, re-pointed at the steps that swallowed the old ones.
   *
   * An anchor says where the playhead lands when a READER fires a transition
   * themselves, and the deck treats the named step's first beat as the thing
   * they just did — so it resumes from the beat after it. That is why every
   * entry here names the merged step that CONTAINS its original target rather
   * than the step that reads best: `vault` → the moment whose first beat is
   * `vault`, `close` → the moment whose first beat is `close`. Re-pointing
   * them by feel would leave a reader's tap resuming the script one
   * transition ahead of the guard that lets it through.
   */
  anchor: {
    toAssets: 'confidential',
    actions: 'row',
    toSwap: 'row',
    max: 'pick',
    picker: 'pick',
    pick: 'pick',
    review: 'sign',
    swap: 'sign',
    again: 'settle',
    vault: 'vault',
    vmax: 'vault',
    deposit: 'vault',
    close: 'earned',
  },
  /**
   * WHERE EACH TRANSITION IS PRESSED — the step-by-step cut's map, unchanged.
   *
   * The machine says what happens; this says where on the glass. The deck
   * resolves the NEXT beat's target while the clock is still counting down to
   * it, so the hand is already on the control when the state changes — which
   * is the whole difference between a screen using itself and a person using
   * it. None of that is a v4 concern, which is exactly why it is copied rather
   * than reconsidered: a marketing cut that quietly retargeted a press would
   * be a second answer to a question this repo has already answered once.
   *
   * `row:crypto` is the shell's own id for a balance row on the account card,
   * not this flow's: the card is shared by four demos and naming its rows here
   * would mean naming them four times.
   */
  target: (a, arg, s) => {
    switch (a) {
      case 'toAssets': return 'row:crypto';
      case 'bucket': return `seg:${arg}`;
      case 'actions': return `tok:${arg}`;
      case 'toSwap': return 'act:swap';
      case 'max': return 'max';
      case 'picker': return 'picker';
      case 'search': return 'search';
      case 'pick': return `pick:${arg}`;
      case 'review': return 'review';
      case 'swap': return 'swap';
      case 'authOk': return 'passkey';
      case 'again': return 'again';
      /* the chip is on every row that has a yield, but the deposit only ever
         comes out of the first USD Coin balance — see `vaultBal` */
      case 'vault': return 'chip:USDC';
      case 'vmax': return 'vmax';
      case 'deposit': return 'deposit';
      case 'close': return 'close';
      /* Five `step`s and six `vstep`s fire, and one press hides among them:
         the vault's first `vstep` IS the passkey button, where the swap's is
         spelled `authOk`. Everything after that is the network coming back,
         and a hand hovering over a checklist that is ticking itself is a lie
         about who is doing the work. */
      case 'step':
      case 'vstep': return s.over === 'passkey' && s.auth === 'ask' ? 'passkey' : null;
      default: return null;
    }
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
