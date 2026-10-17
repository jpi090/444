import type { GeneratorId } from "./generators";

export type ArtRef = { generator: GeneratorId; seed: number };

export type RoomId = "test-card" | "signal" | "night" | "home-video";

export type Room = {
  id: RoomId;
  name: string;
  blurb: string;
};

export type Artwork = ArtRef & {
  slug: string;
  title: string;
  artist: string;
  born: number;
  year: number;
  medium: string;
  room: RoomId;
  accession: string;
  edition: number;
  text: string;
};

export type Merch = {
  id: string;
  item: string;
  name: string;
  detail: string;
  description: string;
  price: number;
  stock: number;
  mockup: "book" | "tote" | "mug" | "vhs" | "poster" | "scarf";
  art: ArtRef;
};

export const ROOMS: Room[] = [
  {
    id: "test-card",
    name: "Test Card Hall",
    blurb: "Calibration images made for engineers, rehung here as portraits of the medium itself.",
  },
  {
    id: "signal",
    name: "Signal & Noise",
    blurb: "Works that live in the gap between what the transmitter sent and what the set received.",
  },
  {
    id: "night",
    name: "Night Programming",
    blurb: "Pictures for the hours after the anthem plays and the station goes to bars.",
  },
  {
    id: "home-video",
    name: "Home Video",
    blurb: "Low resolution, high feeling. Made on the family set, for the family set.",
  },
];

export const ARTWORKS: Artwork[] = [
  {
    slug: "color-bars-melted-i",
    title: "Color Bars, Melted I",
    artist: "Ines Halloran",
    born: 1956,
    year: 1987,
    medium: "Videotape transfer, generative signal, 4:3",
    room: "test-card",
    accession: "444.1987.014",
    edition: 50,
    generator: "bars",
    seed: 11,
    text: "Halloran taped her local station's closing bars every night for a year, then played the tapes back on a deck with a failing capstan. The picture drips toward the bottom of the frame because that is where the tape stretched first.",
  },
  {
    slug: "resolution-chart-no-2",
    title: "Resolution Chart No. 2",
    artist: "Tomasz Weller",
    born: 1941,
    year: 1979,
    medium: "Broadcast test signal, 4:3",
    room: "test-card",
    accession: "444.1979.002",
    edition: 75,
    generator: "testcard",
    seed: 4,
    text: "Weller spent twenty years as a transmitter engineer and drew his own test cards on graph paper during the night shift. This is the second one he ever put on air. The grey steps at the top are tuned to the exact six levels his receiver could tell apart.",
  },
  {
    slug: "color-bars-melted-iv",
    title: "Color Bars, Melted IV",
    artist: "Ines Halloran",
    born: 1956,
    year: 1988,
    medium: "Videotape transfer, generative signal, 4:3",
    room: "test-card",
    accession: "444.1988.031",
    edition: 50,
    generator: "bars",
    seed: 97,
    text: "The fourth tape in the series had been left on a radiator. The bands of tracking error that cross it are real, and they move a little every time it plays.",
  },
  {
    slug: "lissajous-for-two-oscillators",
    title: "Lissajous for Two Oscillators",
    artist: "Delphine Arcaro",
    born: 1949,
    year: 1982,
    medium: "Oscilloscope trace, live signal",
    room: "signal",
    accession: "444.1982.007",
    edition: 40,
    generator: "scope",
    seed: 7,
    text: "Arcaro fed two audio oscillators into the X and Y inputs of a studio scope and tuned them until they nearly agreed. The figure turns because they never quite do. She called it a duet for two machines that cannot hear each other.",
  },
  {
    slug: "snow-study-with-ghost",
    title: "Snow Study with Ghost",
    artist: "Kwame Osei-Lund",
    born: 1962,
    year: 1991,
    medium: "Off-air reception, live signal",
    room: "signal",
    accession: "444.1991.023",
    edition: 60,
    generator: "snow",
    seed: 23,
    text: "Recorded on an unused channel with the antenna pointed at a transmitter two hundred miles away. Look for the faint ring and crosshair inside the snow: a test card from another city, arriving one bounce too late.",
  },
  {
    slug: "subpixel-close-up",
    title: "Subpixel Close-up (Sunset)",
    artist: "Ruth Vandersloot",
    born: 1953,
    year: 1985,
    medium: "Macro photograph of a shadow mask, re-rendered",
    room: "signal",
    accession: "444.1985.031",
    edition: 50,
    generator: "subpixel",
    seed: 31,
    text: "Every color on a tube set is three lights: red, green and blue, packed too close to see. Vandersloot photographed a sunset from an inch away so the picture falls apart into the phosphors that make it. Step back from your screen and it comes together again.",
  },
  {
    slug: "transmitter-at-dusk",
    title: "Transmitter at Dusk",
    artist: "Hiro Tanabe-Kell",
    born: 1958,
    year: 1984,
    medium: "Computer graphic, live signal",
    room: "night",
    accession: "444.1984.005",
    edition: 75,
    generator: "horizon",
    seed: 5,
    text: "Made on a borrowed character generator meant for weather maps. The mast on the horizon is the one that carried the picture you are watching, with its red warning lamp still blinking for aircraft.",
  },
  {
    slug: "afterglow-no-7",
    title: "Afterglow No. 7",
    artist: "The Night Shift Collective",
    born: 1990,
    year: 1993,
    medium: "Phosphor persistence, live signal",
    room: "night",
    accession: "444.1993.077",
    edition: 100,
    generator: "glow",
    seed: 77,
    text: "Switch a tube set off in a dark room and the screen keeps glowing for a few seconds. The collective slowed that moment down to several minutes. It was the first work the museum ever acquired.",
  },
  {
    slug: "sign-off-2-04-am",
    title: "Sign-Off, 2:04 a.m.",
    artist: "Delphine Arcaro",
    born: 1949,
    year: 1986,
    medium: "Audio waveform stack, live signal",
    room: "night",
    accession: "444.1986.013",
    edition: 40,
    generator: "ridges",
    seed: 13,
    text: "Each line is one second of the last minute of broadcast on a Tuesday in March: the anthem, the announcer's goodnight, then the tone. Arcaro stacked them so the minute reads top to bottom like a page.",
  },
  {
    slug: "three-guns",
    title: "Three Guns",
    artist: "Ruth Vandersloot",
    born: 1953,
    year: 1989,
    medium: "Additive halftone, live signal",
    room: "home-video",
    accession: "444.1989.003",
    edition: 50,
    generator: "halftone",
    seed: 3,
    text: "A color tube has three electron guns, one each for red, green and blue. Vandersloot gave each gun its own dot screen at its own angle and let them overlap. Where all three meet, the light adds up to white.",
  },
  {
    slug: "lake-recorded-over",
    title: "Lake, Recorded Over",
    artist: "Kwame Osei-Lund",
    born: 1962,
    year: 1994,
    medium: "Camcorder still, 80 × 60 pixels",
    room: "home-video",
    accession: "444.1994.008",
    edition: 60,
    generator: "pixelscape",
    seed: 8,
    text: "A family holiday tape, taped over with a football match and then rescued. This is the one frame of the lake that survived, enlarged until each pixel is the size of a postage stamp.",
  },
  {
    slug: "holiday-tape-side-b",
    title: "Holiday Tape, Side B",
    artist: "Hiro Tanabe-Kell",
    born: 1958,
    year: 1990,
    medium: "Camcorder still, 80 × 60 pixels",
    room: "home-video",
    accession: "444.1990.041",
    edition: 75,
    generator: "pixelscape",
    seed: 41,
    text: "Tanabe-Kell shot the sunrise from a hotel balcony and kept only the frame where the camera's auto-exposure gave up. The water still shimmers, because the tape never stopped rolling.",
  },
];

export const PRINT_SIZES = [
  { id: "s", label: "12 × 9 in", price: 45 },
  { id: "m", label: "24 × 18 in", price: 95 },
  { id: "l", label: "40 × 30 in", price: 190 },
] as const;

export type PrintSizeId = (typeof PRINT_SIZES)[number]["id"];

export const MERCH: Merch[] = [
  {
    id: "catalogue",
    item: "444-2041",
    name: "444: Broadcast Art 1979–1994",
    detail: "Hardcover catalogue, 240 pages",
    description:
      "Every work in the collection, printed at full screen size, with essays on test cards, tape decay and late-night television. Cloth spine, foil-stamped cover.",
    price: 42,
    stock: 38,
    mockup: "book",
    art: { generator: "glow", seed: 77 },
  },
  {
    id: "tote",
    item: "444-1187",
    name: "Melted Bars Tote",
    detail: "Heavy cotton canvas, 15 × 16 in",
    description:
      "Ines Halloran's dripping color bars, screen-printed edge to edge in seven inks. Holds a week of groceries or a stack of tapes.",
    price: 26,
    stock: 64,
    mockup: "tote",
    art: { generator: "bars", seed: 11 },
  },
  {
    id: "mug",
    item: "444-0412",
    name: "Resolution Chart Mug",
    detail: "12 oz stoneware, dishwasher safe",
    description:
      "Tomasz Weller's test card wrapped around a heavy stoneware mug. Good for checking the color balance of your coffee.",
    price: 18,
    stock: 120,
    mockup: "mug",
    art: { generator: "testcard", seed: 4 },
  },
  {
    id: "vhs",
    item: "444-3313",
    name: "Sign-Off: Artist Tapes, Vol. 1",
    detail: "VHS cassette, 62 min, plus download code",
    description:
      "Six artists' videos from the collection on a real VHS tape, including Delphine Arcaro's Sign-Off. A download code is printed inside the sleeve for anyone without a deck.",
    price: 30,
    stock: 14,
    mockup: "vhs",
    art: { generator: "ridges", seed: 13 },
  },
  {
    id: "poster",
    item: "444-1984",
    name: "Tonight's Programme Poster",
    detail: "Offset lithograph, 18 × 24 in",
    description:
      "Hiro Tanabe-Kell's Transmitter at Dusk, printed in five spot colors on uncoated stock. Ships rolled in a tube.",
    price: 28,
    stock: 52,
    mockup: "poster",
    art: { generator: "horizon", seed: 5 },
  },
  {
    id: "scarf",
    item: "444-0303",
    name: "Three Guns Silk Scarf",
    detail: "Silk twill, 35 × 35 in, hand-rolled edges",
    description:
      "Ruth Vandersloot's red, green and blue dot screens printed on silk. Where the colors overlap the fabric glows a little, the way the tube did.",
    price: 65,
    stock: 21,
    mockup: "scarf",
    art: { generator: "halftone", seed: 3 },
  },
];

export function roomById(id: string) {
  return ROOMS.find((r) => r.id === id);
}

export function artBySlug(slug: string) {
  return ARTWORKS.find((a) => a.slug === slug);
}

/** Digital TV style sub-channel for a work: the gallery is channel 2, each work is 2.n */
export function subChannel(slug: string) {
  return `2.${ARTWORKS.findIndex((a) => a.slug === slug) + 1}`;
}

export const CHANNELS = [
  { n: 1, href: "/", name: "Lobby" },
  { n: 2, href: "/gallery", name: "Gallery" },
  { n: 3, href: "/shop", name: "Shop" },
  { n: 4, href: "/cart", name: "Cart" },
] as const;

export const FREE_SHIPPING_FROM = 75;

export const SHIPPING = [
  { id: "standard", label: "Standard", note: "5–7 working days", price: 8 },
  { id: "express", label: "Express", note: "1–2 working days", price: 18 },
] as const;

export type ShippingId = (typeof SHIPPING)[number]["id"];

export const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
