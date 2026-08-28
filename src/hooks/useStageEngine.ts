'use client';
import { useEffect } from 'react';
import { startStageEngine } from '@/stage/engine';

/** Mounts the scroll-scrub engine once the whole stage markup is in the DOM. */
export function useStageEngine() {
  useEffect(() => startStageEngine(), []);
}
