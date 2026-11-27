// Obolus, the Tithe Taker: the boss of Legacy Mode's Chapter 2. The collector who keeps Zenith's ledger of every light
// the villages owe. It turns rebel and carries the tithe of light off to the rebels' camp instead of up the stair. A
// gaunt figure in a long plum collector's robe, a gold mask with a coin slot for a mouth under a tall cap, a collar of
// coins, and a great balance scale on a staff in its hand. Beaten by the loyal bosses, it gives the stolen light back. Its body is drawn in boss-designs.ts (robe, mask, scale) and obolus-look.ts (coins, ledger glow).
import type { FighterDef, Move } from "./fighters";
import type { Form } from "./forms";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const PLUM = "hsl(282 30% 26%)";
export const TITHE_GOLD = "hsl(42 88% 54%)";
export const COINLIGHT = "hsl(50 100% 80%)";

export const OBOLUS: FighterDef = {
  id: "lux", boss: "obolus", name: "Obolus", power: "The Light Tithe", role: "control",
  ability: "The collector who keeps Zenith's ledger. Every lamp lit under the sky is written in it, and every village pays its share of light up the stair. It has never once left a village with less than it was owed.",
  color: PLUM, glow: COINLIGHT, hp: 860, speed: 104,
  moves: [
    M({ id: "weighing-blow", name: "Weighing Blow", kind: "melee", anim: "slam", range: 118, cd: 1, dmg: 13, kb: 360, status: "stun", statusDur: 0.18 }),
    M({ id: "tithe-coins", name: "Tithe Coins", kind: "projectile", anim: "thrust", range: 600, minRange: 80, cd: 2.3, dmg: 8, speed: 760, size: 12, count: 3, spread: 0.22, shape: "disc" }),
    M({ id: "appraisal", name: "Appraisal", kind: "beam", anim: "cast", range: 620, minRange: 70, cd: 4.2, dmg: 13, act: 0.3, status: "slow", statusDur: 0.8, wind: 0.3 }),
    M({ id: "debt-comes-due", name: "The Debt Comes Due", kind: "blink", anim: "slam", range: 520, cd: 5, dmg: 15, kb: 420, status: "stun", statusDur: 0.3, wind: 0.26 }),
    M({ id: "scales-tip", name: "The Scales Tip", kind: "burst", anim: "raise", range: 180, cd: 5.6, dmg: 14, radius: 200, kb: 480, lift: -260, wind: 0.32, rec: 0.3 }),
    M({ id: "gold-rain", name: "Rain of Gold", kind: "rain", anim: "raise", range: 560, cd: 6, dmg: 9, count: 8, radius: 210, shape: "orb", status: "blind", statusDur: 0.5, wind: 0.34 }),
    M({ id: "collection", name: "Collection", kind: "heal", anim: "cast", range: 2000, cd: 14, dmg: 0, heal: 40, below: 0.5, wind: 0.5, act: 0.4 }),
  ],
};

const P2 = { kind: "phase" as const, step: 2, at: 0.66, dmg: 1.14, kb: 1.1, cd: 0.86, speed: 1.06, act: 1.06 };
const P3 = { kind: "phase" as const, step: 3, at: 0.33, dmg: 1.3, kb: 1.2, cd: 0.74, speed: 1.12, act: 1.14 };

export const OBOLUS_PHASES: Form[] = [
  {
    ...P2, power: "lux", title: "WITH INTEREST", guard: 0.88,
    blurb: "It opens the ledger and reads out what you owe. The sum grows with every line, and so does it.",
    body: "hsl(282 32% 20%)", glow: COINLIGHT, a: TITHE_GOLD, b: COINLIGHT,
    moves: [
      M({ id: "toll-gate", name: "Toll Gate", kind: "zone", anim: "slam", range: 420, cd: 8.5, dmg: 6, radius: 150, dur: 4.5, pullIn: 120, status: "slow", statusDur: 0.6, wind: 0.36 }),
      M({ id: "seize-the-lamp", name: "Seize the Lamp", kind: "pull", anim: "cast", range: 540, minRange: 110, cd: 4.4, dmg: 11, status: "blind", statusDur: 0.6, wind: 0.28 }),
    ],
  },
  {
    ...P3, power: "lux", title: "THE FINAL TALLY", regen: 3,
    blurb: "Every coin it ever took rises out of the ground at once. It is collecting the whole valley now, not just you.",
    body: "hsl(282 40% 14%)", glow: "hsl(50 100% 88%)", a: "hsl(46 100% 62%)", b: "hsl(0 0% 100%)", dark: "hsl(282 40% 6%)",
    moves: [
      M({ id: "gilded-floor", name: "Gilded Floor", kind: "eruption", anim: "uppercut", range: 600, minRange: 40, cd: 5.2, dmg: 13, radius: 42, count: 5, lift: -560, wind: 0.32 }),
      M({ id: "light-tax", name: "Light Tax", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 15, radius: 60, world: true, status: "blind", statusDur: 1, wind: 0.6, rec: 0.32 }),
    ],
  },
];

/** Every move Obolus can use, in any phase. */
export const OBOLUS_ALL_MOVES: Move[] = [...OBOLUS.moves, ...OBOLUS_PHASES.flatMap((p) => p.moves)];

// ---------- move looks ----------
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["weighing-blow", TITHE_GOLD, COINLIGHT, "spark", { glyph: "diamond", trail: "echo", motion: "steady", burst: "crack" }],
  ["tithe-coins", TITHE_GOLD, "hsl(36 70% 36%)", "chunk", { glyph: "ring", trail: "streak", motion: "spin", burst: "scatter" }],
  ["appraisal", COINLIGHT, TITHE_GOLD, "spark", { glyph: "eye", trail: "dots", motion: "steady", burst: "ring" }],
  ["debt-comes-due", PLUM, COINLIGHT, "smoke", { glyph: "cross", trail: "echo", motion: "pulse", burst: "crack" }],
  ["scales-tip", TITHE_GOLD, PLUM, "spark", { glyph: "star", trail: "none", motion: "spin", burst: "ring" }],
  ["gold-rain", "hsl(46 100% 62%)", COINLIGHT, "glyph", { glyph: "ring", trail: "sparkle", motion: "spin", burst: "scatter" }],
  ["collection", COINLIGHT, "hsl(282 30% 40%)", "glyph", { glyph: "ring", trail: "sparkle", motion: "pulse", burst: "spiral" }],
  ["toll-gate", "hsl(282 30% 30%)", TITHE_GOLD, "dust", { glyph: "hex", trail: "none", motion: "steady", burst: "ring" }],
  ["seize-the-lamp", TITHE_GOLD, "hsl(282 30% 40%)", "spark", { glyph: "arrow", trail: "dots", motion: "steady", burst: "spiral" }],
  ["gilded-floor", "hsl(46 100% 60%)", COINLIGHT, "shard", { glyph: "cube", trail: "none", motion: "pulse", burst: "fountain" }],
  ["light-tax", "hsl(50 100% 86%)", "hsl(282 40% 10%)", "glyph", { glyph: "hex", trail: "none", motion: "spin", burst: "ring" }],
];
const kindOf = new Map(OBOLUS_ALL_MOVES.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
