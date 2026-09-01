'use client';
import { useCallback, useRef } from 'react';
import { Chart } from '@/components/stage/phone/ui/Chart';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { Count } from '@/components/demo/shell/Count';
import { Layer, StatusBar } from '@/components/demo/shell/Frame';
import { PasskeySheet } from '@/components/demo/shell/Screens';
import { Spotlight } from '@/components/demo/shell/Spotlight';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  ENTRY, ORDER_STEPS, avail, btcSize, cta, liqPrice, notional, slBad, tpBad,
  type PD, type PDAction,
} from '@/components/demo/perps/state';

type Deck = GenericDeck<PD, PDAction>;

/**
 * PERPS v3 — the device
 * ==================================================================
 * The same machine as v2 renders half as much.
 *
 * Gone: the three lists under the chart, the Market/Limit control, the keypad,
 * and the liquidation row in the ticket. Each was carrying something, and each
 * was carrying it somewhere else too — the lists are where a trade lands and
 * this page is about making one; the order type is a second story; the pad
 * spends two hundred pixels saying "this is being typed", which the caret and
 * the digits landing say for nothing; and liquidation matters most once you are
 * in, which is where it still appears.
 *
 * What is left is the price, the two sides, the size, what leverage turns it
 * into, the two rules, and the position. Every feature v2 communicates is still
 * on screen; there is simply less around it.
 */

const BTC = findToken('BTC');
const usd = (v: number, dp = 2) => '$' + fmt(v, dp);

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="pdev v3" data-motion="rich" data-pos={s.pos ? '1' : undefined}>
      <StatusBar />
      <div className="pdview">
        <Market d={d} />
      </div>

      <Ticket d={d} />
      <LevSheet d={d} />
      <PasskeySheet open={s.over === 'passkey'} auth={s.auth} onUse={d.can('ostep')} />

      {/* No pointer. The control that is about to change lights instead — see
          shell/Spotlight.tsx. It renders nothing of its own; it is here for the
          same reason the hand was, and it must sit inside the device so it can
          find the controls. */}
      <Spotlight hand={d.hand} on={!d.held} />
    </div>
  );
}

/* ---- the market ------------------------------------------------------- */

function Market({ d }: { d: Deck }) {
  const { s } = d;
  const long = d.can('openTicket', 'long');
  const short = d.can('openTicket', 'short');
  /* the price, the change and the position's P&L are written by the chart, off
     the candles it is actually drawing */
  const price = useRef<HTMLSpanElement>(null);
  const change = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const pos = s.pos;

  const onTick = useCallback((last: number) => {
    const el = wrap.current;
    if (!el || !pos) return;
    const qty = pos.size / pos.entry;
    const dv = (last - pos.entry) * qty * (pos.side === 'long' ? 1 : -1);
    const pc = (dv / (pos.size / pos.lev)) * 100;
    const sign = dv >= 0 ? '+' : '−';
    el.querySelectorAll<HTMLElement>('[data-pnl]').forEach((n) => {
      n.textContent = `${sign}$${Math.abs(dv).toFixed(2)}`;
      n.classList.toggle('down', dv < 0);
      n.classList.toggle('dgain', dv >= 0);
    });
    el.querySelectorAll<HTMLElement>('[data-pnlp]').forEach((n) => {
      n.textContent = `${sign}${Math.abs(pc).toFixed(2)}%`;
    });
  }, [pos]);

  /* the market holds still while a protection field is being typed into: both
     rules are enforced against a fixed entry, and a quote walking under them
     makes a refusal look arbitrary instead of legible */
  const paused = s.focus === 'tp' || s.focus === 'sl';

  return (
    <div className="dmkt3" ref={wrap}>
      <div className="dpair3">
        <TokenDot token={BTC} size={26} />
        <span className="dpairt"><b>BTC</b><em>Bitcoin</em></span>
      </div>

      <div className="dpx3">
        <span className="dpxv" ref={price}>${fmt(ENTRY, 1)}</span>
        <span className="dpxd" ref={change}>&minus;$878.36  &minus;1.10%</span>
      </div>

      <div className="dchart3">
        <Chart entry={s.pos ? s.pos.entry : null} side={s.pos?.side ?? null} live
               paused={paused} readout={{ price, change, onTick }} />
      </div>

      {s.pos ? <PositionCard d={d} /> : (
        <div className="dsides">
          <span className={'dside long' + live(long)} {...press(long)} data-tap="side:long">Long</span>
          <span className={'dside short' + live(short)} {...press(short)} data-tap="side:short">Short</span>
        </div>
      )}

      {!s.pos ? (
        <span className="davail3">
          <i>Available to trade</i>
          <b>{usd(avail(s), 0)}</b>
        </span>
      ) : null}
    </div>
  );
}

function PositionCard({ d }: { d: Deck }) {
  const { s } = d;
  if (!s.pos) return null;
  const open = d.can('posOpen');
  const btc = s.pos.size / s.pos.entry;
  return (
    <div className="dposbar">
      <div className={'dposh' + live(open)} {...press(open)} data-tap="posbar">
        <span>Position: <b className={s.pos.side}>{s.pos.side === 'long' ? 'Long' : 'Short'} {s.pos.lev}x</b></span>
        <span className="dposp"><b data-pnl className="down">&minus;$1.58</b> <i data-pnlp>&minus;0.23%</i></span>
        <span className={'dposc' + (s.posOpen ? ' on' : '')}>⌄</span>
      </div>
      {s.posOpen ? (
        <dl className="dposd">
          <div><dt>Size</dt><dd>{usd(s.pos.size, 0)} <i>{btc.toFixed(5)} BTC</i></dd></div>
          <div><dt>Margin</dt><dd>{usd(s.pos.size / s.pos.lev, 0)}</dd></div>
          <div><dt>Entry</dt><dd>{usd(s.pos.entry, 0)}</dd></div>
          <div><dt>Liquidation</dt><dd>{usd(liqPrice(s.pos.entry, s.pos.lev, s.pos.side))}</dd></div>
        </dl>
      ) : null}
    </div>
  );
}

/* ---- the ticket ------------------------------------------------------- */

function Ticket({ d }: { d: Deck }) {
  const { s } = d;
  const c = cta(s);
  const submit = d.can('submit');

  return (
    <Layer open={s.ticket} onScrim={d.can('closeTicket')}>
      <div className="dsheet tk3">
        <span className="dgrab" />

        <div className="dseg3">
          {(['long', 'short'] as const).map((k) => {
            const on = d.can('side', k);
            return (
              <span className={'dsg ' + k + (s.side === k ? ' on' : '') + live(on)} key={k} {...press(on)}>
                {k === 'long' ? 'Long' : 'Short'}
              </span>
            );
          })}
        </div>

        <div className="dfield3">
          <span className="dflab">Amount</span>
          <span className={'dfin' + (s.focus === 'amount' ? ' on' : '') + live(d.can('focus', 'amount'))}
                {...press(d.can('focus', 'amount'))}
                data-tap={s.focus === 'amount' ? 'field' : undefined}>
            <i className="dcur">$</i>
            <b>{s.amount}</b>
            {s.focus === 'amount' ? <i className="dcaret" /> : null}
          </span>
          <span className={'dlev' + live(d.can('levSheet'))} {...press(d.can('levSheet'))}
                data-tap="lev">{s.lev}x <i>⌄</i></span>
        </div>

        {/* THE ONE LINE THE LEVERAGE STORY NEEDS. Both figures travel to their
            new value rather than being replaced, which is the only thing that
            makes the link between the slider and the number visible. */}
        <div className="dnotional">
          <Count className="dnotv" value={notional(s)} prefix="$" />
          <Count className="dnotb" value={btcSize(s)} dp={5} suffix=" BTC" />
        </div>

        <span className={'dchk' + (s.prot ? ' on' : '') + live(d.can('prot'))} {...press(d.can('prot'))}
              data-tap="prot">
          <i className="dbox" />Add profit taker / stop loss
        </span>

        {s.prot ? (
          <>
            <Protect d={d} which="tp" label="Take profit" bad={tpBad(s)}
                     err="Take profit must be above entry price" />
            <Protect d={d} which="sl" label="Stop loss" bad={slBad(s)} delay={80}
                     err="Stop loss must be below entry price" />
          </>
        ) : null}

        {s.submitting && s.over === 'none' ? (
          <>
            <span className="dcta off"><i className="dspin" /></span>
            <div className="dochk"><ProgressList steps={ORDER_STEPS} at={s.ostep} /></div>
          </>
        ) : (
          <span className={'dcta' + (c.ok ? '' : ' off') + live(submit)} {...press(submit)}
                data-tap="submit">{c.label}</span>
        )}
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
  const swap = d.can('unit', which);
  return (
    <div className="dfield3 prot" style={delay ? { animationDelay: `${delay}ms` } : undefined}>
      <span className="dflab">{label}</span>
      <span className={'dfin wide' + (s.focus === which ? ' on' : '') + (bad ? ' bad' : '') + live(focus)}
            {...press(focus)} data-tap={s.focus === which ? 'field' : undefined}>
        {s.punit === '$' ? <i className="dcur">$</i> : null}
        <b>{val}</b>
        {s.focus === which ? <i className="dcaret" /> : null}
        <span className="dunit">
          <i>{s.punit}</i>
          <span className={'dswap' + live(swap)} {...press(swap)} data-tap={'unit:' + which}
                aria-label="Switch unit">⇄</span>
        </span>
      </span>
      {bad ? <em className="derr">{err}</em> : null}
    </div>
  );
}

function LevSheet({ d }: { d: Deck }) {
  const { s } = d;
  const set = d.can('levSet');
  return (
    <Layer open={s.over === 'lev'} onScrim={d.can('levSheet')}>
      <div className="dsheet lev">
        <span className="dgrab" />
        <b className="dsh">Adjust leverage</b>
        <div className="dslide">
          <input
            type="range" min={1} max={50} value={s.levDraft} className="drange" data-tap="levslider"
            aria-label="Leverage"
            onChange={(e) => {
              const fn = d.can('levSet', e.target.value);
              if (fn) fn();
            }}
            disabled={!set}
          />
          <span className="dlevbox"><Count value={s.levDraft} ms={220} /> <i>x</i></span>
        </div>
        {/* the same figure the ticket shows, so the slider's effect is legible
            before Save commits it */}
        <div className="dlevnot">
          <span>Position value</span>
          {/* named so v4's camera can frame the figure rather than the row —
              a row that spans the device cannot be zoomed without cutting it */}
          <Count className="dlevfig" value={(Number(s.amount) || 0) * s.levDraft} prefix="$" ms={260} />
        </div>
        <span className={'dcta light' + live(d.can('levSave'))} {...press(d.can('levSave'))}
              data-tap="save">Save</span>
      </div>
    </Layer>
  );
}
