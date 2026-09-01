'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Deck } from '@/components/demo/shell/deck';
import type { DemoFlow } from '@/components/demo/shell/flow';
import { Focus } from '@/components/demo/shell/Focus';

/**
 * THE MARKETING CUT, WHICH IS A ROOM AND NOT A FLOW
 * ==================================================================
 * Every other version of these demos puts the phone beside a rail of notes,
 * because they are arguments and an argument needs its reasons on screen.
 * This one is a film: the phone is the only object on the page, the copy is
 * one line at a time, and the frame darkens around whatever is being talked
 * about.
 *
 * It was written for perps, and then it turned out to name nothing about
 * perps. There is no price here, no position, no bracket — a phone, a
 * headline, a callout and a row of dots. So it is a component that takes a
 * flow and a device rather than five files that differ in two lines each:
 * the point of the cut is that all five look like one piece of work, and five
 * copies is the one arrangement that guarantees they will not.
 *
 * WHAT IT DELIBERATELY DOES NOT DO is reach inside the device. Each flow keeps
 * its own screens exactly as its other versions have them — the same lit
 * controls, the same travelling figures. What v4 adds is not in the phone. It
 * is where the phone is looked at from.
 */
export function V4Stage<S, A extends string>({
  flow, deck, phone, links,
}: {
  flow: DemoFlow<S, A>;
  deck: Deck<S, A>;
  /** the flow's own device, rendered untouched */
  phone: ReactNode;
  /** the other cuts of this same flow, named as they should be read */
  links?: { href: string; label: string }[];
}) {
  const step = flow.steps[deck.step];

  return (
    <main className="v4">
      {/* the scene. Two drifting fields and a floor, none of it interactive */}
      <div className="v4bg" aria-hidden="true">
        <i className="v4glow a" />
        <i className="v4glow b" />
      </div>

      <Link className="v4back" href="/demo">← near.com × The Rollup</Link>

      <div className="v4stage">
        <div className="v4phone">
          {/* The frame clips, so the cutout's shadow — which is bigger than
              the screen on purpose — stops at the bezel. */}
          <div className="v4frame">
            {phone}
            <Focus shot={step.shot} on={!deck.held} />
          </div>
          {/* outside the frame, or the frame would clip the annotation too */}
          {step.callout ? (
            <span className="v4callout" key={step.id}>{step.callout}</span>
          ) : null}
        </div>

        <div className="v4copy">
          {/* the eyebrow carries the step's number rather than its chapter's:
              how far through is the thing a viewer wants, and this cut has no
              rail to read it off */}
          <span className="v4ch">
            <i>{String(deck.step + 1).padStart(2, '0')}</i>
            {flow.chapters.find((c) => c.id === step.ch)?.name}
          </span>
          {/* keyed so each line arrives rather than being retyped in place */}
          <h1 key={step.id}>{step.title}</h1>
          <p key={step.id + 'n'}>{step.note}</p>
        </div>
      </div>

      <div className="v4bar">
        <span className="v4dots">
          {flow.steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={'v4dot' + (i === deck.step ? ' on' : '') + (i < deck.step ? ' past' : '')}
              onClick={() => deck.seek(i)}
              aria-label={s.title}
              aria-current={i === deck.step ? 'step' : undefined}
            />
          ))}
        </span>
        <span className="v4ctl">
          <button type="button" onClick={deck.prev} aria-label="Previous">‹</button>
          <button type="button" onClick={deck.toggle} aria-label={deck.playing ? 'Pause' : 'Play'}>
            {deck.playing ? '❙❙' : '▶'}
          </button>
          <button type="button" onClick={deck.next} aria-label="Next">›</button>
        </span>
        <span className="v4links">
          {(links ?? []).map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </span>
      </div>
    </main>
  );
}
