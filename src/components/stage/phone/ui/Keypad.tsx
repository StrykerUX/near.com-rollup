'use client';
import { useEffect, useState } from 'react';
import { press } from './tap';

/**
 * The app's numeric keypad, and the accessory bar above it.
 *
 * It is the iOS phone-pad layout, letters and all — that is what the real app
 * puts on screen, and dropping them makes the mock read as a web form rather
 * than a native sheet.
 *
 * Two things light a key. The script sets `pressed`, so an autoplayed entry
 * looks typed instead of pasted. A reader's own press lights it here, locally,
 * for 140ms — the flow state has no business holding a highlight that is over
 * before the next beat, and a `pressed` that stuck would leave the last digit
 * glowing for as long as the reader looked at the screen.
 */
const KEYS: [string, string?][] = [
  ['1'], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  [','], ['0'], ['⌫'],
];

export function Keypad({
  pressed, onKey, onDone,
}: {
  pressed?: string | null;
  /** null in demo mode: the pad is a picture of a pad */
  onKey?: ((k: string) => (() => void) | null) | null;
  /**
   * The ✓ on the accessory bar. It is the app's real way out of a numeric
   * field, and it is the ONLY way out on a screen whose primary button is
   * behind the pad while the pad is up.
   */
  onDone?: (() => void) | null;
}) {
  const [hit, setHit] = useState<string | null>(null);

  useEffect(() => {
    if (!hit) return;
    const id = setTimeout(() => setHit(null), 140);
    return () => clearTimeout(id);
  }, [hit]);

  return (
    <div className={'kpwrap' + (onKey ? ' can' : '')} aria-hidden={onKey ? undefined : 'true'}>
      <div className="kpbar">
        <span className="kpnav"><i className="kpup" /><i className="kpdown" /></span>
        <span className={'kpdone' + (onDone ? ' can' : '')} {...press(onDone ?? null)}
          data-tap="done" aria-label={onDone ? 'Done' : undefined}>✓</span>
      </div>
      <div className="kpgrid">
        {KEYS.map(([k, sub]) => {
          const fn = onKey?.(k) ?? null;
          return (
            <span
              className={'kpkey' + (pressed === k || hit === k ? ' on' : '') + (fn ? ' can' : '')}
              key={k}
              /* named so a demo's hand can find it; harmless everywhere else */
              data-tap={'key:' + k}
              aria-label={onKey ? (k === '⌫' ? 'Delete' : k) : undefined}
              {...press(fn && (() => { setHit(k); fn(); }))}
            >
              <b>{k === '⌫' ? '⌫' : k}</b>
              {sub ? <em>{sub}</em> : null}
            </span>
          );
        })}
      </div>
      <span className="kpglobe">🌐</span>
    </div>
  );
}
