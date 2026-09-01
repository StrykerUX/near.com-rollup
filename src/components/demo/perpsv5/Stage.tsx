'use client';
import type { ReactNode } from 'react';

/**
 * THE ROOM, WITH NOTHING IN IT BUT THE PHONE
 * ==================================================================
 * Every other cut stands in `shell/V4Stage`, which is a phone, a headline, a
 * callout and a row of dots. This one is that room with the furniture taken
 * out: no back link, no eyebrow, no copy, no callout, no transport, no sibling
 * links. One device, centred, and the light behind it.
 *
 * WHY IT IS ITS OWN COMPONENT RATHER THAN A `bare` PROP ON V4Stage. A stage
 * with no headline and no dots is not a V4Stage with two things switched off —
 * it is not a V4Stage at all, since the headline and the dots are the whole of
 * what that component contributes. Adding the prop would have turned four
 * blocks of markup into four conditionals to serve the one caller that wants
 * none of them, and left the other five cuts reading a branch they never take.
 *
 * IT SHARES THE ROOM'S CSS ON PURPOSE. `.v4`, `.v4bg`, `.v4glow`, `.v4phone`
 * and `.v4frame` are about a dark ground, two drifting lights and a clipping
 * bezel — none of that is about a headline, and duplicating it here is how the
 * two rooms would end up lit differently. `.v5bare` is the only new rule and it
 * does one thing: with no copy column and no bar, the stage is a single centred
 * cell instead of two columns in a three-row page.
 *
 * WHAT IS LOST, AND IT IS DELIBERATE: there is now no way to pause, seek or
 * step. That is what "leave only the demo" means — this page is a surface to
 * point a screen recorder at, and every control on it would be a control to
 * crop out of the frame. The other five cuts still have all of it, and
 * `/demo/perps-v3` is the one to open when the flow needs driving by hand.
 */
export function Stage({ phone }: { phone: ReactNode }) {
  return (
    <main className="v4 v5bare">
      {/* two drifting fields and a floor, none of it interactive. A flat black
          behind a floating object reads as a cut-out; a field with somewhere
          for the shadow to fall reads as a room. */}
      <div className="v4bg" aria-hidden="true">
        <i className="v4glow a" />
        <i className="v4glow b" />
      </div>

      <div className="v4stage">
        <div className="v4phone">
          <div className="v4frame">{phone}</div>
        </div>
      </div>
    </main>
  );
}
