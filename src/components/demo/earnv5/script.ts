import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { DEPOSIT, INTO, actions, initial, type EA, type EAAction } from './state';

/**
 * EARN — THE SHORT CUT
 * ==================================================================
 * The brief, in four lines:
 *
 *   the earn page, already loaded, Vaults tab, a list with asset and rate
 *   pick a vault, enter 15,000 USDC, one press to confirm
 *   flick to Staking: 20,000 NEAR already staked, accruing. No new flow.
 *   a positions view showing both, and loop
 *
 * THE FIRST TWO ARE THE RECORDING. The last two are not, and `state.ts` says
 * so beside each figure: forty-eight frames and the Staking tab is never
 * opened, and no frame anywhere shows a third tab.
 *
 * THE ARITHMETIC. Beats play at `PACE` (1.25); `check:flows` asserts it.
 *
 *   scene 1    2,600ms   the page, and two vaults with their rates
 *   scene 2    2,800ms   a vault, and fifteen thousand into it
 *   scene 3    3,380ms   one press
 *   scene 4    2,900ms   the tab flick
 *   scene 5    3,100ms   both positions
 *   outro      4,000ms   the same frame again, for the loop
 *   ─────────────────
 *             18,780ms  ×1.25 = 23,475ms on screen
 */

const type_ = (act: EAAction, chars: string, lead?: number, gap?: number) =>
  typing<EA, EAAction>(act, chars, lead, gap);

const CHAPTERS: Chapter[] = [
  { id: 'page', name: 'The vaults', blurb: '' },
  { id: 'in', name: 'Into one', blurb: '' },
  { id: 'sign', name: 'One press', blurb: '' },
  { id: 'stake', name: 'And the stake', blurb: '' },
];

const STEPS: Step<EA, EAAction>[] = [
  /* ---- scene 1 · 2,600ms ----------------------------------------------
     One beat. Two rows, each carrying its TVL and its rate under the name,
     which is the whole of what the brief asks this screen to say. */
  {
    id: 'page', ch: 'page',
    title: 'Two vaults, and what they pay',
    note: 'Professionally managed, with the rate on the row — and the balance you already hold in each on the right.',
    beats: [{ ms: 2600 }],
  },

  /* ---- scene 2 · 2,800ms ---------------------------------------------- */
  {
    id: 'in', ch: 'in',
    title: 'Fifteen thousand into one',
    note: 'The sheet is the vault’s whole disclosure — who runs it, what it holds, and all three fees before a figure is typed.',
    beats: [
      { ms: 620, do: 'openVault', arg: INTO },
      ...type_('key', DEPOSIT, 420, 160),
      /* the rest after the value lands, as everywhere in this family */
      { ms: 500 },
      { ms: 620, do: 'confirm' },
    ],
  },

  /* ---- scene 3 · 3,380ms ----------------------------------------------
     `step` runs one past the last row so all three read as done before the
     sheet goes — and the fourth press is what closes it and lands the money. */
  {
    id: 'sign', ch: 'sign',
    title: 'Confirmed, and it is in',
    note: 'Confirm in wallet, depositing, deposited — and the vault’s balance carries it on the way out.',
    beats: [
      { ms: 620, do: 'step' },
      { ms: 620, do: 'step' },
      { ms: 620, do: 'step' },
      { ms: 620, do: 'step' },
      { ms: 900 },
    ],
  },

  /* ---- scene 4 · 2,900ms ----------------------------------------------
     "No new flow, just the tab flick" — so it is one gesture and then a hold.
     Nothing here is on film; see STAKED_NEAR in state.ts. */
  {
    id: 'stake', ch: 'stake',
    title: 'Already staked, already accruing',
    note: 'Twenty thousand NEAR, staked and earning, on the other tab. No flow to run — it has been working the whole time.',
    beats: [
      { ms: 700, do: 'tab', arg: 'staking' },
      { ms: 2200 },
    ],
  },

  /* ---- scene 5 · 3,100ms ---------------------------------------------- */
  {
    id: 'both', ch: 'stake',
    title: 'Both, on one screen',
    note: 'Fifteen thousand in the vault and twenty thousand staked, side by side — which is the chapter’s whole claim.',
    beats: [
      { ms: 700, do: 'tab', arg: 'positions' },
      { ms: 2400 },
    ],
  },
];

export const earnV5Flow = buildFlow<EA, EAAction>({
  initial,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  /* reduced motion gets the frame both positions are on */
  restStep: 'both',
  outro: 4000,
  anchor: {
    openVault: 'in',
    confirm: 'sign',
    step: 'sign',
    tab: 'stake',
  },
  /* a settlement is not waiting for anyone */
  auto: (s) => (s.submitting ? { after: 620, do: 'step' } : null),
});
