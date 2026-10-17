import type { Metadata } from "next";
import { Crawl } from "@/components/Crawl";
import { ShopFloor } from "@/components/ShopFloor";

export const metadata: Metadata = { title: "Shop" };

export default function Shop() {
  return (
    <>
      <div className="wrap page">
        <header className="page-head">
          <p className="eyebrow">CH 03 · 444 Shopping Network</p>
          <h1 className="display h1">Live from the gift shop</h1>
          <p className="lede">
            Prints of every work in the collection, plus a few things to carry them home in. Change the item on air or
            browse the full lineup below.
          </p>
        </header>
      </div>
      <Crawl
        label="Order now"
        items={[
          "Free standard shipping on orders over $75",
          "Prints made to order in 12 × 9, 24 × 18 and 40 × 30 in",
          "Item 444-3313: only 14 VHS tapes left",
          "Every print ships with a signed certificate",
        ]}
      />
      <div className="wrap page page-tight">
        <ShopFloor />
      </div>
    </>
  );
}
