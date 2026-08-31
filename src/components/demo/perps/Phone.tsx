'use client';
import { useCallback, useRef } from 'react';
import { Chart } from '@/components/stage/phone/ui/Chart';
import { Keypad } from '@/components/stage/phone/ui/Keypad';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { Ticker } from '@/components/stage/phone/ui/Ticker';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { Hand } from '@/components/demo/shell/Hand';
import { Layer, StatusBar, Tabs } from '@/components/demo/shell/Frame';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  CRYPTO_BAL, EARN_BAL, ENTRY, FUND_ETA, FUND_PAY_NEAR, FUND_SLIPPAGE, FUND_STEPS,
  MARK_0, NEAR_AVAIL, ORDER_STEPS, PERPS_BAL_0,
  avail, btcSize, cta, liqPct, liqPrice, money, notional, slBad, tpBad,
  type PD, type PDAction,
} from './state';

type Deck = GenericDeck<PD, PDAction>;

/**
 * THE APP
 * ==================================================================
 * Four screens and five layers, rebuilt off the recording. Everything on them
 * is derived from the state in `state.ts` — there is no copy of $14K written
 * into the markup, because the whole point of the leverage step is watching
 * that number move.
 *
 * Every control is a `<span>` carrying a hand-tuned class, made live by
 * `press()`. The tag never changes between the played and the touched version,
 * so the stylesheet has one box to get right instead of two.
 */

const BTC = findToken('BTC');
const NEAR = findToken('NEAR');
const USDC = findToken('USDC');

/** the near.com balance after the funding leaves it, frame 5:05 */
const CRYPTO_AFTER = 6806.76;

const usd = (v: number, dp = 2) => '$' + fmt(v, dp);

export function Phone({ d, holdPrice = false, hand = false }: {
  d: Deck;
  holdPrice?: boolean;
  /** draw the touch point that travels between controls — v2 only */
  hand?: boolean;
}) {
  const { s } = d;
  /* v2 holds the market still while a protection field is being typed into.
     The long version lets it run: by the time it reaches that step it has
     already spent four chapters establishing that the price moves. */
  const paused = holdPrice && (s.focus === 'tp' || s.focus === 'sl');
  return (
    <div className="pdev" data-screen={s.screen} data-held={d.held || undefined}
         data-pos={s.pos ? '1' : undefined}>
      <StatusBar />
      <div className="pdview">
        {s.screen === 'account' ? <Account d={d} /> : null}
        {s.screen === 'market' ? <Market d={d} paused={paused} /> : null}
        {s.screen === 'fund' || s.screen === 'funding' ? <Fund d={d} /> : null}
      </div>
      {s.screen === 'account' || s.screen === 'market'
        ? <Tabs on={s.screen === 'account' ? 'Home' : 'Perps'} /> : null}

      <MyAccount d={d} />
      <Ticket d={d} />
      <LevSheet d={d} />
      <ReviewSheet d={d} />
      <Passkey d={d} />

      {/* last, so it is over every sheet — a finger is */}
      {hand ? <Hand hand={d.hand} on={d.playing && !d.held} /> : null}
    </div>
  );
}

/* ---- chrome ----------------------------------------------------------- */

/* ---- 1 · the account -------------------------------------------------- */

function Account({ d }: { d: Deck }) {
  const { s } = d;
  const funded = s.perps > PERPS_BAL_0;
  const crypto = funded ? CRYPTO_AFTER : CRYPTO_BAL;
  /* the headline is the sum of the three rows under it, always */
  const total = crypto + s.perps + EARN_BAL;
  const pnl = s.pos ? 5.1 : null;
  const perps = d.can('openPerps');

  return (
    <div className="dacc">
      <div className="dhead">
        <span className="davatar" aria-hidden="true" />
        <b>Account</b>
        <span className="dhicons" aria-hidden="true"><i /><i /><i /></span>
      </div>

      <span className="dlabel">Total balance <i className="deye" aria-hidden="true" /></span>
      <Ticker className="dtotal" base={total} amp={1.4} dp={2} prefix="$" every={2600} />

      <div className="dpair">
        <span className="dbtn">↓ Receive</span>
        <span className="dbtn">➤ Send</span>
      </div>

      <div className="dcard">
        <span className="dcardh">Balances</span>

        <div className="drow">
          <span className="drowl">
            <em>Crypto</em>
            <b>{usd(crypto)}</b>
            <span className="dpills">
              <TokenDot token={NEAR} size={13} /><TokenDot token={USDC} size={13} />
              <i>NEAR, USDC</i>
            </span>
          </span>
          <span className="dchev">›</span>
        </div>

        <div className={'drow' + live(perps)} {...press(perps)}>
          <span className="drowl">
            <em>Perps</em>
            <b>{usd(s.perps)}</b>
            {pnl
              ? <span className="dpills"><i className="dgain">▲ ${fmt(pnl, 2)}</i><i>unrealized P&amp;L</i></span>
              : <span className="dpills"><i>Trade with up to <b>50x</b> leverage</i></span>}
          </span>
          <span className="dchev">›</span>
        </div>

        <div className="drow">
          <span className="drowl">
            <em>Earn</em>
            <b>{usd(EARN_BAL)}</b>
            <span className="dpills"><i className="dgain">▲ 5.1%</i><i>blended APY</i></span>
          </span>
          <span className="dchev">›</span>
        </div>
      </div>

      <div className="dexp">
        <span className="dexph">Explore</span>
        <div className="dexpr">
          <span className="dexpc">
            <i aria-hidden="true" />
            <b>Track your NEAR@3.33 rewards</b>
            <em>You&rsquo;re ranked #131, in top 4% of users.</em>
          </span>
          <span className="dexpc">
            <i aria-hidden="true" />
            <b>Confidential Send</b>
            <em>Send to any wallet, privately.</em>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- 2 · the market --------------------------------------------------- */

function Market({ d, paused = false }: { d: Deck; paused?: boolean }) {
  const { s } = d;
  const back = d.can('home');
  const acct = d.can('acct');
  const long = d.can('openTicket', 'long');
  const short = d.can('openTicket', 'short');
  /* the price, the change and the position's P&L are all written by the chart,
     off the candles it is actually drawing. Deriving the P&L anywhere else is
     how a screen ends up showing a loss under a price above its own entry. */
  const price = useRef<HTMLSpanElement>(null);
  const change = useRef<HTMLSpanElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const pos = s.pos;

  const onTick = useCallback((last: number) => {
    const el = wrap.current;
    if (!el || !pos) return;
    const qty = pos.size / pos.entry;
    const d = (last - pos.entry) * qty * (pos.side === 'long' ? 1 : -1);
    const pc = (d / (pos.size / pos.lev)) * 100;
    const sign = d >= 0 ? '+' : '\u2212';
    el.querySelectorAll<HTMLElement>('[data-pnl]').forEach((n) => {
      n.textContent = sign + '$' + Math.abs(d).toFixed(2);
      n.classList.toggle('down', d < 0);
      n.classList.toggle('dgain', d >= 0);
    });
    el.querySelectorAll<HTMLElement>('[data-pnlp]').forEach((n) => {
      n.textContent = sign + Math.abs(pc).toFixed(2) + '%';
    });
  }, [pos]);

  return (
    <div className="dmkt" ref={wrap}>
      <div className="dmhead">
        <span className={'dback' + live(back)} {...press(back)} aria-label="Back">‹</span>
        <span className={'dbrief' + live(acct)} {...press(acct)} aria-label="My account">▤</span>
      </div>

      <div className="dpair2">
        <TokenDot token={BTC} size={22} />
        <span className="dpairt"><b>BTC</b><em>Bitcoin</em></span>
        <span className="dchev2">⌄</span>
      </div>

      <div className="dpx">
        <span className="dpxv" ref={price}>${fmt(MARK_0, 1)}</span>
        <span className="dpxd" ref={change}>&minus;$88.50  &minus;0.11%</span>
      </div>

      <div className="dchart">
        <Chart entry={s.pos ? s.pos.entry : null} side={s.pos?.side ?? null} live
               paused={paused} readout={{ price, change, onTick }} />
      </div>
      <div className="dtf"><span>1H ⌄</span><i className="dtfi" /></div>

      {s.pos ? <PositionBar d={d} /> : (
        <div className="dsides">
          <span className={'dside long' + live(long)} {...press(long)} data-tap="side:long">Long</span>
          <span className={'dside short' + live(short)} {...press(short)} data-tap="side:short">Short</span>
        </div>
      )}

      <Lists d={d} />
    </div>
  );
}

function PositionBar({ d }: { d: Deck }) {
  const { s } = d;
  if (!s.pos) return null;
  const open = d.can('posOpen');
  const size = s.pos.size;
  const btc = size / s.pos.entry;
  return (
    <div className="dposbar">
      <div className={'dposh' + live(open)} {...press(open)} data-tap="posbar">
        <span>Position: <b className={s.pos.side}>{s.pos.side === 'long' ? 'Long' : 'Short'} {s.pos.lev}x</b></span>
        <span className="dposp"><b data-pnl className="down">&minus;$1.58</b> <i data-pnlp>&minus;0.23%</i></span>
        <span className={'dposc' + (s.posOpen ? ' on' : '')}>⌄</span>
      </div>
      {s.posOpen ? (
        <dl className="dposd">
          <div><dt>Size</dt><dd>{usd(size)} <i>{btc.toFixed(5)} BTC</i></dd></div>
          <div><dt>Margin</dt><dd>{usd(size / s.pos.lev)}</dd></div>
          <div><dt>Entry</dt><dd>{usd(s.pos.entry)}</dd></div>
          <div><dt>Est. liquidation</dt><dd>{usd(liqPrice(s.pos.entry, s.pos.lev, s.pos.side))}</dd></div>
        </dl>
      ) : null}
      <div className="dposact">
        <span className="dpb">Modify</span>
        <span className={'dpb close' + live(d.can('closePos'))} {...press(d.can('closePos'))}>Close</span>
      </div>
    </div>
  );
}

function Lists({ d }: { d: Deck }) {
  const { s } = d;
  const has = !!s.pos;
  const TABS = [
    ['pos', `Positions${has ? ' (1)' : ''}`],
    ['ord', `Orders${has ? ' (2)' : ''}`],
    ['trd', `Trades (${has ? 27 : 26})`],
  ] as const;

  return (
    <div className="dlists">
      <div className="dtabsr">
        {TABS.map(([k, label]) => {
          const on = d.can('tab', k);
          return (
            <span className={'dlt' + (s.tab === k ? ' on' : '') + live(on)} key={k} {...press(on)}
                  data-tap={'tab:' + k}>
              {label}
            </span>
          );
        })}
      </div>

      <div className="dlist">
        {s.tab === 'pos' && !has ? (
          <div className="dempty"><b>No open positions</b><em>Open positions will show up here.</em></div>
        ) : null}

        {s.tab === 'pos' && has && s.pos ? (
          <>
            <div className={'dli' + live(d.can('rowOpen'))} {...press(d.can('rowOpen'))}>
              <TokenDot token={BTC} size={22} />
              <span className="dlit"><b>BTC</b><em>{s.pos.side === 'long' ? 'Long' : 'Short'} {s.pos.lev}x</em></span>
              <span className="dliv"><b data-pnl className="down">&minus;$1.58</b><i data-pnlp>&minus;0.23%</i></span>
            </div>
            {s.rowOpen ? (
              <dl className="dlid">
                <div><dt>Value</dt><dd>{money(s.pos.size)} <i>{(s.pos.size / s.pos.entry).toFixed(5)} BTC</i></dd></div>
                <div><dt>Entry price</dt><dd>{usd(s.pos.entry)}</dd></div>
                <div><dt>Liquidation</dt><dd>{usd(liqPrice(s.pos.entry, s.pos.lev, s.pos.side))} <i>{(liqPct(s.pos.lev) * 100).toFixed(0)}% below</i></dd></div>
              </dl>
            ) : null}
          </>
        ) : null}

        {s.tab === 'ord' ? (
          has ? (
            <>
              <OrderRow kind="Take profit" price={82000} side="Sell" />
              <OrderRow kind="Stop loss" price={78200} side="Sell" />
            </>
          ) : <div className="dempty"><b>No open orders</b><em>Resting orders will show up here.</em></div>
        ) : null}

        {s.tab === 'trd' ? (
          <>
            {has ? <TradeRow kind="Open Long" when="just now" value={s.pos!.size} price={ENTRY} /> : null}
            <TradeRow kind="Close Long" when="18h ago" value={99.79} price={80475} gain={9.04} />
            <TradeRow kind="Open Long" when="18h ago" value={99.55} price={80446} />
          </>
        ) : null}
      </div>
    </div>
  );
}

function OrderRow({ kind, price, side }: { kind: string; price: number; side: string }) {
  return (
    <div className="dli">
      <TokenDot token={BTC} size={22} />
      <span className="dlit"><b>{kind}</b><em>BTC · {side}</em></span>
      <span className="dliv"><b>{usd(price)}</b><i>Trigger</i></span>
    </div>
  );
}

function TradeRow({ kind, when, value, price, gain }: {
  kind: string; when: string; value: number; price: number; gain?: number;
}) {
  return (
    <div className="dli trade">
      <TokenDot token={BTC} size={22} />
      <span className="dlit"><b>{kind}</b><em>BTC · {when}</em></span>
      <span className="dliv">
        {gain ? <b className="dgain">+${fmt(gain, 2)}</b> : <b />}
        <i>{usd(value)} · {usd(price)}</i>
      </span>
    </div>
  );
}

/* the My account panel, which is where Deposit lives */
function MyAccount({ d }: { d: Deck }) {
  const { s } = d;
  const open = s.screen === 'market' && s.acct && !s.ticket;
  const used = s.pos ? s.pos.size / s.pos.lev : 0;
  return (
    <Layer open={open} onScrim={d.can('acct')}>
      <div className="dsheet acct">
        <span className="dgrab" />
        <b className="dsh">My account</b>
        <dl className="dmine">
          <div><dt>Total equity</dt><dd>{usd(s.perps)}</dd></div>
          <div><dt>Unrealized PNL</dt><dd>$0.00 <i>0.00%</i></dd></div>
        </dl>
        <span className="dmeter"><i style={{ width: `${Math.min(100, (used / s.perps) * 100)}%` }} /></span>
        <dl className="dmine split">
          <div><dt>Margin in use</dt><dd>{usd(used)}</dd></div>
          <div className="r"><dt>Available</dt><dd>{usd(avail(s))}</dd></div>
        </dl>
        <div className="dpair">
          <span className={'dbtn' + live(d.can('deposit'))} {...press(d.can('deposit'))}>Deposit</span>
          <span className="dbtn">Withdraw</span>
        </div>
      </div>
    </Layer>
  );
}

/* ---- 3 · funding ------------------------------------------------------ */

function Fund({ d }: { d: Deck }) {
  const { s } = d;
  const back = d.can('closeFund');
  const review = d.can('fundReview');
  const settling = s.screen === 'funding';

  return (
    <div className="dfund">
      <div className="dmhead">
        <span className={'dback' + live(back)} {...press(back)} aria-label="Back">‹</span>
        {settling ? <span className="dspin sm" aria-hidden="true" /> : null}
      </div>
      <b className="dftitle">Fund Perps Account</b>
      <em className="dfsub">Move USDC from your near.com account to your Perps account.</em>

      {settling ? (
        <div className="dsettle">
          <span className="dcoin"><TokenDot token={USDC} size={30} /></span>
          <b className="dsend">Sending {fmt(Number(s.fundAmt) || 0)} USDC<br />to Perps account</b>
          <ProgressList steps={FUND_STEPS} at={s.fstep} />
          <span className="dghost">View on explorer ↗</span>
          <span className="dghost">Create a new send</span>
        </div>
      ) : (
        <>
          <div className="damt">
            <b className={s.fundAmt ? '' : 'off'}>${s.fundAmt || '0'}</b>
            <span className="dpayrow">
              <TokenDot token={NEAR} size={17} />
              <span>Pay NEAR ⌄</span>
              <i>${fmt(NEAR_AVAIL)} available</i>
            </span>
          </div>
          <span className={'dcta' + (review ? '' : ' off') + live(review)} {...press(review)}>
            {Number(s.fundAmt) > 0 ? 'Review send' : 'Enter amount'}
          </span>
          <Keypad pressed={s.pressed} onKey={(k) => d.can('fkey', k)} onDone={null} />
        </>
      )}
    </div>
  );
}

function ReviewSheet({ d }: { d: Deck }) {
  const { s } = d;
  const send = d.can('fundSend');
  return (
    <Layer open={s.over === 'review'} onScrim={null}>
      <div className="dsheet rev">
        <div className="drevh"><b>Review send</b><span className="dx">×</span></div>
        <span className="dshield" aria-hidden="true" />
        <b className="drevt">Confirm send to<br />Perps account</b>
        <dl className="drevl">
          <div><dt>Estimated time</dt><dd>{FUND_ETA}</dd></div>
          <div><dt>Recipient receives</dt><dd>{fmt(Number(s.fundAmt) || 0)} USDC <TokenDot token={USDC} size={13} /></dd></div>
          <div><dt>Fee</dt><dd>0 NEAR <TokenDot token={NEAR} size={13} /></dd></div>
          <div><dt>You pay at most</dt><dd>{FUND_PAY_NEAR} NEAR <TokenDot token={NEAR} size={13} /></dd></div>
          <div><dt>Maximum slippage</dt><dd>{FUND_SLIPPAGE}</dd></div>
        </dl>
        <em className="drevn">You&rsquo;re responsible for where your funds go. Transfers are irreversible.</em>
        <span className={'dcta light' + live(send)} {...press(send)}>Send</span>
      </div>
    </Layer>
  );
}

/* ---- 4-6 · the ticket ------------------------------------------------- */

function Ticket({ d }: { d: Deck }) {
  const { s } = d;
  const c = cta(s);
  const size = notional(s);
  const submit = d.can('submit');
  const padUp = s.focus !== null && s.ticket;

  return (
    <Layer open={s.ticket} onScrim={d.can('closeTicket')}>
      <div className={'dsheet tk' + (padUp ? ' pad' : '')}>
        <span className="dgrab" />

        <div className="dtkrow">
          <span className="dseg">
            {(['long', 'short'] as const).map((k) => {
              const on = d.can('side', k);
              return (
                <span className={'dsg ' + k + (s.side === k ? ' on' : '') + live(on)} key={k} {...press(on)}
                      data-tap={'seg:' + k}>
                  {k === 'long' ? 'Long' : 'Short'}
                </span>
              );
            })}
          </span>
          <span className={'dot' + (s.over === 'otype' ? ' on' : '') + live(d.can('otypeMenu'))}
                {...press(d.can('otypeMenu'))} data-tap="otype">
            {s.otype} <i>{s.over === 'otype' ? '⌃' : '⌄'}</i>
          </span>
        </div>

        <div className="davail">
          <span>Available to trade</span>
          <b>${fmt(avail(s))}</b>
          <i>Max</i>
        </div>

        <div className="dfield">
          <span className="dflab">Amount</span>
          <span className={'dfin' + (s.focus === 'amount' ? ' on' : '') + live(d.can('focus', 'amount'))}
                {...press(d.can('focus', 'amount'))} data-tap="field:amount">
            <i className="dcur">$</i>
            <b>{s.amount}</b>
            {s.focus === 'amount' ? <i className="dcaret" /> : null}
          </span>
          <span className={'dlev' + live(d.can('levSheet'))} {...press(d.can('levSheet'))}
                data-tap="lev">{s.lev}x <i>⌄</i></span>
        </div>

        {s.otype === 'Limit' ? (
          <div className="dfield">
            <span className="dflab">Limit price</span>
            <span className={'dfin wide' + (s.focus === 'limit' ? ' on' : '') + live(d.can('focus', 'limit'))}
                  {...press(d.can('focus', 'limit'))}>
              <i className="dcur">$</i>
              <b>{s.limit}</b>
              {s.focus === 'limit' ? <i className="dcaret" /> : null}
            </span>
          </div>
        ) : null}

        <span className={'dchk' + (s.prot ? ' on' : '') + live(d.can('prot'))} {...press(d.can('prot'))}
              data-tap="prot">
          <i className="dbox" />Add profit taker/stop loss
        </span>

        {s.prot ? (
          <>
            <Protect d={d} which="tp" label="Take profit" bad={tpBad(s)}
                     err="Take profit must be above entry price" />
            <Protect d={d} which="sl" label="Stop loss" bad={slBad(s)}
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

        <dl className="dest">
          <div><dt>Est. trade value</dt><dd>{money(size)} <i>{btcSize(s).toFixed(5)} BTC</i></dd></div>
          <div>
            <dt>Est. liquidation</dt>
            <dd>{usd(liqPrice(ENTRY, s.lev, s.side))} <i>{(liqPct(s.lev) * 100).toFixed(0)}% below</i></dd>
          </div>
        </dl>

        {padUp ? <Keypad pressed={s.pressed} onKey={(k) => d.can('key', k)} onDone={d.can('done')} /> : null}

        <OtypeMenu d={d} />
      </div>
    </Layer>
  );
}

function Protect({ d, which, label, bad, err }: {
  d: Deck; which: 'tp' | 'sl'; label: string; bad: boolean; err: string;
}) {
  const { s } = d;
  const val = which === 'tp' ? s.tp : s.sl;
  const unit = s.punit;
  const focus = d.can('focus', which);
  const swap = d.can('unit', which);
  return (
    <div className="dfield prot">
      <span className="dflab">{label}</span>
      <span className={'dfin wide' + (s.focus === which ? ' on' : '') + (bad ? ' bad' : '') + live(focus)}
            {...press(focus)} data-tap={'field:' + which}>
        {unit === '$' ? <i className="dcur">$</i> : null}
        <b>{val}</b>
        {s.focus === which ? <i className="dcaret" /> : null}
        <span className="dunit">
          <i>{unit}</i>
          <span className={'dswap' + live(swap)} {...press(swap)} data-tap={'unit:' + which}
                aria-label="Switch unit">⇄</span>
        </span>
      </span>
      {bad ? <em className="derr">{err}</em> : null}
    </div>
  );
}

function OtypeMenu({ d }: { d: Deck }) {
  const { s } = d;
  if (s.over !== 'otype') return null;
  const rows = [
    ['Market', 'Trade at the current market price.'],
    ['Limit', 'Trade at a specified price.'],
  ] as const;
  return (
    <div className="dmenu">
      {rows.map(([k, sub]) => {
        const on = d.can('otype', k);
        return (
          <span className={'dmi' + live(on)} key={k} {...press(on)}>
            <span><b>{k}</b><em>{sub}</em></span>
            {s.otype === k ? <i className="dtick">✓</i> : null}
          </span>
        );
      })}
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
          <span className="dlevbox">{s.levDraft} <i>x</i></span>
        </div>
        <span className={'dcta light' + live(d.can('levSave'))} {...press(d.can('levSave'))}
              data-tap="save">Save</span>
      </div>
    </Layer>
  );
}

/* ---- the passkey ------------------------------------------------------ */

function Passkey({ d }: { d: Deck }) {
  const { s } = d;
  const use = d.can(s.submitting ? 'ostep' : 'authOk');
  return (
    <Layer open={s.over === 'passkey'} onScrim={null}>
      <div className="dsheet pass">
        <span className="dx">×</span>
        <span className="dface" aria-hidden="true" />
        <b className="dsh">Sign In</b>
        <em className="dpsub">
          Sign in to &ldquo;near.com&rdquo; with your passkey for<br />
          &ldquo;Long for a living&rdquo; saved in &ldquo;Passwords&rdquo;?
        </em>
        {s.auth === 'ask' ? (
          <>
            <span className={'dcta blue' + live(use)} {...press(use)} data-tap="passkey">Use Passkey</span>
            <span className="dghost">More Options</span>
          </>
        ) : (
          <div className="dauth">
            {s.auth === 'signing'
              ? <><span className="dspin big" /><em>Signing in</em></>
              : <><span className="ddone">✓</span><em>Done</em></>}
          </div>
        )}
      </div>
    </Layer>
  );
}

/* ---- the layer every sheet rides on ----------------------------------- */
