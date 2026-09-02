'use client';
import { useEffect, useState } from 'react';
import { NARROW_MQ } from '@/lib/breakpoints';

/**
 * WHICH COMPOSITION IS ON, AS A FACT REACT CAN SEE.
 *
 * Almost everything about the narrow tour is CSS, and should be: a stylesheet
 * that hides a node is cheaper and less breakable than a component that
 * decides not to render it. This hook exists for the one case where that is
 * not true — `display:none` does not unmount React, stop a timer, or pause a
 * canvas. The wide composition's `PhoneShell` runs a demo flow on its own
 * clock, and hidden behind a media query it would keep running one: a chart, a
 * settlement and a re-render every beat, on the device with the least battery
 * to spend on it.
 *
 * So the two places that own a RUNNING DEMO ask this and mount accordingly.
 * Everything else is left to the stylesheet.
 *
 * IT STARTS false ON PURPOSE. There is no viewport during server render, so
 * the first client render has to agree with the markup that arrived or React
 * discards it. The effect corrects it on the first commit, which costs one
 * mount of the wide shell on a phone — one frame — and that is the honest
 * price of not guessing at the width in HTML.
 */
export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = matchMedia(NARROW_MQ);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  return narrow;
}
