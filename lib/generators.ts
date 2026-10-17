/**
 * Every artwork in the collection is drawn live on a <canvas> from a seed.
 * A generator gets the canvas size in device pixels, a seeded random source
 * and the time in seconds (0 for a still frame).
 */

export type Rand = () => number;
type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, rand: Rand, t: number) => void;

export type GeneratorId =
  | "bars"
  | "scope"
  | "horizon"
  | "snow"
  | "testcard"
  | "ridges"
  | "halftone"
  | "subpixel"
  | "glow"
  | "pixelscape";

export function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;
const pick = <T,>(rand: Rand, list: readonly T[]) => list[Math.floor(rand() * list.length)];

// 75% SMPTE colour bars, in transmission order.
const SMPTE = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
const CASTELLATION = ["#0000c0", "#131313", "#c000c0", "#131313", "#00c0c0", "#131313", "#c0c0c0"];
const LOWER: [string, number][] = [
  ["#00214c", 1.25],
  ["#ffffff", 1.25],
  ["#32006a", 1.25],
  ["#131313", 1.25],
  ["#090909", 1 / 3],
  ["#131313", 1 / 3],
  ["#1d1d1d", 1 / 3],
  ["#131313", 1],
];

/** Draws one horizontal band of segments, shifted by `off` and wrapped around the frame. */
function band(ctx: CanvasRenderingContext2D, segs: [string, number][], y: number, hgt: number, w: number, off: number) {
  const total = segs.reduce((s, [, f]) => s + f, 0);
  const o = ((off % w) + w) % w;
  let x = 0;
  for (const [color, f] of segs) {
    const sw = (f / total) * w;
    ctx.fillStyle = color;
    ctx.fillRect(x + o, y, sw + 0.75, hgt + 0.75);
    ctx.fillRect(x + o - w, y, sw + 0.75, hgt + 0.75);
    x += sw;
  }
}

let lowresBuffer: HTMLCanvasElement | null = null;
function lowres(w: number, h: number) {
  if (!lowresBuffer) lowresBuffer = document.createElement("canvas");
  if (lowresBuffer.width !== w || lowresBuffer.height !== h) {
    lowresBuffer.width = w;
    lowresBuffer.height = h;
  }
  return lowresBuffer;
}

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};

const bars: Draw = (ctx, w, h, rand, t) => {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  const amp = w * (0.03 + rand() * 0.07);
  const waves = 2 + rand() * 5;
  const phase = rand() * TAU;
  const drip = 1.2 + rand() * 1.6;
  const glitches = Array.from({ length: 2 + Math.floor(rand() * 3) }, () => ({
    y: rand(),
    size: 0.01 + rand() * 0.035,
    shift: (rand() - 0.5) * w * 0.6,
  }));
  const lines = 240; // a nod to the visible lines of one NTSC field
  const step = h / lines;
  const main = SMPTE.map((c) => [c, 1] as [string, number]);
  const castle = CASTELLATION.map((c) => [c, 1] as [string, number]);
  for (let i = 0; i < lines; i++) {
    const v = i / lines;
    const y = i * step;
    let off =
      Math.sin(v * waves * TAU + phase + t * 1.1) * amp * Math.pow(v, drip) +
      Math.sin(v * 41 + phase * 3 + t * 2.7) * amp * 0.12 * v;
    let glitch = false;
    for (const g of glitches) {
      const gy = (g.y + t * 0.04) % 1;
      if (v >= gy && v < gy + g.size) {
        off += g.shift;
        glitch = true;
      }
    }
    band(ctx, v < 0.67 ? main : v < 0.75 ? castle : LOWER, y, step, w, off);
    if (glitch) {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(0, y, w, step + 0.75);
    }
  }
};

const scope: Draw = (ctx, w, h, rand, t) => {
  const [ink, bg] = pick(rand, [
    ["#9dffb8", "#020d07"],
    ["#ffc46b", "#100902"],
    ["#a4e9ff", "#020a10"],
  ] as const);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 10 × 8 division graticule with minor ticks on the centre axes.
  const lw = Math.max(1, w / 900);
  ctx.strokeStyle = ink;
  ctx.lineWidth = lw;
  ctx.globalAlpha = 0.16;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    ctx.moveTo((w * i) / 10, 0);
    ctx.lineTo((w * i) / 10, h);
  }
  for (let j = 0; j <= 8; j++) {
    ctx.moveTo(0, (h * j) / 8);
    ctx.lineTo(w, (h * j) / 8);
  }
  for (let k = 0; k <= 50; k++) {
    const x = (w * k) / 50;
    ctx.moveTo(x, h / 2 - h / 80);
    ctx.lineTo(x, h / 2 + h / 80);
  }
  for (let k = 0; k <= 40; k++) {
    const y = (h * k) / 40;
    ctx.moveTo(w / 2 - w / 100, y);
    ctx.lineTo(w / 2 + w / 100, y);
  }
  ctx.stroke();

  const a = 1 + Math.floor(rand() * 4);
  const b = a + 1 + Math.floor(rand() * 3);
  const d0 = rand() * TAU;
  const rx = w * 0.38;
  const ry = h * 0.38;
  ctx.lineWidth = Math.max(1.5, w / 380);
  ctx.shadowColor = ink;
  ctx.shadowBlur = w / 70;
  for (let k = 6; k >= 0; k--) {
    const d = d0 + t * 0.45 - k * 0.035;
    ctx.globalAlpha = k === 0 ? 1 : 0.1 * (7 - k) / 7;
    ctx.beginPath();
    for (let s = 0; s <= 1400; s++) {
      const u = (s / 1400) * TAU;
      const x = w / 2 + Math.sin(a * u + d) * rx;
      const y = h / 2 + Math.sin(b * u) * ry;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = ink;
  ctx.font = `${Math.round(h / 26)}px ui-monospace, monospace`;
  ctx.fillText(`CH1 500mV  CH2 500mV  X:Y ${a}:${b}`, w * 0.03, h * 0.95);
  ctx.globalAlpha = 1;
};

const horizon: Draw = (ctx, w, h, rand, t) => {
  const hz = h * (0.58 + rand() * 0.06);
  const sky = pick(rand, [
    ["#0b0630", "#4a0f5c", "#e0457b", "#ffb56b"],
    ["#04122e", "#173d73", "#3fa6b8", "#f6d58e"],
    ["#14040a", "#5b0b1e", "#d2481f", "#ffd36b"],
  ] as const);
  const g = ctx.createLinearGradient(0, 0, 0, hz);
  sky.forEach((c, i) => g.addColorStop(i / (sky.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, hz);

  for (let i = 0; i < 140; i++) {
    const x = rand() * w;
    const y = rand() * hz * 0.55;
    const twinkle = 0.5 + 0.5 * Math.sin(t * (1 + rand() * 3) + i);
    ctx.globalAlpha = (0.2 + rand() * 0.6) * (t ? twinkle : 1);
    ctx.fillStyle = "#fff";
    const s = Math.max(1, w / 700) * (rand() < 0.1 ? 2 : 1);
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  // Sun with the slits that get wider toward the horizon.
  const sr = Math.min(w, h) * (0.2 + rand() * 0.06);
  const sx = w * (0.4 + rand() * 0.2);
  const sy = hz - sr * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, TAU);
  ctx.clip();
  const sg = ctx.createLinearGradient(0, sy - sr, 0, sy + sr);
  sg.addColorStop(0, "#fff4b8");
  sg.addColorStop(1, sky[2]);
  ctx.fillStyle = sg;
  ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  ctx.fillStyle = g;
  for (let i = 0; i < 7; i++) {
    const y = sy + sr * (-0.05 + i * 0.15) + ((t * sr * 0.05) % (sr * 0.15));
    ctx.fillRect(sx - sr, y, sr * 2, sr * 0.012 * (i + 1.5));
  }
  ctx.restore();

  // Floor and receding grid.
  ctx.fillStyle = "#08030f";
  ctx.fillRect(0, hz, w, h - hz);
  ctx.strokeStyle = sky[2];
  ctx.lineWidth = Math.max(1, w / 600);
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  for (let i = -16; i <= 16; i++) {
    ctx.moveTo(w / 2 + i * w * 0.012, hz);
    ctx.lineTo(w / 2 + i * w * 0.13, h);
  }
  const rows = 12;
  const drift = (t * 0.35) % 1;
  for (let k = 0; k < rows; k++) {
    const f = (k + drift) / rows;
    const y = hz + (h - hz) * Math.pow(f, 2.2);
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = sky[3];
  ctx.fillRect(0, hz - 1, w, Math.max(1.5, h / 300));

  // Transmitter mast with its aircraft warning lamp.
  const left = rand() < 0.5;
  const tx = left ? w * (0.12 + rand() * 0.1) : w * (0.78 + rand() * 0.1);
  const th = h * (0.36 + rand() * 0.12);
  const tb = w * 0.03;
  ctx.strokeStyle = "#07030c";
  ctx.lineWidth = Math.max(1.5, w / 360);
  ctx.beginPath();
  ctx.moveTo(tx - tb, hz);
  ctx.lineTo(tx, hz - th);
  ctx.lineTo(tx + tb, hz);
  const braces = 9;
  for (let i = 0; i < braces; i++) {
    const f0 = i / braces;
    const f1 = (i + 1) / braces;
    ctx.moveTo(tx - tb * (1 - f0), hz - th * f0);
    ctx.lineTo(tx + tb * (1 - f1), hz - th * f1);
  }
  ctx.stroke();
  const lampOn = t === 0 || Math.floor(t * 1.1) % 2 === 0;
  if (lampOn) {
    ctx.fillStyle = "#ff3b2f";
    ctx.shadowColor = "#ff3b2f";
    ctx.shadowBlur = w / 60;
    ctx.beginPath();
    ctx.arc(tx, hz - th, Math.max(2, w / 260), 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};

const snow: Draw = (ctx, w, h, rand, t) => {
  const lw = Math.max(96, Math.round(w / 3));
  const lh = Math.max(72, Math.round((lw * h) / w));
  const buf = lowres(lw, lh);
  const bctx = buf.getContext("2d")!;
  const img = bctx.createImageData(lw, lh);
  const d = img.data;
  const ring = 0.3 + rand() * 0.06;
  const gx = 0.5 + (rand() - 0.5) * 0.12;
  const gy = 0.5 + (rand() - 0.5) * 0.12;
  const tint = rand() < 0.5 ? [1, 1, 1] : [0.88, 0.96, 1.08];
  const noise = t === 0 ? rand : Math.random;
  const aspect = lw / lh;
  for (let y = 0; y < lh; y++) {
    const v = y / lh;
    const hum = 0.72 + 0.28 * Math.sin((v + t * 0.12) * TAU);
    const tear = Math.sin(v * 30 + t * 2) * 0.006;
    for (let x = 0; x < lw; x++) {
      const u = x / lw + tear;
      const dx = (u - gx) * aspect;
      const dy = v - gy;
      const r = Math.hypot(dx, dy);
      let ghost = Math.abs(r - ring) < 0.014 ? 1 : 0;
      if (r < ring && (Math.abs(dx) < 0.005 || Math.abs(dy) < 0.008)) ghost = 0.9;
      if (r < ring * 0.35) ghost = Math.max(ghost, 0.35);
      const val = (noise() * 0.78 + ghost * 0.32) * hum * 255;
      const i = (y * lw + x) * 4;
      d[i] = val * tint[0];
      d[i + 1] = val * tint[1];
      d[i + 2] = Math.min(255, val * tint[2]);
      d[i + 3] = 255;
    }
  }
  bctx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buf, 0, 0, w, h);
};

const testcard: Draw = (ctx, w, h, rand) => {
  const ground = pick(rand, ["#5c5f63", "#4f5866", "#5d5a55"]);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, w, h);
  const cell = h / 9;
  const lw = Math.max(1, h / 320);
  ctx.strokeStyle = "#e9e9e9";
  ctx.lineWidth = lw;
  ctx.beginPath();
  const x0 = (w % cell) / 2;
  for (let x = x0; x <= w; x += cell) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += cell) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Castellated edge blocks.
  const blocks = Math.ceil(w / (cell / 2));
  for (let i = 0; i < blocks; i++) {
    ctx.fillStyle = i % 2 ? "#111" : "#eee";
    ctx.fillRect(i * (cell / 2), 0, cell / 2, cell * 0.3);
    ctx.fillRect(i * (cell / 2), h - cell * 0.3, cell / 2, cell * 0.3);
  }

  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.42;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.clip();
  ctx.fillStyle = "#151515";
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  const left = cx - R;
  const width = R * 2;
  const rows = [-1, -0.5, -0.18, 0.22, 0.55, 1].map((f) => cy + R * f);

  const order = rand() < 0.5 ? SMPTE : [...SMPTE].reverse();
  order.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(left + (width * i) / 7, rows[0], width / 7 + 1, rows[1] - rows[0]);
  });

  for (let i = 0; i < 6; i++) {
    const v = Math.round((i / 5) * 235 + 10);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(left + (width * i) / 6, rows[1], width / 6 + 1, rows[2] - rows[1]);
  }

  // Multiburst: six gratings of rising frequency.
  const zones = 6;
  for (let z = 0; z < zones; z++) {
    const zx = left + (width * z) / zones;
    const zw = width / zones;
    const freq = 2 + z * 2.5;
    const stripe = zw / (freq * 2);
    for (let s = 0; s < freq * 2; s++) {
      ctx.fillStyle = s % 2 ? "#0c0c0c" : "#f0f0f0";
      ctx.fillRect(zx + s * stripe, rows[2], stripe + 0.5, rows[3] - rows[2]);
    }
  }

  const primaries = ["#d8352f", "#3db552", "#2b3bd6"];
  const shift = Math.floor(rand() * 3);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = primaries[(i + shift) % 3];
    ctx.fillRect(left + (width * i) / 3, rows[3], width / 3 + 1, rows[4] - rows[3]);
  }
  const ramp = ctx.createLinearGradient(left, 0, left + width, 0);
  ramp.addColorStop(0, "#000");
  ramp.addColorStop(1, "#fff");
  ctx.fillStyle = ramp;
  ctx.fillRect(left, rows[4], width, rows[5] - rows[4]);
  ctx.restore();

  ctx.strokeStyle = "#f2f2f2";
  ctx.lineWidth = lw * 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(cx - R, cy);
  ctx.lineTo(cx + R, cy);
  ctx.moveTo(cx, cy - R);
  ctx.lineTo(cx, cy + R);
  ctx.stroke();

  const id = `444-${String(Math.floor(rand() * 90) + 10)}`;
  const fs = Math.round(R * 0.13);
  ctx.font = `700 ${fs}px ui-monospace, monospace`;
  const tw = ctx.measureText(id).width;
  ctx.fillStyle = "#111";
  ctx.fillRect(cx - tw / 2 - fs * 0.4, rows[3] + (rows[4] - rows[3]) / 2 - fs * 0.7, tw + fs * 0.8, fs * 1.4);
  ctx.fillStyle = "#f2f2f2";
  ctx.textBaseline = "middle";
  ctx.fillText(id, cx - tw / 2, rows[3] + (rows[4] - rows[3]) / 2);
};

const ridges: Draw = (ctx, w, h, rand, t) => {
  const bg = "#060606";
  const ink = pick(rand, ["#f2efe6", "#ffd9a8", "#cfe8ff"]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const lines = 40 + Math.floor(rand() * 14);
  const top = h * 0.16;
  const bot = h * 0.9;
  const left = w * 0.2;
  const right = w * 0.8;
  const ph = Array.from({ length: 5 }, () => rand() * TAU);
  ctx.lineWidth = Math.max(1, w / 520);
  ctx.strokeStyle = ink;
  for (let i = 0; i < lines; i++) {
    const y = top + ((bot - top) * i) / (lines - 1);
    const strength = 0.55 + 0.45 * Math.sin(i * 0.33 + ph[3]);
    ctx.beginPath();
    ctx.moveTo(left, y);
    const pts = 140;
    for (let j = 0; j <= pts; j++) {
      const u = j / pts;
      const x = left + (right - left) * u;
      const centre = Math.exp(-Math.pow((u - 0.5) / 0.17, 2));
      const n =
        Math.sin(u * 13 + ph[0] + i * 0.7 + t * 1.3) * 0.5 +
        Math.sin(u * 31 + ph[1] - i * 0.41) * 0.3 +
        Math.sin(u * 57 + ph[2] + i * 1.13 + t * 2.1) * 0.2;
      const amp = h * 0.085 * centre * strength;
      ctx.lineTo(x, y - Math.abs(n) * amp - centre * amp * 0.45);
    }
    ctx.lineTo(right, y);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.stroke();
  }
};

const halftone: Draw = (ctx, w, h, rand, t) => {
  ctx.fillStyle = "#040406";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  // Classic screen angles: 15°, 45°, 75°.
  const guns: [string, number][] = [
    ["#ff2b2b", 15],
    ["#2bff57", 45],
    ["#2b5bff", 75],
  ];
  const cell = Math.max(6, w / 54);
  const fx = 0.3 + rand() * 0.4;
  const fy = 0.3 + rand() * 0.4;
  const fx2 = rand();
  const fy2 = rand();
  const k = 5 + rand() * 4;
  const ext = Math.hypot(w, h) / 2 + cell;
  guns.forEach(([color, deg], idx) => {
    const ang = (deg * Math.PI) / 180;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let gy = -ext; gy < ext; gy += cell) {
      for (let gx = -ext; gx < ext; gx += cell) {
        const wx = gx * cos - gy * sin + w / 2;
        const wy = gx * sin + gy * cos + h / 2;
        if (wx < -cell || wx > w + cell || wy < -cell || wy > h + cell) continue;
        const u = wx / w;
        const v = wy / h;
        const d1 = Math.hypot(u - fx, (v - fy) * (h / w));
        const d2 = Math.hypot(u - fx2, (v - fy2) * (h / w));
        const val =
          0.5 + 0.25 * Math.sin(d1 * k * TAU - t * 1.4 + idx * 0.9) + 0.25 * Math.sin(d2 * k * 0.7 * TAU + t + idx * 1.7);
        const r = cell * 0.52 * Math.sqrt(Math.max(0, val));
        if (r < 0.4) continue;
        ctx.moveTo(gx + r, gy);
        ctx.arc(gx, gy, r, 0, TAU);
      }
    }
    ctx.fill();
    ctx.restore();
  });
  ctx.globalCompositeOperation = "source-over";
};

const subpixel: Draw = (ctx, w, h, rand) => {
  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, w, h);
  const cols = 44 + Math.floor(rand() * 16);
  const tri = w / cols;
  const sub = tri / 3;
  const rowH = tri * 1.15;
  const rows = Math.ceil(h / rowH) + 1;
  const sunX = 0.35 + rand() * 0.3;
  const sunY = 0.45 + rand() * 0.1;
  const hz = 0.66;
  const image = (u: number, v: number): [number, number, number] => {
    const d = Math.hypot(u - sunX, (v - sunY) * (h / w));
    if (v > hz) {
      const ripple = 0.5 + 0.5 * Math.sin(v * 90 + u * 6);
      const glint = Math.abs(u - sunX) < 0.08 ? ripple * 0.9 : 0.1;
      return [0.25 + glint, 0.08 + glint * 0.6, 0.18 + glint * 0.2];
    }
    if (d < 0.12) return [1, 0.82, 0.35];
    const sky = v / hz;
    const halo = Math.max(0, 0.35 - d) * 1.6;
    return [0.2 + sky * 0.75 + halo, 0.05 + sky * 0.3 + halo * 0.6, 0.35 - sky * 0.25 + halo * 0.1];
  };
  const gap = Math.max(0.6, sub * 0.16);
  const ch = ["255,46,46", "46,255,90", "60,90,255"];
  for (let i = 0; i < cols; i++) {
    for (let j = -1; j < rows; j++) {
      const y = j * rowH + (i % 2) * rowH * 0.5;
      const rgb = image((i + 0.5) / cols, (y + rowH / 2) / h);
      for (let s = 0; s < 3; s++) {
        const a = Math.min(1, Math.max(0.03, rgb[s]));
        ctx.fillStyle = `rgba(${ch[s]},${a.toFixed(2)})`;
        ctx.fillRect(i * tri + s * sub + gap / 2, y + gap, sub - gap, rowH - gap * 2);
      }
    }
  }
};

const glow: Draw = (ctx, w, h, rand, t) => {
  ctx.fillStyle = "#05040a";
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  const palette = ["#33c3d1", "#c043be", "#e6cf2e", "#2b3bd6", "#d8352f", "#3db552"];
  const blobs = 5 + Math.floor(rand() * 3);
  for (let b = 0; b < blobs; b++) {
    const [r, g, bl] = hexToRgb(pick(rand, palette));
    const x0 = rand() * w;
    const y0 = rand() * h;
    const rad = (0.25 + rand() * 0.35) * Math.max(w, h);
    const sp = 0.1 + rand() * 0.3;
    const ph = rand() * TAU;
    const x = x0 + Math.sin(t * sp + ph) * w * 0.1;
    const y = y0 + Math.cos(t * sp * 0.8 + ph) * h * 0.1;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(${r},${g},${bl},0.55)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${bl},0.18)`);
    grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";
  const step = h / 180;
  ctx.fillStyle = "rgba(0,0,0,0.38)";
  for (let y = 0; y < h; y += step) ctx.fillRect(0, y, w, step * 0.42);
};

const pixelscape: Draw = (ctx, w, h, rand, t) => {
  const gw = 80;
  const gh = 60;
  const cw = w / gw;
  const ch = h / gh;
  const theme = pick(rand, [
    {
      sky: ["#1b1a3a", "#3b2a5c", "#7a3b6b", "#c45a6a", "#f2a65a"],
      hills: ["#2c2142", "#1d1631", "#120d22"],
      sun: "#ffd27a",
    },
    {
      sky: ["#16304a", "#2f5f86", "#6aa3b8", "#c9d9b0", "#f6e3a1"],
      hills: ["#2c4a4f", "#1f3739", "#132426"],
      sun: "#fff6d0",
    },
    {
      sky: ["#2a0f1f", "#5c1a33", "#a63a3a", "#e0743c", "#f7c065"],
      hills: ["#3b1726", "#2a0f1b", "#1a0912"],
      sun: "#fff0b0",
    },
  ] as const);
  const hz = Math.floor(gh * (0.6 + rand() * 0.06));
  const cell = (x: number, y: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw) + 1, Math.ceil(ch) + 1);
  };
  for (let y = 0; y < hz; y++) {
    const idx = Math.min(theme.sky.length - 1, Math.floor((y / hz) * theme.sky.length));
    ctx.fillStyle = theme.sky[idx];
    ctx.fillRect(0, Math.floor(y * ch), w, Math.ceil(ch) + 1);
  }
  const sx = Math.floor(gw * (0.3 + rand() * 0.4));
  const sy = hz - 6 - Math.floor(rand() * 6);
  const sr = 5 + Math.floor(rand() * 3);
  for (let y = -sr; y <= sr; y++)
    for (let x = -sr; x <= sr; x++) if (x * x + y * y <= sr * sr) cell(sx + x, sy + y, theme.sun);

  const heights: number[][] = theme.hills.map((_, L) => {
    const p = [rand() * TAU, rand() * TAU, rand() * TAU];
    const base = hz - (14 - L * 4);
    return Array.from({ length: gw }, (_, x) =>
      Math.round(base + Math.sin(x * 0.07 + p[0]) * (5 - L) + Math.sin(x * 0.19 + p[1]) * 2 + Math.sin(x * 0.41 + p[2]))
    );
  });
  heights.forEach((row, L) => {
    for (let x = 0; x < gw; x++) for (let y = Math.max(0, row[x]); y < hz; y++) cell(x, y, theme.hills[L]);
  });

  // Water: the sky reflected, darker, with a shimmering sun path.
  for (let y = hz; y < gh; y++) {
    const mirror = hz - (y - hz) - 1;
    const idx = Math.min(theme.sky.length - 1, Math.max(0, Math.floor((mirror / hz) * theme.sky.length)));
    ctx.fillStyle = theme.sky[idx];
    ctx.fillRect(0, Math.floor(y * ch), w, Math.ceil(ch) + 1);
    ctx.fillStyle = "rgba(0,0,20,0.35)";
    ctx.fillRect(0, Math.floor(y * ch), w, Math.ceil(ch) + 1);
    const wobble = Math.round(Math.sin(y * 1.7 + t * 3) * 1.5);
    const spread = Math.max(1, Math.round(sr * (1 - (y - hz) / (gh - hz)) + 1));
    for (let x = -spread; x <= spread; x += 2) {
      if ((x + y + Math.floor(t * 4)) % 3 === 0) continue;
      cell(sx + x + wobble, y, theme.sun);
    }
  }
};

export const GENERATORS: Record<GeneratorId, { draw: Draw; animated: boolean }> = {
  bars: { draw: bars, animated: true },
  scope: { draw: scope, animated: true },
  horizon: { draw: horizon, animated: true },
  snow: { draw: snow, animated: true },
  testcard: { draw: testcard, animated: false },
  ridges: { draw: ridges, animated: true },
  halftone: { draw: halftone, animated: true },
  subpixel: { draw: subpixel, animated: false },
  glow: { draw: glow, animated: true },
  pixelscape: { draw: pixelscape, animated: true },
};
