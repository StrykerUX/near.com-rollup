'use client';
import { PERM_BODY, PERM_WORDS } from '@/lib/cards';
import { useNarrow } from '@/hooks/useNarrow';
import { useStageEngine } from '@/hooks/useStageEngine';
import { GradientField } from './GradientField';
import { Hero } from './Hero';
import { Lockup } from './Lockup';
import { MobileTour } from './MobileTour';
import { NarrowChrome } from './NarrowChrome';
import { StepDots } from './StepDots';

/**
 * THE STAGE — two compositions, one of which is on at a time
 *
 * WIDE (above 1080px). 588vh of scroll with a 100vh sticky child. Scroll only
 * TRIGGERS the moves; the composition itself is a pure function of position.
 * The stage height and the schedule in lib/schedule.ts are a matched pair —
 * change one without the other and the last trigger runs off the end of the
 * sticky.
 *
 * NARROW (1080 and below). Four ordinary sections — see MobileTour.tsx for
 * why. There is no sticky, no scrub and no card sequence, so none of the wide
 * composition is rendered: not the hero, not the step rail, not the lockup,
 * not the closing plate, and above all not `PhoneShell`, which runs a demo
 * flow on its own clock and would keep running one behind a media query.
 * THE FIELD IS THE EXCEPTION and it is deliberate — the sections scroll over
 * the same gradient the wide page is built on. With the engine off, `#gl`
 * never gets its `.on` class, so what shows is `.gcss`: the CSS stack the
 * field already carries as its own fallback, and no shader loop on a phone.
 */
export function Stage() {
  const narrow = useNarrow();
  useStageEngine(!narrow);

  return (
    <section id="stage" aria-label="near.com product tour">
      <div className="stage-sticky">
        <div className="stage-black" />
        <GradientField />

        {!narrow && (
          <>
            <Hero />
            <StepDots />
            <Lockup />

            {/* The closing plate's copy. Its three `.pw` units are the hero
                recede run backwards — literally the same curves, evaluated at
                (1 - progress). */}
            <div className="permcopy">
              <div className="inner">
                <h2 className="h1">
                  <span className="pw">{PERM_WORDS[0]}</span> <em className="pw">{PERM_WORDS[1]}</em>
                </h2>
                <p className="pw">{PERM_BODY}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* THE NARROW COMPOSITION, and it lives OUTSIDE the sticky child on
          purpose: the sticky needs something to scroll past, and these
          sections are it. */}
      {narrow && (
        <>
          <MobileTour />
          <NarrowChrome />
        </>
      )}
    </section>
  );
}
