'use client';
import { useStageEngine } from '@/hooks/useStageEngine';
import { GradientField } from './GradientField';
import { Hero } from './Hero';
import { Lockup } from './Lockup';
import { StepDots } from './StepDots';

/**
 * THE STAGE
 *
 * 588vh of scroll with a 100vh sticky child. Scroll only TRIGGERS the moves;
 * the composition itself is a pure function of position. The stage height and
 * the schedule in lib/schedule.ts are a matched pair — change one without the
 * other and the last trigger runs off the end of the sticky.
 */
export function Stage() {
  useStageEngine();

  return (
    <section id="stage" aria-label="near.com product tour">
      <div className="stage-sticky">
        <div className="stage-black" />
        <GradientField />
        <Hero />
        <StepDots />
        <Lockup />

        {/* The closing plate's copy. Its three `.pw` units are the hero recede
            run backwards — literally the same curves, evaluated at
            (1 - progress). */}
        <div className="permcopy">
          <div className="inner">
            <h2 className="h1">
              <span className="pw">Permissionless</span> <em className="pw">to the core</em>
            </h2>
            <p className="pw">
              Your account, your signature, your assets. near.com is decentralized
              by design. Transact across 30+ chains, no gatekeepers between you,
              your peers, and your crypto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
