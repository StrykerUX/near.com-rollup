'use client';
import { fmt } from '@/lib/format';
import { useFlow } from './flows/player';
import { ENTRY, SUBMIT_STEPS, perpsScript, slInvalid, type PerpsState } from './flows/perps';
import { Chart } from './ui/Chart';
import { Enter } from './ui/Enter';
import { Keypad } from './ui/Keypad';
import { LiveDot } from './ui/LiveDot';
import { ProgressList } from './ui/ProgressList';
import { Ticker } from './ui/Ticker';

const MARKETS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'NEAR-USD'];

/**
 * 0 · PERPS — the frame the tour opens on.
 *
 * The whole screen is a function of the flow's state; nothing here is wired to
 * a pointer. See flows/perps.ts for the beats and flows/player.ts for why the
 * demo keeps its own clock.
 */
export function PerpsFace() {
  const { state: s, live, pass, looping } = useFlow<PerpsState>(0, perpsScript);
  const badSl = slInvalid(s.sl);
  const keypadUp = s.focus !== null;
  const tap = (id: string) => (s.tap === id ? ' tapped' : '');
  /* the chart belongs to the screens that are ABOUT the market: once the ticket
     is up it owns the frame, the way the real app scrolls the chart away the
     moment you start sizing a trade */
  const onMarket = s.screen === 'flat' || s.screen === 'position';

  return (
    <div className={'face pface' + (looping ? ' looping' : '')} data-face="2">
      {onMarket ? (
        <Enter k={`m${pass}`} className="pmarket">
          <div className="pmkt">
            <span className="pmsym">
              <i className="pmdot" aria-hidden="true">₿</i>
              <b>BTC</b>
              <em>Bitcoin</em>
            </span>
            <LiveDot />
          </div>
          <div className="ppx">
            <Ticker base={79670.5} amp={62} dp={1} prefix="$" every={1100} flash live={live} />
            <span className="pdelta up">
              +$<Ticker base={56.5} amp={9} dp={2} prefix="" every={1100} live={live} /> +0.07%
            </span>
          </div>
          <div className="pchartwrap">
            <Chart entry={s.screen === 'position' ? ENTRY : null} side="long" live={live} />
          </div>
          <div className="ptf"><span>1H</span><i>▾</i></div>
        </Enter>
      ) : null}

      {s.screen === 'submitting' ? <Submitting step={s.step} pass={pass} /> : null}
      {s.screen === 'position' ? <Position live={live} pass={pass} /> : null}
      {s.screen === 'ticket' ? <Ticket s={s} badSl={badSl} tap={tap} pass={pass} /> : null}

      {s.screen === 'flat' ? (
        <Enter k={`f${pass}`} className="pflat">
          <div className="pside">
            <span className={'plong' + tap('long')}>Long</span>
            <span className="pshort">Short</span>
          </div>
          <div className="ptabs" role="tablist" aria-label="Perps lists">
            <span className="pt on">Positions</span>
            <span className="pt">Orders</span>
            <span className="pt">Trades <b className="ptc">(27)</b></span>
          </div>
          <div className="pempty">
            <b>No open positions</b>
            <span>Open positions will show up here.</span>
          </div>
          <div className="pmk">
            <span className="klabel">Markets</span>
            <div className="pmrow">
              {MARKETS.map((m, i) => (
                <span className={'pm' + (i === 0 ? ' on' : '')} key={m}>{m}</span>
              ))}
            </div>
          </div>
        </Enter>
      ) : null}

      {keypadUp ? <Keypad pressed={s.pressed} /> : null}
    </div>
  );
}

/* ---- the order ticket ------------------------------------------------- */

function Ticket({
  s, badSl, tap, pass,
}: {
  s: PerpsState; badSl: boolean; tap: (id: string) => string; pass: number;
}) {
  const notional = Number(s.amount || 0) * Number(s.leverage.replace('x', '') || 1);
  /* The real app SCROLLS this form: once the keypad is attached to a protection
     field, the side selector, the balance line and the amount are off the top.
     Two views rather than an overflow container — there is no scrollbar to
     inherit, no scroll position to restore, and the frame is composed rather
     than cropped. */
  const onProtection = s.focus === 'tp' || s.focus === 'sl';

  return (
    <Enter k={`t${pass}-${onProtection}`} className="ptick">
      {onProtection ? null : (
        <>
          <div className="pseg">
            <span className={'psg' + (s.side === 'long' ? ' on long' : '')}>Long</span>
            <span className={'psg' + (s.side === 'short' ? ' on short' : '')}>Short</span>
            <span className="psg mkt">Market <i>▾</i></span>
          </div>

          <div className="pavail">
            <span>Available to trade</span>
            <b>$1,087 <i className="pmax">Max</i></b>
          </div>

          <label className="pfield">
            <span className="plbl">Amount</span>
            <span className={'pinput' + (s.focus === 'amount' ? ' focus' : '')}>
              <i className="pcur">$</i>
              <b>{s.amount ? fmt(Number(s.amount)) : ''}</b>
              {s.focus === 'amount' ? <i className="pcaret" /> : null}
              <span className="plev">{s.leverage} <i>▾</i></span>
            </span>
          </label>
        </>
      )}

      <span className={'pprot' + (s.protect ? ' on' : '') + tap('protect')}>
        <i className="pbox" aria-hidden="true">{s.protect ? '✓' : ''}</i>
        Add profit taker/stop loss
      </span>

      {s.protect ? (
        <>
          <label className="pfield">
            <span className="plbl">Take profit</span>
            <span className={'pinput' + (s.focus === 'tp' ? ' focus' : '')}>
              <i className="pcur">$</i>
              <b>{s.tp}</b>
              {s.focus === 'tp' ? <i className="pcaret" /> : null}
              <span className="punit">$ ⇄</span>
            </span>
          </label>
          <label className="pfield">
            <span className="plbl">Stop loss</span>
            <span className={'pinput' + (s.focus === 'sl' ? ' focus' : '') + (badSl ? ' bad' : '')}>
              <i className="pcur">$</i>
              <b>{s.sl}</b>
              {s.focus === 'sl' ? <i className="pcaret" /> : null}
              <span className="punit">$ ⇄</span>
            </span>
          </label>
          {badSl ? <p className="perr">Stop loss must be below entry price</p> : null}
        </>
      ) : null}

      <span className={'popen' + (badSl ? ' off' : '') + tap('open')}>
        {badSl ? 'Review stop loss' : 'Open long'}
      </span>

      <dl className="pest">
        <div>
          <dt>Est. trade value</dt>
          <dd>${fmt(Math.round(notional / 1000))}K <i>{(notional / ENTRY).toFixed(5)} BTC</i></dd>
        </div>
        <div>
          <dt>Est. liquidation</dt>
          {/* 2% below entry is what a 20x long liquidates at, so it is derived
              rather than quoted — the two cannot drift apart. */}
          <dd>${fmt(ENTRY * 0.98, 2)} <i>2% below</i></dd>
        </div>
      </dl>
    </Enter>
  );
}

/* ---- submitting -------------------------------------------------------- */

function Submitting({ step, pass }: { step: number; pass: number }) {
  return (
    <div className="psubmit enter-one" key={`s${pass}`}>
      <span className="psicon" aria-hidden="true">₿</span>
      <b className="pstitle">Opening long</b>
      <span className="pssub">BTC-USD · 20x</span>
      <ProgressList steps={SUBMIT_STEPS} at={step} />
    </div>
  );
}

/* ---- the open position ------------------------------------------------- */

function Position({ live, pass }: { live: boolean; pass: number }) {
  return (
    <Enter k={`p${pass}`} className="pposwrap">
      <div className="ppos">
        <span className="pposl">Position: <b>Long 20x</b></span>
        <span className="pposv up">
          +$<Ticker base={3.52} amp={1.9} dp={2} every={900} live={live} flash /> +0.50%
        </span>
      </div>
      <div className="pposacts">
        <span className="pmod">Modify</span>
        <span className="pcls">Close</span>
      </div>
      <div className="ptabs" role="tablist" aria-label="Perps lists">
        <span className="pt on">Positions <b className="ptc">(1)</b></span>
        <span className="pt">Orders</span>
        <span className="pt">Trades <b className="ptc">(27)</b></span>
      </div>
      <div className="pposrow">
        <span className="prtop">
          <i className="pmdot sm" aria-hidden="true">₿</i>
          <b>BTC</b><em>Long 20x</em>
          <span className="prpnl up">
            <span>+$<Ticker base={3.52} amp={1.9} dp={2} every={900} live={live} /></span>
            <i>+0.50%</i>
          </span>
        </span>
        <dl className="prdl">
          <div><dt>Value</dt><dd>$14K <i>0.17585 BTC</i></dd></div>
          <div><dt>Entry price</dt><dd>${fmt(ENTRY)}</dd></div>
          <div><dt>Liquidation</dt><dd>$76,713.27 <i>3.7% below</i></dd></div>
        </dl>
      </div>
    </Enter>
  );
}
