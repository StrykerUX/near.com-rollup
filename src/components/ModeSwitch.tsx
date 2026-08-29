'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Mode } from '@/components/stage/phone/flows/mode';

const MODES: { mode: Mode; href: string; label: string; hint: string }[] = [
  { mode: 'demo', href: '/', label: 'Demo', hint: 'Autoplay. Slower, and nothing takes a pointer.' },
  { mode: 'guided', href: '/guided', label: 'Guided', hint: 'It plays itself, but you may take the wheel. It always heals back.' },
  { mode: 'free', href: '/live', label: 'Live', hint: 'No script. The app, as far as it goes.' },
];

/**
 * The switch between the three versions.
 *
 * It is a set of real links rather than a client-side toggle: each mode is a
 * route, so a reader can send someone the one they mean. It collapses to a
 * puck on small screens, where the phone needs every pixel it has.
 */
export function ModeSwitch({ mode }: { mode: Mode }) {
  /* Folded until asked for, so it never covers the stage for a reader who did
     not want it. Each mode is its own route and `Site` is rendered per page,
     so navigating remounts this and the menu closes itself — there is nothing
     here to reset on a path change. */
  const [open, setOpen] = useState(false);

  const cur = MODES.find((m) => m.mode === mode) ?? MODES[0];

  return (
    <div className={'modesw' + (open ? ' open' : '')}>
      <button className="modesw-puck" type="button" onClick={() => setOpen((v) => !v)}
        aria-expanded={open} aria-label="Choose a demo mode">
        <i className="modesw-dot" aria-hidden="true" />
        <b>{cur.label}</b>
        <i className="modesw-chev" aria-hidden="true">⌃</i>
      </button>
      <div className="modesw-menu" role="group" aria-label="Demo modes">
        {MODES.map((m) => (
          <Link key={m.mode} href={m.href} className={'modesw-item' + (m.mode === mode ? ' on' : '')}>
            <b>{m.label}</b>
            <span>{m.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
