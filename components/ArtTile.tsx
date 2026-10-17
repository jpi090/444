import Link from "next/link";
import { subChannel, type Artwork } from "@/lib/catalog";
import { ArtCanvas } from "./ArtCanvas";
import { Monitor } from "./Monitor";

export function ArtTile({ art }: { art: Artwork }) {
  return (
    <Link href={`/art/${art.slug}`} className="tile">
      <Monitor osd={subChannel(art.slug)}>
        <ArtCanvas generator={art.generator} seed={art.seed} label={`${art.title} by ${art.artist}`} />
      </Monitor>
      <span className="tile-label">
        <span className="tile-title">{art.title}</span>
        <span className="tile-meta">
          {art.artist}, {art.year}
        </span>
      </span>
    </Link>
  );
}
