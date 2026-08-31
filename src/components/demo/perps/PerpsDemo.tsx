'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Phone } from './Phone';
import { useDeck } from './player';
import { CHAPTERS, STEPS } from './script';

/**
 * PERPS, STEP BY STEP
 * ==================================================================
 * The page is two columns that share one clock: the app, and the argument for
 * what the app is doing. Neither is a caption on the other — the rail is
 * navigation, so a reader who wants the liquidation math can jump straight to
 * it, and the phone follows.
 */
export function PerpsDemo() {
  const d = useDeck();
  const step = STEPS[d.step];

  return (
    <main className="pd">
      <header className="pdtop">
        <Link className="pdback" href="/">← near.com × The Rollup</Link>
        <h1>Perps, step by step</h1>
        <p>
          near.com&rsquo;s perpetuals app, rebuilt frame by frame: fund it with a passkey, build
          the ticket, run into the two rules the market imposes, and open the position. It plays
          on its own &mdash; and it lets you take the controls.
        </p>
        <nav className="pdlinks">
          <Link href="/">Demo</Link>
          <Link href="/guided">Guided</Link>
          <Link href="/live">Live</Link>
        </nav>
      </header>

      <div className="pdgrid">
        <div className="pdstage">
          <div className="pdphone">
            <Phone d={d} />
            {d.held ? <span className="pdheld">You have the wheel &middot; resuming shortly</span> : null}
          </div>
          <Transport d={d} />
        </div>

        <Rail d={d} />
      </div>

      <section className="pdnow" aria-live="polite">
        <b>{step.title}</b>
        <p>{step.note}</p>
      </section>
    </main>
  );
}

function Transport({ d }: { d: ReturnType<typeof useDeck> }) {
  return (
    <div className="pdbar">
      <span className="pdprog"><i style={{ transform: `scaleX(${d.progress})` }} /></span>
      <div className="pdctl">
        <button type="button" onClick={d.prev} aria-label="Previous step">‹</button>
        <button type="button" onClick={d.toggle} className="pdplay"
                aria-label={d.playing ? 'Pause' : 'Play'}>
          {d.playing ? '❙❙' : '▶'}
        </button>
        <button type="button" onClick={d.next} aria-label="Next step">›</button>
        <span className="pdcount">{d.step + 1} / {STEPS.length}</span>
      </div>
    </div>
  );
}

function Rail({ d }: { d: ReturnType<typeof useDeck> }) {
  const ref = useRef<HTMLDivElement>(null);

  /* keep the playing step in view WITHOUT `scrollIntoView`: that scrolls every
     ancestor, and the rail sits inside a page the reader may have scrolled on
     purpose. This moves one box. */
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const el = box.querySelector<HTMLElement>('[data-on="1"]');
    if (!el) return;
    const top = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
    box.scrollTo({ top, behavior: 'smooth' });
  }, [d.step]);

  return (
    <div className="pdrail" ref={ref}>
      {CHAPTERS.map((c, ci) => {
        const steps = STEPS.map((s, i) => ({ s, i })).filter(({ s }) => s.ch === c.id);
        const on = steps.some(({ i }) => i === d.step);
        return (
          <section className={'pdch' + (on ? ' on' : '')} key={c.id}>
            <h2><i>{String(ci + 1).padStart(2, '0')}</i>{c.name}</h2>
            <p className="pdblurb">{c.blurb}</p>
            <ol className="pdsteps">
              {steps.map(({ s, i }) => {
                const active = i === d.step;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={'pdstep' + (active ? ' on' : '') + (i < d.step ? ' past' : '')}
                      data-on={active ? '1' : undefined}
                      onClick={() => d.seek(i)}
                      aria-current={active ? 'step' : undefined}
                    >
                      <span className="pdmark" aria-hidden="true" />
                      <span className="pdtxt">
                        <b>{s.title}</b>
                        <em>{s.note}</em>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
