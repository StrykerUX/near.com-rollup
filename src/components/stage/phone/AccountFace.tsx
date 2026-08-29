'use client';
import { findToken } from '@/lib/tokens';
import { useFlow } from './flows/player';
import { accountScript, type AccountState } from './flows/account';
import { Enter } from './ui/Enter';
import { FieldRow } from './ui/FieldRow';
import { Keypad } from './ui/Keypad';
import { LiveDot } from './ui/LiveDot';
import { Ticker } from './ui/Ticker';
import { TokenDot } from './TokenDot';
import { IconReceive, IconSend } from './icons';

const ZEC = findToken('ZEC');
const NEAR = findToken('NEAR');



/**
 * 1 · ACCOUNT — the home screen, and the send it opens.
 */
export function AccountFace() {
  const { state: s, live, pass, looping } = useFlow<AccountState>(1, accountScript);
  const tap = (id: string) => (s.tap === id ? ' tapped' : '');

  if (s.screen === 'home') {
    return (
      <div className={'face aface' + (looping ? ' looping' : '')} data-face="0">
        <Enter k={`h${pass}`} className="ahome">
          <div className="totrow">
            <span className="klabel">Total balance</span>
          </div>
          <div className="kbig">
            $<Ticker base={10230.56} amp={7.4} dp={2} every={2600} live={live} />
          </div>

          <div className="seg" role="group" aria-label="Account actions">
            <span className="segb"><IconReceive />Receive</span>
            <span className={'segb' + tap('send')}><IconSend />Send</span>
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
                <span className="bnote up">
                  <LiveDot /> +$<Ticker base={5.1} amp={2.2} dp={2} every={1000} live={live} flash /> unrealized P&amp;L
                </span>
              </div>
              <div className="balrow">
                <span className="brt"><span className="bn">Earn</span><span className="bar" aria-hidden="true">&rarr;</span></span>
                <span className="bv">$2,347.81</span>
                <span className="bnote info">5.1% blended APY</span>
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

  return (
    <div className={'face aface send' + (looping ? ' looping' : '')} data-face="0">
      <Enter k={`s${pass}-${packed}`} className="asend">
      {packed ? null : (
        <>
          <h3 className="usend">Universal Send</h3>
          <p className="usub">Send any token to any network, pay with any asset you own.</p>
        </>
      )}

      <div className="urows">
        {packed ? null : (
          <>
            <FieldRow mark={<TokenDot token={ZEC} size={22} />} label="Token" value="ZEC" />
            <FieldRow mark={<span className="unet" aria-hidden="true">Z</span>} label="Network" value="Zcash" />
          </>
        )}
        <FieldRow mark={<span className="urec" aria-hidden="true">□</span>} label="Recipient" value="Select recipient" muted />
      </div>

      <div className={'uamt' + (s.focus ? ' focus' : '')}>
        <b className={s.amount ? '' : 'ghost'}>
          {s.amount || '0'} <i>ZEC</i>
          {s.focus ? <span className="pcaret" /> : null}
        </b>
        <em>${s.amount ? (Number(s.amount) * ZEC.price).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0.00'}</em>

        <span className="upay">
          <i className="upaylbl">Pay with</i>
          <span className={'upayrow' + (s.swapping ? ' swapping' : '') + tap('paywith')}>
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
            <span className="vmax">Use max</span>
          </span>
        </span>
      </div>

      <span className={'ucta' + (s.amount ? '' : ' off')}>
        {s.amount ? 'Review send' : 'Enter amount'}
      </span>
      </Enter>

      {s.focus ? <Keypad pressed={s.pressed} /> : null}
    </div>
  );
}
