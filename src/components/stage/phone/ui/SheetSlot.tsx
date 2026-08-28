'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Sheets are rendered by the FACE that owns them but must land on the SHELL.
 *
 * `.sheet` is inset:0 on its positioned ancestor, and a sheet that stops at the
 * content area — leaving the header and the tab bar showing above and below —
 * reads as a panel rather than a layer. The faces are inset inside `.cswap`, so
 * a sheet written where it belongs would do exactly that.
 *
 * A portal keeps the JSX next to the flow that drives it and the DOM node where
 * the CSS needs it. It stays mounted across beats, which is what lets the open
 * transition run at all — a sheet that mounts already-open has nothing to
 * transition from.
 */
const SlotCtx = createContext<HTMLElement | null>(null);

export function SheetSlotProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  return (
    <SlotCtx.Provider value={node}>
      {children}
      <div className="sheetslot" ref={setNode} />
    </SlotCtx.Provider>
  );
}

export function SheetPortal({ children }: { children: ReactNode }) {
  /* The slot is a sibling rendered after us, so it is null on the first pass —
     on the server, during hydration, and on the client's first render alike.
     The provider's ref callback then commits the node and everyone re-renders
     with it. Rendering nothing until then is both correct and identical on
     both sides of hydration, so no extra state is needed to gate it. */
  const node = useContext(SlotCtx);
  if (!node) return null;
  return createPortal(children, node);
}
