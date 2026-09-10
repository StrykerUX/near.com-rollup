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

`useAcquisition` rewrites the `ref` on all eight outgoing links to
`therollup-<source>`. It has to be the query string: `near.com` is a different
origin and nothing else we write crosses. With no source known it stays
`therollup`, which is what the links were hardcoded to before any of this — so
the worst case is the previous behaviour, not a broken link.

Done in an effect rather than on the server: reading `cookies()` would turn a
static route into one rendered per request.

## Open: the ref carries the door, not the button

`ref=therollup-nearperps` says which door they came through. It does not say
which of the eight buttons they pressed, so near.com can report accounts per
campaign but not per position.

That gap matters because **a click is not an account**. Someone who presses the
hero three seconds in is a different intent from someone who read five chapters
first, and the second arrives far warmer. It is entirely possible for the hero
to produce three times the clicks and half the accounts — in which case the
click counts would point at the worse button.

Two shapes would close it:

- `ref=therollup-nearperps-final` — one field, but eight values per campaign
  where their report currently has one clean row.
- `ref=therollup-nearperps&ref_pos=final` — leaves the working field alone,
  needs their side to store a second parameter.

**Why it is not done.** The field is theirs, on their domain, in their system.
If their pipeline validates `ref` against known values, an unregistered
`therollup-nearperps-hero` drops silently — and that does not merely fail to
add the position, it breaks the attribution that works today, with nothing
reporting an error.

Ask them first:

1. Is `ref` stored verbatim, or matched against a list?
2. Can they report it broken down, or only as a campaign total?
3. Would a second parameter be accepted instead of changing `ref`?

If the answer to (1) is "matched against a list", the only version with a
chance is a coarse one — `-cold` for the buttons pressed before reading,
`-warm` for those after. Two values instead of eight, and it still captures
where most of the signal is.

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
