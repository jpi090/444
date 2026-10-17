"use client";

import { useState } from "react";
import { PRINT_SIZES, usd, type Artwork, type PrintSizeId } from "@/lib/catalog";
import { useCart } from "./CartProvider";

export function PrintPicker({ art }: { art: Artwork }) {
  const [size, setSize] = useState<PrintSizeId>("m");
  const { add } = useCart();
  const chosen = PRINT_SIZES.find((s) => s.id === size) ?? PRINT_SIZES[1];

  return (
    <form
      className="buy"
      onSubmit={(e) => {
        e.preventDefault();
        add({
          key: `print:${art.slug}:${chosen.id}`,
          name: `${art.title}, print`,
          option: chosen.label,
          price: chosen.price,
          art: { generator: art.generator, seed: art.seed },
          href: `/art/${art.slug}`,
        });
      }}
    >
      <fieldset className="sizes">
        <legend className="buy-legend">Take it home</legend>
        {PRINT_SIZES.map((s) => (
          <label key={s.id} className={`size ${size === s.id ? "is-on" : ""}`} htmlFor={`size-${s.id}`}>
            <input
              type="radio"
              id={`size-${s.id}`}
              name="size"
              value={s.id}
              checked={size === s.id}
              onChange={() => setSize(s.id)}
            />
            <span className="size-dim">{s.label}</span>
            <span className="size-price">{usd.format(s.price)}</span>
          </label>
        ))}
      </fieldset>
      <p className="buy-note">
        Archival pigment print on cotton rag, in an edition of {art.edition}. Each comes with a certificate stamped with
        accession number {art.accession}.
      </p>
      <button type="submit" className="btn btn-primary btn-wide">
        Add print to cart · {usd.format(chosen.price)}
      </button>
    </form>
  );
}
