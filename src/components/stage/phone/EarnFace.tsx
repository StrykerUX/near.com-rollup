'use client';
import { useState } from 'react';
import { EthTokenIcon, NearTokenIcon, SolTokenIcon } from '@/components/marks';

const ASSETS = [
  { sym: 'NEAR', apr: '4.56% APR', bal: '0 NEAR', usd: '$0.00', bg: '#00EC97', Icon: NearTokenIcon },
  { sym: 'ETH',  apr: '2.91% APR', bal: '0 ETH',  usd: null,    bg: '#C9D1F5', Icon: EthTokenIcon },
  { sym: 'SOL',  apr: '6.35% APR', bal: '0 SOL',  usd: null,    bg: '#8E9093', Icon: SolTokenIcon },
];

/**
 * 3 · EARN — matched to the app's Staking screen: type tabs and asset rows.
 * Staking leads, because Vaults is the screen with nothing in it.
 */
export function EarnFace() {
  const [tab, setTab] = useState<'Vaults' | 'Staking'>('Staking');
  const [row, setRow] = useState(0);

  return (
    <div className="face" data-face="3">
      <p className="psub"><span className="pbeta">Beta</span>Put your idle assets to work.</p>

      <div className="etabs" role="tablist" aria-label="Earn types">
        {(['Vaults', 'Staking'] as const).map((t) => (
          <button
            className="et"
            role="tab"
            type="button"
            key={t}
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="edesc">
        Stake assets to help secure their networks and earn rewards, shown as APR.
      </p>

      <div className="etbl">
        <div className="ethead"><span>Asset</span><span>Balance</span></div>
        {/* A listbox, not a bare stack of buttons: the stylesheet keys the
            selected row off aria-selected, and aria-selected is only valid on a
            role that supports it. role="option" makes the markup honest about
            what the row already is. */}
        <div className="etrs" role="listbox" aria-label="Stakeable assets">
          {ASSETS.map((a, i) => (
            <button
              className="etr"
              type="button"
              role="option"
              key={a.sym}
              aria-selected={row === i}
              onClick={() => setRow(i)}
            >
              <span className="tico" style={{ background: a.bg }}><a.Icon /></span>
              <span className="enm"><b>{a.sym}</b><span>{a.apr}</span></span>
              <span className="ebal">
                <b>{a.bal}</b>
                {a.usd ? <span>{a.usd}</span> : null}
              </span>
              <span className="echev">&#8250;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
