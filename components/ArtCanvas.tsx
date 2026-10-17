"use client";

import { useEffect, useRef } from "react";
import { GENERATORS, mulberry32, type GeneratorId } from "@/lib/generators";

type Props = {
  generator: GeneratorId;
  seed: number;
  /** Animate the work if its generator supports it. */
  live?: boolean;
  label: string;
  className?: string;
};

export function ArtCanvas({ generator, seed, live = false, label, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const gen = GENERATORS[generator];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = live && gen.animated && !reduce;
    let w = 0;
    let h = 0;
    let raf = 0;
    let lastT = 0;

    const size = () => {
      // Layout size, not getBoundingClientRect: the power-on animation scales the page while it mounts.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        return true;
      }
      return false;
    };
    const draw = (t: number) => {
      ctx.save();
      gen.draw(ctx, w, h, mulberry32(seed), t);
      ctx.restore();
    };

    size();
    draw(0);

    const ro = new ResizeObserver(() => {
      if (size() && !animate) draw(lastT);
    });
    ro.observe(canvas);

    if (animate) {
      const start = performance.now();
      let last = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (now - last < 33) return; // ~30 fps, like interlaced video
        last = now;
        lastT = (now - start) / 1000;
        draw(lastT);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [generator, seed, live]);

  return <canvas ref={ref} className={className} role="img" aria-label={label} />;
}
