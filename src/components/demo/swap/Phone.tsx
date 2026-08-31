'use client';
import { ProgressList } from '@/components/stage/phone/ui/ProgressList';
import { live, press } from '@/components/stage/phone/ui/tap';
import { TokenDot } from '@/components/stage/phone/TokenDot';
import { findToken } from '@/lib/tokens';
import { fmt } from '@/lib/format';
import { Layer, StatusBar, Tabs } from '@/components/demo/shell/Frame';
import { AccountScreen, PasskeySheet, usd } from '@/components/demo/shell/Screens';
import type { Deck as GenericDeck } from '@/components/demo/shell/deck';
import {
  CATALOGUE, EARN_BAL, EARN_STEPS, MAIN_BAL, PERPS_BAL, RATE, REFERENCE,
  SWAP_STEPS, SLIPPAGE, VAULT,
  confidential, fromBal, holdings, least, out, price, total, vaultBal,
  type Holding, type SW, type SWAction,
} from './state';

type Deck = GenericDeck<SW, SWAction>;

/**
 * SWAP — the app
 * ==================================================================
 * Three screens and five layers. The Assets list is the spine: it is where the
 * swap starts, where it lands, and where the yield chip lives the whole time.
 */

/**
 * The token chip. The shared token table is the swap screen's on `/`, where
 * USDC is NEAR-green and Tether is absent; these recordings show the brands'
 * own colours, and two identically-lettered green circles for USDT and USDC
 * is exactly the ambiguity a token chip exists to remove. The letter is the
 * only thing `TokenDot` draws without a glyph, so it is what gets overridden.
 */
const LOCAL: Record<string, { sym: string; color: string; ink: string }> = {
  USDT: { sym: 'T', color: '#26A17B', ink: '#fff' },
  USDC: { sym: '$', color: '#2775CA', ink: '#fff' },
  ZEC: { sym: 'Z', color: '#F4B728', ink: '#000' },
};

const dot = (sym: string) => {
  const base = (() => {
    try {
      return findToken(sym);
    } catch {
      return { sym, name: sym, price: 1, color: '#3A4046', ink: '#fff', chain: '', dp: 2 };
    }
  })();
  return { ...base, ...(LOCAL[sym] ?? {}) };
};

export function Phone({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="pdev" data-screen={s.screen}>
      <StatusBar time="12:07" />
      <div className="pdview">
        {s.screen === 'account' ? <Account d={d} /> : null}
        {s.screen === 'assets' ? <Assets d={d} /> : null}
        {s.screen === 'swap' ? <SwapScreen d={d} /> : null}
      </div>
      <Tabs on={s.screen === 'account' ? 'Home' : s.screen === 'assets' ? 'Assets' : 'Swap'} />

      <ActionSheet d={d} />
      <TokenPicker d={d} />
      <ReviewSheet d={d} />
      <VaultSheet d={d} />
      <PasskeySheet
        open={s.over === 'passkey'}
        auth={s.auth}
        onUse={d.can('authOk')}
      />
    </div>
  );
}

/* ---- 1 · the account -------------------------------------------------- */

function Account({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <AccountScreen
      explore
      rows={[
        {
          label: 'Crypto',
          value: total(s),
          on: d.can('toAssets'),
          sub: <>
            <TokenDot token={dot('USDT')} size={13} /><TokenDot token={dot('USDC')} size={13} />
            <i>USDT, USDC</i>
          </>,
        },
        { label: 'Perps', value: PERPS_BAL, sub: <i>Trade with up to <b>50x</b> leverage</i> },
        { label: 'Earn', value: EARN_BAL, sub: <><i className="dgain">▲ 5.1%</i><i>blended APY</i></> },
      ]}
    />
  );
}

/* ---- 2 · assets ------------------------------------------------------- */

function Assets({ d }: { d: Deck }) {
  const { s } = d;
  return (
    <div className="dassets">
      <div className="dmhead">
        <span className={'dback' + live(d.can('home'))} {...press(d.can('home'))} aria-label="Back">‹</span>
      </div>
      <b className="dftitle">Assets</b>
      <span className="dlabel">Total balance <i className="deye" aria-hidden="true" /></span>
      <b className="dtotal sm">{usd(total(s))}</b>

      {/* the balance's two halves. Confidential is the larger one, which is
          the whole argument of this wallet stated as a number. */}
      <div className="dseg wide">
        {(['main', 'conf'] as const).map((k) => {
          const on = d.can('bucket', k);
          return (
            <span className={'dsg' + (s.bucket === k ? ' on' : '') + live(on)} key={k} {...press(on)}>
              <em>{k === 'main' ? 'Main' : 'Confidential'}</em>
              <b>{usd(k === 'main' ? MAIN_BAL : confidential(s))}</b>
            </span>
          );
        })}
      </div>

      <div className="dlist tall">
        {holdings(s).map((h, i) => <TokenRow d={d} h={h} key={h.sym + i} />)}
      </div>
    </div>
  );
}

function TokenRow({ d, h }: { d: Deck; h: Holding }) {
  const open = d.can('actions', h.sym);
  /* the chip is a control of its own: tapping the row and tapping the yield
     are two different intentions, and the app treats them that way */
  const chip = h.yield ? d.can('vault') : null;
  return (
    <div className={'dli' + live(open)} {...press(open)}>
      <TokenDot token={dot(h.sym)} size={26} />
      <span className="dlit">
        <b>{h.name}</b>
        <em>{fmt(h.qty, h.dp)} {h.sym}</em>
      </span>
      <span className="dliv">
        <b>{usd(h.usd)}</b>
        <i className={h.chg.startsWith('−') ? 'down' : 'dgain'}>{h.chg}</i>
      </span>
      {h.yield
        ? <span className={'dchip' + live(chip)} {...press(chip)}>Earn {h.yield}</span>
        : null}
    </div>
  );
}

function ActionSheet({ d }: { d: Deck }) {
  const { s } = d;
  const held = holdings(s).find((h) => h.sym === s.acted);
  return (
    <Layer open={s.over === 'actions'} onScrim={d.can('closeSheet')}>
      <div className="dsheet acts">
        <span className="dgrab" />
        <div className="dli plain">
          <TokenDot token={dot(s.acted ?? 'USDT')} size={26} />
          <span className="dlit">
            <b>{held?.name ?? s.acted}</b>
            <em>{held ? `${fmt(held.qty, held.dp)} ${held.sym}` : null}</em>
          </span>
        </div>
        <div className="dacts">
          <span className={'dact' + live(d.can('toSwap'))} {...press(d.can('toSwap'))}>⇄ Swap</span>
          <span className="dact">➤ Send</span>
          <span className="dact">▥ Earn</span>
          <span className="dact">← Move to Main</span>
        </div>
      </div>
    </Layer>
  );
}

/* ---- 3 · the swap ----------------------------------------------------- */

function SwapScreen({ d }: { d: Deck }) {
  const { s } = d;
  const settling = s.step >= 0;
  const finished = s.swapped;

  if (settling) {
    return (
      <div className="dswapscr">
        <div className="dmhead"><b className="dftitle sm">Swap</b><span className="dspin sm" /></div>
        <div className="dlegs">
          <Leg sym={s.from} qty={Number(s.amount)} dp={4} />
          <span className="darrow">↓</span>
          <Leg sym={s.to} qty={out(s)} dp={4} />
        </div>
        <div className="dchecks"><ProgressList steps={SWAP_STEPS} at={s.step} /></div>
        {finished
          ? <span className={'dghost' + live(d.can('again'))} {...press(d.can('again'))}>↺ Swap again</span>
          : null}
      </div>
    );
  }

  const max = d.can('max');
  const pick = d.can('picker');
  const review = d.can('review');

  return (
    <div className="dswapscr">
      <div className="dmhead"><b className="dftitle sm">Swap</b></div>

      <div className="dleg">
        <span className="dlegv">
          <b className={s.amount ? '' : 'off'}>{s.amount || `Enter amount ${s.from}`}</b>
          <span className="dtokchip"><TokenDot token={dot(s.from)} size={17} />{s.from} ⌄</span>
        </span>
        <span className="dlegm">
          <i>{usd((Number(s.amount) || 0) * price(s.from))} ⇅</i>
          <span className={'dbal' + live(max)} {...press(max)}>{fmt(fromBal(s), 6)} {s.from}</span>
        </span>
      </div>

      <span className="darrow mid">↓</span>

      <div className="dleg">
        <span className="dlegv">
          <b className={s.amount ? '' : 'off'}>{s.amount ? fmt(out(s), 3) : '0'}</b>
          <span className={'dtokchip' + live(pick)} {...press(pick)}>
            <TokenDot token={dot(s.to)} size={17} />{s.to} ⌄
          </span>
        </span>
        <span className="dlegm">
          <i>{usd(s.amount ? out(s) * price(s.to) : 0)}</i>
          <span>{s.amount ? fmt(out(s), 3) : 0} {s.to}</span>
        </span>
      </div>

      <span className={'dcta' + (review ? '' : ' off') + live(review)} {...press(review)}>
        {Number(s.amount) > 0 ? 'Review trade' : 'Please enter an amount'}
      </span>

      {Number(s.amount) > 0 ? <Quote s={s} /> : null}
    </div>
  );
}

function Leg({ sym, qty, dp }: { sym: string; qty: number; dp: number }) {
  return (
    <div className="dli plain">
      <TokenDot token={dot(sym)} size={26} />
      <span className="dlit"><b>{fmt(qty, dp)} {sym}</b><em>{usd(qty * price(sym))}</em></span>
    </div>
  );
}

/** the three rows that price the trade. The last one is the only promise. */
function Quote({ s }: { s: SW }) {
  return (
    <dl className="dest wide">
      <div><dt>Exchange rate</dt><dd>1 {s.to} = {RATE} {s.from}</dd></div>
      <div><dt>Max slippage ⓘ</dt><dd>{(SLIPPAGE * 100).toFixed(2)}% ⇄</dd></div>
      <div><dt>Receive at least</dt><dd>{fmt(least(s), 6)} {s.to}</dd></div>
    </dl>
  );
}

function TokenPicker({ d }: { d: Deck }) {
  const { s } = d;
  const q = s.query.trim().toLowerCase();
  const mine = holdings(s);
  const more = CATALOGUE.filter((t) => t.sym !== s.from);
  const hit = (sym: string, name: string) =>
    !q || sym.toLowerCase().startsWith(q) || name.toLowerCase().startsWith(q);

  return (
    <Layer open={s.over === 'picker'} onScrim={d.can('picker')}>
      <div className="dsheet picker">
        <span className="dgrab" />
        <b className="dsh">Select token</b>
        <span className="dsearch">
          <i>⌕</i>
          <b>{s.query || <em>Search tokens</em>}</b>
          {s.query ? <span className="dcaret" /> : null}
        </span>

        {mine.filter((h) => hit(h.sym, h.name)).length ? <span className="dgroup">Your tokens</span> : null}
        {mine.filter((h) => hit(h.sym, h.name)).map((h, i) => (
          <PickRow d={d} sym={h.sym} name={h.name} note={`${fmt(h.qty, h.dp)}`} usdv={h.usd} key={h.sym + i} />
        ))}

        {more.filter((t) => hit(t.sym, t.name)).length ? <span className="dgroup">More tokens</span> : null}
        {more.filter((t) => hit(t.sym, t.name)).map((t) => (
          <PickRow d={d} sym={t.sym} name={t.name} key={t.sym} />
        ))}
      </div>
    </Layer>
  );
}

function PickRow({ d, sym, name, note, usdv }: {
  d: Deck; sym: string; name: string; note?: string; usdv?: number;
}) {
  const on = d.can('pick', sym);
  return (
    <div className={'dli' + live(on)} {...press(on)}>
      <TokenDot token={dot(sym)} size={26} />
      <span className="dlit"><b>{sym}</b><em>{name}</em></span>
      {usdv !== undefined
        ? <span className="dliv"><b>{usd(usdv)}</b><i>{note}</i></span>
        : null}
      {d.s.to === sym ? <i className="dtick">✓</i> : null}
    </div>
  );
}

function ReviewSheet({ d }: { d: Deck }) {
  const { s } = d;
  const go = d.can('swap');
  return (
    <Layer open={s.over === 'review'} onScrim={d.can('closeSheet')}>
      <div className="dsheet rev">
        <div className="drevh"><b>Review trade</b><span className="dx">×</span></div>
        <div className="dlegs tight">
          <Leg sym={s.from} qty={Number(s.amount)} dp={5} />
          <span className="darrow">↓</span>
          <Leg sym={s.to} qty={out(s)} dp={5} />
        </div>
        <Quote s={s} />
        <span className={'dcta light' + live(go)} {...press(go)}>Swap</span>
      </div>
    </Layer>
  );
}

/* ---- the vault behind the chip ---------------------------------------- */

function VaultSheet({ d }: { d: Deck }) {
  const { s } = d;
  const settling = s.vstep >= 0;
  const finished = s.earned;
  const max = d.can('vmax');
  const go = d.can('deposit');

  return (
    <Layer open={s.over === 'vault'} onScrim={settling ? null : d.can('closeSheet')}>
      <div className="dsheet vault">
        <span className="dgrab" />
        <span className="dvico"><TokenDot token={dot('USDC')} size={26} /></span>
        <b className="dsh big">Quick Earn with {VAULT.name}</b>
        <em className="dvdesc">
          Earn yield on your USD without changing how you use it &mdash; send, swap, or spend it
          as usual. Your USDC will start earning.
        </em>

        <dl className="dvstat">
          <div><dt>APY</dt><dd>{VAULT.apy}</dd></div>
          <div><dt>TVL</dt><dd>{VAULT.tvl}</dd></div>
        </dl>
        <dl className="dvfees">
          {VAULT.fees.map(([k, v]) => (
            <div key={k}>
              <dt>{k}{k === 'Performance fee' ? <i className="dpromo">Promo</i> : null}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        {settling ? (
          <>
            <b className="dsend sm">Depositing {fmt(Number(s.vamount), 5)} USDC</b>
            <div className="dchecks left"><ProgressList steps={EARN_STEPS} at={s.vstep} /></div>
            <div className="dref"><span>Reference ID</span><b>{REFERENCE} ⧉</b></div>
            {finished
              ? <span className={'dcta light' + live(d.can('close'))} {...press(d.can('close'))}>Close</span>
              : null}
          </>
        ) : (
          <>
            <div className="damt tight">
              <b className={s.vamount ? '' : 'off'}>{s.vamount ? fmt(Number(s.vamount), 6) : '0'} <i>USDC</i></b>
              <em>{usd(Number(s.vamount) || 0)}</em>
            </div>
            <div className="davailrow">
              <TokenDot token={dot('USDC')} size={17} />
              <span>Available<i>{fmt(vaultBal(), 2)} USDC</i></span>
              <span className={'dmax' + live(max)} {...press(max)}>Use max</span>
            </div>
            <span className={'dcta' + (go ? ' light' : ' off') + live(go)} {...press(go)}>
              {Number(s.vamount) > 0 ? 'Deposit' : 'Enter an amount'}
            </span>
            <em className="dvsettings">Manage Quick Earn defaults in Settings →</em>
          </>
        )}
      </div>
    </Layer>
  );
}
