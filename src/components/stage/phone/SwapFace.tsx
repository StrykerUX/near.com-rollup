'use client';
import { fmt } from '@/lib/format';
import { findToken } from '@/lib/tokens';
import { useFlow } from './flows/player';
import { SETTLE_STEPS, swapScript, type SwapState } from './flows/swap';
import { Enter } from './ui/Enter';
import { ProgressList } from './ui/ProgressList';
import { Sheet } from './ui/Sheet';
import { Ticker } from './ui/Ticker';
import { SheetPortal } from './ui/SheetSlot';
import { TokenDot } from './TokenDot';
import { IconSlippage, IconSwapDir } from './icons';

const FROM = findToken('USDT');
const SEND = 6635.6169;

/**
 * 2 · SWAP.
 *
 * Everything on screen is derived from (from, to, amount) exactly as the real
 * app derives it — the rate, the fiat legs and the minimum received all come
 * off the same two prices, so no two numbers here can disagree.
 */
export function SwapFace() {
  const { state: s, live, pass, looping } = useFlow<SwapState>(2, swapScript);
  const to = findToken(s.to);
  const out = (SEND * FROM.price) / to.price;
  const rate = to.price / FROM.price;
  const settling = s.screen === 'settling' || s.screen === 'done';
  const tap = (id: string) => (s.tap === id ? ' tapped' : '');

  return (
    <div className={'face sface' + (looping ? ' looping' : '')} data-face="1">
      <div className="sleg">
        <TokenDot token={FROM} size={30} />
        <span className="slegt">
          <b>{fmt(SEND, 4)} {FROM.sym}</b>
          <em>${fmt(SEND * FROM.price, 0)}</em>
        </span>
      </div>

      <span className="sarrow" aria-hidden="true"><IconSwapDir /></span>

      {/* The receiving leg RE-QUOTES. A swap screen whose output figure never
          moves is quoting a price from the past, and this is the one number on
          the card a trader would look at twice. */}
      <div className={'sleg' + tap('picker')} key={`leg${to.sym}${pass}`}>
        <TokenDot token={to} size={30} />
        <span className="slegt">
          <b>
            {/* no flash here: a re-quote every second and a half is normal,
                and colouring each one turns a quiet refresh into an alarm */}
            <Ticker base={out} amp={out * 0.0009} dp={4} every={1600} live={live} />
            {' '}{to.sym}
          </b>
          <em>${fmt(out * to.price, 0)}</em>
        </span>
      </div>

      {settling ? (
        <div className="ssettle enter-one" key={`st${pass}`}>
          <ProgressList steps={SETTLE_STEPS} at={s.step} />
          {s.screen === 'done' ? (
            <span className="sagain enter-one">↻ Swap again</span>
          ) : null}
        </div>
      ) : (
        <Enter k={`f${pass}`} className="sform">
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
          <span className={'sreview' + tap('review') + tap('swap')}>
            {s.screen === 'review' ? 'Swap' : 'Review trade'}
          </span>
        </Enter>
      )}

      <SheetPortal>
        <Sheet open={s.sheet === 'token'} title="Select token">
          <div className="tmsearch">
            <span className="tmglass" aria-hidden="true">⌕</span>
            <span className="tmq">{s.query || <i>Search tokens</i>}</span>
            {s.query ? <span className="tmcaret" /> : null}
          </div>
          <TokenList query={s.query} />
        </Sheet>
      </SheetPortal>
    </div>
  );
}

const ALL = ['NEAR', 'ZEC', 'USDC', 'SOL', 'BTC', 'ETH'] as const;

function TokenList({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const rows = ALL.map(findToken).filter(
    (t) => !q || t.sym.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
  );
  return (
    <div className="tmlist">
      {rows.map((t) => (
        <div className="tmrow" key={t.sym}>
          <TokenDot token={t} size={30} />
          <span>
            <span className="tsym">{t.sym}</span>
            <span className="tname">{t.name}</span>
          </span>
          <span className="tprice">${fmt(t.price, t.price < 10 ? 2 : 0)}</span>
        </div>
      ))}
    </div>
  );
}
