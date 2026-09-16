# Analytics

Self-hosted Umami. Cookieless, so the page owes nobody a consent banner.
Script in `app/layout.tsx`; everything else is `lib/analytics.ts`,
`lib/domWatch.ts` and the three hooks mounted by `components/Analytics.tsx`.

## Events

Four names. Position and chapter number are **properties**, not names — an
earlier scheme spent twenty-two rows on this and put the two halves of every
rate in different places.

| Event | Properties | Fires when |
|---|---|---|
| `landed` | `source` | Arrival through a door. Once per tab per door — `sessionStorage`, so a reload does not recount |
| `cta-click` | `pos`, `source` | A signup button is pressed. Sent by Umami itself from `data-umami-event` |
| `cta-view` | `pos`, `source` | A signup button was visible for 1s |
| `chapter` | `n`, `source` | A chapter held the frame for 2s. `n` is 1–5 |

`pos` values: `hero` `lockup` `tour-top` `tour-close` `final` `sticky`
`nav-create` `nav-signin`.

`cta-view` skips both `nav-*`: they sit in a fixed header, so their view count
would restate the pageview count under another name.

**Click-through rate per position** is `cta-click` over `cta-view`, read as two
lists of the same shape.

## Where a source comes from

`utm_campaign` → `utm_source` → the path → the `acq_src` cookie (90 days,
last touch wins). `next.config.ts` rewrites `/perps` and `/r/:source` to `/`,
so `location.pathname` still names the door — a redirect would have erased it.

A bare path is an allowlist (`SOURCE_PATHS`) kept in step with those rewrites;
everything else goes under `/r/`, where no route of this site will collide.

**The URL is never tidied.** An earlier version cleaned the address bar once
the source was banked and it cost three measurements: Umami parses `utm_*` out
of the url it reports, Umami wraps `history.replaceState` and sends a second
pageview on any url change, and which of the two landed was a race against a
script loaded `afterInteractive`. Cosmetics are not worth a measurement.

## Reaching near.com

Every outgoing link is `https://near.com/login?ref=therollup`, and nothing
modifies it at runtime. The door the reader came through stays on our side, as
the `source` property on Umami events.

## Operational notes

- `data-domains` comes from `NEXT_PUBLIC_ANALYTICS_DOMAINS`, falling back to
  `therollup.near.com,near-com-rollup.vercel.app`. **Drop the Vercel host the
  day the real domain is pointed**, or the two share one dashboard. It is an
  env var so that is done by whoever repoints the domain, without a deploy.
  Every event carries `hostname` regardless, so mixed traffic can still be
  separated after the fact.
- Event names cannot be renamed backwards in Umami. Renaming means resetting
  the site or living with two series for one measurement.
- `cta-view` and `chapter` need a rendering lifecycle, so they do not fire in a
  backgrounded tab. That is correct — a reader who cannot see the page has not
  seen the button — but it also means they cannot be verified from an
  automated browser session whose window is behind another.
