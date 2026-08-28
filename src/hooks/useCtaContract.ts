'use client';
import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { easeShrink } from '@/lib/math';
import { setCtaRearm } from '@/stage/bus';

const CTA_MS = 1150;

/**
 * FINAL CTA: full bleed -> resting inset.
 *
 * Same shape of move as the stage shrink, so it reuses easeShrink: a soft entry
 * and a long decelerating settle. It is a tween on `--cta-t` rather than a CSS
 * transition because that is an unregistered custom property, which would
 * otherwise snap rather than interpolate.
 *
 * It plays once per DESCENT. Scrolling back up into the stage re-arms it — the
 * engine calls the re-arm callback this hook registers on the bus — so the next
 * trip down plays the contract again, and GSAP's own tween kill handles the
 * case where a re-arm lands mid-play.
 */
export function useCtaContract(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.style.setProperty('--cta-t', '1');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    root.style.setProperty('--cta-t', '0');

    const state = { v: 0 };
    let played = false;
    let tween: gsap.core.Tween | null = null;

    const play = () => {
      tween?.kill();
      state.v = 0;
      tween = gsap.to(state, {
        v: 1,
        duration: CTA_MS / 1000,
        ease: easeShrink,
        onUpdate: () => root.style.setProperty('--cta-t', state.v.toFixed(4)),
      });
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      onEnter: () => {
        if (played) return;
        played = true;
        play();
      },
    });

    const rearm = () => {
      if (!played) return;
      played = false;
      tween?.kill();
      root.style.setProperty('--cta-t', '0'); /* back to full bleed, staged */
    };
    const unregister = setCtaRearm(rearm);

    return () => {
      unregister();
      st.kill();
      tween?.kill();
    };
  }, [ref]);
}
