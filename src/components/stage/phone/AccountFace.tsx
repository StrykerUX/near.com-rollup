'use client';
import { findToken } from '@/lib/tokens';
import { useFlow } from './flows/player';
import { SEND_STEPS, account, type AccountState } from './flows/account';
import { Enter } from './ui/Enter';
import { FieldRow } from './ui/FieldRow';
import { Keypad } from './ui/Keypad';
import { LiveDot } from './ui/LiveDot';
import { ProgressList } from './ui/ProgressList';
import { Sheet } from './ui/Sheet';
import { SheetPortal } from './ui/SheetSlot';
import { Ticker } from './ui/Ticker';
import { TokenDot } from './TokenDot';
import { IconReceive, IconSend } from './icons';
import { live as can, press } from './ui/tap';

const NEAR = findToken('NEAR');
const SENDABLE = ['ZEC', 'NEAR', 'USDT', 'USDC', 'BTC', 'ETH'] as const;

/**
 * 1 · ACCOUNT — the home screen, and the send it opens.
 */
export function AccountFace() {
  const f = useFlow(1, account);
  const s = f.s;
  const token = findToken(s.token);
  const tap = (id: string) => (s.tap === id ? ' tapped' : '');
  const shell = 'face aface' + (f.looping ? ' looping' : '') + (f.held ? ' held' : '');

  if (s.screen === 'home') {
    return (
      <div className={shell} data-face="0">
        <Enter k={`h${f.pass}`} className="ahome">
          <div className="totrow">
            <span className="klabel">Total balance</span>
          </div>
          <div className="kbig">
            $<Ticker base={10230.56} amp={7.4} dp={2} every={2600} live={f.live} />
          </div>

          <div className="seg" role="group" aria-label="Account actions">
            <span className={'segb' + can(f.can('receive'))} {...press(f.can('receive'))}>
              <IconReceive />Receive
            </span>
            <span className={'segb' + tap('send') + can(f.can('send'))} {...press(f.can('send'))}>
              <IconSend />Send
            </span>
          </div>

          <div className="balgrp">
            <span className="klabel">Balances</span>
            <div className="ballist">
              <div className="balrow">
                <span className="brt"><span className="bn">Crypto</span><span className="bar" aria-hidden="true">&rarr;</span></span>
                <span className="bv">$6,806.76</span>
                <span className="bnote plain">NEAR, USDC</span>
              </div>
              <div className="balrow">
                <span className="brt"><span className="bn">Perps</span><span className="bar" aria-hidden="true">&rarr;</span></span>
                <span className="bv">$1,075.98</span>
                {/* the one figure on this screen that is genuinely moving */}
                {/* short enough to sit on the value's baseline without
                    wrapping — the row is ~245px wide and the figure has
                    first claim on it */}
                <span className="bnote up">
                  <LiveDot /> +$<Ticker base={5.1} amp={2.2} dp={2} every={1000} live={f.live} flash /> P&amp;L
                </span>
              </div>
              <div className="balrow">
                <span className="brt"><span className="bn">Earn</span><span className="bar" aria-hidden="true">&rarr;</span></span>
                <span className="bv">$2,347.81</span>
                <span className="bnote info">5.1% APY</span>
              </div>
            </div>
          </div>
        </Enter>
      </div>
    );
  }

  /* The real app SCROLLS this form under the keypad: with the pad up, the
     heading and the token/network rows are off the top and only the recipient,
     the amount and the ask are in frame. Composing the two views beats an
     overflow container — there is no scrollbar to inherit and no scroll
     position to restore between loops. */
  const packed = s.focus;
  const fiat = Number(s.amount || 0) * token.price;
  const usd = (v: number) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });

  /* Sending is its own screen, not a sheet: the form it came from has nothing
     left to say, and a checklist under a dimmed copy of the thing you already
     committed to reads as an app that is unsure whether you meant it. */
  if (s.screen === 'sending' || s.screen === 'sent') {
    return (
      <div className={shell + ' send'} data-face="0">
        <div className="psubmit enter-one" key={`x${f.pass}`}>
          <span className="psicon" aria-hidden="true">↗</span>
          <b className="pstitle">Sending {s.amount} {token.sym}</b>
          <span className="pssub">
            {s.network} · from {s.payWith === 'vault' ? 'Gauntlet USDC' : 'NEAR'}
          </span>
          <ProgressList steps={SEND_STEPS} at={s.step} />
          {s.screen === 'sent' ? (
            <span className={'sagain enter-one' + can(f.can('again'))} {...press(f.can('again'))}>
              ↻ Send again
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={shell + ' send'} data-face="0">
      <Enter k={`s${f.pass}-${packed}`} className="asend">
        {packed ? null : (
          <>
            <h3 className="usend">Universal Send</h3>
            <p className="usub">Send any token to any network, pay with any asset you own.</p>
          </>
        )}

        <div className="urows">
          {packed ? null : (
            <>
              <FieldRow mark={<TokenDot token={token} size={22} />} label="Token" value={token.sym}
                on={f.can('picker')} open={s.sheet === 'token'} />
              <FieldRow mark={<span className="unet" aria-hidden="true">{s.network[0]}</span>}
                label="Network" value={s.network} />
            </>
          )}
          <FieldRow mark={<span className="urec" aria-hidden="true">□</span>}
            label="Recipient" value="Select recipient" muted />
        </div>

        <div className={'uamt' + (s.focus ? ' focus' : '') + can(f.can('focus'))} {...press(f.can('focus'))}>
          <b className={s.amount ? '' : 'ghost'}>
            {s.amount || '0'} <i>{token.sym}</i>
            {s.focus ? <span className="pcaret" /> : null}
          </b>
          <em>${fiat.toLocaleString('en-US', { maximumFractionDigits: 0 })}</em>

          <span className="upay">
            <i className="upaylbl">Pay with</i>
            <span className={'upayrow' + (s.swapping ? ' swapping' : '') + tap('paywith') + can(f.can('payPicker'))}
              {...press(f.can('payPicker'))}>
              {s.payWith === 'NEAR' ? (
                <>
                  <TokenDot token={NEAR} size={20} />
                  <b>NEAR</b>
                  <span className="upaybal"><i>Balance</i>3535.3148</span>
                </>
              ) : (
                <>
                  <span className="vico" aria-hidden="true">$</span>
                  <b>Gauntlet USDC</b>
                  <span className="upaybal"><i>Yield vault</i>1,343.03</span>
                </>
              )}
              <span className={'vmax' + can(f.can('max'))} {...press(f.can('max'))}>Use max</span>
            </span>
          </span>
        </div>

        {/* The amber notice the real screen raises, and the box it makes you
            tick. It is a real guard: Review send refuses until it is checked,
            in every mode. */}
        {packed ? null : (
          <span className={'uwarn' + (s.ack ? ' on' : '') + tap('ack') + can(f.can('ack'))} {...press(f.can('ack'))}>
            <i className="uwi" aria-hidden="true">!</i>
            <span className="uwt">Some exchanges may not credit this transfer.</span>
            <span className="uwack"><i className="pbox">{s.ack ? '✓' : ''}</i>I understand.</span>
          </span>
        )}

        <span className={'ucta' + (Number(s.amount) > 0 && s.ack ? '' : ' off') + tap('review') + can(f.can('review'))}
          {...press(f.can('review'))}>
          {Number(s.amount) > 0 ? (s.ack ? 'Review send' : 'Acknowledge to continue') : 'Enter amount'}
        </span>
      </Enter>

      {s.focus && s.sheet === 'none' ? (
        <Keypad pressed={s.pressed} onKey={(k) => f.can('key', k)} onDone={f.can('blur')} />
      ) : null}

      <SheetPortal>
        {/* The review the real app puts between you and an irreversible
            transfer. It restates the two things a reader would check — what
            leaves, and what it comes out of. */}
        <Sheet open={s.screen === 'review'} title="Review send">
          <div className="urev">
            <div className="urevlead">
              <TokenDot token={token} size={30} />
              <span className="slegt">
                <b>{s.amount} {token.sym}</b>
                <em>{usd(fiat)}</em>
              </span>
            </div>
            <dl className="srows">
              <div><dt>Network</dt><dd>{s.network}</dd></div>
              <div>
                <dt>Paid with</dt>
                <dd>{s.payWith === 'vault' ? 'Gauntlet USDC · yield vault' : 'NEAR'}</dd>
              </div>
              <div><dt>Network fee</dt><dd>0 NEAR</dd></div>
              <div><dt>Arrives in</dt><dd>~22 sec</dd></div>
            </dl>
            <span className={'sreview' + tap('confirm') + can(f.can('confirm'))} {...press(f.can('confirm'))}>
              Send
            </span>
          </div>
        </Sheet>

        <Sheet open={s.sheet === 'token'} title="Select token">
          <div className="tmlist">
            {SENDABLE.map(findToken).map((t) => {
              const fn = f.can('pick', t.sym);
              return (
                <div className={'tmrow' + (s.token === t.sym ? ' on' : '') + can(fn)} key={t.sym} {...press(fn)}>
                  <TokenDot token={t} size={30} />
                  <span><span className="tsym">{t.sym}</span><span className="tname">{t.name}</span></span>
                  <span className="tprice">${t.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
              );
            })}
          </div>
        </Sheet>

        {/* The sheet the whole card is about: the send's funding source, and a
            yield vault sitting in the list beside a plain token balance. */}
        <Sheet open={s.sheet === 'pay'} title="Pay with">
          <div className="tmlist">
            <div className={'tmrow' + (s.payWith === 'NEAR' ? ' on' : '') + can(f.can('pay', 'NEAR'))}
              {...press(f.can('pay', 'NEAR'))}>
              <TokenDot token={NEAR} size={30} />
              <span><span className="tsym">NEAR</span><span className="tname">Wallet balance</span></span>
              <span className="tprice">3535.3148</span>
            </div>
            <div className={'tmrow' + (s.payWith === 'vault' ? ' on' : '') + can(f.can('pay', 'vault'))}
              {...press(f.can('pay', 'vault'))}>
              <span className="vico" aria-hidden="true">$</span>
              <span><span className="tsym">Gauntlet USDC</span><span className="tname">Yield vault · 4.52%</span></span>
              <span className="tprice">1,343.03</span>
            </div>
          </div>
          <p className="paynote">
            Spending from a vault leaves the position earning until the moment it settles.
          </p>
        </Sheet>
      </SheetPortal>
    </div>
  );
}

export type { AccountState };
