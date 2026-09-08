import type { Metadata } from 'next';
import { Site } from '@/components/Site';

/**
 * NOT INDEXED, and that is the point of the holding page rather than an extra.
 * `/` says the product is not being shown yet; a crawler that files the whole
 * tour under `/preview` and serves it in a result defeats the thing `/` was put
 * up to do. It comes off with the route, in the same commit that gives `<Site />`
 * the homepage back.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * THE PRODUCT TOUR, which used to be `/`.
 *
 * It plays itself, slowly, and takes no pointer. It opens on the app's own
 * perps screen. There used to be a prop here choosing between three modes and a
 * second one choosing between two drawings of that screen; the routes behind
 * both are gone and so are the props.
 *
 * IT IS HERE BECAUSE THE HOLDING PAGE HAS `/` FOR NOW, and that is the only
 * reason. Nothing in `<Site />` knows which route it is mounted on — the stage
 * engine measures the scroll it is given — so moving it back is renaming this
 * file and pointing `app/page.tsx` at `<Site />` again.
 */
export default function Preview() {
  return <Site />;
}
