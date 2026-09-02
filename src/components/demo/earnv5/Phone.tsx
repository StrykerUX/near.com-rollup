'use client';
import { fmt } from '@/lib/format';
import { live, press } from '@/components/stage/phone/ui/tap';
import { Enter } from '@/components/stage/phone/ui/Enter';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { Layer, Tabs } from '@/components/demo/shell/Frame';
import { Dot } from '@/components/demo/app/Dot';
import { PALETTE_VARS } from '@/components/demo/app/palette';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  BETA, BLURB, COLS, DEPOSIT, REFERENCE, STAKE_APY, STAKED_NEAR, STEPS, SUB, TITLE, VAULTS,
  available, balanceOf, cta, stakeUsd, vaultOf, type EA, type EAAction, type Vault,
} from './state';

type Deck = GenericDeck<EA, EAAction>;

/**
 * EARN — THE DEVICE
 * ==================================================================
 * Read off `rec-Earn + being able to send:pay from your earn balance.MP4` at
 * one frame per second. The Vaults half is quoted: the Beta badge, the
 * subtitle, the paragraph, the table's own `Vault` / `Balance` headers, both
 * rows with `TVL … · rate` under the name, and Taler's sheet down to the fee
 * wording and the reference id.
 *
 * The Staking and Positions tabs are the brief's — see `STAKED_NEAR` and
 * `POSITIONS_TAB` in state.ts, which carry the note about what is not on film.
 */

const usd = (v: number, dp = 2) => '$' + fmt(v, dp);
const USDC = { sym: 'USDC', color: '#2775CA', ink: '#fff' };
const NEAR = { sym: 'NEAR', color: '#00EC97', ink: '#000' };

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="pdev app earn" data-motion="rich" data-tempo="fast" style={PALETTE_VARS}>
      <div className="pdview">
        <div className="ernhead">
          <b>{TITLE}</b><i className="ernbeta">{BETA}</i>
        </div>
        <span className="ernsub">{SUB}</span>

        <div className="erntabs">
          {(['vaults', 'staking', 'positions'] as const).map((k) => {
            const on = d.can('tab', k);
            return (
              <span className={'erntab' + (s.tab === k ? ' on' : '') + live(on)} key={k}
                    {...press(on)} data-tap={'tab:' + k}>
                {k === 'vaults' ? 'Vaults' : k === 'staking' ? 'Staking' : 'Positions'}
              </span>
            );
          })}
        </div>

        {s.tab === 'vaults' ? <Vaults d={d} />
          : s.tab === 'staking' ? <Staking d={d} />
            : <Positions d={d} />}
      </div>

      {/* THE TAB BAR HAS NO EARN. Home / Assets / Swap / Perps / Menu is the
          whole row in every frame of every recording — Earn is reached from
          the Home screen's third balance row, so Home is what stays lit. */}
      <Tabs on="Home" />
      <VaultSheet d={d} />
    </div>
  );
}

/* ---- 1 · the vaults ---------------------------------------------------- */

function Vaults({ d }: { d: Deck }) {
  return (
    <Enter k={`v${d.pass}`} className="ernpane">
      <p className="ernblurb">{BLURB}</p>

      {/* the table's own headers, frame 0:02 */}
      <div className="erncols"><i>{COLS[0]}</i><i>{COLS[1]}</i></div>

      <div className="ernlist">
        {VAULTS.map((v) => {
          const open = d.can('openVault', v.id);
          return (
            <span className={'ernrow' + live(open)} key={v.id} {...press(open)}
                  data-tap={'vault:' + v.id}>
              <Dot a={USDC} size={30} />
              <span className="ernrowt">
                <b>{v.name}{v.promo ? <i className="ernpromo">Promo</i> : null}</b>
                <em>TVL {v.tvl} · {v.apr}</em>
              </span>
              <b className="ernbal">{usd(balanceOf(d.s, v), 0)}</b>
              <Chev />
            </span>
          );
        })}
      </div>
    </Enter>
  );
}

/** lucide `chevron-right` (ISC) */
function Chev() {
  return (
    <svg className="ernchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* ---- 2 · the stake ----------------------------------------------------- */

function Staking({ d }: { d: Deck }) {
  return (
    <Enter k={`s${d.pass}`} className="ernpane">
      <p className="ernblurb">
        Stake NEAR to help secure the network. Rewards accrue every epoch and
        compound into the same position.
      </p>
      <div className="ernstake">
        <div className="ernstakeh">
          <Dot a={NEAR} size={34} />
          <span className="ernrowt"><b>NEAR</b><em>Staked · {STAKE_APY} APY</em></span>
          <span className="ernlive"><i />Accruing</span>
        </div>
        <b className="ernstakev">{fmt(STAKED_NEAR, 0)} <em>NEAR</em></b>
        <span className="ernstakeu">{usd(stakeUsd())}</span>
      </div>
    </Enter>
  );
}

/* ---- 3 · both ---------------------------------------------------------- */

function Positions({ d }: { d: Deck }) {
  const v = vaultOf('taler');
  return (
    <Enter k={`p${d.pass}`} className="ernpane">
      <div className="erncols"><i>Position</i><i>Value</i></div>
      <div className="ernlist">
        <span className="ernrow">
          <Dot a={USDC} size={30} />
          <span className="ernrowt">
            <b>{v.name}</b>
            <em>Yield vault · {v.apr}</em>
          </span>
          <b className="ernbal">{usd(Number(DEPOSIT), 0)}</b>
        </span>
        <span className="ernrow">
          <Dot a={NEAR} size={30} />
          <span className="ernrowt">
            <b>NEAR</b>
            <em>Staked · {STAKE_APY}</em>
          </span>
          <b className="ernbal">{usd(stakeUsd(), 0)}</b>
        </span>
      </div>
    </Enter>
  );
}

/* ---- the vault's sheet ------------------------------------------------- */

function VaultSheet({ d }: { d: Deck }) {
  const { s } = d;
  const v: Vault | null = s.open ? vaultOf(s.open) : null;
  const c = cta(s);

  return (
    <Layer open={!!s.open} onScrim={d.can('closeVault')}>
      <div className="dsheet ernsheet">
        <span className="dgrab" />
        {v ? (
          <>
            <Dot a={USDC} size={30} />
            <b className="ernsh">{v.name}</b>
            <p className="erndesc">{v.desc}</p>

            <div className="ernstat">
              <span><i>APY</i><b>{v.apy}</b></span>
              <span><i>TVL</i><b>{v.tvlFull}</b></span>
            </div>

            <dl className="ernfees">
              {v.fees.map(([k, val, promo]) => (
                <div key={k}>
                  <dt>{k}{promo ? <i className="ernpromo">Promo</i> : null}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>

            {s.submitting ? (
              <div className="ernsettle">
                <b className="ernsettleh">Depositing {fmt(Number(s.amount), 2)} USDC</b>
                <ProgressList steps={STEPS} at={s.step} />
                <span className="ernref"><i>Reference ID</i><b>{REFERENCE}</b></span>
              </div>
            ) : (
              <>
                <div className="ernside">
                  {(['deposit', 'withdraw'] as const).map((k) => {
                    const on = d.can('side', k);
                    return (
                      <span className={'ernsg' + (s.side === k ? ' on' : '') + live(on)} key={k}
                            {...press(on)}>{k === 'deposit' ? 'Deposit' : 'Withdraw'}</span>
                    );
                  })}
                </div>

                <div className="ernamt">
                  <span className="ernamtv">
                    <b>{s.amount ? fmt(Number(s.amount), 0) : '0'}</b><em>USDC</em>
                    {s.focus === 'amount' ? <i className="bcaret" /> : null}
                  </span>
                  <span className="ernamtu">{usd(Number(s.amount) || 0)}</span>
                </div>

                <div className="ernavail">
                  <Dot a={USDC} size={22} />
                  <span className="ernrowt"><em>Available</em><b>{fmt(available(s), 2)} USDC</b></span>
                  <span className={'ernmax' + live(d.can('max'))} {...press(d.can('max'))}
                        data-tap="max">Use max</span>
                </div>

                <span className={'bcta' + (c.ok ? '' : ' off') + live(d.can('confirm'))}
                      {...press(d.can('confirm'))} data-tap="deposit">{c.label}</span>
              </>
            )}
          </>
        ) : null}
      </div>
    </Layer>
  );
}
