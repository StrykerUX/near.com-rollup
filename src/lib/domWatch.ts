/**
 * ONE MUTATION OBSERVER FOR THE WHOLE ANALYTICS LAYER.
 *
 * Three hooks need to know when nodes appear or vanish, and all three need it
 * for the SAME reason: `useNarrow` swaps the entire stage between two
 * compositions on a `matchMedia` change, so crossing 1080px unmounts half the
 * tracked elements and mounts different ones.
 *
 * THEY USED TO EACH BUILD THEIR OWN, and on this page that was the wrong shape.
 * `childList` with `subtree` fires on every node added or removed anywhere
 * below `<body>` — and the device in the middle of the stage swaps its screens
 * continuously while the tour plays. Three observers meant three callbacks and
 * three `requestAnimationFrame`s per swap, all to run work that is identical in
 * timing and differs only in which selector it queries.
 *
 * The isolation that bought — a hook deletable on its own — was real, and it
 * stopped being worth its price once there were three of them.
 *
 * IT IS LAZY AND IT TIDIES UP. The observer is created with the first
 * subscriber and disconnected with the last, so a route that tracks nothing
 * (the holding page mounts `<Analytics />` too) never starts one.
 */

let mo: MutationObserver | null = null;
let queued = 0;
const subs = new Set<() => void>();

/** Registers a rescan; returns its own unsubscribe. */
export function onDomChange(fn: () => void): () => void {
  subs.add(fn);

  if (!mo) {
    mo = new MutationObserver(() => {
      /* One frame's worth of records collapses into one pass. A composition
         swap produces a burst of them and every subscriber wants the settled
         DOM, not each intermediate step. */
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        subs.forEach((f) => f());
      });
    });
    /* `childList` ONLY. Attribute mutations are deliberately not observed:
       `useAcquisition` writes `href` and `data-*` from inside a rescan, and
       observing attributes would let it retrigger itself. */
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    subs.delete(fn);
    if (!subs.size && mo) {
      mo.disconnect();
      mo = null;
      if (queued) {
        cancelAnimationFrame(queued);
        queued = 0;
      }
    }
  };
}
