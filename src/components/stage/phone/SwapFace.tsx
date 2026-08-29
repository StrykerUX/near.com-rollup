'use client';
import { fmt } from '@/lib/format';
import { findToken } from '@/lib/tokens';
import { useFlow, type Flow } from './flows/player';
import { BALANCE, SETTLE_STEPS, swap, type SwapAction, type SwapState } from './flows/swap';
import { Enter } from './ui/Enter';
import { ProgressList } from './ui/ProgressList';
import { Sheet } from './ui/Sheet';
import { Ticker } from './ui/Ticker';
import { SheetPortal } from './ui/SheetSlot';
import { TokenDot } from './TokenDot';
import { IconSlippage, IconSwapDir } from './icons';
import { live as can, press } from './ui/tap';

const FROM = findToken('USDT');
const PCTS = [25, 50, 75, 100] as const;

/**
 * 2 · SWAP.
 *
 * Everything on screen is derived from (from, to, amount) exactly as the real
 * app derives it — the rate, the fiat legs and the minimum received all come
 * off the same two prices, so no two numbers here can disagree. That is what
 * lets the percentage chips be real: change the size and every figure below
 * moves with it.
 */
export function SwapFace() {
  const f = useFlow(2, swap);
  const s = f.s;
  const to = findToken(s.to);
  const send = (BALANCE * s.pct) / 100;
  const out = (send * FROM.price) / to.price;
  const rate = to.price / FROM.price;
  const settling = s.screen === 'settling' || s.screen === 'done';
  const tap = (id: string) => (s.tap === id ? ' tapped' : '');

  return (
    <div className={'face sface' + (f.looping ? ' looping' : '') + (f.held ? ' held' : '')} data-face="1">
      <div className="sleg">
        <TokenDot token={FROM} size={30} />
        <span className="slegt">
          <b>{fmt(send, 4)} {FROM.sym}</b>
          <em>${fmt(send * FROM.price, 0)}</em>
        </span>
      </div>

      {/* The ⇅ stays a mark, not a control. Reversing the pair would mean a
          second balance and a second set of chips for a gesture nobody in the
          recordings makes — a control that half works is worse than a glyph
          that never claimed to. */}
      <span className="sarrow" aria-hidden="true"><IconSwapDir /></span>

      {/* The receiving leg RE-QUOTES. A swap screen whose output figure never
          moves is quoting a price from the past, and this is the one number on
          the card a trader would look at twice. */}
      <div className={'sleg' + tap('picker') + can(f.can('picker'))} key={`leg${to.sym}${f.pass}`}
        {...press(f.can('picker'))}>
        <TokenDot token={to} size={30} />
        <span className="slegt">
          <b>
            {/* no flash here: a re-quote every second and a half is normal,
                and colouring each one turns a quiet refresh into an alarm */}
            <Ticker base={out} amp={out * 0.0009} dp={4} every={1600} live={f.live} />
            {' '}{to.sym}
          </b>
          <em>${fmt(out * to.price, 0)}</em>
        </span>
        <span className="schev" aria-hidden="true">⌄</span>
      </div>

      {settling ? (
        <div className="ssettle enter-one" key={`st${f.pass}`}>
          <ProgressList steps={SETTLE_STEPS} at={s.step} />
          {s.screen === 'done' ? (
            <span className={'sagain enter-one' + can(f.can('again'))} {...press(f.can('again'))}>
              ↻ Swap again
            </span>
          ) : null}
        </div>
      ) : (
        <Enter k={`f${f.pass}`} className="sform">
          {/* the size chips. Real in every mode that takes a pointer: every
              figure on the card is derived from the one they set. */}
          <div className="spct">
            {PCTS.map((p) => {
              const fn = f.can('pct', String(p));
              return (
                <span className={'spc' + (s.pct === p ? ' on' : '') + tap('pct' + p) + can(fn)}
                  key={p} {...press(fn)}>{p === 100 ? 'Max' : p + '%'}</span>
              );
            })}
          </div>

          <dl className="srows">
            <div>
              <dt>Exchange rate</dt>
              <dd>1 {to.sym} = {fmt(rate, 5)} {FROM.sym}</dd>
            </div>
            <div>
              <dt>Max slippage</dt>
              <dd className="schip">0.50% <IconSlippage /></dd>
            </div>
            <div>
              <dt>Receive at least</dt>
              <dd>{fmt(out * 0.995, 4)} {to.sym}</dd>
            </div>
          </dl>
          <span
            className={'sreview' + tap('review') + tap('swap') + can(f.can('review') ?? f.can('swap'))}
            {...press(f.can('review') ?? f.can('swap'))}
          >
            {s.screen === 'review' ? 'Swap' : 'Review trade'}
          </span>
        </Enter>
      )}

      <SheetPortal>
        <Sheet open={s.sheet === 'token'} title="Select token">
          <Search f={f} />
          <TokenList f={f} />
        </Sheet>
      </SheetPortal>
    </div>
  );
}

type F = Flow<SwapState, SwapAction>;

/**
 * The search field. A search box you cannot type in is worse than no search
 * box, so in the interactive modes this is a real input; in demo it stays the
 * span the script writes into, caret and all.
 */
function Search({ f }: { f: F }) {
  const typing = f.mode !== 'demo';
  return (
    <div className="tmsearch">
      <span className="tmglass" aria-hidden="true">⌕</span>
      {typing ? (
        <input
          className="tmi"
          value={f.s.query}
          placeholder="Search tokens"
          aria-label="Search tokens"
          onChange={(e) => {
            /* one action per character keeps the machine the only writer of
               state — the same transition the script's beats press */
            const next = e.target.value;
            const cur = f.s.query;
            if (next.length < cur.length) f.can('query', '⌫')?.();
            else f.can('query', next.slice(cur.length))?.();
          }}
        />
      ) : (
        <>
          <span className="tmq">{f.s.query || <i>Search tokens</i>}</span>
          {f.s.query ? <span className="tmcaret" /> : null}
        </>
      )}
    </div>
  );
}

const ALL = ['NEAR', 'ZEC', 'USDC', 'SOL', 'BTC', 'ETH'] as const;

function TokenList({ f }: { f: F }) {
  const q = f.s.query.trim().toLowerCase();
  const rows = ALL.map(findToken).filter(
    (t) => !q || t.sym.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
  );
  if (!rows.length) return <p className="tmnone">No tokens match “{f.s.query}”.</p>;
  return (
    <div className="tmlist">
      {rows.map((t) => {
        const fn = f.can('pick', t.sym);
        return (
          <div className={'tmrow' + (f.s.to === t.sym ? ' on' : '') + can(fn)} key={t.sym} {...press(fn)}>
            <TokenDot token={t} size={30} />
            <span>
              <span className="tsym">{t.sym}</span>
              <span className="tname">{t.name}</span>
            </span>
            <span className="tprice">${fmt(t.price, t.price < 10 ? 2 : 0)}</span>
          </div>
        );
      })}
    </div>
  );
}
