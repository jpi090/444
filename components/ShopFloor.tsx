"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ARTWORKS, MERCH, PRINT_SIZES, usd, type Merch } from "@/lib/catalog";
import { useCart } from "./CartProvider";
import { Mockup } from "./Mockup";
import { Monitor } from "./Monitor";
import { Snow } from "./Snow";
import { Stepper } from "./Stepper";

type Filter = "all" | "merch" | "prints";
const FILTERS: { id: Filter; label: string; count: number }[] = [
  { id: "all", label: "Everything", count: MERCH.length + ARTWORKS.length },
  { id: "merch", label: "Merch", count: MERCH.length },
  { id: "prints", label: "Prints", count: ARTWORKS.length },
];
const FROM_PRICE = PRINT_SIZES[0].price;

export function ShopFloor() {
  const { add } = useCart();
  const [onAir, setOnAir] = useState(0);
  const [qty, setQty] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [zap, setZap] = useState(false);
  const stage = useRef<HTMLElement>(null);
  const item = MERCH[onAir];

  const addMerch = (m: Merch, n = 1) =>
    add({ key: `merch:${m.id}`, name: m.name, option: m.detail, price: m.price, art: m.art, href: "/shop" }, n);

  const show = (i: number, scroll = false) => {
    setZap(true);
    window.setTimeout(() => {
      setOnAir((i + MERCH.length) % MERCH.length);
      setQty(1);
    }, 120);
    window.setTimeout(() => setZap(false), 340);
    if (scroll) stage.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="onair-set" ref={stage} aria-labelledby="onair-name">
        <Monitor
          live
          osd="CH 03"
          className="monitor-lg"
          overlay={
            <div className="lower-third" aria-hidden="true">
              <span className="lt-item">Item {item.item}</span>
              <span className="lt-name">{item.name}</span>
              <span className="lt-price">{usd.format(item.price)}</span>
            </div>
          }
        >
          <span className="studio">
            <Mockup key={item.id} kind={item.mockup} art={item.art} label={item.name} />
          </span>
          {zap && <Snow className="screen-snow" />}
        </Monitor>

        <div className="onair-copy">
          <p className="eyebrow eyebrow-live">
            <i aria-hidden="true" /> On air now · Item {item.item}
          </p>
          <h2 id="onair-name" className="display h2">
            {item.name}
          </h2>
          <p className="onair-detail">{item.detail}</p>
          <p className="onair-desc">{item.description}</p>
          <div className="price-row">
            <span className="price-big">{usd.format(item.price)}</span>
            <span className="stock">{item.stock} in stock</span>
          </div>
          <div className="buy-row">
            <Stepper value={qty} onChange={setQty} label="Quantity" />
            <button type="button" className="btn btn-primary" onClick={() => addMerch(item, qty)}>
              Add to cart · {usd.format(item.price * qty)}
            </button>
          </div>
          <div className="onair-nav">
            <button type="button" className="btn btn-ghost" onClick={() => show(onAir - 1)}>
              ◀ Previous item
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => show(onAir + 1)}>
              Next item ▶
            </button>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="lineup-h">
        <header className="section-head section-head-row">
          <div>
            <h2 id="lineup-h" className="display h2">
              The lineup
            </h2>
            <p>Every item on tonight&rsquo;s show. Prints are made to order in three sizes.</p>
          </div>
          <div className="tabs" role="group" aria-label="Filter the lineup">
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f.id}
                className={`tab ${filter === f.id ? "is-on" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label} <span>{f.count}</span>
              </button>
            ))}
          </div>
        </header>

        <ul className="lineup">
          {filter !== "prints" &&
            MERCH.map((m, i) => (
              <li key={m.id} className="product">
                <button
                  type="button"
                  className="product-visual"
                  onClick={() => show(i, true)}
                  aria-label={`Put ${m.name} on air`}
                >
                  <Mockup kind={m.mockup} art={m.art} label={m.name} />
                  {onAir === i && <span className="product-flag">On air</span>}
                </button>
                <div className="product-body">
                  <span className="product-item">Item {m.item}</span>
                  <h3 className="product-name">{m.name}</h3>
                  <span className="product-detail">{m.detail}</span>
                  <div className="product-foot">
                    <span className="price">{usd.format(m.price)}</span>
                    <button type="button" className="btn btn-small" onClick={() => addMerch(m)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </li>
            ))}
          {filter !== "merch" &&
            ARTWORKS.map((a) => (
              <li key={a.slug} className="product">
                <Link href={`/art/${a.slug}`} className="product-visual" aria-label={`See ${a.title} in the gallery`}>
                  <Mockup kind="print" art={a} label={a.title} />
                </Link>
                <div className="product-body">
                  <span className="product-item">Print · edition of {a.edition}</span>
                  <h3 className="product-name">{a.title}</h3>
                  <span className="product-detail">
                    {a.artist}, {a.year}
                  </span>
                  <div className="product-foot">
                    <span className="price">From {usd.format(FROM_PRICE)}</span>
                    <Link className="btn btn-small" href={`/art/${a.slug}`}>
                      Choose a size
                    </Link>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
