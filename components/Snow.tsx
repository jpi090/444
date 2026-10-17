"use client";

import { useEffect, useRef } from "react";

/** Animated television snow, drawn small and scaled up with crisp pixels. */
export function Snow({ className }: { className: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = 160;
    canvas.height = 120;
    const img = ctx.createImageData(160, 120);
    const d = img.data;
    let raf = 0;
    const frame = () => {
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
