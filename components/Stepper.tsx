"use client";

import { MAX_ITEM_QTY } from "./CartProvider";

export function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="One fewer">
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_ITEM_QTY, value + 1))}
        disabled={value >= MAX_ITEM_QTY}
        aria-label="One more"
      >
        +
      </button>
    </div>
  );
}
