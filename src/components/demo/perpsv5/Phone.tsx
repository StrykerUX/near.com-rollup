'use client';
import { useCallback, useRef } from 'react';
import { Chart } from '@/components/stage/phone/ui/Chart';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { Count } from '@/components/demo/shell/Count';
import { Layer } from '@/components/demo/shell/Frame';
import { PALETTE, PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  CANDLE_MS, JITTER, MARK, PHASE, REACH, TAPE, TICK, WICK_BIAS, ORDERS_0, ORDER_STEPS, TRADES_0, avail, btcSize, cta, liqPct, liqPrice, money,
  notional, pnl, pnlPct, slBad, tpBad, type BD, type BDAction, type Position,
} from './state';

type Deck = GenericDeck<BD, BDAction>;

/**
 * PERPS v5 — THE DEVICE, AS A COPY RATHER THAN A RENDERING
 * ==================================================================
 * The other four perps devices are ARGUMENTS about the app: v3 in particular
 * removes half the screen on purpose, because what it is showing is a trade
 * and the lists under the chart are where a trade lands. This one makes the
 * opposite claim — that this is what the app looks like — so everything those
 * versions earned the right to drop is back:
 *
 *   the chrome (back, the badge, the wallet)     the time axis under the chart
 *   the price axis and its live chip             the 1H / chart-type row
 *   Positions · Orders · Trades, with counts     Modify and Close
 *   the position card, opened                    Est. trade value on the ticket
 *
 * Which means the one rule this file is under is different from theirs: where
 * a reference frame and a tidier idea disagree, the frame wins. A screen whose
 * whole pitch is fidelity does not get to improve the thing it is copying.
 *
 * IT IS SET IN FIGTREE, and it is the only surface in the repo that is. The
 * other twelve devices are in Montreal by an explicit decision (`b2c10ab`);
 * that decision was about the site's voice, and this screen is not speaking in
 * the site's voice. See `.pdev.app` in 24-demo-app.css.
 */

const BTC = findToken('BTC');
/* the canvas has no stylesheet to inherit from, so the axis is told the same
   face the rest of the device is set in — see `face` on <Chart>. Tabular
   figures: the live chip is rewritten every frame and a proportional 1 makes
   the label twitch sideways under a price that has not moved. */
/**
 * LUCIDE, INLINED (ISC) — `lucide-static@1.38.0`.
 *
 * EVERY MARK ON THIS DEVICE THAT IS AN ICON IS ONE OF THESE. They were four
 * different kinds of not-an-icon, and each failed the same way:
 *
 *   `⌄`  MODIFIER LETTER DOWN ARROWHEAD — not a chevron, a phonetic letter.
 *        Every family draws it at its own weight, size and baseline, so the
 *        five disclosure arrows on this screen were five slightly different
 *        marks, none of them aligned to the text beside them.
 *   `⇄`  a text glyph again, and one Figtree has no strong opinion about.
 *   `~`  a hand-drawn polyline that had to be read twice before it said chart.
 *   `✓`  drawn in CSS out of two rotated borders — precise, and impossible to
 *        restyle, recolour or resize without redoing the trigonometry.
 *
 * One 24-grid path set each, inlined the way the repo already keeps its icons
 * (`phone/icons.tsx`, `TAB_ICONS` in the shell). A package for five glyphs is
 * a tree to shake for a handful of `d` attributes.
 *
 * The spinner stays CSS. It is a rotating stroke rather than a glyph, and a
 * border with an `animation` is both smaller and smoother than a path being
 * transformed.
 */
function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('|').map((p) => <path key={p} d={p} />)}
    </svg>
  );
}
/** lucide `chevron-down` */
const CHEV = 'm6 9 6 6 6-6';
/** lucide `chart-line` — the control switches the chart's type */
const CHART_KIND = 'M3 3v16a2 2 0 0 0 2 2h16|m19 9-5 5-4-4-3 3';
/** lucide `arrow-right-left` — the unit swap on a protection field */
const SWAP = 'm16 3 4 4-4 4|M20 7H4|m8 21-4-4 4-4|M4 17h16';
/** lucide `check` — the "add profit taker/stop loss" box, once it is ticked */
const CHECK = 'M20 6 9 17l-5-5';

const AXIS_FACE = '\'Figtree\', "Helvetica Neue", Arial, sans-serif';
const usd = (v: number, dp = 2) => '$' + fmt(v, dp);
/** a signed figure, in the app's own spelling: a true minus, never a hyphen */
const signed = (v: number, dp = 2) =>
  (v >= 0 ? '+' : '−') + '$' + fmt(Math.abs(v), dp);
const signedPct = (v: number, dp = 2) =>
  (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(dp) + '%';

export function Phone({ d }: { d: Deck }) {
  return (
    <div className="pdev app" data-motion="rich" data-tempo="fast" style={PALETTE_VARS}>
      {/* NO STATUS BAR AT ALL — no clock, no signal, no battery, and no notch.
          It is the one block on this device that is not the product: forty-four
          pixels at the top of a 766px screen spent simulating an operating
          system, in a cut whose whole job is to show an app. The reference
          frames are crops and have none of it either.

          The notch went last and is worth its own line. It is device chrome
          rather than status chrome, so it survived the first pass — but a
          Dynamic Island with nothing beside it is a phone bezel drawn INSIDE a
          phone bezel, and `.pdev` already carries the radius, the border and
          the shadow that say "this is a device". Two of them is one too many.

          The forty-four pixels go where the cut needed them: `.bchart` and
          `.blist` are both `flex: 1`, so the chart gets some air and the list
          finally has room to show that a SECOND position arrived, which is the
          frame the whole clip is spent earning. */}
      <Chrome d={d} />
      <div className="pdview">
        <Market d={d} />
      </div>

      <Ticket d={d} />
      <LevSheet d={d} />
    </div>
  );
}

/* ---- the chrome -------------------------------------------------------- */

/**
 * The row above the pair. In the reference frame it holds a back chevron, a
 * notification badge and a wallet — and nothing that says what the account is
 * worth, because in the app that lives a tap away behind the wallet.
 *
 * The balance chip is the one addition, and it is deliberate: the cut opens on
 * a position that has $6,000 of margin posted against it, and "what is left"
 * is the figure that makes the second trade legible before the ticket is even
 * open. Putting it in the corner is the cheapest place to say it — the ticket
 * says it again, in the app's own words, four hundred milliseconds later.
 */
function Chrome({ d }: { d: Deck }) {
  return (
    <div className="bchrome">
      <span className="bback" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5.5L8 12l6.5 6.5" /></svg>
      </span>
      <span className="bspace" />
      {/* the figure travels, because it is about to be spent */}
      <span className="bbal">
        <i>Available</i>
        <Count className="bbalv" value={avail(d.s)} dp={2} prefix="$" ms={960} />
      </span>
      {/* THE WALLET, FROM LUCIDE (ISC) — `lucide-static@1.38.0`, icon `wallet`,
          inlined rather than depended on. It is one 24-grid path pair and the
          repo already keeps its icons this way (`phone/icons.tsx`, `TAB_ICONS`
          in the shell); a package for a single glyph would be 400KB of tree to
          shake for two `d` attributes.

          The one it replaces was drawn by hand here and did not read as a
          wallet — a rounded rect with a bar through it is a card, or a
          database. An icon a viewer has to decode is worse than no icon, and
          this is a screen whose whole claim is that it looks like the app. */}
      <span className="bwallet" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
          <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
      </span>
    </div>
  );
}

/* ---- the market -------------------------------------------------------- */

function Market({ d }: { d: Deck }) {
  const { s } = d;
  const long = d.can('openTicket', 'long');
  const short = d.can('openTicket', 'short');

  /* the quote, the change and every position's P&L are written by the chart,
     off the candles it is actually drawing. One walk, one price — the fastest
     way to make a mock read as a mock is a header that disagrees with the
     candles under it. */
  const price = useRef<HTMLSpanElement>(null);
  const change = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const book = s.book;

  /**
   * The chart hands this the PRINTED quote, not the market — see `tick` on
   * <Chart>. So the P&L inherits the tape for free: it can only change when the
   * quote crosses fifty cents, and between crossings it computes the identical
   * figure and the guard below throws the write away.
   *
   * WRITE-IF-CHANGED IS NOT AN OPTIMISATION HERE, IT IS THE MECHANISM. Setting
   * `textContent` to a string it already holds still tears the text node down
   * and builds it again, so without the guard the DOM would churn at sixty
   * hertz under a number that had not moved — which is the exact thing the tick
   * was added to stop. It is the rule `stage/domCache.ts` enforces one level up.
   */
  const onTick = useCallback((quote: number) => {
    const el = wrap.current;
    if (!el) return;
    const put = (n: HTMLElement, text: string, v: number) => {
      if (n.textContent !== text) n.textContent = text;
      n.classList.toggle('bdown', v < 0);
      n.classList.toggle('bup', v >= 0);
    };
    /* every P&L on screen belongs to a position in the book and is keyed by
       its index, so the bar at the top and the card in the list are literally
       the same arithmetic rather than two copies of it */
    el.querySelectorAll<HTMLElement>('[data-pnl]').forEach((n) => {
      const p = book[Number(n.dataset.pnl)];
      if (!p) return;
      const v = pnl(p, quote);
      put(n, signed(v), v);
    });
    el.querySelectorAll<HTMLElement>('[data-pnlp]').forEach((n) => {
      const p = book[Number(n.dataset.pnlp)];
      if (!p) return;
      const v = pnlPct(p, quote);
      put(n, signedPct(v), v);
    });
  }, [book]);

  /* the market holds still while a protection field is being typed into: both
     rules are enforced against a fixed entry, and a quote walking under them
     makes a refusal look arbitrary instead of legible */
  const paused = s.focus === 'tp' || s.focus === 'sl';
  const head = book[0];

  return (
    <div className="bmkt" ref={wrap}>
      <div className="bpair">
        <TokenDot token={BTC} size={34} />
        <span className="bpairt"><b>BTC</b><em>Bitcoin</em></span>
        <Icon d={CHEV} className="bcv bchev" />
      </div>

      <div className="bpx">
        <span className="bpxv" ref={price}>${fmt(MARK, 1)}</span>
        <span className="bpxd" ref={change}>&minus;$46.50  &minus;0.06%</span>
      </div>

      <div className="bchart">
        <Chart
          /* KEYED TO THE LOOP PASS. The chart keeps its own clock and the deck
             does not remount anything when it starts over, so without this a
             rolling window would open pass two several candles further along
             and draw a different market from the same script — and the drift
             below, which is unbounded by design, would accumulate for as long
             as the tab stayed open. Remounted, every pass is the first pass. */
          key={d.pass}
          base={MARK}
          roll
          phase={PHASE}
          tick={TICK}
          candleMs={CANDLE_MS}
          reach={REACH}
          wickBias={WICK_BIAS}
          jitter={JITTER}
          tape={TAPE}
          up={PALETTE.up}
          down={PALETTE.down}
          face={AXIS_FACE}
          /* ONE LINE PER POSITION, newest first — the whole book, not its head.
             Handing the chart only `book[0]` meant the first position's line
             vanished the instant a second trade landed, so what a viewer saw
             was one blue line MOVING: the position changed price, which is the
             opposite of what happened. */
          entry={s.book.map((p) => p.entry)}
          side={head?.side ?? null}
          /**
           * THE BRACKET GOES ON THE CHART, because a trade that was set and
           * cannot be seen is the ending failing to happen. Before the order
           * lands there is nothing to draw; after it, the entry moves to the
           * new position and its two exits appear either side — which is the
           * only thing on screen that says a SECOND trade exists rather than
           * the first one having shifted.
           *
           * These lines join the price scale so they can be seen, and that is
           * exactly why the exits had to be resized rather than hidden: see
           * TAKE_PROFIT in state.ts.
           */
          tp={head?.tp ?? null}
          sl={head?.sl ?? null}
          live
          paused={paused}
          readout={{ price, change, onTick }}
        />
        <span className="btv" aria-hidden="true">
          <svg viewBox="0 0 36 22" fill="currentColor">
            <path d="M0 0h14.4v4.8H9.6V22H4.8V4.8H0z" />
            <path d="M17.2 0H36v4.8H17.2z" />
            <path d="M28.8 7.6H36L27.4 22h-7.2z" />
          </svg>
        </span>
      </div>

      <div className="btime" aria-hidden="true"><i>:00</i><i>10:30</i><b>11:00</b></div>

      <div className="btools">
        <span className="btf">1H <Icon d={CHEV} className="bcv" /></span>
        <Icon d={CHART_KIND} className="bkind" />
      </div>

      {s.book.length ? <PositionBar d={d} /> : null}

      {/**
        * ONE SLOT, TWO ROWS, AND THE BOOK DECIDES WHICH.
        *
        * The reference frames show Long/Short on an empty market and
        * Modify/Close once a position is on — the second row is drawn where
        * the first one was. Rendering both, as the layout first did, puts 142
        * pixels of buttons under a 352-wide chart and pushes the list that the
        * whole ending lands in off the bottom of the device.
        *
        * So they share the slot, and the switch is the book being full: while
        * there is still a trade to open the row offers to open one, and on the
        * last frame — when there is not — it offers the two things you can do
        * with what you have. Which is also the ending: the cut closes on the
        * screen admitting it has nothing left to sell you.
        */}
      {s.book.length < 2 ? (
        <div className="bsides">
          <span className={'bside long' + live(long)} {...press(long)} data-tap="side:long">Long</span>
          <span className={'bside short' + live(short)} {...press(short)} data-tap="side:short">Short</span>
        </div>
      ) : (
        <div className="bposact">
          <span className="bact modify">Modify</span>
          <span className="bact close">Close</span>
        </div>
      )}

      <Book d={d} />
    </div>
  );
}

/**
 * THE BAR UNDER THE CHART, which is the app's summary of what you are in. It
 * shows the FIRST position rather than a net of the book: netting two longs
 * into one line is what a risk engine does and not what this screen does, and
 * the reference frame is unambiguous that the bar names a side and a leverage.
 */
function PositionBar({ d }: { d: Deck }) {
  const { s } = d;
  const p = s.book[0];
  if (!p) return null;
  const open = d.can('posOpen');
  return (
    <div className="bposbar">
      <div className={'bposh' + live(open)} {...press(open)} data-tap="posbar">
        <span className="bposl">Position: <b className={p.side}>{p.side === 'long' ? 'Long' : 'Short'} {p.lev}x</b></span>
        <span className="bposp">
          <b data-pnl="0">{signed(pnl(p, MARK))}</b>
          <i data-pnlp="0" className="bpct">{signedPct(pnlPct(p, MARK))}</i>
        </span>
        <Icon d={CHEV} className={'bcv bposc' + (s.posOpen ? ' on' : '')} />
      </div>
    </div>
  );
}

/* ---- the three lists --------------------------------------------------- */

/**
 * The tab row counts, and the counts MOVE. A trade that lands without the row
 * above the list noticing is the detail that gives a mock away — and a bracket
 * is two resting orders, not one, so Orders gains two where Positions gains
 * one and Trades gains one.
 */
function Book({ d }: { d: Deck }) {
  const { s } = d;
  const extra = s.book.length - 1;
  const counts = {
    pos: s.book.length,
    ord: ORDERS_0 + extra * 2,
    trd: TRADES_0 + extra,
  };
  const TABS: [BD['tab'], string][] = [['pos', 'Positions'], ['ord', 'Orders'], ['trd', 'Trades']];

  return (
    <div className="bbook">
      <div className="btabs" role="tablist">
        {TABS.map(([k, label]) => {
          const on = d.can('tab', k);
          return (
            <span key={k} role="tab" aria-selected={s.tab === k}
                  className={'btab' + (s.tab === k ? ' on' : '') + live(on)}
                  {...press(on)} data-tap={'tab:' + k}>
              {label} <i>({counts[k]})</i>
            </span>
          );
        })}
      </div>

      <div className="blist">
        {s.book.map((p, i) => (
          /* keyed by ENTRY, not by index. The new position is unshifted onto
             the front of the list, so an index key would hand card 0's
             identity — and its entrance — to the card that was already there,
             and the one row that just arrived would be the one row that does
             not animate. */
          <Enter k={`${d.pass}:${p.entry}`} className="brow" key={p.entry}>
            <PositionCard p={p} i={i} />
          </Enter>
        ))}
      </div>
    </div>
  );
}

function PositionCard({ p, i }: { p: Position; i: number }) {
  const qty = p.size / p.entry;
  return (
    <div className="bcard">
      <div className="bcardh">
        <TokenDot token={BTC} size={30} />
        <span className="bcardt"><b>BTC</b><em>{p.side === 'long' ? 'Long' : 'Short'} {p.lev}x</em></span>
        <span className="bcardp">
          <b data-pnl={i}>{signed(pnl(p, MARK))}</b>
          <i data-pnlp={i} className="bpct">{signedPct(pnlPct(p, MARK))}</i>
        </span>
      </div>
      <dl className="bcardd">
        <div>
          <dt>Value</dt>
          <dd>{money(p.size)} <i>{qty.toFixed(5)} BTC</i></dd>
        </div>
        <div>
          <dt>Entry price</dt>
          <dd>{usd(p.entry, 0)}</dd>
        </div>
        <div>
          <dt>Liquidation</dt>
          <dd>{usd(liqPrice(p.entry, p.lev, p.side))} <i>{(liqPct(p.lev) * 100).toFixed(1)}% below</i></dd>
        </div>
      </dl>
    </div>
  );
}

/* ---- the ticket -------------------------------------------------------- */

function Ticket({ d }: { d: Deck }) {
  const { s } = d;
  const c = cta(s);
  const submit = d.can('submit');

  return (
    <Layer open={s.ticket} onScrim={d.can('closeTicket')}>
      <div className="dsheet btk">
        <span className="dgrab" />

        <div className="btkhead">
          <div className="bseg">
            {(['long', 'short'] as const).map((k) => {
              const on = d.can('side', k);
              return (
                <span className={'bsg ' + k + (s.side === k ? ' on' : '') + live(on)} key={k}
                      {...press(on)} data-tap={'seg:' + k}>
                  {k === 'long' ? 'Long' : 'Short'}
                </span>
              );
            })}
          </div>
          {/* Market is a chip and not a switch in this cut. The order type is a
              second story and there is no room for it; a control that opened
              nothing would be worse than one that is plainly just a label, so
              it carries no `can` and gets no pointer. */}
          <span className="botype">Market <Icon d={CHEV} className="bcv" /></span>
        </div>

        <div className="bavail">
          <span>Available to trade</span>
          <b><Count value={avail(s)} dp={2} prefix="$" ms={960} /></b>
          <i className="bmax">Max</i>
        </div>

        <div className="bamt">
          <span className="bflab">Amount</span>
          <div className="bamtr">
            <span className={'bfin' + (s.focus === 'amount' ? ' on' : '') + live(d.can('focus', 'amount'))}
                  {...press(d.can('focus', 'amount'))}
                  data-tap={s.focus === 'amount' ? 'field' : undefined}>
              <i className="bcur">$</i>
              <b>{s.amount}</b>
              {s.focus === 'amount' ? <i className="bcaret" /> : null}
            </span>
            <span className={'blev' + live(d.can('levSheet'))} {...press(d.can('levSheet'))}
                  data-tap="lev">{s.lev}x <Icon d={CHEV} className="bcv" /></span>
          </div>
        </div>

        <span className={'bchk' + (s.prot ? ' on' : '') + live(d.can('prot'))} {...press(d.can('prot'))}
              data-tap="prot">
          <i className="bbox"><Icon d={CHECK} className="btick" /></i>Add profit taker/stop loss
        </span>

        {s.prot ? (
          <>
            <Protect d={d} which="tp" label="Take profit" bad={tpBad(s)}
                     err="Take profit must be above entry price" />
            <Protect d={d} which="sl" label="Stop loss" bad={slBad(s)} delay={70}
                     err="Stop loss must be below entry price" />
          </>
        ) : null}

        {s.submitting ? (
          <>
            <span className="bcta off"><i className="bspin" /></span>
            <div className="bochk"><ProgressList steps={ORDER_STEPS} at={s.ostep} /></div>
          </>
        ) : (
          <span className={'bcta' + (c.ok ? '' : ' off') + live(submit)} {...press(submit)}
                data-tap="submit">{c.label}</span>
        )}

        {/* the app's own footer on this sheet, and the one line that says what
            the leverage did. Both figures travel — that trip IS the feature. */}
        <div className="best">
          <span>Est. trade value</span>
          <Count className="bestv" value={notional(s)} prefix="$" ms={780} />
          <Count className="bestb" value={btcSize(s)} dp={5} suffix=" BTC" ms={780} />
        </div>
      </div>
    </Layer>
  );
}

function Protect({ d, which, label, bad, err, delay = 0 }: {
  d: Deck; which: 'tp' | 'sl'; label: string; bad: boolean; err: string; delay?: number;
}) {
  const { s } = d;
  const val = which === 'tp' ? s.tp : s.sl;
  const focus = d.can('focus', which);
  return (
    <div className="bprot" style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      <span className="bflab">{label}</span>
      <span className={'bfin wide' + (s.focus === which ? ' on' : '') + (bad ? ' bad' : '') + live(focus)}
            {...press(focus)} data-tap={s.focus === which ? 'field' : undefined}>
        <i className="bcur">$</i>
        <b>{val}</b>
        {s.focus === which ? <i className="bcaret" /> : null}
        {/* the unit affordance is drawn because the reference frame has it, and
            it is inert because this cut never swaps units — see `prot` in
            state.ts. Inert and undrawn are different lies; this is the smaller
            one, and `press(null)` keeps it out of the tab order either way. */}
        <span className="bunit" aria-hidden="true"><i>$</i><Icon d={SWAP} className="bswap" /></span>
      </span>
      {bad ? <em className="berr">{err}</em> : null}
    </div>
  );
}

function LevSheet({ d }: { d: Deck }) {
  const { s } = d;
  const set = d.can('levSet');
  return (
    <Layer open={s.over === 'lev'} onScrim={d.can('levSheet')}>
      <div className="dsheet blevsheet">
        <span className="dgrab" />
        <b className="bsh">Adjust leverage</b>
        <div className="bslide">
          <input
            type="range" min={1} max={50} value={s.levDraft} className="brange" data-tap="levslider"
            aria-label="Leverage"
            onChange={(e) => {
              const fn = d.can('levSet', e.target.value);
              if (fn) fn();
            }}
            disabled={!set}
          />
          <span className="blevbox"><Count value={s.levDraft} ms={300} /> <i>x</i></span>
        </div>
        {/* the same figure the ticket's footer shows, so the slider's effect is
            legible BEFORE Save commits it */}
        <div className="blevnot">
          <span>Position value</span>
          <Count className="blevfig" value={(Number(s.amount) || 0) * s.levDraft} prefix="$" ms={360} />
        </div>
        <span className={'bcta light' + live(d.can('levSave'))} {...press(d.can('levSave'))}
              data-tap="save">Save</span>
      </div>
    </Layer>
  );
}
