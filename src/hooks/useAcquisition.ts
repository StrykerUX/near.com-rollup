'use client';
import { useEffect } from 'react';
import { refFor, resolveSource, track } from '@/lib/analytics';

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
 * THE URL IS LEFT ALONE, AND THAT IS THE CORRECTION. A previous version tidied
 * `/r/nearperps?utm_campaign=...` down to `/` once the source was banked. It
 * read well and it cost three things, all of them measurement:
 *
 *   · Umami parses `utm_*` out of the url it reports. Stripping the tags meant
 *     the campaign report saw whatever was left after we had erased its input.
 *   · Umami wraps `history.replaceState` and sends a SECOND pageview 300ms
 *     after the url changes, so the tidy-up was also inventing a visit to `/`.
 *   · Whether any of it landed depended on which arrived first, our effect or
 *     a third-party script — and losing that race looked identical to nobody
 *     having come through the door.
 *
 * The address bar is cosmetics. None of the above is.
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
       against a numerator that cannot inflate with it.

       IT IS NOT REDUNDANT WITH THE PAGEVIEW. Umami's own pageview records the
       url, so `/r/nearperps` and its tags are already in the Pages and campaign
       reports; what neither of those can say is whether this was an ARRIVAL or
       a reader coming back for the third time. That distinction is the whole
       top of the funnel. */
    if (fresh) track('landed');

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
