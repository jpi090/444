import type { ArtRef, Merch } from "@/lib/catalog";
import { ArtCanvas } from "./ArtCanvas";

export type MockupKind = Merch["mockup"] | "print";

/** A product drawn in CSS with the artwork printed on it. */
export function Mockup({ kind, art, label }: { kind: MockupKind; art: ArtRef; label: string }) {
  return (
    <span className={`mock mock-${kind}`}>
      {kind === "tote" && <span className="mock-strap" aria-hidden="true" />}
      <span className="mock-face">
        <ArtCanvas generator={art.generator} seed={art.seed} label={label} />
        {kind === "book" && <span className="mock-book-title">444</span>}
      </span>
      {kind === "mug" && <span className="mock-mug-handle" aria-hidden="true" />}
      {kind === "vhs" && (
        <span className="mock-vhs-window" aria-hidden="true">
          <i />
          <i />
        </span>
      )}
    </span>
  );
}
