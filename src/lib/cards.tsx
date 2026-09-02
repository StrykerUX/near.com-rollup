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

/**
 * THE OFFER, AND THE ONE LINE THAT IS NOT A DESIGN DECISION.
 *
 * Both were authored inside `Lockup.tsx` and both are needed by a composition
 * that does not render the lockup's CTA block. The offer is the reason a Rollup
 * listener is on this page at all, and the jurisdiction note is a legal
 * requirement — a narrow layout that quietly drops either is not a smaller
 * version of this page, it is a different one.
 */
export const OFFER = (
  <p className="offer">
    Rollup traders keep <b>20% of every fee</b>, back in stablecoins.
  </p>
);

/* PENDING LEGAL. Wording and the jurisdiction list are unapproved.
   Confirm both with counsel before this page ships. */
export const PERPS_NOTE = (
  <>
    Perps are not available to US persons or in other restricted
    jurisdictions. Leveraged trading carries a substantial risk of loss.
  </>
);

/**
 * THE CLOSING PLATE'S WORDS, AND WHY THEY ARE WORDS AND NOT MARKUP.
 *
 * `Stage.tsx` sets these in three `.pw` units, because the closing plate's copy
 * is the hero recede run backwards and the engine walks `.pw` to do it. The
 * narrow composition has no closing plate — there is no shrink on a page whose
 * scroll is its own — so it renders the same sentences as an ordinary section,
 * and it must NOT wear `.pw`: `qsa('.pw')` is global, and a second set of them
 * would have the engine animating a block that is nowhere near the plate.
 *
 * Hence pieces rather than a node. Each composition brings its own wrapper and
 * the words cannot drift, which is the same bargain OFFER above already makes.
 */
export const PERM_WORDS = ['Permissionless', 'to the core'] as const;
export const PERM_BODY =
  'Your account, your signature, your assets. near.com is decentralized by ' +
  'design. Transact across 30+ chains, no gatekeepers between you, your ' +
  'peers, and your crypto.';
