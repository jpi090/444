"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ARTWORKS, roomById, subChannel } from "@/lib/catalog";

const SLOT_MS = 30 * 60 * 1000;
const ROWS = 6;

/** A TV-listings style schedule: one work per half hour, in the viewer's local time. */
export function Guide() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const base = now === null ? 0 : Math.floor(now / SLOT_MS);
  const fmt = (ms: number) => new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <ol className="guide">
      {Array.from({ length: ROWS }, (_, k) => {
        const slot = base + k;
        const art = ARTWORKS[slot % ARTWORKS.length];
        const room = roomById(art.room);
        const onNow = k === 0;
        return (
          <li key={k} className={`guide-row ${onNow ? "is-now" : ""}`}>
            <span className="guide-time">{now === null ? "--:--" : fmt(slot * SLOT_MS)}</span>
            <span className="guide-ch">{subChannel(art.slug)}</span>
            <span className="guide-what">
              <Link href={`/art/${art.slug}`}>{art.title}</Link>
              <span className="guide-sub">
                {art.artist} · {room?.name}
              </span>
            </span>
            {onNow ? <span className="guide-tag">On now</span> : <span className="guide-dur">30 min</span>}
          </li>
        );
      })}
    </ol>
  );
}
