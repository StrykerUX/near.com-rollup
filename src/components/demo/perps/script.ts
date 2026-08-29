import { applyBeat, type Beat, type Machine } from '@/components/stage/phone/flows/machine';
import { actions, initial, type PD, type PDAction } from './state';

/**
 * THE SCRIPT, WRITTEN AS STEPS
 * ==================================================================
 * The page has to do two things with the same timeline: play it, and let a
 * reader jump around inside it. So the beats are not one flat list — they are
 * grouped into named steps, each of which says what feature it is showing.
 *
 * A step's FIRST beat is its entrance: seeking to a step applies that beat at
 * once and starts the clock after it. Which is why the leading `ms` on a first
 * beat is the pause the PREVIOUS step gets to hold for — it costs nothing when
 * a reader jumps straight here.
 */

export type Chapter = { id: string; name: string; blurb: string };

export type Step = {
  id: string;
  ch: string;
  /** what this step is called in the rail */
  title: string;
  /** what the app is doing, and which number moved */
  note: string;
  beats: Beat<PD, PDAction>[];
};

export const CHAPTERS: Chapter[] = [
  { id: 'account', name: 'La cuenta', blurb: 'Una sola pantalla para custodia, perps y rendimiento.' },
  { id: 'market', name: 'El mercado', blurb: 'Precio, posiciones y el estado de tu cuenta de perps.' },
  { id: 'fund', name: 'Fondear', blurb: 'Mover saldo de near.com a la cuenta de perps, firmado con passkey.' },
  { id: 'ticket', name: 'El ticket', blurb: 'Tamaño, apalancamiento y tipo de orden.' },
  { id: 'protect', name: 'Protección', blurb: 'Take profit y stop loss, con las reglas que el mercado impone.' },
  { id: 'open', name: 'Abrir', blurb: 'Firmar y ver la orden liquidarse por partes.' },
  { id: 'position', name: 'La posición', blurb: 'Lo que queda vivo después de la orden.' },
  { id: 'back', name: 'De vuelta', blurb: 'El mismo saldo, visto desde la cuenta.' },
];

/** a digit run, typed rather than pasted */
const type_ = (act: PDAction, chars: string, lead = 900, gap = 165): Beat<PD, PDAction>[] =>
  chars.split('').map((c, i) => ({ ms: i === 0 ? lead : gap, do: act, arg: c }));

export const STEPS: Step[] = [
  /* ---- 1 · la cuenta ------------------------------------------------- */
  {
    id: 'balances', ch: 'account',
    title: 'Balances en una tarjeta',
    note: 'Crypto $7,811.50, Perps $86.99 y Earn $2,347.79 conviven en la misma cuenta. La fila de Perps anuncia su propia oferta: hasta 50x.',
    beats: [{ ms: 500 }],
  },
  {
    id: 'toperps', ch: 'account',
    title: 'Entrar a Perps',
    note: 'La fila es la puerta. No hay onboarding, ni una segunda app: el mercado abre sobre la misma cuenta.',
    beats: [{ ms: 3000, do: 'openPerps' }],
  },

  /* ---- 2 · el mercado ------------------------------------------------ */
  {
    id: 'chart', ch: 'market',
    title: 'BTC, precio y velas',
    note: 'Par arriba con su selector, precio y variación, velas con eje de precio a la derecha y marco temporal 1H abajo. Long y Short son lo único que pide la pantalla.',
    beats: [{ ms: 2900 }],
  },
  {
    id: 'tabs', ch: 'market',
    title: 'Positions · Orders · Trades',
    note: 'Las tres listas viven bajo el chart. Trades ya trae 26 operaciones; Positions está vacía y lo dice con todas sus letras.',
    beats: [
      { ms: 2600, do: 'tab', arg: 'trd' },
      { ms: 1900, do: 'tab', arg: 'ord' },
      { ms: 1700, do: 'tab', arg: 'pos' },
    ],
  },
  {
    id: 'myaccount', ch: 'market',
    title: 'My account',
    note: 'Equity $86.99, PNL sin realizar $0.00, margen en uso $0.00 y disponible $86.99. Con ese saldo no hay operación posible — de ahí sale Deposit.',
    beats: [{ ms: 2300, do: 'acct' }],
  },

  /* ---- 3 · fondear --------------------------------------------------- */
  {
    id: 'fund', ch: 'fund',
    title: 'Fund Perps Account',
    note: 'Mueve USDC de tu cuenta near.com a la de perps. El saldo que paga no tiene que ser USDC: aquí paga NEAR y la ruta convierte.',
    beats: [{ ms: 2700, do: 'deposit' }],
  },
  {
    id: 'amount', ch: 'fund',
    title: 'Cuánto, y con qué pagas',
    note: '$1,000 al teclado, y la fila «Pay NEAR» dice de dónde salen: $7,682 disponibles.',
    beats: [...type_('fkey', '1000', 2000), { ms: 900 }],
  },
  {
    id: 'review', ch: 'fund',
    title: 'Review send',
    note: 'La hoja pone el precio completo antes de firmar: recibe 1000 USDC, comisión 0 NEAR, pagas como máximo 539.096 NEAR, deslizamiento máximo 0.50%, ~22 segundos.',
    beats: [{ ms: 1700, do: 'fundReview' }],
  },
  {
    id: 'passkey', ch: 'fund',
    title: 'Firmar con passkey',
    note: 'No hay contraseña ni frase semilla: Face ID contra la passkey guardada para near.com. Nada se mueve hasta que esa firma vuelve.',
    beats: [
      { ms: 3000, do: 'fundSend' },
      { ms: 1100, do: 'authOk' },
      { ms: 1300, do: 'fstep' },
      { ms: 900, do: 'fstep' },
    ],
  },
  {
    id: 'settle', ch: 'fund',
    title: 'Processing · Sending · Complete',
    note: 'El envío se liquida por partes y cada parte se marca sola. Al cerrar la última, el saldo de perps pasa de $86.99 a $1,086.99.',
    beats: [
      { ms: 1500, do: 'fstep' },
      { ms: 2100, do: 'fstep' },
      /* the third tick is the one that closes the list AND lands the balance:
         FUND_STEPS has three rows, so `fstep` runs to 3 */
      { ms: 2000, do: 'fstep' },
      { ms: 1900 },
    ],
  },

  /* ---- 4 · el ticket ------------------------------------------------- */
  {
    id: 'toticket', ch: 'ticket',
    title: 'Long o Short',
    note: 'De vuelta al mercado, con $1,087 disponibles para operar. El lado que elijas abre el mismo ticket con distinto signo.',
    beats: [
      { ms: 2600, do: 'closeFund' },
      { ms: 2400, do: 'openTicket', arg: 'long' },
    ],
  },
  {
    id: 'size', ch: 'ticket',
    title: 'El tamaño es margen, no nocional',
    note: '$700 de los $1,087. Ese número es lo que arriesgas; el apalancamiento decide en qué se convierte.',
    beats: [...type_('key', '700', 1700, 190), { ms: 1100, do: 'done' }],
  },
  {
    id: 'lev', ch: 'ticket',
    title: 'Apalancamiento',
    note: 'La hoja mueve 10x a 20x y todo el ticket se recalcula: valor estimado de $7,000 a $14K, y la liquidación estimada sube de 7% a 2% por debajo de la entrada.',
    beats: [
      { ms: 1700, do: 'levSheet' },
      { ms: 1100, do: 'levSet', arg: '13' },
      { ms: 300, do: 'levSet', arg: '16' },
      { ms: 300, do: 'levSet', arg: '19' },
      { ms: 300, do: 'levSet', arg: '21' },
      { ms: 420, do: 'levSet', arg: '20' },
      { ms: 1500, do: 'levSave' },
    ],
  },
  {
    id: 'otype', ch: 'ticket',
    title: 'Market o Limit',
    note: 'El menú explica cada uno en una línea: al precio actual, o a un precio que tú pones. Limit abre un campo más — y el ticket no se envía sin él.',
    beats: [
      { ms: 2000, do: 'otypeMenu' },
      { ms: 3000, do: 'otypeMenu' },
    ],
  },

  /* ---- 5 · protección ------------------------------------------------ */
  {
    id: 'prot', ch: 'protect',
    title: 'Add profit taker / stop loss',
    note: 'Una casilla abre los dos campos. Ambos nacen en porcentaje: una distancia respecto a la entrada, no un precio.',
    beats: [{ ms: 2200, do: 'prot' }],
  },
  {
    id: 'unit', ch: 'protect',
    title: 'El ⇄ cambia la unidad',
    note: 'Y limpia el campo, que es lo correcto: 82000 significa una cosa como precio y ninguna como porcentaje.',
    beats: [...type_('key', '82000', 1500), { ms: 1600, do: 'unit', arg: 'tp' }],
  },
  {
    id: 'tperr', ch: 'protect',
    title: 'El take profit va arriba de la entrada',
    note: 'Con $2 el ticket se niega: «Take profit must be above entry price», y el botón deja de decir Open long para decir Review take profit. Corregido a $82,000, vuelve.',
    beats: [
      { ms: 1300, do: 'key', arg: '2' },
      { ms: 2600, do: 'key', arg: '⌫' },
      ...type_('key', '82000', 700, 175),
    ],
  },
  {
    id: 'slerr', ch: 'protect',
    title: 'El stop loss va abajo',
    note: '$79,974 queda por encima de la entrada de $79,654 — es la misma regla, invertida. A $78,200 el ticket acepta.',
    beats: [
      { ms: 1800, do: 'focus', arg: 'sl' },
      ...type_('key', '79974', 900),
      { ms: 2800, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      { ms: 130, do: 'key', arg: '⌫' },
      ...type_('key', '78200', 700, 180),
      { ms: 1200, do: 'done' },
    ],
  },

  /* ---- 6 · abrir ----------------------------------------------------- */
  {
    id: 'submit', ch: 'open',
    title: 'Open long',
    note: 'Otra passkey. La orden lleva tres cosas —apalancamiento, orden y protecciones— y las manda como una sola intención firmada.',
    beats: [
      { ms: 2400, do: 'submit' },
      { ms: 1200, do: 'ostep' },
      { ms: 1300, do: 'ostep' },
      { ms: 900, do: 'ostep' },
    ],
  },
  {
    id: 'checklist', ch: 'open',
    title: 'Set leverage · Submit order · Update TP/SL',
    note: 'La orden se liquida por partes y el checklist las marca en orden. Al cerrar la última, el ticket se vacía y la posición existe.',
    beats: [
      { ms: 1500, do: 'ostep' },
      { ms: 1500, do: 'ostep' },
      { ms: 1900, do: 'ostep' },
    ],
  },

  /* ---- 7 · la posición ----------------------------------------------- */
  {
    id: 'entry', ch: 'position',
    title: 'La entrada, dibujada',
    note: 'La línea azul de $79,654 queda en el chart y la barra de posición aparece bajo él, con Modify y Close a la mano.',
    beats: [{ ms: 2800 }],
  },
  {
    id: 'detail', ch: 'position',
    title: 'Tamaño, margen, liquidación',
    note: 'La barra se despliega: $14,000 de nocional, 0.17575 BTC, $700 de margen y el precio al que la posición se cierra sola.',
    beats: [{ ms: 2400, do: 'posOpen' }],
  },
  {
    id: 'orders', ch: 'position',
    title: 'Orders (2) y Trades (27)',
    note: 'El take profit y el stop loss no son ajustes: son dos órdenes vivas. Y la operación de apertura ya está en el historial.',
    beats: [
      { ms: 2800, do: 'tab', arg: 'ord' },
      { ms: 2400, do: 'tab', arg: 'trd' },
      { ms: 2400, do: 'tab', arg: 'pos' },
      /* the detail folds away here, not at the top of the next step: a step's
         first beat is what a reader lands on, and landing on "the balance seen
         from the account" should BE the account */
      { ms: 1800, do: 'posOpen' },
    ],
  },

  /* ---- 8 · de vuelta ------------------------------------------------- */
  {
    id: 'home', ch: 'back',
    title: 'El saldo, desde la cuenta',
    note: 'La misma tarjeta del principio: Perps ya no dice $86.99 sino $1,086.99, con su P&L sin realizar debajo.',
    beats: [{ ms: 1400, do: 'home' }],
  },
];

/* ---- flattening ------------------------------------------------------- */

export const BEATS: Beat<PD, PDAction>[] = STEPS.flatMap((s) => s.beats);

/** the beat index each step starts at */
export const STARTS: number[] = (() => {
  const out: number[] = [];
  let n = 0;
  for (const s of STEPS) {
    out.push(n);
    n += s.beats.length;
  }
  return out;
})();

/** which step a beat index belongs to */
export function stepOf(i: number) {
  if (i < 0) return 0;
  let k = 0;
  for (let j = 0; j < STARTS.length; j++) if (STARTS[j] <= i) k = j;
  return k;
}

/**
 * WHERE A READER'S GESTURE LANDS.
 *
 * Firing an anchored transition moves the playhead to that step, so the script
 * resumes from what the reader just did instead of yanking the screen back to
 * its own place. That single behaviour is the difference between a demo that
 * lets you touch it and one that fights you.
 */
const ANCHOR: Partial<Record<PDAction, string>> = {
  openPerps: 'toperps',
  acct: 'myaccount',
  deposit: 'fund',
  fundReview: 'review',
  fundSend: 'passkey',
  closeFund: 'toticket',
  openTicket: 'size',
  levSheet: 'lev',
  levSave: 'otype',
  otypeMenu: 'otype',
  prot: 'unit',
  unit: 'tperr',
  submit: 'checklist',
  posOpen: 'detail',
  home: 'home',
  closePos: 'home',
};

const stepIndex = (id: string) => STEPS.findIndex((s) => s.id === id);

export const anchor: Partial<Record<PDAction, number>> = Object.fromEntries(
  Object.entries(ANCHOR).map(([a, id]) => [a, STARTS[stepIndex(id)]]),
) as Partial<Record<PDAction, number>>;

/**
 * The machine, assembled. `guided` is deliberately wide open: this page's
 * whole promise is that you can touch it, and the anchors above are what keeps
 * that from breaking the story. The guards in `state.ts` are the only thing
 * that ever refuses.
 */
export const MACHINE: Machine<PD, PDAction> = {
  initial,
  actions,
  beats: BEATS,
  restFrame: STARTS[stepIndex('detail')],
  outro: 4200,
  guided: () => Object.keys(actions) as PDAction[],
  anchor,
  /* the two settlements tick on their own when no clock is running */
  auto: (s) => {
    if (s.screen === 'funding' && s.fstep < 3) return { after: 1500, do: 'fstep' };
    if (s.over === 'passkey' && s.auth !== 'done') return { after: 1100, do: s.submitting ? 'ostep' : 'fstep' };
    if (s.over === 'passkey' && s.auth === 'done') return { after: 700, do: s.submitting ? 'ostep' : 'fstep' };
    if (s.submitting && s.over === 'none') return { after: 1500, do: 'ostep' };
    return null;
  },
};

/** the state at a given beat index — the pure function the page rides */
export function frameAt(i: number): PD {
  let s = { ...initial };
  for (let k = 0; k <= i && k < BEATS.length; k++) s = applyBeat(MACHINE, s, BEATS[k]);
  return s;
}
