'use client';
import { useFlow, type Flow } from './flows/player';
import { AVAILABLE, DEPOSIT_STEPS, VAULTS, earn, type EarnAction, type EarnState } from './flows/earn';
import { Enter } from './ui/Enter';
import { Keypad } from './ui/Keypad';
import { LiveDot } from './ui/LiveDot';
import { ProgressList } from './ui/ProgressList';
import { Sheet } from './ui/Sheet';
import { Ticker } from './ui/Ticker';
import { SheetPortal } from './ui/SheetSlot';
import { live as can, press } from './ui/tap';

/**
 * 3 · EARN — the vault list, and the vault.
 *
 * The sheet is the whole screen for a reason: choosing where yield comes from
 * is the decision, and the app gives it the full frame rather than a row that
 * expands.
 */
export function EarnFace() {
  const f = useFlow(3, earn);
  const s = f.s;
  const v = VAULTS[s.vault];
  const settling = s.screen === 'depositing' || s.screen === 'done';
  const tap = (id: string) => (s.tap === id ? ' tapped' : '');
  const usd = (Number(s.amount) || 0).toFixed(2);

  return (
    <div className={'face eface' + (f.looping ? ' looping' : '') + (f.held ? ' held' : '')} data-face="3">
      <Enter k={`l${f.pass}`} className="elist">
        <p className="psub"><span className="pbeta">Beta</span>Put your idle assets to work.</p>

        <div className="etabs" role="tablist" aria-label="Earn types">
          {(['Vaults', 'Staking'] as const).map((t) => {
            const fn = f.can('tab', t);
            return (
              <span className={'et' + can(fn)} role="tab" key={t} aria-selected={s.tab === t} {...press(fn)}>
                {t}
              </span>
            );
          })}
        </div>

        {s.tab === 'Vaults' ? (
          <>
            <p className="edesc">
              Earn yield by depositing into professionally managed vaults. As a general
              guide, the APR is considered reflective of the strategy risk level.
            </p>

            <div className="etbl">
              <div className="ethead"><span>Vault</span><span>Balance</span></div>
              <div className="etrs" role="listbox" aria-label="Vaults">
                {VAULTS.map((vault, i) => {
                  const fn = f.can('openVault', String(i));
                  return (
                    <div
                      className={'etr' + (i === s.vault ? tap('vaultrow') : '') + can(fn)}
                      role="option"
                      key={vault.name}
                      aria-selected={s.screen !== 'list' && i === s.vault}
                      {...press(fn)}
                    >
                      <span className="vico" aria-hidden="true">$</span>
                      <span className="enm">
                        <b>{vault.name}{vault.promo ? <i className="vpromo">Promo</i> : null}</b>
                        <span>TVL {vault.tvlLabel} · {vault.apr}</span>
                      </span>
                      <span className="ebal"><b>{vault.bal}</b></span>
                      <span className="echev">&#8250;</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* An app that pretends every tab is finished is an app nobody
             believes. Staking is real, and it is empty. */
          <div className="pempty tall">
            <b>Staking is coming</b>
            <span>Validator staking arrives with the next release.</span>
          </div>
        )}
      </Enter>

      <SheetPortal>
        <Sheet open={s.screen !== 'list'}>
          <div className="vhead">
            <span className="vico big" aria-hidden="true">$</span>
            <b className="vname">{v.name}</b>
            <p className="vdesc">
              This yield vault is provided by Taler, a NEAR ecosystem company, and
              managed by the <u>TAU Labs</u> team, and is built on Ethereum.
            </p>
          </div>

          <dl className="vstat">
            <div><dt>APY <LiveDot /></dt><dd>{v.apr}</dd></div>
            {/* a vault's TVL creeps all day; frozen it reads as a brochure */}
            <div>
              <dt>TVL</dt>
              <dd>$<Ticker base={v.tvl} amp={v.tvl * 0.0008} dp={0} every={2800} live={f.live} /></dd>
            </div>
          </dl>

          {settling ? (
            <div className="vsettle enter-one" key={`d${f.pass}`}>
              <b className="vsettleh">Depositing {s.amount || AVAILABLE} USDC</b>
              <ProgressList steps={DEPOSIT_STEPS} at={s.step} />
              <span className="vref">Reference ID <i>Cc.X9D…FtYC</i></span>
              {s.screen === 'done' ? (
                <span className={'vclose enter-one' + can(f.can('close'))} {...press(f.can('close'))}>Close</span>
              ) : null}
            </div>
          ) : (
            <Enter k={`v${f.pass}`} className="vform">
              <dl className="vfees">
                <div><dt>Deposit fee</dt><dd>Variable, up to 0.01%</dd></div>
                <div><dt>Withdrawal fee</dt><dd>Fixed, 0.05%</dd></div>
                <div>
                  <dt>Performance fee <i className="vpromo">Promo</i></dt>
                  <dd>0% through Oct 31, 2026</dd>
                </div>
              </dl>

              <div className="vseg">
                {(['Deposit', 'Withdraw'] as const).map((side) => {
                  const fn = f.can('side', side);
                  return (
                    <span className={'vsg' + (s.side === side ? ' on' : '') + tap('side') + can(fn)}
                      key={side} {...press(fn)}>{side}</span>
                  );
                })}
              </div>

              <div className={'vamt' + (s.focus ? ' focus' : '') + can(f.can('focus'))} {...press(f.can('focus'))}>
                <b className={s.amount ? '' : 'ghost'}>
                  {s.amount || '0'} <i>USDC</i>
                  {s.focus ? <span className="pcaret" /> : null}
                </b>
                <em>${usd}</em>
                <span className="vavail">
                  <span className="vico" aria-hidden="true">$</span>
                  <span className="vatext">
                    <i>{s.side === 'Deposit' ? 'Available' : 'Deposited'}</i>
                    <b>{AVAILABLE} USDC</b>
                  </span>
                  <span className={'vmax' + (s.maxed ? ' on' : '') + tap('max') + can(f.can('max'))}
                    {...press(f.can('max'))}>Use max</span>
                </span>
              </div>

              <span className={'vcta' + (Number(s.amount) > 0 ? '' : ' off') + tap('deposit') + can(f.can('deposit'))}
                {...press(f.can('deposit'))}>
                {Number(s.amount) > 0 ? s.side : 'Enter an amount'}
              </span>
            </Enter>
          )}

          {s.focus && !settling ? (
            <Keypad pressed={s.pressed} onKey={(k) => f.can('key', k)} onDone={f.can('blur')} />
          ) : null}
        </Sheet>
      </SheetPortal>
    </div>
  );
}

export type EarnFlow = Flow<EarnState, EarnAction>;
