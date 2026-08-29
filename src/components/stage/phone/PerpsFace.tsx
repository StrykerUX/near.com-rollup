'use client';
import { fmt } from '@/lib/format';
import { useFlow, type Flow } from './flows/player';
import { AVAILABLE, ENTRY, SUBMIT_STEPS, perps, ready, slInvalid, type PerpsAction, type PerpsState } from './flows/perps';
import { Chart } from './ui/Chart';
import { Enter } from './ui/Enter';
import { Keypad } from './ui/Keypad';
import { LiveDot } from './ui/LiveDot';
import { ProgressList } from './ui/ProgressList';
import { Sheet } from './ui/Sheet';
import { SheetPortal } from './ui/SheetSlot';
import { Ticker } from './ui/Ticker';
import { live as can, press } from './ui/tap';

const MARKETS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'NEAR-USD'];
const TABS: [PerpsState['tab'], string][] = [['pos', 'Positions'], ['ord', 'Orders'], ['trd', 'Trades']];
const LEVELS = [2, 5, 10, 20, 50];

/**
 * 0 · PERPS — the frame the tour opens on.
 *
 * The whole screen is a function of the flow's state. Which of its controls
 * take a pointer is a function of the mode: see flows/mode.tsx.
 */
export function PerpsFace() {
  const f = useFlow(0, perps);
  const s = f.s;
  const badSl = slInvalid(s);
  const tap = (id: string) => (s.tap === id ? ' tapped' : '');
  /* the chart belongs to the screens that are ABOUT the market: once the ticket
     is up it owns the frame, the way the real app scrolls the chart away the
     moment you start sizing a trade */
  const onMarket = s.screen === 'flat' || s.screen === 'position';

  return (
    <div className={'face pface' + (f.looping ? ' looping' : '') + (f.held ? ' held' : '')} data-face="2">
      {onMarket ? (
        <Enter k={`m${f.pass}`} className="pmarket">
          <div className="pmkt">
            <span className="pmsym">
              <i className="pmdot" aria-hidden="true">₿</i>
              <b>BTC</b>
              <em>Bitcoin</em>
            </span>
            <LiveDot />
          </div>
          <div className="ppx">
            <Ticker base={79670.5} amp={62} dp={1} prefix="$" every={1100} flash live={f.live} />
            <span className="pdelta up">
              +$<Ticker base={56.5} amp={9} dp={2} prefix="" every={1100} live={f.live} /> +0.07%
            </span>
          </div>
          <div className="pchartwrap">
            <Chart entry={s.screen === 'position' ? ENTRY : null} side="long" live={f.live} />
          </div>
          <div className="ptf"><span>1H</span><i>▾</i></div>
        </Enter>
      ) : null}

      {s.screen === 'submitting' ? <Submitting s={s} pass={f.pass} /> : null}
      {s.screen === 'position' ? <Position f={f} tap={tap} /> : null}
      {s.screen === 'ticket' ? <Ticket f={f} badSl={badSl} tap={tap} /> : null}

      {s.screen === 'flat' ? (
        <Enter k={`f${f.pass}`} className="pflat">
          <div className="pside">
            <span className={'plong' + tap('long') + can(f.can('openTicket', 'long'))}
              {...press(f.can('openTicket', 'long'))}>Long</span>
            <span className={'pshort' + tap('short') + can(f.can('openTicket', 'short'))}
              {...press(f.can('openTicket', 'short'))}>Short</span>
          </div>
          <Tabs f={f} counts={{ pos: 0, ord: 0, trd: 27 }} />
          <Lists tab={s.tab} open={false} live={f.live} />
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

      {s.focus !== null && s.sheet === 'none' ? (
        <Keypad pressed={s.pressed} onKey={(k) => f.can('key', k)} onDone={f.can('focus')} />
      ) : null}

      <SheetPortal>
        <Sheet open={s.sheet === 'lev'} title="Adjust leverage">
          <div className="lsheet">
            <b className="lval">{s.leverage}<i>x</i></b>
            <div className="ltrack" aria-hidden="true">
              <span className="lfill" style={{ width: `${(s.leverage / 50) * 100}%` }} />
              <span className="lknob" style={{ left: `${(s.leverage / 50) * 100}%` }} />
            </div>
            <div className="lsteps">
              {LEVELS.map((n) => (
                <span
                  className={'lstep' + (s.leverage === n ? ' on' : '') + can(f.can('lev', String(n)))}
                  key={n}
                  {...press(f.can('lev', String(n)))}
                >{n}x</span>
              ))}
            </div>
            <p className="lnote">
              Liquidation moves to <b>${fmt(ENTRY * (1 - 1 / s.leverage), 2)}</b> at {s.leverage}x.
            </p>
            <span className={'lsave' + can(f.can('levSheet'))} {...press(f.can('levSheet'))}>Save</span>
          </div>
        </Sheet>
      </SheetPortal>
    </div>
  );
}

/* ---- shared bits ------------------------------------------------------- */

type F = Flow<PerpsState, PerpsAction>;

function Tabs({ f, counts }: { f: F; counts: Record<string, number> }) {
  return (
    <div className="ptabs" role="tablist" aria-label="Perps lists">
      {TABS.map(([id, label]) => {
        const fn = f.can('tab', id);
        return (
          <span
            className={'pt' + (f.s.tab === id ? ' on' : '') + can(fn)}
            role="tab"
            aria-selected={f.s.tab === id}
            key={id}
            {...press(fn)}
          >
            {label}
            {counts[id] ? <b className="ptc">({counts[id]})</b> : null}
          </span>
        );
      })}
    </div>
  );
}

/** what sits under the tabs — a real switch, not three labels over one list */
function Lists({ tab, open, live, s }: { tab: PerpsState['tab']; open: boolean; live: boolean; s?: PerpsState }) {
  if (tab === 'ord')
    return <div className="pempty"><b>No open orders</b><span>Limit orders will show up here.</span></div>;
  if (tab === 'trd')
    return (
      <div className="ptrades">
        <div className="ptrow"><span><b>Open Long</b><em>BTC · just now</em></span><i className="up">+$0.04</i></div>
        <div className="ptrow"><span><b>Close Long</b><em>BTC · 18m ago</em></span><i className="up">+$0.04</i></div>
        <div className="ptrow"><span><b>Open Long</b><em>BTC · 1h ago</em></span><i className="dn">−$1.32</i></div>
      </div>
    );
  if (!open)
    return <div className="pempty"><b>No open positions</b><span>Open positions will show up here.</span></div>;
  return <PositionRow live={live} s={s} />;
}

/* ---- the order ticket -------------------------------------------------- */

function Ticket({ f, badSl, tap }: { f: F; badSl: boolean; tap: (id: string) => string }) {
  const s = f.s;
  const notional = Number(s.amount || 0) * s.leverage;
  /* The real app SCROLLS this form: once the keypad is attached to a protection
     field, the side selector, the balance line and the amount are off the top.
     Two views rather than an overflow container — there is no scrollbar to
     inherit, no scroll position to restore, and the frame is composed rather
     than cropped. */
  const onProtection = s.focus === 'tp' || s.focus === 'sl';
  /* the third composition: while a number is being typed into the top of the
     ticket, the protection toggle and the estimates go — the keypad is over
     them, and neither is anything you act on mid-entry */
  const sizing = s.focus === 'amount' || s.focus === 'limit';

  return (
    <Enter k={`t${f.pass}-${onProtection}`} className={'ptick' + (sizing ? ' sizing' : '')}>
      {onProtection ? null : (
        <>
          <div className="pseg">
            <span className={'psg' + (s.side === 'long' ? ' on long' : '') + can(f.can('side', 'long'))}
              {...press(f.can('side', 'long'))}>Long</span>
            <span className={'psg' + (s.side === 'short' ? ' on short' : '') + can(f.can('side', 'short'))}
              {...press(f.can('side', 'short'))}>Short</span>
            {(() => {
              const next = s.otype === 'Market' ? 'Limit' : 'Market';
              return (
                <span className={'psg mkt' + can(f.can('otype', next))} {...press(f.can('otype', next))}>
                  {s.otype} <i>▾</i>
                </span>
              );
            })()}
          </div>

          <div className="pavail">
            <span>Available to trade</span>
            <b>${fmt(AVAILABLE, 0)} <i className="pmax">Max</i></b>
          </div>

          {s.otype === 'Limit' ? (
            <div className="pfield">
              <span className="plbl">Limit price</span>
              <span className={'pinput' + (s.focus === 'limit' ? ' focus' : '') + can(f.can('focus', 'limit'))}
                {...press(f.can('focus', 'limit'))}>
                <i className="pcur">$</i>
                <b>{s.limit}</b>
                {s.focus === 'limit' ? <i className="pcaret" /> : null}
                <span className="punit">Resting</span>
              </span>
            </div>
          ) : null}

          <div className="pfield">
            <span className="plbl">Amount</span>
            <span className={'pinput' + (s.focus === 'amount' ? ' focus' : '') + can(f.can('focus', 'amount'))}
              {...press(f.can('focus', 'amount'))}>
              <i className="pcur">$</i>
              <b>{s.amount ? fmt(Number(s.amount)) : ''}</b>
              {s.focus === 'amount' ? <i className="pcaret" /> : null}
              <span className={'plev' + tap('lev') + can(f.can('levSheet'))} {...press(f.can('levSheet'))}>
                {s.leverage}x <i>▾</i>
              </span>
            </span>
          </div>
        </>
      )}

      <span className={'pprot' + (s.protect ? ' on' : '') + tap('protect') + can(f.can('protect'))}
        {...press(f.can('protect'))}>
        <i className="pbox" aria-hidden="true">{s.protect ? '✓' : ''}</i>
        Add profit taker/stop loss
      </span>

      {s.protect ? (
        <>
          <div className="pfield">
            <span className="plbl">Take profit</span>
            <span className={'pinput' + (s.focus === 'tp' ? ' focus' : '') + can(f.can('focus', 'tp'))}
              {...press(f.can('focus', 'tp'))}>
              <i className="pcur">$</i>
              <b>{s.tp}</b>
              {s.focus === 'tp' ? <i className="pcaret" /> : null}
              <span className="punit">$ ⇄</span>
            </span>
          </div>
          <div className="pfield">
            <span className="plbl">Stop loss</span>
            <span className={'pinput' + (s.focus === 'sl' ? ' focus' : '') + (badSl ? ' bad' : '') + can(f.can('focus', 'sl'))}
              {...press(f.can('focus', 'sl'))}>
              <i className="pcur">$</i>
              <b>{s.sl}</b>
              {s.focus === 'sl' ? <i className="pcaret" /> : null}
              <span className="punit">$ ⇄</span>
            </span>
          </div>
          {badSl ? (
            <p className="perr">
              Stop loss must be {s.side === 'long' ? 'below' : 'above'} entry price
            </p>
          ) : null}
        </>
      ) : null}

      {/* the guard refuses the reader exactly as it refuses the script: `can`
          returns null while the ticket is not ready, so this is a dead span */}
      <span className={'popen' + (ready(s) ? '' : ' off') + tap('open') + can(f.can('submit'))}
        {...press(f.can('submit'))}>
        {badSl ? 'Review stop loss' : Number(s.amount) > 0 ? `Open ${s.side}` : 'Enter an amount'}
      </span>

      <dl className="pest">
        <div>
          <dt>Est. trade value</dt>
          <dd>${fmt(Math.round(notional / 1000))}K <i>{(notional / ENTRY).toFixed(5)} BTC</i></dd>
        </div>
        <div>
          <dt>Est. liquidation</dt>
          {/* derived from the leverage rather than quoted, so the two cannot
              drift apart when the reader moves the slider */}
          <dd>
            ${fmt(ENTRY * (1 - 1 / s.leverage), 2)}{' '}
            <i>{(100 / s.leverage).toFixed(0)}% below</i>
          </dd>
        </div>
      </dl>
    </Enter>
  );
}

/* ---- submitting -------------------------------------------------------- */

function Submitting({ s, pass }: { s: PerpsState; pass: number }) {
  /* It used to say "Opening long · 20x" no matter what had been submitted.
     Harmless while only the script could submit; a plain lie the moment a
     reader can open a 50x short and watch it confirm something else. */
  return (
    <div className="psubmit enter-one" key={`s${pass}`}>
      <span className="psicon" aria-hidden="true">₿</span>
      <b className="pstitle">Opening {s.side}</b>
      <span className="pssub">BTC-USD · {s.leverage}x · {s.otype}</span>
      <ProgressList steps={SUBMIT_STEPS} at={s.step} />
    </div>
  );
}

/* ---- the open position ------------------------------------------------- */

function Position({ f, tap }: { f: F; tap: (id: string) => string }) {
  const close = f.can('close');
  return (
    <Enter k={`p${f.pass}`} className="pposwrap">
      <div className="ppos">
        <span className="pposl">Position: <b>{f.s.side === 'long' ? 'Long' : 'Short'} {f.s.leverage}x</b></span>
        <span className="pposv up">
          +$<Ticker base={3.52} amp={1.9} dp={2} every={900} live={f.live} flash /> +0.50%
        </span>
      </div>
      <div className="pposacts">
        <span className="pmod">Modify</span>
        <span className={'pcls' + tap('close') + can(close)} {...press(close)}>Close</span>
      </div>
      <Tabs f={f} counts={{ pos: 1, ord: 0, trd: 27 }} />
      <Lists tab={f.s.tab} open live={f.live} s={f.s} />
    </Enter>
  );
}

function PositionRow({ live, s }: { live: boolean; s?: PerpsState }) {
  const side = s?.side === 'short' ? 'Short' : 'Long';
  const lev = s?.leverage ?? 20;
  return (
    <div className="pposrow">
      <span className="prtop">
        <i className="pmdot sm" aria-hidden="true">₿</i>
        <b>BTC</b><em>{side} {lev}x</em>
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
  );
}
