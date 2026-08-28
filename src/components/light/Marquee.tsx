'use client';
import { useEffect, useRef, useState } from 'react';
import { QUOTES } from '@/lib/quotes';

/**
 * THE SOCIAL-PROOF MARQUEE
 *
 * The track loops by translating exactly one set-width, so the duplicate lands
 * where the original was. Two rules make that seam invisible:
 *
 *   1. The travel distance is MEASURED, never hard-coded. Card width, gap, font
 *      and copy length all feed into it — a hard-coded pixel value drifts the
 *      moment any of them change, and the seam shows as a jump.
 *   2. There must be enough copies to cover the viewport PLUS one full set.
 *      With narrow cards a single set can be shorter than the screen, which
 *      opens a visible gap at the wrap.
 *
 * It runs on rAF rather than a CSS animation because hover doesn't PAUSE it —
 * it eases the velocity to zero over ~220ms and back out again, which a CSS
 * animation cannot do without a visible jolt. Touch is excluded (hover:hover),
 * so a tap can't strand it.
 */
export function Marquee() {
  /* the copy count is state, because it is measured from the rendered set */
  const [copies, setCopies] = useState(2);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setW = useRef(0);
  const revealed = useRef(false);

  /* ---- measure ---------------------------------------------------------- */
  useEffect(() => {
    const measure = () => {
      const mt = trackRef.current;
      if (!mt) return;
      /* One set-width INCLUDING the gap that follows it, read as the distance
         between the first card of set 1 and the first card of set 2. Deriving
         it from scrollWidth instead is off by the inter-set gaps, and that
         error is exactly what shows at the wrap. */
      const kids = mt.children;
      if (kids.length < QUOTES.length + 1) return;
      const set =
        (kids[QUOTES.length] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
      if (!set) return;
      setW.current = set;
      const need = Math.max(2, Math.ceil((innerWidth + set) / set) + 1);
      if (need !== copies) setCopies(need);
    };
    measure();
    document.fonts?.ready.then(measure);
    /* Gate on WIDTH, not on resize: mobile browsers fire resize on every
       URL-bar show/hide, and re-measuring there would snap the marquee back to
       the start over and over while the user scrolls. */
    let w = innerWidth;
    let timer = 0;
    const onResize = () => {
      if (innerWidth === w) return;
      w = innerWidth;
      clearTimeout(timer);
      timer = window.setTimeout(measure, 200);
    };
    addEventListener('resize', onResize);
    return () => {
      removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [copies]);

  /* ---- reveal ----------------------------------------------------------- */
  useEffect(() => {
    const mq = wrapRef.current;
    if (!mq) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* The cascade is keyed to each card's position across the viewport, not to
       its index: a card already off the right edge should not still be waiting
       its turn when the row is scrolled into view. Re-derived on every rebuild
       so cloned cards get delays too — and zeroed once the reveal has already
       played, so a font-load rebuild does not replay it at the reader. */
    const cards = Array.from(mq.querySelectorAll<HTMLElement>('.qcard'));
    cards.forEach((c) => {
      c.style.transitionDelay = revealed.current
        ? '0ms'
        : Math.round(Math.min(Math.max(c.getBoundingClientRect().left / innerWidth, 0), 1.4) * 420) + 'ms';
    });
    mq.classList.add('mq-wait');
    if (revealed.current) {
      mq.classList.add('mq-in');
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          revealed.current = true;
          mq.classList.add('mq-in'); /* .mq-wait stays as the from-state */
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(mq);
    return () => io.disconnect();
  }, [copies]);

  /* ---- the drive -------------------------------------------------------- */
  useEffect(() => {
    const mq = wrapRef.current;
    const mt = trackRef.current;
    if (!mq || !mt) return;

    let hov = false;
    let visible = true;
    let x = 0;
    let v = 0;
    let prev = 0;
    let raf = 0;
    const speed =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mspeed')) || 42;

    const enter = () => { hov = true; };
    const leave = () => { hov = false; };
    if (matchMedia('(hover:hover)').matches) {
      mq.addEventListener('pointerenter', enter);
      mq.addEventListener('pointerleave', leave);
    }
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
    io.observe(mq);

    raf = requestAnimationFrame(function step(now) {
      const dt = prev ? Math.min((now - prev) / 1000, 0.05) : 0;
      prev = now;
      raf = requestAnimationFrame(step);
      const set = setW.current;
      if (!set || !visible) return;
      v += ((hov ? 0 : speed) - v) * (1 - Math.exp(-dt / 0.22));
      if (v < 0.01 && hov) return; /* settled at rest — stop writing */
      x -= v * dt;
      if (x <= -set) x += set;
      mt.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mq.removeEventListener('pointerenter', enter);
      mq.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div className="marquee rv" ref={wrapRef}>
      <div className="mtrack" id="mtrack" ref={trackRef}>
        {Array.from({ length: copies }, (_, c) =>
          QUOTES.map((q, i) => (
            <figure className={'qcard' + (i % 3 === 1 ? ' qdark' : '')} key={`${c}-${q.person}`}>
              {i % 3 === 1 ? <span className="qstripes" aria-hidden="true" /> : null}
              <span className="qmark" aria-hidden="true">&rdquo;</span>
              <div className="qhead">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="qlogo" src={q.logo} alt="" loading="lazy" />
                <span className="qorg">{q.org}</span>
              </div>
              <blockquote className="q">{q.text}</blockquote>
              <figcaption className="a">
                <b>{q.person}</b>
                {q.role ? `${q.role}, ${q.org}` : q.org}
              </figcaption>
            </figure>
          )),
        )}
      </div>
    </div>
  );
}
