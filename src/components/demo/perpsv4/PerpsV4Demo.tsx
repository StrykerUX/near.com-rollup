'use client';
import Link from 'next/link';
import { useDeck } from '@/components/demo/shell/deck';
import { Camera } from '@/components/demo/shell/Camera';
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
          {/* THE FRAME CLIPS, THE CAMERA MOVES. They have to be two elements:
              `overflow: hidden` on the transformed one would scale the clip
              along with the content, and a 1.45x push-in would grow the phone
              rather than look into it. */}
          <div className="v4frame">
            <div className="pdcam">
              <Phone d={deck} />
              <Camera shot={step.shot} on={!deck.held} />
              <span className="v4vig" aria-hidden="true" />
            </div>
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
