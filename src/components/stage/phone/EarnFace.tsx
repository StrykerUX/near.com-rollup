'use client';
import { useFlow } from './flows/player';
import { AVAILABLE, DEPOSIT_STEPS, earnScript, type EarnState } from './flows/earn';
import { ProgressList } from './ui/ProgressList';
import { Sheet } from './ui/Sheet';
import { SheetPortal } from './ui/SheetSlot';

const VAULTS = [
  { name: 'Gauntlet USDC', tvl: '$4.32.92M', apr: '4.52%', bal: '$1,343', promo: false },
  { name: 'Taler USDC', tvl: '$854.15K', apr: '5.80%', bal: '$1,047', promo: true },
];

/**
 * 3 · EARN — the vault list, and the vault.
 *
 * The sheet is the whole screen for a reason: choosing where yield comes from
 * is the decision, and the app gives it the full frame rather than a row that
 * expands.
 */
export function EarnFace() {
  const { state: s } = useFlow<EarnState>(3, earnScript);
  const settling = s.screen === 'depositing' || s.screen === 'done';

  return (
    <div className="face eface" data-face="3">
      <p className="psub"><span className="pbeta">Beta</span>Put your idle assets to work.</p>

      <div className="etabs" role="tablist" aria-label="Earn types">
        {(['Vaults', 'Staking'] as const).map((t) => (
          <span className="et" role="tab" key={t} aria-selected={s.tab === t}>{t}</span>
        ))}
      </div>

      <p className="edesc">
        Earn yield by depositing into professionally managed vaults. As a general
        guide, the APR is considered reflective of the strategy risk level.
      </p>

      <div className="etbl">
        <div className="ethead"><span>Vault</span><span>Balance</span></div>
        <div className="etrs" role="listbox" aria-label="Vaults">
          {VAULTS.map((v, i) => (
            <div
              className="etr"
              role="option"
              key={v.name}
              aria-selected={s.screen !== 'list' && i === 1}
            >
              <span className="vico" aria-hidden="true">$</span>
              <span className="enm">
                <b>{v.name}{v.promo ? <i className="vpromo">Promo</i> : null}</b>
                <span>TVL {v.tvl} · {v.apr}</span>
              </span>
              <span className="ebal"><b>{v.bal}</b></span>
              <span className="echev">&#8250;</span>
            </div>
          ))}
        </div>
      </div>

      <SheetPortal>
        <Sheet open={s.screen !== 'list'}>
          <div className="vhead">
            <span className="vico big" aria-hidden="true">$</span>
            <b className="vname">Taler USDC</b>
            <p className="vdesc">
              This yield vault is provided by Taler, a NEAR ecosystem company, and
              managed by the <u>TAU Labs</u> team, and is built on Ethereum.
            </p>
          </div>

          <dl className="vstat">
            <div><dt>APY</dt><dd>5.80%</dd></div>
            <div><dt>TVL</dt><dd>$854,153</dd></div>
          </dl>

          {settling ? (
            <div className="vsettle">
              <b className="vsettleh">Depositing {AVAILABLE} USDC</b>
              <ProgressList steps={DEPOSIT_STEPS} at={s.step} />
              <span className="vref">Reference ID <i>Cc.X9D…FtYC</i></span>
              {s.screen === 'done' ? (
                <button className="vclose" type="button" tabIndex={-1}>Close</button>
              ) : null}
            </div>
          ) : (
            <>
              <dl className="vfees">
                <div><dt>Deposit fee</dt><dd>Variable, up to 0.01%</dd></div>
                <div><dt>Withdrawal fee</dt><dd>Fixed, 0.05%</dd></div>
                <div>
                  <dt>Performance fee <i className="vpromo">Promo</i></dt>
                  <dd>0% through Oct 31, 2026</dd>
                </div>
              </dl>

              <div className="vseg">
                <span className="vsg on">Deposit</span>
                <span className="vsg">Withdraw</span>
              </div>

              <div className="vamt">
                <b className={s.amount ? '' : 'ghost'}>{s.amount || '0'} <i>USDC</i></b>
                <em>${s.amount ? '22.56' : '0.00'}</em>
                <span className="vavail">
                  <span className="vico" aria-hidden="true">$</span>
                  <span className="vatext"><i>Available</i><b>{AVAILABLE} USDC</b></span>
                  <span className={'vmax' + (s.maxed ? ' on' : '')}>Use max</span>
                </span>
              </div>

              <button className={'vcta' + (s.amount ? '' : ' off')} type="button" tabIndex={-1}>
                {s.amount ? 'Deposit' : 'Enter an amount'}
              </button>
            </>
          )}
        </Sheet>
      </SheetPortal>
    </div>
  );
}
