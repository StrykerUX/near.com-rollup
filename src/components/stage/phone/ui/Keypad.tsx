/**
 * The app's numeric keypad, and the accessory bar above it.
 *
 * It is the iOS phone-pad layout, letters and all — that is what the real app
 * puts on screen, and dropping them makes the mock read as a web form rather
 * than a native sheet. `pressed` lights one key so an autoplayed entry looks
 * typed instead of pasted.
 */
const KEYS: [string, string?][] = [
  ['1'], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  [','], ['0'], ['⌫'],
];

export function Keypad({ pressed }: { pressed?: string | null }) {
  return (
    <div className="kpwrap" aria-hidden="true">
      <div className="kpbar">
        <span className="kpnav"><i className="kpup" /><i className="kpdown" /></span>
        <span className="kpdone">✓</span>
      </div>
      <div className="kpgrid">
        {KEYS.map(([k, sub]) => (
          <span className={'kpkey' + (pressed === k ? ' on' : '')} key={k}>
            <b>{k === '⌫' ? '⌫' : k}</b>
            {sub ? <em>{sub}</em> : null}
          </span>
        ))}
      </div>
      <span className="kpglobe">🌐</span>
    </div>
  );
}
