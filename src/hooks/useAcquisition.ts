'use client';
import { useEffect } from 'react';
import { cleanedUrl, refFor, resolveSource, track } from '@/lib/analytics';

/** every outbound link to the signup, wherever it is drawn */
const LOGIN_LINKS = 'a[href*="near.com/login"]';

/**
 * THE SOURCE, PUT WHERE THE OTHER SIDE CAN SEE IT
 * ==================================================================
 * `lib/analytics.ts` works out WHICH door the reader came through. This puts
 * that answer on the eight links that leave for near.com, because a cookie on
 * `therollup.near.com` is unreadable from `near.com` and the query string is
 * the only thing that crosses.
 *
 * WHY THE HREFS ARE PATCHED IN AN EFFECT AND NOT RENDERED. Reading a cookie on
 * the server means reading `cookies()`, and that turns a statically generated
 * route into one rendered per request — this page is a landing page whose whole
 * argument is that it arrives fast, and paying the CDN for an attribution tag
 * is the wrong trade. The cost of doing it here instead is a window between
 * first paint and hydration in which the links still say what the markup said.
 * THAT FALLBACK IS EXACTLY `ref=therollup`, the value every one of them was
 * hardcoded to before this existed — so the worst case of the entire mechanism
 * is the behaviour that already shipped, not a broken link.
 *
 * THE OBSERVER IS NOT DEFENSIVE PADDING. `useNarrow` swaps the whole stage
 * between two compositions on a `matchMedia` change, so crossing 1080px
 * unmounts four of these anchors and mounts different ones. Patching once on
 * mount would leave a resized window handing out untagged links.
 *
 * AND THEN IT TIDIES THE ADDRESS BAR, which is safe only in this order. The
 * door is in the PATH because that is the part no blocker strips on the way
 * in; by the time these lines run the answer is in a cookie and the url is
 * decoration. `history.replaceState` is Next's own supported route to this —
 * it integrates with the App Router rather than fighting it (see
 * `docs/01-app/01-getting-started/04-linking-and-navigating.md`) — and it adds
 * no history entry, so Back still goes where the reader came from.
 *
 * THE LANDING IS RECORDED BEFORE THE URL CHANGES, and that is not belt and
 * braces. Umami sends its own pageview when its script arrives, which is
 * `afterInteractive` and therefore either side of this line depending on the
 * connection — a race over whether the dashboard's Pages report shows
 * `/r/nearperps` or `/`. Rather than tune a delay against a third-party
 * script, the arrival is stated outright as an event carrying the source. It
 * is also the only record of a reader who lands, reads nothing and leaves:
 * they trip no CTA and no chapter, so without this they would arrive as an
 * anonymous pageview and the door would go uncounted.
 */
export function useAcquisition() {
  useEffect(() => {
    const { source, fresh } = resolveSource();
    const ref = refFor(source);

    const patch = () => {
      document.querySelectorAll<HTMLAnchorElement>(LOGIN_LINKS).forEach((a) => {
        try {
          const url = new URL(a.href);
          if (url.searchParams.get('ref') !== ref) {
            url.searchParams.set('ref', ref);
            a.href = url.toString();
          }
        } catch {
          /* an href that is not a url is not ours to fix */
        }
        /* Umami turns `data-umami-event-source` into a `source` property on
           the click event, so the counter and near.com agree on the door
           without the two being wired to each other. */
        if (source) a.dataset.umamiEventSource = source;
      });
    };

    patch();

    /* ONLY WHEN THIS VISIT NAMED THE DOOR. `fresh` is false for a reader whose
       source came out of a ninety-day-old cookie: they are a return, not a
       landing, and counting them again would inflate the top of the funnel
       against a numerator that cannot inflate with it. */
    if (fresh) {
      track('landed');
      const tidy = cleanedUrl();
      if (tidy) {
        try {
          history.replaceState(null, '', tidy);
        } catch {
          /* the url stays as it arrived, which is longer and works identically */
        }
      }
    }

    /* `childList` ONLY, which is what makes this safe to run from inside its
       own callback: `patch` writes attributes, and attribute mutations are not
       observed here, so it cannot retrigger itself. The rAF coalesces the
       burst of records a composition swap produces into one pass. */
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        patch();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);
}
