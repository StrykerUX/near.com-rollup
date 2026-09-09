/**
 * WHO SENT THEM, AND HOW THAT REACHES THE OTHER SIDE
 * ==================================================================
 * Two jobs, and they are not the same job.
 *
 *   1. TELL OUR OWN COUNTER. Umami is on `window` once `script.js` has run,
 *      and every event this file sends carries the source with it, so a
 *      breakdown by door is one property away.
 *   2. TELL near.com. That is a DIFFERENT ORIGIN. Nothing we write here — no
 *      cookie, no storage, no header — is readable there. The only vehicle
 *      that crosses is the query string on the outgoing link, which is why
 *      `refFor()` exists and why `useAcquisition` rewrites eight `href`s.
 *
 * WHERE A SOURCE COMES FROM, in the order it is believed:
 *
 *      ?utm_source=x     an explicit campaign tag, which is what the partner
 *                        redirect is asked to append
 *      /perps, /r/x      the path, which survives a link being copied, pasted
 *                        and stripped of its query by every "clean URL" tool
 *      the cookie        a previous visit in the last 90 days
 *
 * LAST TOUCH WINS. Arriving through a new door overwrites the cookie rather
 * than deferring to the first one ever seen. It is the convention, it is the
 * one a person can hold in their head, and the alternative — first touch —
 * quietly credits a door the reader may have walked through months ago.
 *
 * EVERYTHING IS BEST EFFORT AND NOTHING THROWS. `document.cookie` throws in
 * some privacy modes and `window.umami` is simply absent behind a blocker.
 * Both are ordinary states, not faults: the page must work identically with no
 * counter at all, so every call here fails into a no-op.
 */

/** Umami's tracker as it appears on `window` once its script has run. */
type Umami = { track: (name: string, data?: Record<string, unknown>) => void };
declare global {
  interface Window { umami?: Umami }
}

/**
 * BARE PATHS THAT MEAN A DOOR RATHER THAN A ROUTE. Every name here must have a
 * matching rewrite in `next.config.ts` or it is a 404 with a cookie on it.
 */
const SOURCE_PATHS = new Set(['perps']);

/** first-party, ours, and read by nothing but this file */
export const SOURCE_COOKIE = 'acq_src';
/** ninety days: long enough to survive a newsletter read weeks late */
const MAX_AGE = 60 * 60 * 24 * 90;

/**
 * WHAT `ref` SAYS WHEN WE KNOW NOTHING, and it is deliberately the value the
 * eight links were hardcoded to before any of this existed. The worst case of
 * the whole mechanism is therefore what shipped yesterday, not a broken link.
 */
export const DEFAULT_REF = 'therollup';

/**
 * A SOURCE IS `[a-z0-9-]`, AT MOST 32, AND NOTHING ELSE. This value is
 * concatenated into a url that leaves our origin, so it is whitelisted rather
 * than escaped — a stranger controls the path and the query it is read from,
 * and a whitelist cannot be wrong about a character it never passes.
 */
const clean = (raw: string | null | undefined): string =>
  (raw ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32);

/* ---- THE COOKIE -------------------------------------------------------- */

export function readCookie(name: string): string {
  try {
    const hit = document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='));
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
  } catch {
    return '';
  }
}

function writeCookie(name: string, value: string) {
  try {
    /* `SameSite=Lax` and not `Strict`: the reader lands here THROUGH a
       cross-site redirect from the partner's domain, and Strict would withhold
       the cookie on exactly that navigation — the one this exists for. */
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      `${name}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    /* private modes throw on write; the visit is simply unattributed */
  }
}

/* ---- WHERE THEY CAME FROM ---------------------------------------------- */

/**
 * Reads the three signals in order and PERSISTS the first fresh one it finds.
 * Returns '' when there is nothing to say, which is a real answer — most
 * readers arrive by no campaign at all and inventing "direct" for them would
 * put a fake token on the outbound link.
 */
/**
 * The door a pathname names, or '' if it names a route of this site.
 *
 * Shared by `resolveSource` and `cleanedUrl` deliberately: one decides what to
 * record and the other decides what to erase, and they must not be able to
 * disagree about which paths are doors. A door that the cleaner did not
 * recognise would stay in the address bar; a route the cleaner thought was a
 * door would have `/preview` rewritten to `/` under a reader who is on it.
 */
function sourceFromPath(pathname: string): string {
  const ns = pathname.match(/^\/r\/([\w-]+)\/?$/);
  if (ns) return clean(ns[1]);
  const bare = pathname.match(/^\/([\w-]+)\/?$/);
  if (bare && SOURCE_PATHS.has(bare[1].toLowerCase())) return clean(bare[1]);
  return '';
}

/**
 * WHAT THE ADDRESS BAR SHOULD SAY ONCE THE SOURCE HAS BEEN BANKED, or null if
 * there is nothing to tidy.
 *
 * THE ORDER IS THE WHOLE TRICK. Blockers strip query strings on ARRIVAL, which
 * is why the door is in the path; this runs afterwards, when the answer is
 * already in a cookie and the url is decoration. Cleaning first would be the
 * one arrangement that loses everything.
 *
 * IT COLLAPSES A DOOR AND ONLY A DOOR. `/r/nearperps` was rewritten to `/`, so
 * `/` is what it becomes and a refresh lands on the same page it was already
 * showing. A url that merely carries tags — `/preview?utm_source=x` — keeps its
 * path and loses the tags: rewriting THAT to `/` would move a reader off the
 * page they asked for, which is not tidying, it is a redirect nobody ordered.
 */
export function cleanedUrl(): string | null {
  try {
    const url = new URL(location.href);
    let changed = false;

    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_/i.test(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (sourceFromPath(url.pathname)) {
      url.pathname = '/';
      changed = true;
    }
    return changed ? url.pathname + url.search + url.hash : null;
  } catch {
    return null;
  }
}

/** what `resolveSource` found, and whether THIS visit is what carried it */
export type Acquisition = {
  source: string;
  /**
   * True when the door was named by this url rather than remembered from a
   * cookie. It is what separates an arrival from a return: without it a reader
   * who came through the door in March would file a fresh landing every time
   * they opened the page for the next ninety days.
   */
  fresh: boolean;
};

export function resolveSource(): Acquisition {
  let src = '';

  try {
    const q = new URLSearchParams(location.search);
    /* the campaign is the more specific of the two when both are present:
       `utm_source=therollup&utm_campaign=nearperps` should not collapse every
       one of the partner's campaigns into one bucket */
    src = clean(q.get('utm_campaign')) || clean(q.get('utm_source'));

    if (!src) {
      /* THE PATH, AND IT IS STILL `/perps` HERE. `next.config.ts` rewrites
         these to `/` rather than redirecting, so the browser's url — and
         therefore `location.pathname` — is untouched. A redirect would have
         erased the signal before this line ever ran.

         `/r/<x>` IS OPEN AND A BARE PATH IS NOT. Treating every single-segment
         path as a door would make `/preview` a campaign called "preview" and
         tag its readers' links with it — the site's own routes would poison
         the attribution. So bare names are an allowlist that has to be kept in
         step with the rewrites in `next.config.ts`, and everything else goes
         under the `/r/` namespace where no route will ever collide. */
      src = sourceFromPath(location.pathname);
    }
  } catch {
    /* malformed url; fall through to the cookie */
  }

  if (src) {
    writeCookie(SOURCE_COOKIE, src);
    return { source: src, fresh: true };
  }
  return { source: clean(readCookie(SOURCE_COOKIE)), fresh: false };
}

/** What the `ref` on a near.com link should say for a given source. */
export const refFor = (source: string): string =>
  source ? `${DEFAULT_REF}-${source}` : DEFAULT_REF;

/* ---- THE COUNTER ------------------------------------------------------- */

/**
 * A SHORT QUEUE, BECAUSE THE FIRST EVENT IS THE ONE MOST LIKELY TO BE LOST.
 * `script.js` loads `afterInteractive`, and the hero's view event fires one
 * second after mount — usually after the tracker has arrived, but not on a
 * cold cache or a slow phone. Dropping it would bias the denominator toward
 * fast connections, which is the population that converts best; the top of the
 * funnel would look worse than it is, for a reason invisible in the data.
 *
 * It gives up after ten seconds. Past that the tracker is not late, it is
 * blocked, and holding events for a reader who will never send one is a leak.
 */
type Queued = [string, Record<string, unknown> | undefined];
const pending: Queued[] = [];
let flushing = false;

function flush() {
  if (typeof window === 'undefined') return;
  const umami = window.umami;
  if (!umami) return;
  while (pending.length) {
    const next = pending.shift();
    if (next) umami.track(next[0], next[1]);
  }
}

function drain() {
  if (flushing) return;
  flushing = true;
  const started = Date.now();
  const timer = setInterval(() => {
    flush();
    if (!pending.length || Date.now() - started > 10_000) {
      clearInterval(timer);
      flushing = false;
      if (pending.length) pending.length = 0;
    }
  }, 400);
}

/**
 * Sends one event, with the source attached to every single one of them.
 * The source is read per call rather than captured once: `useAcquisition`
 * writes the cookie in an effect, and a view event can be armed before that
 * effect has run.
 */
export function track(name: string, data: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const source = clean(readCookie(SOURCE_COOKIE));
  const payload = source ? { ...data, source } : data;
  if (window.umami) {
    try {
      window.umami.track(name, payload);
    } catch {
      /* a tracker that throws is not worth a broken page */
    }
    return;
  }
  pending.push([name, payload]);
  drain();
}
