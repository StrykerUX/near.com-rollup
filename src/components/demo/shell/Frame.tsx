'use client';
import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { live, press } from '@/components/stage/phone/ui/tap';
import type { Deck } from './deck';
import type { DemoFlow } from './flow';

/**
 * THE PAGE AROUND THE PHONE
 * ==================================================================
 * Two columns that share one clock: the app, and the argument for what the app
 * is doing. Neither is a caption on the other — the rail is navigation, so a
 * reader who wants the liquidation math can jump straight to it and the phone
 * follows.
 *
 * Everything here is flow-agnostic. A demo page supplies its head copy and its
 * device; the chapters, the steps and the transport come out of the flow.
 */

export function DemoPage<S, A extends string>({
  flow, deck, title, intro, children,
}: {
  flow: DemoFlow<S, A>;
  deck: Deck<S, A>;
  title: string;
  intro: ReactNode;
  /** the device itself */
  children: ReactNode;
}) {
  const step = flow.steps[deck.step];

  return (
    <main className="pd">
      <header className="pdtop">
        <Link className="pdback" href="/demo">← near.com × The Rollup</Link>
        <h1>{title}</h1>
        <p>{intro}</p>
        <nav className="pdlinks">
          <Link href="/demo/perps">Perps</Link>
          <Link href="/demo/perps-v2">Perps v2</Link>
          <Link href="/demo/perps-v3">Perps v3</Link>
          <Link href="/demo/perps-v4">Perps v4</Link>
            <Link href="/demo/perps-v5">Perps v5</Link>
          <Link href="/demo/swap">Swap</Link>
          <Link href="/demo/swap-v4">Swap v4</Link>
          <Link href="/demo/earn">Earn</Link>
          <Link href="/demo/earn-v4">Earn v4</Link>
          <Link href="/demo/confidential-deposit">Confidential deposit</Link>
          <Link href="/demo/confidential-deposit-v4">Confidential deposit v4</Link>
          <Link href="/demo/confidential-send">Confidential send</Link>
          <Link href="/demo/confidential-send-v4">Confidential send v4</Link>
        </nav>
      </header>

      <div className="pdgrid">
        <div className="pdstage">
          <div className="pdphone">
            {children}
            {deck.held ? <span className="pdheld">You have the wheel &middot; resuming shortly</span> : null}
          </div>
          <Transport deck={deck} count={flow.steps.length} />
        </div>

        <Rail flow={flow} deck={deck} />
      </div>

      <section className="pdnow" aria-live="polite">
        <b>{step.title}</b>
        <p>{step.note}</p>
      </section>
    </main>
  );
}

function Transport<S, A extends string>({ deck, count }: { deck: Deck<S, A>; count: number }) {
  return (
    <div className="pdbar">
      <span className="pdprog"><i style={{ transform: `scaleX(${deck.progress})` }} /></span>
      <div className="pdctl">
        <button type="button" onClick={deck.prev} aria-label="Previous step">‹</button>
        <button type="button" onClick={deck.toggle} className="pdplay"
                aria-label={deck.playing ? 'Pause' : 'Play'}>
          {deck.playing ? '❙❙' : '▶'}
        </button>
        <button type="button" onClick={deck.next} aria-label="Next step">›</button>
        <span className="pdcount">{deck.step + 1} / {count}</span>
      </div>
    </div>
  );
}

function Rail<S, A extends string>({ flow, deck }: { flow: DemoFlow<S, A>; deck: Deck<S, A> }) {
  const ref = useRef<HTMLDivElement>(null);

  /* keep the playing step in view WITHOUT `scrollIntoView`: that scrolls every
     ancestor, and the rail sits inside a page the reader may have scrolled on
     purpose. This moves one box. */
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const el = box.querySelector<HTMLElement>('[data-on="1"]');
    if (!el) return;
    box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
  }, [deck.step]);

  return (
    <div className="pdrail" ref={ref}>
      {flow.chapters.map((c) => {
        const steps = flow.steps.map((s, i) => ({ s, i })).filter(({ s }) => s.ch === c.id);
        const on = steps.some(({ i }) => i === deck.step);
        return (
          <section className={'pdch' + (on ? ' on' : '')} key={c.id}>
            <h2>{c.name}</h2>
            <p className="pdblurb">{c.blurb}</p>
            <ol className="pdsteps">
              {steps.map(({ s, i }) => {
                const active = i === deck.step;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={'pdstep' + (active ? ' on' : '') + (i < deck.step ? ' past' : '')}
                      data-on={active ? '1' : undefined}
                      onClick={() => deck.seek(i)}
                      aria-current={active ? 'step' : undefined}
                    >
                      {/* THE STEP'S OWN NUMBER, NOT ITS CHAPTER'S.
                          A chapter index answers "which section is this" — a
                          question nobody watching a demo asks. The number that
                          means something is how far through you are, and it
                          only reads if it counts across the whole flow. It is
                          also the marker: state lives in its colour, so a
                          reader is not tracking a number and a dot separately. */}
                      <span className="pdmark" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="pdtxt"><b>{s.title}</b><em>{s.note}</em></span>
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

/* ---- the device's own chrome ------------------------------------------ */

/** The status bar. Frozen at the time on the recordings, because a clock that
    disagreed with the one in the reference frames would be the only thing on
    this page that is not from them.

    `/demo/perps-v5` renders none of this — see the note where it would have
    gone. It briefly took a `bare` prop that kept the notch and dropped the
    three indicators; when the notch went too, the prop had no caller left, and
    a shared component does not get to keep an option nobody passes. */
export function StatusBar({ time = '12:03' }: { time?: string }) {
  return (
    <div className="dstat" aria-hidden="true">
      <span className="dtime">{time}</span>
      <span className="dnotch" />
      <span className="dsig"><i className="dbars" /><i className="dwifi" /><i className="dbat" /></span>
    </div>
  );
}

export type TabName = 'Home' | 'Assets' | 'Swap' | 'Perps' | 'Menu';

const TAB_ICONS: Record<TabName, ReactNode> = {
  Home: <path className="fl" d="M12 4.6l7.4 5.9V18a1.9 1.9 0 0 1-1.9 1.9H6.5A1.9 1.9 0 0 1 4.6 18v-7.5z" />,
  Assets: <rect className="fl" x="4.4" y="6.4" width="15.2" height="11.2" rx="2.6" />,
  Swap: <path d="M7 9.4h9l-2.4-2.4M17 14.6H8l2.4 2.4" />,
  Perps: <><path d="M8.2 4.8v2.4M12 4.2v3M15.8 5.4v2.4" /><rect className="fl" x="6.9" y="7.2" width="2.6" height="9.6" rx="1.1" /><rect className="fl" x="14.5" y="7.8" width="2.6" height="7.2" rx="1.1" /></>,
  Menu: <><rect className="fl" x="4.5" y="4.5" width="6.2" height="6.2" rx="1.9" /><rect className="fl" x="13.3" y="4.5" width="6.2" height="6.2" rx="1.9" /><rect className="fl" x="4.5" y="13.3" width="6.2" height="6.2" rx="1.9" /><rect className="fl" x="13.3" y="13.3" width="6.2" height="6.2" rx="1.9" /></>,
};

const TABS: TabName[] = ['Home', 'Assets', 'Swap', 'Perps', 'Menu'];

export function Tabs({ on }: { on: TabName }) {
  return (
    <nav className="dtabs" aria-label="App sections">
      {TABS.map((t) => (
        <span className="dtab" key={t} aria-current={t === on ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
               strokeLinecap="round" strokeLinejoin="round">{TAB_ICONS[t]}</svg>
          <em>{t}</em>
        </span>
      ))}
    </nav>
  );
}

/**
 * The layer every sheet rides on. It clips, so a closed sheet slides clear of
 * the phone rather than fading — a sheet that fades while it slides is
 * transparent for the length of the slide, and what shows through is the
 * screen it is leaving behind.
 */
export function Layer({ open, onScrim, children }: {
  open: boolean;
  /** what tapping outside does; null makes the sheet modal, as the app does */
  onScrim: (() => void) | null;
  children: ReactNode;
}) {
  return (
    <div className={'dlayer' + (open ? ' open' : '')} aria-hidden={!open}>
      <span className={'dscrim' + live(onScrim)} {...press(open ? onScrim : null)} />
      {children}
    </div>
  );
}
