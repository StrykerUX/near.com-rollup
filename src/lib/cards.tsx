import type { ReactNode } from 'react';

/**
 * THE FOUR CHAPTERS' COPY, ONCE
 * ==================================================================
 * A headline and an aside per card, in DISPLAY order — Perps, Account, Swap,
 * Earn. Every composition of the tour renders from this array, so a wording
 * change lands everywhere or nowhere.
 *
 * IT WAS AUTHORED TWICE IN `Lockup.tsx`, in two sibling columns kept aligned by
 * position: `.side.l .face[n]` was the headline for the card whose aside was
 * `.side.r .face[n]`, and the engine walks both lists by index. That worked
 * exactly as long as the page had one layout. The moment the narrow frame needs
 * the two halves INTERLEAVED — headline, aside, headline, aside — they cannot
 * come from two separate subtrees, because no amount of CSS reorders children
 * across different parents.
 *
 * So the pairing moves here, where it was always the real relationship, and the
 * columns become a rendering of it. `.offerslot` and `.qband` already set the
 * precedent: this build accepts that the narrow composition is a different
 * arrangement of the same words, not a squeezed copy of the wide one. What it
 * has not had until now is one place for the words.
 *
 * `face` is the ORIGINAL deck index, from before v06 put Perps first. Nothing
 * in the stylesheet or the engine reads it on these nodes any more — only
 * `.cswap > .face[data-face]` is selected on — but the demo-app wiring and
 * three of its modules still refer to cards by it in prose, so it is carried
 * through rather than quietly dropped.
 */
export type Card = {
  /** stable key, and the chapter's name in the step rail's own vocabulary */
  id: 'perps' | 'account' | 'swap' | 'earn';
  /** the ORIGINAL deck index — see the note above */
  face: 0 | 1 | 2 | 3;
  /** extra classes for the headline, where one of them needs them */
  headClass?: string;
  head: ReactNode;
  /** what sits beside the headline: a paragraph, or on Perps the quote */
  aside: ReactNode;
};

export const CARDS: Card[] = [
  {
    id: 'perps',
    face: 2,
    head: (
      <>
        Trade where the liquidity is.<br />
        Hedge where your assets are.<br />
        <span className="wordmark">near.com</span>
      </>
    ),
    aside: (
      /* PLACEHOLDER QUOTE. Not said by Robbie Klages and not approved by
         The Rollup. Replace this text and this comment before ship. */
      <blockquote className="rollquote">
        <p>
          &ldquo;Bridging was the tax on trading Hyperliquid. Watching it
          disappear is the part I keep showing people.&rdquo;
        </p>
        <div className="qfoot">
          <span className="rqmark" aria-hidden="true" />
          <span className="qwho">
            <b>Robbie Klages</b>
            <span>Co-founder, The Rollup</span>
          </span>
        </div>
      </blockquote>
    ),
  },
  {
    id: 'account',
    face: 0,
    headClass: ' stack',
    head: (
      <>
        Everything you own,<br />one screen<br />
        <span className="wordmark">near.com</span>
      </>
    ),
    aside: (
      <p>
        Fully confidential swaps, transfers, deposits, and withdrawals. Trade
        perps, earn yield, and hold RWAs across 30+ chains, all from one
        account, your assets in your control. The way crypto should work.
      </p>
    ),
  },
  {
    id: 'swap',
    face: 1,
    head: <>Swap anything, <em>anywhere</em></>,
    aside: (
      <p>
        Cross-chain paths you can&rsquo;t get anywhere else. Optimized routing
        in seconds, under a cent per swap. You define the outcome, NEAR
        handles the route.
      </p>
    ),
  },
  {
    id: 'earn',
    face: 3,
    head: <>Earn on what<br /><em>you&rsquo;re not using</em></>,
    aside: (
      <p>
        Earn onchain yield from the same account you already hold assets in.{' '}
        <strong style={{ fontWeight: 500, color: '#fff' }}>
          Spend directly from a yield-earning deposit
        </strong>{' '}
        — no unwinding, no moving funds out.
      </p>
    ),
  },
];
