'use client';
import { useEffect, useRef, useState } from 'react';
import { CARDS, OFFER, PERM_BODY, PERM_WORDS, PERPS_NOTE } from '@/lib/cards';
import { CH_TITLES } from '@/lib/schedule';
import { ChapterScreen } from './phone/AppDevice';
import { LOGIN_URL } from '@/lib/login';

/* NO OBSERVER, NO GATE. The gate below is an optimisation — four demo flows
   are three too many to run at once — and a browser that cannot express it
   must get four working devices, not none. Read once, at module scope, so the
   fallback is the initial state rather than a setState inside an effect, which
   is a cascading render for a case that has not shipped in a browser since
   2019. `typeof window` because this module is also evaluated during server
   render; MobileTour itself only ever mounts on the client (see useNarrow), so
   the two values can never disagree in a way hydration would see. */
const NO_IO = typeof window !== 'undefined' && !('IntersectionObserver' in window);

/**
 * THE TOUR ON A NARROW FRAME — four sections, and no trick
 * ==================================================================
 * The wide composition is three columns changing around a device that stays
 * put, and the sticky is what buys that: co-presence. At 390px there is no
 * co-presence to buy, and the arithmetic says so plainly:
 *
 *   the device lays out 352 x 766. A phone is 390 x 844. Those are the SAME
 *   SHAPE — 2.176 against 2.164 — so a device that is readable on a phone is
 *   the whole phone, with nothing left over for words.
 *
 * Every version that tried to keep the two on screen together was paying for
 * it out of the device. The one this replaces split the frame 48/52, which put
 * `--k` at 0.40: a 142px-wide device, and because the scale is a `transform`,
 * 12px interface type rendering at 4.8px. Not one price, ticker or balance row
 * could be read, on the page whose entire argument IS the demo.
 *
 * SO THIS COMPOSITION DOES NOT SIMULATE CO-PRESENCE. It takes the sequence
 * apart into four ordinary sections — eyebrow, headline, device, copy — and
 * lets the reader scroll through them the way they scroll through anything
 * else. Nothing is sticky. Nothing is scrubbed. There is no snap, no
 * scroll-driven timeline and no observer deciding which chapter is on stage,
 * because on a page laid out in the ordinary way the answer to that is simply
 * "the one you are looking at".
 *
 * WHAT IT COSTS is the trick: a phone holding still while the world changes
 * around it is genuinely good, and it is gone here. What it buys is that the
 * device is 280px wide instead of 142, that nothing can ever be drawn on top
 * of anything, that it needs no feature newer than `dvh`, and that the
 * document reads top to bottom for a screen reader and for a crawler.
 *
 * THE ONE PIECE OF MACHINERY LEFT is `mounted`, and it is not decoration. Four
 * devices means four demo flows, each with a clock, a chart and a re-render
 * every beat; run all four at once and a phone spends its battery animating
 * three screens nobody is looking at. Each section mounts its screen on
 * approach and drops it on the way out — which also means arriving at a
 * chapter starts its flow from the first beat rather than dropping the reader
 * into the middle of a loop that has been running unseen. That is the same
 * bargain `AppDevice` already makes for the wide composition.
 *
 * The copy is `CARDS`, the same array the wide columns render, so the two
 * compositions cannot drift.
 */
export function MobileTour() {
  return (
    <div className="mtour">
      {/* THE HEAD OF THE PAGE. The brow is the only branding the page has —
          the nav's mark is hidden while the stage owns the frame — and the
          offer is the reason a Rollup listener is here at all. Claim, then
          incentive, then the tour: the order `13-rollup.css` already chose for
          the stacked lockup, kept. */}
      <header className="mtop">
        {/* The Rollup first — see the note on `.rollbrow` in Lockup.tsx. The
            two compositions are the same lockup and must not disagree. */}
        <div className="mbrow" aria-label="The Rollup and near.com">
          <span className="rolllock" role="img" aria-label="The Rollup" />
          <span className="rule" aria-hidden="true" />
          <span className="nearw" role="img" aria-label="near.com" />
        </div>
        {OFFER}
        <a
          className="btn btn-primary btn-lg"
          href={LOGIN_URL}
          target="_blank"
          rel="noopener"
          data-umami-event="cta-click"
          data-umami-event-pos="tour-top"
        >
          Create account <span className="arw">&rarr;</span>
        </a>
        <p className="friction">No email. No KYC. Ready in seconds.</p>
        <p className="ctadisc">
          The Rollup earns a share of fees from users who sign up through this page.
        </p>
      </header>

      {CARDS.map((c, i) => (
        <section className="mch" key={c.id} aria-label={CH_TITLES[i]} data-ch={i}>
          {/* THE COPY IS ONE GROUP AND THE DEVICE IS THE OTHER, which is a
              markup decision made for the TABLET: from 760 up the section is
              two columns, and a headline and a paragraph that are siblings of
              the device cannot be centred against it — the device spans their
              rows, so its height is shared out between them and they end up
              pinned to the top and bottom of it with a hole in between.

              On a phone the group is `display:contents`, so these three are
              flex items of the section itself and `order` interleaves the
              device between the headline and the body. The reading order in
              the DOM stays copy-then-device either way. */}
          <div className="mchtext">
            {/* THE NUMBERED EYEBROW IS GONE. It read "01 PERPS" above each
                headline — the narrow frame's answer to the wide composition's
                step rail, which is a left-gutter orientation aid this frame has
                no gutter for. On a phone it was a second, smaller line of type
                competing with the headline directly beneath it, on the one
                composition with the least room to spend.

                NOTHING IS LOST TO A SCREEN READER. The `<section>` above
                carries `aria-label={CH_TITLES[i]}`, so the chapter still
                announces itself by name; the eyebrow was restating out loud
                what the landmark already said. */}
            <h2 className={'mchhead' + (c.headClass ?? '')}>{c.head}</h2>
            {/* Perps' aside is the pull quote. It is drawn here rather than in
                `.qband`: that band exists because the stacked lockup could not
                fit a 383px plate under the phone, and this composition has the
                room, in the chapter the brief wanted it in. */}
            <div className="mchbody">{c.aside}</div>
          </div>
          <ChapterDevice at={i} />
        </section>
      ))}

      {/* THE CLOSE. Two things land here that the narrow frame otherwise drops
          on the floor: the closing plate's copy — there is no shrink to carry
          it — and the jurisdiction note, which is not a design decision. */}
      <section className="mclose" aria-label="Get started with a wallet or passkey">
        <h2>
          {PERM_WORDS[0]} <em>{PERM_WORDS[1]}</em>
        </h2>
        <p className="mclosebody">{PERM_BODY}</p>
        <a
          className="btn btn-primary btn-lg"
          href={LOGIN_URL}
          target="_blank"
          rel="noopener"
          data-umami-event="cta-click"
          data-umami-event-pos="tour-close"
        >
          Create account <span className="arw">&rarr;</span>
        </a>
        <p className="friction">No email. No KYC. Ready in seconds.</p>
        <p className="mdisc">{PERPS_NOTE}</p>
      </section>
    </div>
  );
}

/**
 * ONE CHAPTER'S DEVICE, RUNNING ONLY WHILE IT IS WORTH RUNNING.
 *
 * The margin is generous on purpose — a screen that mounts before its section
 * arrives has already played a beat or two by the time the reader reaches it,
 * so they arrive at a demo that is alive rather than at a still frame waiting
 * to start.
 *
 * The box is drawn whether or not the screen inside it is mounted, so nothing
 * in the section moves when one arrives or leaves. `.pdev` lays out at a fixed
 * 352 x 766 and is scaled with a transform, which is why the wrapper carries
 * the scaled size and the screen inside never knows it was scaled.
 */
function ChapterDevice({ at }: { at: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(NO_IO);

  useEffect(() => {
    const el = box.current;
    if (!el || NO_IO) return;
    const io = new IntersectionObserver(
      (es) => setMounted(es[0].isIntersecting),
      /* 30% and not 50%: a section runs about 1.15 viewports, so half a
         viewport either side is a 2688px window against 390 x 844 and three
         chapters can be inside it at once. 30% keeps it to two — the one
         being read and the one being approached. */
      { rootMargin: '30% 0px 30% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mdev" ref={box}>
      {mounted ? <ChapterScreen at={at} /> : null}
    </div>
  );
}
