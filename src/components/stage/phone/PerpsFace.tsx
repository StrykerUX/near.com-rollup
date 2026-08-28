'use client';
import { useState } from 'react';
import { IconPerpsCaret } from './icons';

const LISTS = [
  { label: 'Positions' },
  { label: 'Orders' },
  { label: 'Trades', count: '(24)' },
];
const MARKETS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'NEAR-USD'];

/**
 * 0 · PERPS — the frame the tour opens on.
 *
 * Matched to the real app's Perps screen: Beta pill and risk line, balance
 * block with caret and day chip, Add funds / Withdraw, list tabs, empty state,
 * and the Markets pill row. The screen is mostly static; only the list tabs and
 * the market pills toggle.
 */
export function PerpsFace() {
  const [list, setList] = useState(0);
  const [market, setMarket] = useState(0);

  return (
    <div className="face" data-face="2">
      <p className="psub">
        <span className="pbeta">Beta</span>Advanced trading with leverage. High risk.
      </p>
      <span className="klabel pblab">Perps balance</span>
      <div className="kbig pbal">$87.18<IconPerpsCaret /></div>
      <div className="prow"><span>$0.00</span><span className="pchip">0.00%</span></div>

      <div className="seg pacts" role="group" aria-label="Perps actions">
        <button type="button">Add funds</button>
        <button type="button">Withdraw</button>
      </div>

      <div className="ptabs" role="tablist" aria-label="Perps lists">
        {LISTS.map((t, i) => (
          <button
            className="pt"
            role="tab"
            key={t.label}
            aria-selected={list === i}
            onClick={() => setList(i)}
          >
            {t.label}{t.count ? <> <span className="ptc">{t.count}</span></> : null}
          </button>
        ))}
      </div>

      <div className="pempty">
        <b>No open positions</b>
        <span>Open positions will show up here.</span>
      </div>

      <div className="pmk">
        <span className="klabel">Markets</span>
        <div className="pmrow">
          {MARKETS.map((m, i) => (
            <span
              className={'pm' + (market === i ? ' on' : '')}
              key={m}
              onClick={() => setMarket(i)}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
