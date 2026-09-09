'use client';
import { useAcquisition } from '@/hooks/useAcquisition';
import { useChapterViews } from '@/hooks/useChapterViews';
import { useCtaViews } from '@/hooks/useCtaViews';

/**
 * THE THREE HOOKS THAT NEED A CLIENT, MOUNTED ONCE.
 *
 * IT LIVES IN THE LAYOUT, NOT IN `Site`, and the reason is the holding page.
 * `app/page.tsx` renders `<ComingSoon />` today and the tour is at `/preview`,
 * so a reader arriving from the partner's redirect lands on the holding page —
 * which is exactly the visit whose source is most worth keeping. Mounted here,
 * the cookie is written wherever they land and is still there when the tour
 * comes back to `/`.
 *
 * THE OTHER TWO COST NOTHING WHERE THEY HAVE NOTHING TO DO. `useCtaViews` and
 * `useChapterViews` query for elements the holding page does not have, observe
 * an empty list, and subscribe to a stage bus whose value is -1 because no
 * engine is running. No branch on route is needed and none is wanted: a
 * `usePathname` here would be one more thing to update the day the homepage
 * changes back.
 *
 * IT RENDERS NOTHING. No wrapper, no provider — the hooks talk to the document
 * and to `window.umami`, neither of which is React's to hold.
 */
export function Analytics() {
  useAcquisition();
  useCtaViews();
  useChapterViews();
  return null;
}
