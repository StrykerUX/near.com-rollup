'use client';
import { useReveal } from '@/hooks/useReveal';
import { Faq } from './Faq';
import { FinalCta } from './FinalCta';
import { Footer } from './Footer';
import { Marquee } from './Marquee';
import { MobileCta } from './MobileCta';
import { Security } from './Security';

/**
 * Everything below the stage. It sits on cream paper with its own rounded
 * bottom, and the closing plate above it is sized to match that radius exactly.
 */
export function LightZone() {
  useReveal();

  return (
    <div className="light">
      <div className="lightbody">
        <section className="band">
          <div className="shell rv">
            <h2 className="h1" style={{ maxWidth: '16ch' }}>
              The DeFi app power users love
            </h2>
          </div>
          <Marquee />
        </section>

        <Security />
        <Faq />
        <FinalCta />
      </div>

      <MobileCta />
      <Footer />
    </div>
  );
}
