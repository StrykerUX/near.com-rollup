/**
 * WRITE-IF-CHANGED
 * ------------------------------------------------------------------
 * The scrub paints every frame whether or not anything moved, and most frames
 * rewrite values that are already there. Baseline over a 242-frame scrub of the
 * whole stage: 614 style recalcs, 1.396s of recalc. Assigning an identical
 * string to el.style still dirties the element, and root custom properties are
 * worse — they invalidate every node that could inherit them, i.e. the whole
 * document.
 *
 * The cache is one plain object per element, which the elements outlive anyway.
 */

type Cached = HTMLElement & { __sty?: Record<string, string> };

export function sty(el: HTMLElement, prop: string, val: string) {
  const e = el as Cached;
  const c = e.__sty || (e.__sty = {});
  if (c[prop] === val) return;
  c[prop] = val;
  (e.style as unknown as Record<string, string>)[prop] = val;
}

export function makeVarWriter(root: HTMLElement) {
  const cache: Record<string, string> = {};
  return (name: string, val: string) => {
    if (cache[name] === val) return;
    cache[name] = val;
    root.style.setProperty(name, val);
  };
}
