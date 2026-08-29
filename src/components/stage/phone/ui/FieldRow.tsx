import type { ReactNode } from 'react';
import { live as can, press } from './tap';

/**
 * The tappable row the app uses for Token / Network / Recipient: a leading
 * mark, a stacked label and value, and a chevron. `open` rotates the chevron,
 * so a row that is driving a sheet says so.
 */
export function FieldRow({
  mark, label, value, open, muted, on,
}: {
  mark?: ReactNode;
  label: string;
  value: string;
  open?: boolean;
  /** the placeholder state — "Select recipient" rather than a real choice */
  muted?: boolean;
  /** null in demo mode, and for the rows that genuinely lead nowhere */
  on?: (() => void) | null;
}) {
  return (
    <div className={'frow' + (open ? ' open' : '') + (muted ? ' muted' : '') + can(on)} {...press(on)}>
      <span className="fmark">{mark}</span>
      <span className="ftext">
        <span className="flabel">{label}</span>
        <span className="fvalue">{value}</span>
      </span>
      <span className="fchev" aria-hidden="true">⌄</span>
    </div>
  );
}
