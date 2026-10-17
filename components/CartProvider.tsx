"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ArtRef } from "@/lib/catalog";

export type CartItem = {
  /** product id + option, so the same print in two sizes is two lines */
  key: string;
  name: string;
  option: string;
  price: number;
  qty: number;
  art: ArtRef;
  href: string;
};

type CartContext = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  /** Last "added to cart" message, shown briefly on screen */
  toast: string | null;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);
const STORAGE_KEY = "444.cart.v1";
const MAX_QTY = 9;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Storage blocked or corrupt: start with an empty cart.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Not fatal; the cart just won't survive a reload.
    }
  }, [items, ready]);

  const flash = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback<CartContext["add"]>(
    (item, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.key === item.key);
        if (existing) {
          return prev.map((i) => (i.key === item.key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i));
        }
        return [...prev, { ...item, qty: Math.min(MAX_QTY, qty) }];
      });
      flash(`Added to cart: ${item.name}${item.option ? `, ${item.option}` : ""}`);
    },
    [flash]
  );

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    );
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContext>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items, count, subtotal, ready, toast, add, setQty, remove, clear };
  }, [items, ready, toast, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export const MAX_ITEM_QTY = MAX_QTY;
