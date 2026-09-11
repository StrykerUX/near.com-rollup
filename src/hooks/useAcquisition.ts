'use client';
import { useEffect } from 'react';
import { resolveSource, track } from '@/lib/analytics';
import { onDomChange } from '@/lib/domWatch';

/**
 * Every element that already declares a click event to Umami. It used to be
 * `a[href*="near.com/login"]`, named for a url rewrite that no longer happens —
 * what is stamped here is an analytics attribute, and the set that wants one is
 * the set that reports clicks.
 */
const TRACKED_CTAS = '[data-umami-event]';

/**
 * THE SOURCE, RECORDED — AND NOT WRITTEN INTO THE SIGNUP LINK
 * ==================================================================
 * `lib/analytics.ts` works out WHICH door the reader came through. This banks
 * that answer in a cookie and stamps it on the CTAs so Umami's click events
 * carry it. It does NOT go anywhere near the outgoing url.
 *
 * IT USED TO. This hook rewrote `?ref=therollup` to `?ref=therollup-nearperps`
 * on every signup link, so the ref would say not just which partner but which
 * of their campaigns. That was built on the assumption that `ref` is a free
 * text field near.com stores verbatim — and it is not. near.com issues opaque
 * codes (`lib/login.ts`), so appending a door to one invalidates it exactly as
 * changing a character would. Between the served markup and the rewrite, their
 * side saw two different values, both wrong, and attributed nothing.
 *
 * SO THE LINK IS A CONSTANT NOW and the door reaches only our own counter. That
 * is a real loss on their side — they can no longer tell which door produced an
 * account — and closing it needs either a code issued per door or a `utm_content`
 * they agree to read. Both are theirs to decide; neither is worth guessing at
 * again. See `docs/analytics.md`.
 *
 * THE OBSERVER IS NOT DEFENSIVE PADDING. `useNarrow` swaps the whole stage
 * between two compositions on a `matchMedia` change, so crossing 1080px
 * unmounts four of these CTAs and mounts different ones. Stamping once on mount
 * would leave a resized window sending click events with no door on them.
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

    /* Umami turns `data-umami-event-source` into a `source` property on the
       click event it fires itself, which is the only reason to walk the DOM
       here at all. No href is read and none is written. */
    const patch = () => {
      if (!source) return;
      document.querySelectorAll<HTMLElement>(TRACKED_CTAS).forEach((el) => {
        el.dataset.umamiEventSource = source;
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
