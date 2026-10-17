import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtCanvas } from "@/components/ArtCanvas";
import { ArtTile } from "@/components/ArtTile";
import { Monitor } from "@/components/Monitor";
import { PrintPicker } from "@/components/PrintPicker";
import { ARTWORKS, artBySlug, roomById, subChannel } from "@/lib/catalog";
import { GENERATORS } from "@/lib/generators";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTWORKS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const art = artBySlug(slug);
  return art ? { title: art.title, description: `${art.title} by ${art.artist}, ${art.year}. ${art.medium}.` } : {};
}

export default async function ArtPage({ params }: Params) {
  const { slug } = await params;
  const art = artBySlug(slug);
  if (!art) notFound();

  const i = ARTWORKS.indexOf(art);
  const prev = ARTWORKS[(i - 1 + ARTWORKS.length) % ARTWORKS.length];
  const next = ARTWORKS[(i + 1) % ARTWORKS.length];
  const room = roomById(art.room)!;
  const siblings = ARTWORKS.filter((a) => a.room === art.room && a.slug !== art.slug);
  const live = GENERATORS[art.generator].animated;

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/gallery">Gallery</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/gallery?room=${room.id}`}>{room.name}</Link>
      </nav>

      <div className="exhibit">
        <div className="exhibit-screen">
          <Monitor osd={`CH ${subChannel(art.slug)}`} live={live} className="monitor-lg">
            <ArtCanvas generator={art.generator} seed={art.seed} live label={`${art.title} by ${art.artist}`} />
          </Monitor>
          <div className="zapper">
            <Link href={`/art/${prev.slug}`} className="zapper-btn">
              <span className="zapper-ch">◀ CH {subChannel(prev.slug)}</span>
              <span className="zapper-title">{prev.title}</span>
            </Link>
            <Link href={`/art/${next.slug}`} className="zapper-btn zapper-next">
              <span className="zapper-ch">CH {subChannel(next.slug)} ▶</span>
              <span className="zapper-title">{next.title}</span>
            </Link>
          </div>
        </div>

        <aside className="label" aria-label="Wall label">
          <p className="eyebrow">{room.name}</p>
          <h1 className="display label-title">{art.title}</h1>
          <p className="label-artist">
            {art.artist}{" "}
            <span>
              ({art.artist.startsWith("The ") ? "formed" : "b."} {art.born})
            </span>
          </p>
          <dl className="label-facts">
            <div>
              <dt>Date</dt>
              <dd>{art.year}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{art.medium}</dd>
            </div>
            <div>
              <dt>Accession no.</dt>
              <dd className="mono">{art.accession}</dd>
            </div>
          </dl>
          <p className="label-text">{art.text}</p>
          <PrintPicker art={art} />
        </aside>
      </div>

      <section className="section" aria-labelledby="also-h">
        <header className="section-head">
          <h2 id="also-h" className="display h2">
            Also in {room.name}
          </h2>
        </header>
        <ul className="wall wall-pair">
          {siblings.map((a) => (
            <li key={a.slug}>
              <ArtTile art={a} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
