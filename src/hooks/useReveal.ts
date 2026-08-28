'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The light zone's entrance reveals.
 *
 * GSAP's ScrollTrigger replaces the hand-rolled IntersectionObserver here, but
 * it only decides WHEN — the from-state and the transition still live in CSS
 * (`.rv` / `.rv.in`), because those are the tuned values and because a section
 * that has already revealed must keep its final style with no inline transform
 * left on it. The `(i % 3) * 60ms` stagger is written as a transition-delay for
 * the same reason: it survives GSAP being unavailable.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rv'));
    if (!els.length) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    els.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
    });

    const START = 0.94; /* the same -6% rootMargin the observer version used */
    const reveal = (el: Element) => el.classList.add('in');

    const triggers = ScrollTrigger.batch(els, {
      start: `top ${START * 100}%`,
      once: true,
      onEnter: (batch) => batch.forEach(reveal),
    });

    /* ScrollTrigger only fires onEnter for a start line the page CROSSES. A
       section that is already above the fold when the trigger is created — a
       restored scroll position, a #hash landing, a back-navigation — never
       crosses it and would stay at opacity 0 forever. The IntersectionObserver
       this replaces had no such asymmetry, so the initial state is settled by
       hand here. */
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight * START) reveal(el);
    });

    return () => triggers.forEach((t) => t.kill());
  }, []);
}
