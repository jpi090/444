"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { FREE_SHIPPING_FROM, SHIPPING, usd, type ShippingId } from "@/lib/catalog";
import { ArtCanvas } from "./ArtCanvas";
import { useCart, type CartItem } from "./CartProvider";
import { Stepper } from "./Stepper";

type Order = {
  number: string;
  name: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  method: string;
};

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Nigeria", "Germany", "Japan", "Australia", "Other"];
const FIELDS = ["name", "email", "address", "city", "postcode"] as const;
type Field = (typeof FIELDS)[number];

function validate(data: FormData) {
  const errors: Partial<Record<Field, string>> = {};
  const get = (k: Field) => String(data.get(k) ?? "").trim();
  if (!get("name")) errors.name = "Enter the name to put on the parcel.";
  const email = get("email");
  if (!email) errors.email = "Enter an email address for the order receipt.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Check the email address. It should look like name@example.com.";
  if (!get("address")) errors.address = "Enter a street address.";
  if (!get("city")) errors.city = "Enter a town or city.";
  if (!get("postcode")) errors.postcode = "Enter a postcode or ZIP code.";
  return errors;
}

export function CartView() {
  const { items, count, subtotal, ready, setQty, remove, clear } = useCart();
  const [ship, setShip] = useState<ShippingId>("standard");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [order, setOrder] = useState<Order | null>(null);

  const method = SHIPPING.find((s) => s.id === ship) ?? SHIPPING[0];
  const freeStandard = subtotal >= FREE_SHIPPING_FROM;
  const shipping = ship === "standard" && freeStandard ? 0 : method.price;
  const total = subtotal + shipping;

  if (order) return <Confirmation order={order} />;

  if (!ready) {
    return (
      <div className="panel panel-tuning" aria-live="polite">
        Tuning in to your cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="nosignal">
        <div className="nosignal-bars" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i />
        </div>
        <div className="nosignal-box">
          <p className="nosignal-head">No signal</p>
          <p>Your cart is empty. Prints start at $45 and every work in the gallery is available.</p>
          <div className="hero-actions">
            <Link href="/shop" className="btn btn-primary">
              <span className="btn-ch">03</span>Go to the shop
            </Link>
            <Link href="/gallery" className="btn">
              <span className="btn-ch">02</span>Browse the gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);
    const firstBad = FIELDS.find((f) => found[f]);
    if (firstBad) {
      form.querySelector<HTMLInputElement>(`#co-${firstBad}`)?.focus();
      return;
    }
    setOrder({
      number: `444-${String(Math.floor(100000 + Math.random() * 900000))}`,
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      items,
      subtotal,
      shipping,
      total,
      method: method.label,
    });
    clear();
    document.getElementById("programme")?.closest(".screen-scroll")?.scrollTo({ top: 0 });
  };

  const field = (id: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={`field ${errors[id] ? "has-error" : ""}`}>
      <label htmlFor={`co-${id}`}>{label}</label>
      <input
        id={`co-${id}`}
        name={id}
        aria-invalid={errors[id] ? true : undefined}
        aria-describedby={errors[id] ? `co-${id}-err` : undefined}
        {...props}
      />
      {errors[id] && (
        <span className="field-error" id={`co-${id}-err`}>
          {errors[id]}
        </span>
      )}
    </div>
  );

  return (
    <div className="checkout">
      <section className="bag" aria-labelledby="bag-h">
        <h2 id="bag-h" className="h3">
          In your cart <span className="h3-count">{count} {count === 1 ? "item" : "items"}</span>
        </h2>
        <ul className="lines">
          {items.map((i) => (
            <li key={i.key} className="line">
              <Link href={i.href} className="line-thumb" tabIndex={-1} aria-hidden="true">
                <ArtCanvas generator={i.art.generator} seed={i.art.seed} label="" />
              </Link>
              <div className="line-body">
                <Link href={i.href} className="line-name">
                  {i.name}
                </Link>
                <span className="line-opt">{i.option}</span>
                <span className="line-unit">{usd.format(i.price)} each</span>
              </div>
              <div className="line-controls">
                <Stepper value={i.qty} onChange={(q) => setQty(i.key, q)} label={`Quantity of ${i.name}`} />
                <button type="button" className="link-btn" onClick={() => remove(i.key)}>
                  Remove
                </button>
              </div>
              <span className="line-total">{usd.format(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{usd.format(subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping, {method.label.toLowerCase()}</dt>
            <dd>{shipping === 0 ? "Free" : usd.format(shipping)}</dd>
          </div>
          <div className="totals-grand">
            <dt>Total</dt>
            <dd>{usd.format(total)}</dd>
          </div>
        </dl>
        {!freeStandard && (
          <p className="hint">Add {usd.format(FREE_SHIPPING_FROM - subtotal)} more for free standard shipping.</p>
        )}
      </section>

      <form className="details" onSubmit={onSubmit} noValidate aria-labelledby="details-h">
        <h2 id="details-h" className="h3">
          Delivery
        </h2>
        {field("name", "Full name", { autoComplete: "name", placeholder: "Ada Okafor" })}
        {field("email", "Email", { type: "email", autoComplete: "email", placeholder: "ada@example.com" })}
        {field("address", "Street address", { autoComplete: "street-address" })}
        <div className="field-row">
          {field("city", "Town or city", { autoComplete: "address-level2" })}
          {field("postcode", "Postcode or ZIP", { autoComplete: "postal-code" })}
        </div>
        <div className="field">
          <label htmlFor="co-country">Country</label>
          <select id="co-country" name="country" defaultValue="United States" autoComplete="country-name">
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <fieldset className="ship">
          <legend>Shipping</legend>
          {SHIPPING.map((s) => {
            const price = s.id === "standard" && freeStandard ? 0 : s.price;
            return (
              <label key={s.id} htmlFor={`ship-${s.id}`} className={`ship-opt ${ship === s.id ? "is-on" : ""}`}>
                <input
                  type="radio"
                  id={`ship-${s.id}`}
                  name="shipping"
                  value={s.id}
                  checked={ship === s.id}
                  onChange={() => setShip(s.id)}
                />
                <span className="ship-name">{s.label}</span>
                <span className="ship-note">{s.note}</span>
                <span className="ship-price">{price === 0 ? "Free" : usd.format(price)}</span>
              </label>
            );
          })}
        </fieldset>

        <p className="demo-note">
          This is a demo store. Placing an order takes no payment and nothing will ship.
        </p>
        <button type="submit" className="btn btn-primary btn-wide">
          Place order · {usd.format(total)}
        </button>
      </form>
    </div>
  );
}

function Confirmation({ order }: { order: Order }) {
  const first = order.name.split(/\s+/)[0];
  return (
    <section className="vcr" aria-labelledby="vcr-h">
      <p className="vcr-corner">▶ PLAY</p>
      <h2 id="vcr-h" className="vcr-head">
        Order received
      </h2>
      <p className="vcr-number">No. {order.number}</p>
      <p>
        Thanks, {first}. In a real store a receipt would go to {order.email}. This was a demo, so no payment was taken.
      </p>
      <ul className="vcr-lines">
        {order.items.map((i) => (
          <li key={i.key}>
            <span>
              {i.qty} × {i.name}
              <small>{i.option}</small>
            </span>
            <span>{usd.format(i.qty * i.price)}</span>
          </li>
        ))}
        <li>
          <span>Shipping, {order.method.toLowerCase()}</span>
          <span>{order.shipping === 0 ? "Free" : usd.format(order.shipping)}</span>
        </li>
        <li className="vcr-total">
          <span>Total</span>
          <span>{usd.format(order.total)}</span>
        </li>
      </ul>
      <div className="hero-actions">
        <Link href="/" className="btn btn-osd">
          <span className="btn-ch">01</span>Back to the lobby
        </Link>
        <Link href="/gallery" className="btn btn-osd">
          <span className="btn-ch">02</span>Keep browsing
        </Link>
      </div>
    </section>
  );
}
