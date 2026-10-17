import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Cart" };

export default function Cart() {
  return (
    <div className="wrap page">
      <header className="page-head">
        <p className="eyebrow">CH 04 · Cart</p>
        <h1 className="display h1">Checkout</h1>
      </header>
      <CartView />
    </div>
  );
}
