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

The signup link is a constant. One string, one export, `src/lib/login.ts`, and
nothing modifies it at runtime:

```
https://near.com/login?ref=uykzkl1o&utm_source=perpscampaign&utm_medium=landing&utm_campaign=near_q3_perps
```

`uykzkl1o` is a code **near.com issued**. It is opaque — eight characters that
mean nothing on their own and everything in their database, which is where the
account, the fee share and the 20% rebate are all keyed from. Do not concatenate
to it, derive from it, or swap it for a name that reads better. The UTM tags
belong to near.com's own analytics and arrived with the code; our campaign
measurement is separate and never touches this url.

### The bug this replaced, because it is worth not repeating

It was `?ref=therollup` in six hand-copied constants, and `useAcquisition`
rewrote it to `?ref=therollup-<door>` at hydration so the ref would say which
campaign the reader came through.

That was built on the assumption that `ref` is a free text field near.com stores
verbatim. It is not. So near.com saw two different values depending on whether
the page had hydrated yet — `therollup` and `therollup-nearperps` — and **both
were invalid**. Weeks of signups went unattributed, and nothing anywhere
reported an error: the link worked, the page loaded, the account was created.

Two failures made it, and the fix addresses both. The value was never verified
with the party that reads it. And the string lived in six files with no import
between them, so the served markup and the hydrated href could drift apart
without anything failing.

## Open: near.com cannot tell which door an account came from

The door (`/perps`, `/r/nearperps`) reaches our counter and stops there. It used
to ride in the `ref`, which is what broke it.

That gap is real. A click is not an account, and without it there is no way to
know whether one campaign's traffic converts better than another's once it
leaves this page — only how many clicked.

Two ways to close it, **both theirs to decide**:

- **A code per door.** near.com issues `uykzkl1o` for this campaign; they could
  issue another for the next. Cleanest, because it uses the field that already
  carries attribution through their signup flow.
- **`utm_content`.** The standard UTM field for distinguishing links inside one
  campaign. Costs them nothing structurally, but only helps if their analytics
  reads it and their signup pipeline keeps it.

The same question applies one level down — which of the eight buttons was
pressed. `pos` answers it on our side already; carrying it to theirs has the
same two options and the same owner.

**Do not guess at either again.** The last attempt to enrich this field broke
the attribution it was trying to improve, silently, for weeks.

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
