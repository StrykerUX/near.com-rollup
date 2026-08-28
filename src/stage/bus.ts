/**
 * The two places the imperative engine has to reach into React-owned state.
 *
 * Module slots rather than DOM CustomEvents on purpose: React runs a parent's
 * effect AFTER its children's, so an event-based handshake would be a race
 * between whichever of the engine and its listeners mounted first. A slot has
 * no ordering to get wrong — whoever arrives second simply finds the other
 * already there.
 */

let ctaRearm: (() => void) | null = null;
/** Registered by the final CTA; returns its own unregister. */
export function setCtaRearm(fn: (() => void) | null) {
  ctaRearm = fn;
  return () => {
    if (ctaRearm === fn) ctaRearm = null;
  };
}
export const callCtaRearm = () => ctaRearm?.();

let menuCloser: (() => void) | null = null;
/** Registered by the swap screen's token picker. */
export function setMenuCloser(fn: (() => void) | null) {
  menuCloser = fn;
  return () => {
    if (menuCloser === fn) menuCloser = null;
  };
}
export const closeStageMenu = () => menuCloser?.();
