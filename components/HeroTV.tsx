"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ARTWORKS, subChannel } from "@/lib/catalog";
import { ArtCanvas } from "./ArtCanvas";
import { Snow } from "./Snow";

const START = ARTWORKS.findIndex((a) => a.slug === "transmitter-at-dusk");
const DWELL_MS = 9000;

/** The lobby set: a wood-cabinet television that cycles through the collection. */
export function HeroTV() {
  const [index, setIndex] = useState(START);
  const [turns, setTurns] = useState(0);
  const [zap, setZap] = useState(false);
  const timers = useRef<number[]>([]);
  const art = ARTWORKS[index];

  const change = (dir: 1 | -1) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setZap(true);
    setTurns((n) => n + dir);
    timers.current = [
      window.setTimeout(() => setIndex((i) => (i + dir + ARTWORKS.length) % ARTWORKS.length), 140),
      window.setTimeout(() => setZap(false), 360),
    ];
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => change(1), DWELL_MS);
    return () => window.clearTimeout(id);
  }, [index]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  return (
    <figure className="tvset">
      <div className="tvset-antenna" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="tvset-cabinet">
        <div className="tvset-bezel">
          <div className="screen screen-hero">
            <ArtCanvas key={art.slug} generator={art.generator} seed={art.seed} live label={`${art.title} by ${art.artist}`} />
            {zap && <Snow className="screen-snow" />}
            <span className="screen-osd">CH {subChannel(art.slug)}</span>
          </div>
        </div>
        <div className="tvset-panel">
          <button
            type="button"
            className="knob"
            style={{ ["--turn" as string]: `${turns * 30}deg` }}
            onClick={() => change(1)}
            aria-label="Turn the channel dial to the next work"
          />
          <span className="knob-label">Channel</span>
          <span className="knob knob-small" aria-hidden="true" />
          <span className="knob-label">Volume</span>
          <span className="tvset-grille" aria-hidden="true" />
        </div>
      </div>
      <div className="tvset-feet" aria-hidden="true">
        <i />
        <i />
      </div>
      <figcaption className="nowshowing">
        <span className="eyebrow">Now showing on this set</span>
        <Link href={`/art/${art.slug}`} className="nowshowing-title">
          {art.title}
        </Link>
        <span className="nowshowing-meta">
          {art.artist}, {art.year}
        </span>
        <span className="nowshowing-nav">
          <button type="button" className="link-btn" onClick={() => change(-1)}>
            ◀ Previous
          </button>
          <button type="button" className="link-btn" onClick={() => change(1)}>
            Next ▶
          </button>
        </span>
      </figcaption>
    </figure>
  );
}
