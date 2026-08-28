'use client';
import { useRef } from 'react';
import { useCtaContract } from '@/hooks/useCtaContract';

const LOGIN = 'https://near.com/login?ref=therollup';

/**
 * The closing plate. It enters full-bleed and contracts to a resting inset —
 * the same shape of move as the stage shrink, and it deliberately matches the
 * light panel's own bottom radius so the two read as one surface.
 *
 * No `.rv` here: its translateY(16px) would move the top edge, and the top edge
 * is the one thing that has to stay put through the contract.
 */
export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  useCtaContract(ref);

  return (
    <section className="finalcta" id="start" ref={ref}>
      <div className="ctagrad" aria-hidden="true" />
      <div className="ctaveil" aria-hidden="true" />
      <div className="inner">
        <h2 className="h1">Your account is <em>seconds away</em></h2>
        <p>No email. No KYC. Pick a wallet or passkey and you&rsquo;re in.</p>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <a className="btn btn-primary btn-lg ripple-cta" href={LOGIN}>
            Get started <span className="arw">&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
