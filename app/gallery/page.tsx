import type { Metadata } from "next";
import Link from "next/link";
import { ArtTile } from "@/components/ArtTile";
import { ARTWORKS, ROOMS, roomById } from "@/lib/catalog";

export const metadata: Metadata = { title: "Gallery" };

export default async function Gallery({ searchParams }: { searchParams: Promise<{ room?: string }> }) {
  const { room } = await searchParams;
  const active = room ? roomById(room) : undefined;
  const works = active ? ARTWORKS.filter((a) => a.room === active.id) : ARTWORKS;

  return (
    <div className="wrap page">
      <header className="page-head">
        <p className="eyebrow">CH 02 · Gallery{active ? ` · ${active.name}` : ""}</p>
        <h1 className="display h1">{active ? active.name : "The monitor wall"}</h1>
        <p className="lede">
          {active
            ? active.blurb
            : "All twelve works, one per screen. Choose a monitor to watch the piece live, read its wall label and order a print."}
        </p>
      </header>

      <nav className="tabs" aria-label="Rooms">
        <Link href="/gallery" className={`tab ${!active ? "is-on" : ""}`} aria-current={!active ? "page" : undefined}>
          All rooms <span>{ARTWORKS.length}</span>
        </Link>
        {ROOMS.map((r) => (
          <Link
            key={r.id}
            href={`/gallery?room=${r.id}`}
            className={`tab ${active?.id === r.id ? "is-on" : ""}`}
            aria-current={active?.id === r.id ? "page" : undefined}
          >
            {r.name} <span>{ARTWORKS.filter((a) => a.room === r.id).length}</span>
          </Link>
        ))}
      </nav>

      <ul className="wall">
        {works.map((a) => (
          <li key={a.slug}>
            <ArtTile art={a} />
          </li>
        ))}
      </ul>
    </div>
  );
}
