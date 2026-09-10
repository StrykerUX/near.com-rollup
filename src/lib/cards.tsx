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
        {/* THE THIRD LINE IS THE WHOLE SENTENCE NOW, and all of it takes
            `.wordmark`. That class was written when the line was the bare
            domain — 13-rollup.css:720 calls it "near.com READS AS A URL" — and
            it does two things: the lighter weight and the tighter tracking.
            Both still apply to what the line has become. Splitting it, with
            `near.com` light and the clause after the colon at the headline's
            own Medium, would put the emphasis on the explanation and read the
            sentence backwards; the first two lines are the claim and this one
            steps back from them, which is the job it already had. */}
        <span className="wordmark">
          near.com: the only onchain account you need.
        </span>
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
        {/* THE near.com LINE IS GONE FROM THIS ONE. It closed three of the four
            chapters as a signature; supplied copy keeps it on the opening card
            only, where it is the claim being made, and drops it here where it
            was repetition. The break stays: it is where the line wants to turn
            in this column, not part of the sentence. */}
        Everything you own,<br />
        {/* THE SECOND LINE STEPS BACK, the same way the opening card's third
            line does. `.wordmark` is the light weight and the tighter tracking
            — 13-rollup.css names it for near.com reading as a URL, and what it
            actually encodes is "this line is quieter than the one above it".
            "Everything you own" is the claim; "one screen" is the answer, and
            an answer at the same weight as its own question reads as two
            claims. */}
        <span className="wordmark">one screen</span>
      </>
    ),
    aside: (
      <p>
        Crypto, perps, stocks, bonds, metals, and yield in one confidential
        account. Trade, earn, and move assets across 30+ chains without
        exposing who you are, all from a single balance. The way crypto should
        work.
      </p>
    ),
  },
  {
    id: 'swap',
    face: 1,
    head: <>Swap anything, <em>anywhere</em></>,
    aside: (
      <p>
        Buy ZEC with USDC, AAPL with BTC, and other cross-chain paths you
        can&rsquo;t get anywhere else. Powered by NEAR Intents, place your order
        and let market makers compete to fill it at the best price in seconds.
      </p>
    ),
  },
  {
    id: 'earn',
    face: 3,
    head: <>Earn on what<br /><em>you&rsquo;re not using</em></>,
    /* NO `<strong>` IN THIS ONE ANY MORE. The old copy emphasised its own
       middle clause — "spend directly from a yield-earning deposit" — and the
       supplied replacement marks nothing. Choosing a phrase to bold here would
       be writing, not typesetting. `.side p strong` still has a user in the
       offer line, so the rule is not orphaned. */
    aside: (
      <p>
        Put your assets to work in professionally managed vaults and staking
        strategies, without locking them up. Your yield-earning USDC stays
        ready to trade, move, or spend just like regular USDC. Earn and spend
        from the same balance, no unwinding required.
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
    Rollup traders keep <b>20% of near.com platform fees</b> back in NEAR tokens.
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
/* WAS 'Permissionless to the core'. The page runs AML and security controls,
   and a headline that says otherwise is the one line on it a reader would be
   entitled to rely on. What replaces it describes the step in front of them
   rather than making a claim about what the platform will never ask. */
export const PERM_WORDS = ['Get started with', 'a wallet or passkey.'] as const;
/* IT USED TO OPEN 'Sign in with a passkey or any wallet you already use'.
   That was written under a headline about being permissionless, where it was
   the first mention of how you get in. The headline now says 'Get started with
   a wallet or passkey' — same verb, same two nouns, same order — so the two
   lines sat one above the other saying one thing twice. The body leads with
   the ecosystems instead; the headline keeps the action. */
export const PERM_BODY =
  'Works with NEAR, Solana, EVM and more. No email, no KYC, no application. ' +
  'Just connect and start moving across 30+ chains.';
