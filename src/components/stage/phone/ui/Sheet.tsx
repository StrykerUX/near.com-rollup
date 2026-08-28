import type { ReactNode } from 'react';

/**
 * The bottom sheet. It covers the whole shell rather than stopping at the
 * content area, because `.tokenmenu` taught us that a sheet which leaves the
 * header and tab bar showing reads as a panel, not as a layer.
 *
 * `open` drives a transform+opacity transition; the scrim fades with it.
 */
export function Sheet({
  open, title, children,
}: {
  open: boolean;
  /** omitted for sheets whose own content carries the title, like a vault */
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className={'sheet' + (open ? ' open' : '')} aria-hidden={!open}>
      <span className="sheet-scrim" />
      <div className="sheet-body">
        <span className="sheet-grab" aria-hidden="true" />
        {title ? <div className="sheet-head">{title}</div> : null}
        <div className="sheet-content">{children}</div>
      </div>
    </div>
  );
}
