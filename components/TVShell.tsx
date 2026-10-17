"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { artBySlug, CHANNELS, subChannel } from "@/lib/catalog";
import { useCart } from "./CartProvider";
import { Snow } from "./Snow";

function channelOf(pathname: string) {
  if (pathname.startsWith("/art/")) {
    const slug = pathname.split("/")[2] ?? "";
    const art = artBySlug(slug);
    return { n: 2, label: art ? `CH ${subChannel(slug)}` : "CH 02", name: art ? art.title : "Gallery" };
  }
  const c = CHANNELS.find((c) => (c.href === "/" ? pathname === "/" : pathname.startsWith(c.href)));
  if (!c) return { n: 0, label: "CH --", name: "No signal" };
  return { n: c.n, label: `CH ${String(c.n).padStart(2, "0")}`, name: c.name };
}

/** Where the channel knob's pointer sits for channels 1 to 4. */
const DIAL_ANGLES = [-60, -20, 20, 60];

/** LCD backlight colours for the phone view. `lit` is only used for the menu swatches;
    the screen itself takes its colours from globals.css. */
const BACKLIGHTS = [
  { id: "amber", name: "Amber", lit: "#ffab12" },
  { id: "blue", name: "Blue", lit: "#2b84f0" },
  { id: "green", name: "Green", lit: "#a9c94b" },
  { id: "ice", name: "Ice", lit: "#cfe5ee" },
  { id: "red", name: "Red", lit: "#ff4b3a" },
  { id: "pink", name: "Pink", lit: "#ff70b4" },
  { id: "violet", name: "Violet", lit: "#9b7cff" },
] as const;

type Backlight = (typeof BACKLIGHTS)[number]["id"];

type MenuItem = { label: string; run: () => void; stay: boolean; swatch?: string; checked?: boolean };

const ColourIcon = () => (
  <svg className="lcd-ico" viewBox="0 0 18 18" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M1 1h16v16H1z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M2 16L16 2v14z" />
  </svg>
);

/** Phone status bar icons, drawn on the pixel grid like an old handset. */
const SignalIcon = () => (
  <svg className="lcd-ico" viewBox="0 0 28 20" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M0 0h9L5 6z" />
    <rect x="4" y="5" width="2" height="15" />
    <rect x="9" y="14" width="3" height="6" />
    <rect x="14" y="10" width="3" height="10" />
    <rect x="19" y="6" width="3" height="14" />
    <rect x="24" y="2" width="3" height="18" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg className="lcd-ico" viewBox="0 0 26 18" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M1 1h24v16H1z M1 1l12 9 12-9 M1 17l8-7 M25 17l-8-7" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const BatteryIcon = () => (
  <svg className="lcd-ico lcd-battery" viewBox="0 0 32 16" aria-hidden="true" shapeRendering="crispEdges">
    <rect x="0" y="5" width="3" height="6" />
    <rect x="4" y="1" width="27" height="14" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="7" y="4" width="6" height="8" />
    <rect x="14.5" y="4" width="6" height="8" />
    <rect x="22" y="4" width="6" height="8" />
  </svg>
);

function LcdClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time className="lcd-clock" suppressHydrationWarning>
      {now ?? "--:--"}
    </time>
  );
}

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time className="clock" suppressHydrationWarning>
      {now ?? "--:--:--"}
    </time>
  );
}

const Star = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 1.5v17M2.6 5.75l14.8 8.5M2.6 14.25l14.8-8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Cross = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// Bar and gap widths in px for the decorative barcode.
const BARCODE = [3, 1, 1, 2, 2, 1, 1, 1, 3, 2, 1, 1, 2, 3, 1, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 1, 3, 2, 1, 1, 2, 1, 1, 3, 2, 1];

/** Print marks around the set, like the margins of a product poster. */
function PosterMarks() {
  return (
    <div className="marks" aria-hidden="true">
      <span className="mark-rule" />
      <Star className="mark mark-tl" />
      <Star className="mark mark-tr" />
      <Cross className="mark mark-l1" />
      <Cross className="mark mark-r1" />
      <Star className="mark mark-l2" />
      <Star className="mark mark-r2" />
      <span className="mark-pill mark-l3">+ 444 +</span>
      <span className="mark-pill mark-r3">+ 444 +</span>
      <span className="mark-line mark-l4" />
      <span className="mark-line mark-r4" />
      <span className="mark-pill mark-l5">+ 444 +</span>
      <span className="mark-pill mark-r5">+ 444 +</span>
      <div className="spec">
        <span>444 Systems Group (b)</span>
        <span>Model TV-444 · 4:3 · 525 lines</span>
        <span className="spec-row">
          <i>TV</i>
          <i>4:3</i>
          Serial (X) 444-0001.979
        </span>
      </div>
      <div className="barcode">
        {BARCODE.map((w, i) => (
          <i key={i} style={{ width: w * 1.5 }} />
        ))}
      </div>
      <div className="plate">
        <span>AC 120 V ~ 60 Hz</span>
        <b>85 W</b>
        <span>CH 01–04 · VHF</span>
        <b>TV-444-A</b>
      </div>
    </div>
  );
}

function Remote({
  current,
  onChannel,
  fx,
  onFx,
}: {
  current: number;
  onChannel: (n: number) => void;
  fx: boolean;
  onFx: () => void;
}) {
  const step = (dir: 1 | -1) => {
    const from = current || 1;
    onChannel(((from - 1 + dir + CHANNELS.length) % CHANNELS.length) + 1);
  };
  return (
    <div className="remote" role="group" aria-label="Remote control">
      <span className="remote-ir" aria-hidden="true" />
      <button type="button" className={`rbtn rbtn-power ${fx ? "is-on" : ""}`} onClick={onFx} aria-pressed={fx}>
        FX
      </button>
      <span className="remote-pad">
        {CHANNELS.map((c) => (
          <button
            type="button"
            key={c.n}
            className={`rbtn ${current === c.n ? "is-on" : ""}`}
            onClick={() => onChannel(c.n)}
            aria-label={`Channel ${c.n}: ${c.name}`}
          >
            {c.n}
          </button>
        ))}
      </span>
      <button type="button" className="rbtn" onClick={() => step(-1)} aria-label="Channel down">
        ▼
      </button>
      <button type="button" className="rbtn" onClick={() => step(1)} aria-label="Channel up">
        ▲
      </button>
      <span className="remote-brand">444</span>
    </div>
  );
}

export function TVShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { count, toast } = useCart();
  const channel = channelOf(pathname);
  const screen = useRef<HTMLDivElement>(null);
  const [zapping, setZapping] = useState(false);
  const [osd, setOsd] = useState<{ label: string; name: string } | null>(null);
  const [fx, setFx] = useState(true);
  const [canFull, setCanFull] = useState(false);
  const [full, setFull] = useState(false);
  const [backlight, setBacklight] = useState<Backlight>("amber");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "colour">("main");
  const [menuIndex, setMenuIndex] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem("444.fx") === "off") setFx(false);
      const saved = BACKLIGHTS.find((b) => b.id === window.localStorage.getItem("444.backlight"));
      if (saved) setBacklight(saved.id);
    } catch {}
    setCanFull(Boolean(document.fullscreenEnabled));
    const onChange = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    // Let arrow keys and the space bar scroll the screen straight away.
    screen.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.fx = fx ? "on" : "off";
  }, [fx]);

  useEffect(() => {
    document.documentElement.dataset.backlight = backlight;
  }, [backlight]);

  // Channel change: back to the top of the programme, a burst of snow, then the channel number.
  useEffect(() => {
    setMenuOpen(false);
    screen.current?.scrollTo({ top: 0 });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wasFirst = first.current;
    first.current = false;
    const timers: number[] = [];
    if (!wasFirst && !reduce && fx) {
      setZapping(true);
      timers.push(window.setTimeout(() => setZapping(false), 380));
    }
    timers.push(window.setTimeout(() => setOsd({ label: channel.label, name: channel.name }), wasFirst ? 900 : 120));
    timers.push(window.setTimeout(() => setOsd(null), wasFirst ? 3400 : 2600));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname]);

  const goTo = useCallback(
    (n: number) => {
      const c = CHANNELS.find((c) => c.n === n);
      if (c) router.push(c.href);
    },
    [router]
  );

  const toggleFx = useCallback(() => {
    setFx((on) => {
      try {
        window.localStorage.setItem("444.fx", on ? "off" : "on");
      } catch {}
      return !on;
    });
  }, []);

  const toggleFull = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const pickBacklight = useCallback((next: Backlight) => {
    setBacklight(next);
    try {
      window.localStorage.setItem("444.backlight", next);
    } catch {}
  }, []);

  const backlightName = BACKLIGHTS.find((b) => b.id === backlight)?.name ?? "Amber";
  const COLOUR_ITEM = CHANNELS.length; // position of "Colour" in the main menu

  const showColours = () => {
    setMenuView("colour");
    setMenuIndex(Math.max(0, BACKLIGHTS.findIndex((b) => b.id === backlight)));
    setMenuOpen(true);
  };

  // The phone's menu: channels first, then the handset settings.
  const menu: MenuItem[] =
    menuView === "colour"
      ? BACKLIGHTS.map((b) => ({
          label: b.name,
          run: () => pickBacklight(b.id),
          stay: true,
          swatch: b.lit,
          checked: b.id === backlight,
        }))
      : [
          ...CHANNELS.map((c) => ({
            label: c.n === 4 && count > 0 ? `${c.name} (${count})` : c.name,
            run: () => goTo(c.n),
            stay: false,
          })),
          { label: `Colour: ${backlightName}`, run: showColours, stay: true },
          { label: `Pixel grid: ${fx ? "On" : "Off"}`, run: toggleFx, stay: true },
        ];

  const openMenu = () => {
    setMenuView("main");
    setMenuIndex(Math.max(0, channel.n - 1));
    setMenuOpen(true);
  };

  const choose = (i: number) => {
    const item = menu[i];
    if (!item) return;
    setMenuIndex(i);
    item.run();
    if (!item.stay) setMenuOpen(false);
  };

  const closeOrUp = useCallback(() => {
    if (menuView === "colour") {
      setMenuView("main");
      setMenuIndex(COLOUR_ITEM);
    } else setMenuOpen(false);
  }, [menuView, COLOUR_ITEM]);

  const back = () => {
    if (menuOpen) closeOrUp();
    else if (pathname === "/") return;
    else if (window.history.length > 1) router.back();
    else router.push("/");
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setMenuIndex((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + menu.length) % menu.length);
      } else if (e.key === "Escape") closeOrUp();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, menu.length, closeOrUp]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (/^[1-4]$/.test(e.key)) goTo(Number(e.key));
      else if (e.key === "+" || e.key === "=") goTo((channel.n % CHANNELS.length) + 1);
      else if (e.key === "-") goTo(((Math.max(1, channel.n) + CHANNELS.length - 2) % CHANNELS.length) + 1);
      else if (e.key === "f" || e.key === "F") toggleFull();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, toggleFull, channel.n]);

  const dial = { "--turn": `${DIAL_ANGLES[Math.max(1, channel.n) - 1]}deg` } as CSSProperties;
  const fxKnob = { "--turn": fx ? "50deg" : "-50deg" } as CSSProperties;

  return (
    <div className="poster">
      <a className="skip" href="#programme">
        Skip to programme
      </a>
      <PosterMarks />
      {canFull && (
        <button type="button" className="fullscreen" onClick={toggleFull} aria-pressed={full}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            {full ? (
              <path d="M7 2v5H2M13 2v5h5M7 18v-5H2M13 18v-5h5" />
            ) : (
              <path d="M2 7V2h5M18 7V2h-5M2 13v5h5M18 13v5h-5" />
            )}
          </svg>
          {full ? "Exit fullscreen" : "Fullscreen"}
        </button>
      )}

      <div className="set">
        <div className="cabinet">
          <div className="bezel">
            <div className="tube-mask">
              <div className="glass">
                <div className="screen-scroll" ref={screen} tabIndex={-1}>
                  <header className="station">
                    <div className="station-inner">
                      <Link href="/" className="brand" aria-label="444, channel 1, lobby">
                        <span className="brand-word">444</span>
                        <span className="brand-bars" aria-hidden="true">
                          <i /><i /><i /><i /><i /><i /><i />
                        </span>
                      </Link>
                      <nav className="channels" aria-label="Channels">
                        {CHANNELS.map((c) => {
                          const on = channel.n === c.n;
                          return (
                            <Link
                              key={c.n}
                              href={c.href}
                              className={`ch ${on ? "is-on" : ""}`}
                              aria-current={on ? "page" : undefined}
                            >
                              <span className="ch-n">{String(c.n).padStart(2, "0")}</span>
                              <span className="ch-name">{c.name}</span>
                              {c.n === 4 && count > 0 && (
                                <span className="ch-badge" aria-label={`${count} items`}>
                                  {count}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </nav>
                      <div className="station-meta">
                        <span className="onair">
                          <i aria-hidden="true" />
                          On air
                        </span>
                        <Clock />
                      </div>
                    </div>
                  </header>

                  <main id="programme" className="tube">
                    {children}
                  </main>

                  <footer className="credits">
                    <div className="bars-stripe" aria-hidden="true" />
                    <div className="wrap credits-inner">
                      <p>
                        <strong>444</strong> is a fictional museum of broadcast art. The artists and works are
                        invented, and every picture is drawn live in your browser.
                      </p>
                      <p className="credits-keys">Keys 1–4 change channel · + and − step · F for fullscreen</p>
                      <p>Demo store: no payment is taken and nothing ships.</p>
                    </div>
                  </footer>
                </div>

                <div className="crt" aria-hidden="true">
                  <div className="crt-lines" />
                  <div className="crt-roll" />
                </div>
                <div className="glass-shade" aria-hidden="true" />
                <div className="glass-gloss" aria-hidden="true" />
                {zapping && <Snow className="zap" />}
                <div className={`osd ${osd ? "is-shown" : ""}`} aria-hidden="true">
                  {osd && (
                    <>
                      <span className="osd-ch">{osd.label}</span>
                      <span className="osd-name">{osd.name}</span>
                    </>
                  )}
                </div>
                <div className={`toast ${toast ? "is-shown" : ""}`} role="status" aria-live="polite">
                  {toast && (
                    <>
                      <span className="toast-tag">Cart</span>
                      {toast}
                    </>
                  )}
                </div>

                {/* Phone LCD chrome: only shown on small screens */}
                <div className="lcd-status">
                  <SignalIcon />
                  {count > 0 && (
                    <Link href="/cart" className="lcd-msg" aria-label={`Cart, ${count} items`}>
                      <EnvelopeIcon />
                      <span>{count}</span>
                    </Link>
                  )}
                  <span className="lcd-spacer" />
                  <button
                    type="button"
                    className="lcd-colour"
                    onClick={menuOpen && menuView === "colour" ? () => setMenuOpen(false) : showColours}
                    aria-label={`Screen colour: ${backlightName}`}
                  >
                    <ColourIcon />
                  </button>
                  <LcdClock />
                  <BatteryIcon />
                </div>

                <div
                  className="lcd-menu"
                  hidden={!menuOpen}
                  role="dialog"
                  aria-label={menuView === "colour" ? "Screen colour" : "Menu"}
                >
                  <p className="lcd-menu-title">
                    <span>{menuView === "colour" ? "Colour" : "Menu"}</span>
                    <span>
                      {menuIndex + 1}/{menu.length}
                    </span>
                  </p>
                  <ol className="lcd-menu-list">
                    {menu.map((item, i) => (
                      <li key={item.label}>
                        <button
                          type="button"
                          className={i === menuIndex ? "is-on" : ""}
                          onClick={() => choose(i)}
                          onMouseEnter={() => setMenuIndex(i)}
                          aria-pressed={item.checked}
                        >
                          <span className="lcd-menu-n">{i + 1}</span>
                          {item.swatch && (
                            <span className="lcd-swatch" style={{ background: item.swatch }} aria-hidden="true" />
                          )}
                          <span className="lcd-menu-label">{item.label}</span>
                          {item.checked !== undefined && (
                            <span className="lcd-radio" aria-hidden="true">
                              {item.checked ? "●" : "○"}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="lcd-keys">
                  <button type="button" onClick={menuOpen ? () => choose(menuIndex) : openMenu}>
                    {menuOpen ? "Select" : "Menu"}
                  </button>
                  <span className="lcd-title">{menuOpen ? (menuView === "colour" ? backlightName : "444") : channel.name}</span>
                  <button type="button" onClick={back} aria-disabled={!menuOpen && pathname === "/"}>
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <span className="panel-mark">444</span>
            <div className="dial">
              <span className="dial-ticks" aria-hidden="true">
                {CHANNELS.map((c) => (
                  <i key={c.n} className={channel.n === c.n ? "is-on" : ""}>
                    {c.n}
                  </i>
                ))}
              </span>
              <button
                type="button"
                className="tv-knob"
                style={dial}
                onClick={() => goTo((channel.n % CHANNELS.length) + 1)}
                aria-label={`Channel dial, on channel ${channel.n || "none"}. Turn to the next channel`}
              />
              <span className="panel-label">Channel</span>
            </div>
            <div className="dial">
              <button
                type="button"
                className="tv-knob"
                style={fxKnob}
                onClick={toggleFx}
                aria-pressed={fx}
                aria-label="Picture effects"
              />
              <span className="panel-label">Picture FX</span>
            </div>
          </div>

          <div className="strip" aria-hidden="true">
            <span className="strip-badge">444</span>
          </div>
        </div>

        <svg className="legs" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="teak" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#8a3a14" />
              <stop offset="0.45" stopColor="#c0612c" />
              <stop offset="1" stopColor="#7c3311" />
            </linearGradient>
            <linearGradient id="teak-dark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7a3212" />
              <stop offset="1" stopColor="#5a240c" />
            </linearGradient>
          </defs>
          <path d="M175 6h26l22 96h-14z" fill="url(#teak-dark)" />
          <path d="M799 6h26l-34 96h-14z" fill="url(#teak-dark)" />
          <rect x="190" y="58" width="620" height="9" fill="url(#teak-dark)" />
          <rect x="60" y="0" width="880" height="12" rx="2" fill="url(#teak-dark)" />
          <path d="M92 8h44L84 120H58z" fill="url(#teak)" />
          <path d="M864 8h44l34 112h-26z" fill="url(#teak)" />
          <rect x="104" y="66" width="792" height="11" fill="url(#teak)" />
        </svg>
        <span className="floor-shadow" aria-hidden="true" />
        <Remote current={channel.n} onChannel={goTo} fx={fx} onFx={toggleFx} />
      </div>
    </div>
  );
}
