import { Nav } from '@/components/Nav';
import { Stage } from '@/components/stage/Stage';
import { QuoteBand } from '@/components/stage/QuoteBand';
import { LightZone } from '@/components/light/LightZone';

export default function Home() {
  return (
    <>
      <Nav />
      <Stage />
      <QuoteBand />
      <LightZone />
    </>
  );
}
