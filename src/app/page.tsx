import { Site } from '@/components/Site';

/**
 * THE TOUR HAS THE HOMEPAGE BACK.
 *
 * It sat at `/preview` while `<ComingSoon />` held this route, and nothing
 * about it was gated, unpicked or conditioned to make room — the stage engine
 * measures the scroll it is given and never knew which route it was on. So
 * this is the whole of putting it back.
 *
 * `<ComingSoon />` AND `34-coming-soon.css` STAY IN THE TREE, unrouted. The
 * holding page is the kind of thing that gets asked for again, it shares the
 * field through tokens rather than holding a copy of it, and nothing it leaves
 * behind runs: the one rule that reached out of it — the selector hiding the
 * curtain in front of it — is scoped to `body:has(.soon)`, and no page has a
 * `.soon` on it now. Delete them when it is clear nobody wants it back.
 */
export default function Home() {
  return <Site />;
}
