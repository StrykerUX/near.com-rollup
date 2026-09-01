import { buildFlow, typing, type Chapter, type Step } from '@/components/demo/shell/flow';
import { actions, initialFunded, type PD, type PDAction } from '@/components/demo/perps/state';

/**
 * PERPS v4 — the cut you would put in front of a room
 * ==================================================================
 * Same machine again. What changes is the camera and the copy.
 *
 * The other three versions explain. This one SHOWS: eight moments, a line of
 * copy beside the phone instead of a rail of notes under it, and — on three of
 * them — everything but the subject darkened.
 *
 * THREE, NOT EIGHT. `shot` was on almost every step once, and an effect that
 * arrives every time stops meaning anything: it becomes the house style rather
 * than an instruction. It is kept for the moments where a reader would
 * otherwise be looking at the wrong half of the screen — a number being typed,
 * a figure travelling, a refusal appearing under a field. The rest are carried
 * by what the UI does on its own: a sheet arriving, a box ticking, a signature
 * rising.
 *
 * The beats are longer than anywhere else. A push in, a hold, a pull back is
 * three seconds of screen time on its own, and a cut that lands before the eye
 * has arrived is a cut nobody saw.
 */

const type_ = (act: PDAction, chars: string, lead?: number, gap?: number) =>
  typing<PD, PDAction>(act, chars, lead, gap);

/* the chapter is the eyebrow over the headline, so each one names the moment
   its own steps are in rather than the section they were filed under */
const CHAPTERS: Chapter[] = [
  { id: 'market', name: 'The market', blurb: '' },
  { id: 'size', name: 'Size and leverage', blurb: '' },
  { id: 'protect', name: 'The exits', blurb: '' },
  { id: 'sign', name: 'Signing', blurb: '' },
  { id: 'live', name: 'Live', blurb: '' },
];

const STEPS: Step<PD, PDAction>[] = [
  {
    id: 'market', ch: 'market',
    title: 'A price, and two decisions',
    note: 'Perpetuals on the same account that holds everything else. No separate app, no bridge, no deposit to wait for.',
        beats: [{ ms: 3000 }],
  },
  {
    id: 'long', ch: 'market',
    title: 'Pick a side',
    note: 'Long or short. The same ticket, with the sign reversed.',
    beats: [{ ms: 3200, do: 'openTicket', arg: 'long' }],
  },

  {
    id: 'size', ch: 'size',
    title: '$5,000 of margin',
    note: 'The number you type is the number you can lose. Everything else on this screen is derived from it.',
    shot: { on: 'field' },
    beats: [...type_('key', '5000', 2200, 380), { ms: 1800, do: 'done' }],
  },
  {
    id: 'lev', ch: 'size',
    title: 'Twenty times the position',
    note: 'The same $5,000 at risk, controlling a hundred thousand dollars of Bitcoin. The figure travels so you can watch it happen.',
    /* the row, not the figure inside it: with nothing scaling, a cutout can
       hold the label and its number together and still be the only lit thing */
    shot: { on: '.dlevnot' },
    callout: '$5,000 → $100,000',
    beats: [
      { ms: 2600, do: 'levSheet' },
      { ms: 1600, do: 'levSet', arg: '14' },
      { ms: 380, do: 'levSet', arg: '18' },
      { ms: 380, do: 'levSet', arg: '20' },
      { ms: 2400, do: 'levSave' },
    ],
  },

  {
    id: 'prot', ch: 'protect',
    title: 'Both exits, before you are in',
    note: 'One checkbox opens the pair. Where to leave when it works, and where to leave when it does not.',
    beats: [{ ms: 3000, do: 'prot' }, { ms: 1600, do: 'unit', arg: 'tp' }],
  },
  {
    id: 'rule', ch: 'protect',
    title: 'The ticket refuses what the market would',
    note: 'A take profit below the entry is an instruction to close at a loss. The button names the field instead of just going grey.',
    shot: { on: 'field' },
    callout: 'Refused',
    beats: [
      { ms: 2200, do: 'key', arg: '2' },
      { ms: 3400, do: 'key', arg: '⌫' },
      ...type_('key', '80654', 1300, 380),
      { ms: 2200, do: 'focus', arg: 'sl' },
      ...type_('key', '79154', 1400, 380),
      { ms: 1800, do: 'done' },
    ],
  },

  {
    id: 'sign', ch: 'sign',
    title: 'One signature for all of it',
    note: 'The leverage, the order and both exits go as a single signed intent. No password, no seed phrase.',
    beats: [
      { ms: 2800, do: 'submit' },
      { ms: 2000, do: 'ostep' },
      { ms: 1700, do: 'ostep' },
      { ms: 1300, do: 'ostep' },
      { ms: 1900, do: 'ostep' },
      { ms: 1900, do: 'ostep' },
      { ms: 2300, do: 'ostep' },
    ],
  },
  {
    id: 'open', ch: 'live',
    title: 'Both exits on the chart, and one of them met',
    note: 'The entry, the stop five hundred below it and the take profit a thousand above — two to one. The market walks up into the green line, which is the only proof a bracket was ever worth setting.',
        callout: 'Long 20x · $100,000',
    beats: [
      { ms: 3000 }, { ms: 3000, do: 'posOpen' },
      /* the climb is 22,500 REAL ms; beats run at PACE, so the fill sits at
         22,500 / 1.25 = 18,000 of script time from the open, less the 6,000
         already spent above. Checked by `pnpm check:flows`. */
      { ms: 12000, do: 'tpFill' }, { ms: 6000 },
    ],
  },
];

export const perpsV4Flow = buildFlow<PD, PDAction>({
  initial: initialFunded,
  actions,
  chapters: CHAPTERS,
  steps: STEPS,
  restStep: 'open',
  outro: 5200,
  anchor: {
    openTicket: 'size',
    levSheet: 'lev',
    levSave: 'prot',
    prot: 'rule',
    unit: 'rule',
    submit: 'sign',
    posOpen: 'open',
    tpFill: 'open',
  },
  target: (a, arg, s) => {
    switch (a) {
      case 'openTicket': return `side:${arg}`;
      case 'key': case 'done': case 'focus': return 'field';
      case 'levSheet': return 'lev';
      case 'levSet': return 'levslider';
      case 'levSave': return 'save';
      case 'prot': return 'prot';
      case 'unit': return `unit:${arg ?? 'tp'}`;
      case 'submit': return 'submit';
      case 'ostep': return s.over === 'passkey' && s.auth === 'ask' ? 'passkey' : null;
      case 'posOpen': return 'posbar';
      case 'tpFill': return 'posbar';
      default: return null;
    }
  },
  auto: (s) => {
    if (s.over === 'passkey') return { after: s.auth === 'done' ? 900 : 1300, do: 'ostep' };
    if (s.submitting && s.over === 'none') return { after: 1900, do: 'ostep' };
    return null;
  },
});
