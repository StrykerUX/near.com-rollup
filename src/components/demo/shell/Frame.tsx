'use client';
import Link from 'next/link';
import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { live, press } from '@/components/stage/phone/ui/tap';
import { CandlesIcon, HomeIcon, MenuIcon, SwapIcon, WalletIcon, type IconProps } from '@/components/demo/icons';
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
          <Link href="/demo/own-v5">Everything you own</Link>
            <Link href="/demo/perps">Perps</Link>
          <Link href="/demo/perps-v2">Perps v2</Link>
          <Link href="/demo/perps-v3">Perps v3</Link>
          <Link href="/demo/perps-v4">Perps v4</Link>
            <Link href="/demo/perps-v5">Perps v5</Link>
          <Link href="/demo/swap">Swap</Link>
          <Link href="/demo/swap-v4">Swap v4</Link>
            <Link href="/demo/swap-v5">Swap v5</Link>
            <Link href="/demo/earn-v5">Earn v5</Link>
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

/**
 * THE FIVE TAB GLYPHS, from the phone's icon set — see `demo/icons.tsx`.
 *
 * `fl` IS GONE, AND WITH IT THE FILL WASH. The five icons used to be
 * hand-drawn here, and three of them tagged their closed shapes with `.fl` so
 * that `.dtab[aria-current] .fl` (17-demo.css) could flood them with 22%
 * green. Two never could: Swap is an open arrow and Assets' wallet body runs
 * back along its own top edge, so filling either paints a wedge across the
 * opening. The effect was therefore already true of three tabs out of five.
 *
 * A drawn set has no such marks and should not be given them — every glyph in
 * it is a stroke, and stroke icons fill badly for exactly the reason the two
 * exceptions above document. So the wash goes, and the active tab is what it
 * already was for Swap and Assets: the whole icon in `--near-green`, which
 * `.dtab[aria-current]` does through `color`. Five tabs behaving alike, rather
 * than three of one kind and two of another.
 */
const TAB_ICONS: Record<TabName, ComponentType<IconProps>> = {
  Home: HomeIcon,
  Assets: WalletIcon,
  Swap: SwapIcon,
  Perps: CandlesIcon,
  Menu: MenuIcon,
};

const TABS: TabName[] = ['Home', 'Assets', 'Swap', 'Perps', 'Menu'];

/**
 * `on` may be a tab, or `'None'` — which is what the bar looks like on a screen
 * the bar has no item for. The earn page is one: it is reached from a balance
 * row on the home screen, and every item in the row is dim there. Lighting Home
 * would be the bar claiming you are somewhere you left.
 */
export function Tabs({ on, go, lit }: {
  on: TabName | 'None';
  /**
   * WHAT A TAB DOES, for the chapters that are reached through one.
   *
   * The bar was drawn and inert everywhere — the app's own furniture, correct
   * and untouchable. The swap chapter starts on the account and gets to its
   * screen the way anybody would: by pressing Swap down here. So a tab may now
   * carry a handler, and the ones that do not are what they always were.
   */
  go?: Partial<Record<TabName, (() => void) | null>>;
  /** which tab is being held down — see the note in 24-demo-app.css */
  lit?: string | null;
}) {
  return (
    <nav className="dtabs" aria-label="App sections">
      {TABS.map((t) => {
        const fn = go?.[t] ?? null;
        return (
          <span className={'dtab' + live(fn)} key={t} {...press(fn)}
                aria-current={t === on ? 'page' : undefined}
                data-tap={fn ? 'tab:' + t : undefined}
                data-lit={lit === 'tab:' + t ? '1' : undefined}>
            {/* 1.7, the weight the hand-drawn set was carrying here. The
                icons ship at 1.5, which reads thin at 21px against the label
                under it. */}
            {(() => { const Glyph = TAB_ICONS[t]; return <Glyph strokeWidth={1.7} />; })()}
            <em>{t}</em>
          </span>
        );
      })}
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
