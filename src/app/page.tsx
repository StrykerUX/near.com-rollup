import { Site } from '@/components/Site';

/**
 * THE PRODUCT TOUR. It plays itself, slowly, and takes no pointer.
 *
 * It opens on the app's own perps screen. There used to be a prop here
 * choosing between three modes and a second one choosing between two drawings
 * of that screen; the routes behind both are gone and so are the props.
 */
export default function Home() {
  return <Site />;
}
