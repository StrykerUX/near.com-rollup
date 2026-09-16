'use client';
import { useEffect } from 'react';
import { resolveSource, track } from '@/lib/analytics';
import { onDomChange } from '@/lib/domWatch';

/** every outbound link to the signup, wherever it is drawn */
const LOGIN_LINKS = 'a[href*="near.com/login"]';

/**
 * THE SOURCE, STAMPED ON THE LINKS FOR OUR OWN COUNTER
 * ==================================================================
 * `lib/analytics.ts` works out WHICH door the reader came through. This puts
 * that answer on the eight links that leave for near.com as an Umami property.
 *
 * THE `ref` IS NOT TOUCHED. Every link ships as
 * `https://near.com/login?ref=therollup` and leaves exactly like that. A
 * previous version rewrote it to `therollup-<source>` at hydration, which meant
 * near.com saw two different values depending on whether the page had hydrated.
 *
 * THE OBSERVER IS NOT DEFENSIVE PADDING. `useNarrow` swaps the whole stage
 * between two compositions on a `matchMedia` change, so crossing 1080px
 * unmounts four of these anchors and mounts different ones. Stamping once on
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

    const patch = () => {
      document.querySelectorAll<HTMLAnchorElement>(LOGIN_LINKS).forEach((a) => {
        /* Umami turns `data-umami-event-source` into a `source` property on
           the click event, so a breakdown by door is one property away. */
        if (source) a.dataset.umamiEventSource = source;
      });
    };

    patch();

    /* ONE PER TAB, PER DOOR — and `fresh` alone was not enough to get that.
       `fresh` means THIS URL NAMED A DOOR, which is a different claim from
       "this is a first visit": a reader who reloads `/r/nearperps` five times,
       or opens it from a bookmark every morning, satisfies it every time. The
       count was inflating exactly where it was supposed to be authoritative.

       `sessionStorage` IS THE RIGHT SCOPE HERE, not the ninety-day cookie. A
       genuine second click through the partner's redirect next week IS another
       arrival and should count; a refresh of the tab already open is not.

       THE THROW COUNTS. Safari in private browsing throws on `setItem`, and
       there the choice is between losing real arrivals and letting a minority
       double-count on refresh. An arrival that happened is a fact; failing
       toward recording it is the honest direction. */
    if (fresh) {
      const once = `landed:${source}`;
      try {
        if (!sessionStorage.getItem(once)) {
          sessionStorage.setItem(once, '1');
          track('landed');
        }
      } catch {
        track('landed');
      }
    }

    return onDomChange(patch);
  }, []);
}
