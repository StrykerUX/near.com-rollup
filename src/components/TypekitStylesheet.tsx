'use client';
import { useEffect } from 'react';

export const TYPEKIT_HREF = 'https://use.typekit.net/gtm1rhn.css';

/**
 * Flips the Kepler kit's stylesheet from media="print" to media="all".
 *
 * The <link> itself is server-rendered into <head> (see layout.tsx) — it has to
 * be, or the fetch does not start until after hydration, and `document.fonts.
 * ready` then resolves BEFORE Kepler is even requested. Everything keyed to
 * that promise measures the fallback serif and never corrects: the italic
 * squeeze bakes in a compensation for a face that is about to be replaced.
 *
 * media="print" is what keeps it non-render-blocking. As a plain stylesheet the
 * kit cost 13,920ms to first paint against 704ms this way.
 */
export function TypekitStylesheet() {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>(`link[href="${TYPEKIT_HREF}"]`);
    if (!link || link.media === 'all') return;
    const show = () => { link.media = 'all'; };
    /* sheet is non-null once the CSS has parsed — covers the case where the
       stylesheet finished loading before hydration ran */
    if (link.sheet) show();
    else link.addEventListener('load', show, { once: true });
  }, []);
  return null;
}
