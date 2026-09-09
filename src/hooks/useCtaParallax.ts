'use client';
import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * THE CLOSING PLATE'S PHOTOGRAPH DRIFTS AGAINST ITS OWN BOX.
 *
 * Writes `--cta-par`, 0 as the section's top edge reaches the bottom of the
 * viewport and 1 as its bottom edge leaves the top. 08-light.css turns that
 * into a translate on the plate; nothing else reads it.
 *
 * A SEPARATE HOOK FROM `useCtaContract`, WHICH ALSO WATCHES THIS ELEMENT. That
 * one plays a one-shot tween on a descent and re-arms from the stage bus; this
 * is a continuous scrub with no state and no memory. Folding a scrub into a
 * hook whose whole shape is "played / not played" would have meant one
 * ScrollTrigger doing two jobs on two clocks, and the re-arm logic would have
 * had to learn to leave the scrub alone.
 *
 * NOTHING IS WRITTEN TO `document`. `--cta-par` is set on the SECTION, not the
 * root: the contract's `--cta-t` is a page-level fact (the light zone reads it
 * for its own bottom radius), and this is one element's own drift.
 *
 * UNDER REDUCED MOTION IT NEVER RUNS, and the plate sits at its rest position
 * because the CSS defaults `--cta-par` to .5 — the midpoint, which is the
 * frame the crop was chosen against.
 */
export function useCtaParallax(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      /* `invalidateOnRefresh` because the plate's box CHANGES SIZE under it:
         `useCtaContract` animates the section's margins and padding, so the
         start/end distances measured on mount are wrong the moment the
         contract plays. */
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        el.style.setProperty('--cta-par', self.progress.toFixed(4));
      },
    });
    return () => st.kill();
  }, [ref]);
}
