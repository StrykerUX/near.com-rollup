'use client';
import Link from 'next/link';
import { useDeck } from '@/components/demo/shell/deck';
import { Focus } from '@/components/demo/shell/Focus';
import { Phone } from '@/components/demo/perpsv3/Phone';
import { perpsV4Flow } from './script';

/**
 * PERPS v4 — the marketing cut
 * ==================================================================
 * The other three put the phone beside a rail of notes, because they are
 * arguments and an argument needs its reasons on screen. This one is a film:
 * the phone is the only object, the copy is one line at a time, and the camera
 * moves.
 *
 * It borrows v3's device wholesale — the same half-empty screens, the same
 * lit controls, the same travelling figures — because the thing v4 adds is not
 * inside the phone. It is where the phone is looked at from.
 */
export function PerpsV4Demo() {
  const deck = useDeck(perpsV4Flow);
  const step = perpsV4Flow.steps[deck.step];

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
            <Phone d={deck} />
            <Focus shot={step.shot} on={!deck.held} />
          </div>
          {/* outside the frame, or the frame would clip the annotation too */}
          {step.callout ? (
            <span className="v4callout" key={step.id}>{step.callout}</span>
          ) : null}
        </div>

        <div className="v4copy">
          <span className="v4ch">{perpsV4Flow.chapters.find((c) => c.id === step.ch)?.name}</span>
          {/* keyed so each line arrives rather than being retyped in place */}
          <h1 key={step.id}>{step.title}</h1>
          <p key={step.id + 'n'}>{step.note}</p>
        </div>
      </div>

      <div className="v4bar">
        <span className="v4dots">
          {perpsV4Flow.steps.map((s, i) => (
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
          <Link href="/demo/perps-v2">v2</Link>
          <Link href="/demo/perps-v3">v3</Link>
        </span>
      </div>
    </main>
  );
}
