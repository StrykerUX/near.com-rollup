/**
 * A SCRIPT THAT RUNS WHILE THE HTML IS STILL BEING PARSED.
 *
 * Copied from Next's own guide — `next/dist/docs/01-app/02-guides/
 * preventing-flash-before-hydration.md:124` — because the problem it solves is
 * exactly the curtain's: anything that has to be true BEFORE the first paint
 * cannot be decided by React. An effect runs after paint (the reader sees the
 * curtain, then it vanishes), and `useLayoutEffect` runs before paint but
 * after hydration, which on a slow connection is long after the HTML painted.
 * A script in `<head>` runs during parsing, before React exists.
 *
 * THE `type` SWITCH is the guide's, and it is there for a warning rather than
 * a behaviour: React complains in development when a render produces a
 * `<script>` tag, so on the client the same node is emitted as inert
 * `text/plain`. `suppressHydrationWarning` covers the resulting mismatch —
 * the DOM wins, which is what we want, since the DOM is where the script
 * already did its work.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
