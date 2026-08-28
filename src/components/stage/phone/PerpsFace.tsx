'use client';
import { fmt } from '@/lib/format';
import { useFlow } from './flows/player';
import { ENTRY, SUBMIT_STEPS, perpsScript, slInvalid, type PerpsState } from './flows/perps';
import { Chart } from './ui/Chart';
import { Keypad } from './ui/Keypad';
import { ProgressList } from './ui/ProgressList';

const MARKETS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'NEAR-USD'];

/**
 * 0 · PERPS — the frame the tour opens on.
 *
 * The whole screen is a function of the flow's state; nothing here is wired to
 * a pointer. See flows/perps.ts for the beats and flows/player.ts for why the
 * demo autoplays rather than waiting to be poked.
 */
export function PerpsFace() {
  const { state: s } = useFlow<PerpsState>(0, perpsScript);
  const badSl = slInvalid(s.sl);
  const keypadUp = s.focus !== null;

  return (
    <div className="face pface" data-face="2">
      {s.screen === 'submitting' ? <Submitting step={s.step} /> : null}

      {/* The chart belongs to the screens that are ABOUT the market. Once the
          ticket is up it owns the frame — the real app scrolls the chart away
          the moment you start sizing a trade, and rendering both is what
          pushes the form off the bottom of the shell. */}
      {s.screen === 'flat' || s.screen === 'position' ? (
        <>
          <div className="pmkt">
            <span className="pmsym">
              <i className="pmdot" aria-hidden="true">₿</i>
              <b>BTC</b>
              <em>Bitcoin</em>
            </span>
          </div>
          <div className="ppx">
            $79,670.5 <span className="pdelta up">+$56.50 +0.07%</span>
          </div>
          <div className="pchartwrap">
            <Chart entry={s.screen === 'position' ? ENTRY : null} side="long" />
          </div>
          <div className="ptf"><span>1H</span><i>▾</i></div>
        </>
      ) : null}

      {s.screen === 'position' ? <Position /> : null}

      {s.screen === 'ticket' ? <Ticket s={s} badSl={badSl} /> : null}

      {s.screen === 'flat' ? (
        <>
          <div className="pside">
            <button className="plong" type="button" tabIndex={-1}>Long</button>
            <button className="pshort" type="button" tabIndex={-1}>Short</button>
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
        </>
      ) : null}

      {keypadUp ? <Keypad pressed={s.pressed} /> : null}
    </div>
  );
}

/* ---- the order ticket ------------------------------------------------- */

function Ticket({ s, badSl }: { s: PerpsState; badSl: boolean }) {
  const notional = Number(s.amount || 0) * Number(s.leverage.replace('x', '') || 1);
  /* The real app SCROLLS this form: once the keypad is attached to a protection
     field, the side selector, the balance line and the amount are off the top.
     Two views rather than an overflow container — there is no scrollbar to
     inherit, no scroll position to restore, and the frame is composed rather
     than cropped. */
  const onProtection = s.focus === 'tp' || s.focus === 'sl';
  return (
    <div className="ptick">
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

      <span className={'pprot' + (s.protect ? ' on' : '')}>
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

      <button className={'popen' + (badSl ? ' off' : '')} type="button" tabIndex={-1}>
        {badSl ? 'Review stop loss' : 'Open long'}
      </button>

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
    </div>
  );
}

/* ---- submitting -------------------------------------------------------- */

function Submitting({ step }: { step: number }) {
  return (
    <div className="psubmit">
      <span className="psicon" aria-hidden="true">₿</span>
      <b className="pstitle">Opening long</b>
      <span className="pssub">BTC-USD · 20x</span>
      <ProgressList steps={SUBMIT_STEPS} at={step} />
    </div>
  );
}

/* ---- the open position ------------------------------------------------- */

function Position() {
  return (
    <>
      <div className="ppos">
        <span className="pposl">Position: <b>Long 20x</b></span>
        <span className="pposv up">+$3.52 +0.50%</span>
      </div>
      <div className="pposacts">
        <button className="pmod" type="button" tabIndex={-1}>Modify</button>
        <button className="pcls" type="button" tabIndex={-1}>Close</button>
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
          <span className="prpnl up">+$3.52<i>+0.50%</i></span>
        </span>
        <dl className="prdl">
          <div><dt>Value</dt><dd>$14K <i>0.17585 BTC</i></dd></div>
          <div><dt>Entry price</dt><dd>${fmt(ENTRY)}</dd></div>
          <div><dt>Liquidation</dt><dd>$76,713.27 <i>3.7% below</i></dd></div>
        </dl>
      </div>
    </>
  );
}
