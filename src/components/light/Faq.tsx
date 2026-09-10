'use client';
import { useEffect, useRef, useState } from 'react';

const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is near.com?',
    a: 'near.com is one account for all of crypto: trade perps, buy tokenized stocks and RWAs, earn yield, and swap nearly any asset across 30+ chains, confidentially.',
  },
  {
    q: 'How do I create an account?',
    a: 'Pick a wallet or create a passkey. There is no email to verify and no KYC to pass, and you hold the keys from the first second.',
  },
  {
    q: 'How do swaps work?',
    a: 'Every swap runs through NEAR Intents. Market makers compete to fill your order across networks, so you get the best available price and settlement in seconds rather than a fixed route through a single pool.',
  },
  {
    q: 'What are private deals?',
    a: 'A peer-to-peer trade. You set the terms, send a link, and a smart contract holds both sides until the swap executes. No intermediary, no counterparty settlement risk, no order book.',
  },
  {
    q: "What's coming next?",
    a: 'AI that manages positions on your behalf, tokenized real-world assets, virtual account numbers and a debit card that spends straight from your onchain balance.',
  },
  {
    q: 'Can my business integrate?',
    a: 'Yes. By integrating NEAR Intents, major wallets, infrastructure providers, and DeFi protocols like Ledger, SwapKit, Infinex, and others have processed billions in cross-chain swaps. Interested? Reach out.',
  },
  {
    q: 'Need help?',
    /* THE LINK IS GONE WITH THE WORDING. It read "Contact support" and pointed
       at near.com/support; the supplied line sends the reader to a support chat
       on this page instead. Leaving the anchor in would give one sentence two
       exits and name a different one than it says.

       AND THERE IS NO CHAT ON THIS PAGE YET. Nothing in the app mounts one —
       the only support route the site has is the "Support" link in the footer,
       which goes to the same near.com/support this answer just stopped
       pointing at. Until a widget lands, this line asks the reader to use
       something that is not there. The copy is as supplied; the gap is real
       and is flagged here rather than papered over with a link the words do
       not describe. */
    a: 'Support is one message away, and the docs cover the rest. Use the support chat below.',
  },
];

/**
 * Hiding an answer until it is asked for is the right behaviour in an FAQ and
 * nowhere else on this page — which is why the accordion lives here and not in
 * a shared component.
 *
 * The panel animates on max-height, so the open height is a measured pixel
 * value. It has to be RE-measured on resize: a panel measured at one width
 * clips its own answer at a narrower one.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const remeasure = () => {
      panels.current.forEach((pn, i) => {
        if (!pn) return;
        pn.style.maxHeight = i === open ? pn.scrollHeight + 'px' : '0px';
      });
    };
    remeasure();
    addEventListener('resize', remeasure);
    return () => removeEventListener('resize', remeasure);
  }, [open]);

  return (
    <section className="band" id="faq">
      <div className="shell split top">
        <div className="copy rv">
          <h2 className="h1">Common questions</h2>
          <p className="lead" style={{ color: 'var(--l-fg-2)' }}>
            Everything people ask before they open an account.
          </p>
        </div>
        <div className="rv">
          <div className="acc">
            {ITEMS.map((item, i) => (
              <div className={'acc-item' + (open === i ? ' open' : '')} key={item.q}>
                <button
                  className="acc-btn"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="plus">+</span>
                  <span className="t">{item.q}</span>
                </button>
                <div
                  className="acc-panel"
                  ref={(el) => { panels.current[i] = el; }}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
