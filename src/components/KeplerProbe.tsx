'use client';
import { useKeplerProbe } from '@/hooks/useKeplerProbe';
import { useSqueezeItalics } from '@/hooks/useSqueezeItalics';

/**
 * Two page-wide type behaviours, mounted once and rendering nothing:
 *   - the local-Kepler probe, which adds `.kepler` to <html>
 *   - the italic squeeze, which compensates every scaleX'd italic's line box
 */
export function KeplerProbe() {
  useKeplerProbe();
  useSqueezeItalics();
  return null;
}
