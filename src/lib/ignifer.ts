// Ignifer, the Lamplighter: the boss of Legacy Mode's Chapter 4. Zenith's stair is lit from the ground to the sky by
// ten thousand lamps, each burning with a drop of Zenith's own light, and Ignifer is the one who climbs it every night
// to keep them lit. A tall, thin figure in a long buttoned coat whose head is a white candle with its wick alight,
// carrying a long lighting pole with a hook and a flame at its tip. It joins the bosses' rebellion and snuffs the lamps
// one by one so the rebels can climb in the dark. Beaten, it is too late: the stair is dark, and the
// light at the top of the sky flickers for the first time. Its body is drawn in boss-designs.ts (coat, candle head,
// pole) and ignifer-look.ts (wick glow, drifting sparks).
import type { FighterDef, Move } from "./fighters";
import type { Form } from "./forms";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const SOOT = "hsl(222 18% 20%)";
export const BRASS = "hsl(42 64% 50%)";
export const WICKLIGHT = "hsl(44 100% 72%)";

export const IGNIFER: FighterDef = {
  id: "pyro", boss: "ignifer", name: "Ignifer", power: "The Stair Lamps", role: "attacker",
  ability: "The Lamplighter of Zenith's stair. Every night it climbs from the ground to the sky with its pole and lights ten thousand lamps, each with a drop of Zenith's light. It has never left one dark.",
  color: SOOT, glow: WICKLIGHT, hp: 900, speed: 108,
  moves: [
    M({ id: "pole-hook", name: "Pole Hook", kind: "melee", anim: "thrust", range: 130, cd: 1, dmg: 13, kb: 340, status: "burn", statusDur: 1.2 }),
    M({ id: "tossed-wick", name: "Tossed Wick", kind: "projectile", anim: "cast", range: 600, minRange: 90, cd: 2.2, dmg: 10, speed: 620, size: 14, count: 2, spread: 0.1, shape: "orb", status: "burn", statusDur: 1.6 }),
    M({ id: "lighting-run", name: "Lighting Run", kind: "dash", anim: "lunge", range: 460, cd: 4.4, dmg: 14, dist: 360, kb: 400, status: "burn", statusDur: 1.4, wind: 0.24 }),
    M({ id: "spilled-oil", name: "Spilled Oil", kind: "zone", anim: "slam", range: 420, cd: 8, dmg: 6, radius: 150, dur: 4.4, status: "burn", statusDur: 0.8, wind: 0.34 }),
    M({ id: "falling-sparks", name: "Falling Sparks", kind: "rain", anim: "raise", range: 560, cd: 5.6, dmg: 9, count: 8, radius: 210, shape: "orb", status: "burn", statusDur: 1, wind: 0.34 }),
    M({ id: "lamp-post", name: "Lamp Post", kind: "eruption", anim: "slam", range: 540, minRange: 50, cd: 4.6, dmg: 13, radius: 42, count: 2, lift: -520, wind: 0.3 }),
    M({ id: "trim-the-wick", name: "Trim the Wick", kind: "heal", anim: "cast", range: 2000, cd: 15, dmg: 0, heal: 38, below: 0.5, wind: 0.5, act: 0.4 }),
  ],
};

const P2 = { kind: "phase" as const, step: 2, at: 0.66, dmg: 1.14, kb: 1.1, cd: 0.86, speed: 1.08, act: 1.06 };
const P3 = { kind: "phase" as const, step: 3, at: 0.33, dmg: 1.3, kb: 1.2, cd: 0.74, speed: 1.14, act: 1.14 };

export const IGNIFER_PHASES: Form[] = [
  {
    ...P2, power: "pyro", title: "EVERY LAMP AT ONCE", guard: 0.88,
    blurb: "It stops lighting one lamp at a time and lights them all. The stair blazes from the ground to the sky.",
    body: "hsl(222 20% 15%)", glow: WICKLIGHT, a: BRASS, b: WICKLIGHT,
    moves: [
      M({ id: "hooked-lantern", name: "Hooked Lantern", kind: "pull", anim: "cast", range: 540, minRange: 110, cd: 4.6, dmg: 10, status: "burn", statusDur: 1, wind: 0.28 }),
      M({ id: "snuffed-step", name: "Snuffed Step", kind: "blink", anim: "slam", range: 500, cd: 5.4, dmg: 14, kb: 420, status: "blind", statusDur: 0.4, wind: 0.24 }),
    ],
  },
  {
    ...P3, power: "pyro", title: "BURNING AT BOTH ENDS", regen: 3,
    blurb: "It lights the bottom of its own candle. The wax runs, the flame roars, and it burns twice as bright for half as long.",
    body: "hsl(222 26% 10%)", glow: "hsl(40 100% 86%)", a: "hsl(24 100% 58%)", b: "hsl(0 0% 100%)", dark: "hsl(222 40% 5%)",
    moves: [
      M({ id: "lamplight-beam", name: "Lamplight", kind: "beam", anim: "thrust", range: 620, minRange: 80, cd: 4.6, dmg: 14, act: 0.32, status: "burn", statusDur: 1.2, wind: 0.32 }),
      M({ id: "ten-thousand-lamps", name: "Ten Thousand Lamps", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 15, radius: 60, world: true, status: "burn", statusDur: 1.6, wind: 0.6, rec: 0.32 }),
    ],
  },
];

/** Every move Ignifer can use, in any phase. */
export const IGNIFER_ALL_MOVES: Move[] = [...IGNIFER.moves, ...IGNIFER_PHASES.flatMap((p) => p.moves)];

// ---------- move looks ----------
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["pole-hook", BRASS, WICKLIGHT, "ember", { glyph: "fang", trail: "streak", motion: "steady", burst: "crack" }],
  ["tossed-wick", WICKLIGHT, "hsl(18 100% 56%)", "ember", { glyph: "drop", trail: "dots", motion: "wobble", burst: "scatter" }],
  ["lighting-run", "hsl(36 100% 64%)", SOOT, "ember", { glyph: "arrow", trail: "ribbon", motion: "steady", burst: "fountain" }],
  ["spilled-oil", "hsl(28 70% 30%)", WICKLIGHT, "smoke", { glyph: "drop", trail: "none", motion: "pulse", burst: "ring" }],
  ["falling-sparks", "hsl(40 100% 70%)", "hsl(14 100% 56%)", "ember", { glyph: "star", trail: "sparkle", motion: "spin", burst: "scatter" }],
  ["lamp-post", BRASS, "hsl(44 100% 80%)", "chunk", { glyph: "hex", trail: "none", motion: "pulse", burst: "fountain" }],
  ["trim-the-wick", WICKLIGHT, "hsl(40 30% 92%)", "ember", { glyph: "feather", trail: "none", motion: "pulse", burst: "spiral" }],
  ["hooked-lantern", BRASS, "hsl(222 24% 36%)", "ember", { glyph: "crescent", trail: "dots", motion: "pulse", burst: "spiral" }],
  ["snuffed-step", SOOT, WICKLIGHT, "smoke", { glyph: "cross", trail: "echo", motion: "pulse", burst: "crack" }],
  ["lamplight-beam", "hsl(42 100% 82%)", "hsl(20 100% 56%)", "ember", { glyph: "orb", trail: "ribbon", motion: "steady", burst: "ring" }],
  ["ten-thousand-lamps", "hsl(44 100% 88%)", "hsl(222 40% 10%)", "glyph", { glyph: "flower", trail: "none", motion: "pulse", burst: "ring" }],
];
const kindOf = new Map(IGNIFER_ALL_MOVES.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
