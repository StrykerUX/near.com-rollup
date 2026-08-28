'use client';
import { useEffect, useRef, useState } from 'react';

const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is near.com?',
    a: 'One account for onchain finance. Swap, trade perps, earn yield and hold assets across 30+ networks without moving funds between apps or bridging by hand.',
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
    a: 'A peer-to-peer trade. You set the terms, send a link, and a smart contract holds both sides until the swap executes. No intermediary, no counterparty risk, no order book.',
  },
  {
    q: "What's coming next?",
    a: 'AI that manages positions on your behalf, tokenized real-world assets, virtual account numbers and a debit card that spends straight from your onchain balance.',
  },
  {
    q: 'Can my business integrate?',
    a: 'Yes. NEAR Intents is available as infrastructure, so you can route cross-chain swaps and settlement through the same layer near.com runs on.',
  },
  {
    q: 'Need help?',
    a: (
      <>
        Support is one message away, and the docs cover the rest.{' '}
        <a href="https://near.com/support" style={{ color: 'var(--green-600)', textDecoration: 'underline' }}>
          Contact support
        </a>
        .
      </>
    ),
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
