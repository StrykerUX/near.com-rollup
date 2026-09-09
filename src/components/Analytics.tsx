'use client';
import { useAcquisition } from '@/hooks/useAcquisition';

/**
 * THE HOOKS THAT NEED A CLIENT, MOUNTED ONCE.
 *
 * IT LIVES IN THE LAYOUT, NOT IN `Site`, and the reason is the holding page.
 * `app/page.tsx` renders `<ComingSoon />` today and the tour is at `/preview`,
 * so a reader arriving from the partner's redirect lands on the holding page —
 * which is exactly the visit whose source is most worth keeping. Mounted here,
 * the cookie is written wherever they land and is still there when the tour
 * comes back to `/`.
 *
 * IT RENDERS NOTHING. No wrapper, no provider — the hooks talk to the document
 * and to `window.umami`, neither of which is React's to hold.
 */
export function Analytics() {
  useAcquisition();
  return null;
}
