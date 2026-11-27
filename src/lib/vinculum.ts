// Vinculum, the Chain Warden: the boss of Legacy Mode's Chapter 5. The jailer Zenith set under its stair to keep
// Carnael's cell shut. It joins the bosses' rebellion, which promised it an end to
// guarding, and goes down to open the cell; its lock breaking frees Carnael. A hulking figure of riveted iron with a padlock for a face, chains wrapped round its
// body and a great chain flail ending in a lock in its hand. Beaten by the loyal bosses, too late to shut the door.
// Its body is drawn in boss-designs.ts (armour, chains, the flail) and vinculum-look.ts (keyring, padlock face, cell bars).
import type { FighterDef, Move } from "./fighters";
import type { Form } from "./forms";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.22,
  act: 0.12,
  rec: 0.26,
  ...m,
});

export const IRON = "hsl(212 12% 30%)";
export const RUST = "hsl(18 62% 40%)";
export const KEYLIGHT = "hsl(44 100% 64%)";

export const VINCULUM: FighterDef = {
  id: "magneto", boss: "vinculum", name: "Vinculum", power: "The Chain Warden", role: "tank",
  ability: "The jailer Zenith set under its stair to keep Carnael's cell shut. It made the lock, made the key and swallowed the key. Every link of its chains is a sentence, and it has never let a prisoner walk.",
  color: IRON, glow: KEYLIGHT, hp: 980, speed: 92,
  moves: [
    M({ id: "shackle-swing", name: "Shackle Swing", kind: "melee", anim: "slam", range: 126, cd: 1.05, dmg: 15, kb: 400, status: "stun", statusDur: 0.22 }),
    M({ id: "flung-padlock", name: "Flung Padlock", kind: "projectile", anim: "thrust", range: 620, minRange: 90, cd: 2.5, dmg: 13, speed: 640, size: 20, shape: "disc", arc: true, kb: 320 }),
    M({ id: "drag-to-the-cell", name: "Drag to the Cell", kind: "pull", anim: "cast", range: 560, minRange: 110, cd: 4, dmg: 12, status: "slow", statusDur: 1, wind: 0.28 }),
    M({ id: "turnkey-charge", name: "Turnkey Charge", kind: "dash", anim: "lunge", range: 440, cd: 4.2, dmg: 16, dist: 440, act: 0.26, kb: 440, lift: -180 }),
    M({ id: "bars-rise", name: "The Bars Rise", kind: "eruption", anim: "uppercut", range: 560, minRange: 40, cd: 5.2, dmg: 13, radius: 40, count: 4, lift: -520, status: "stun", statusDur: 0.3, wind: 0.32 }),
    M({ id: "iron-cell", name: "Iron Cell", kind: "zone", anim: "slam", range: 420, cd: 9, dmg: 6, radius: 160, dur: 5, pullIn: 150, status: "slow", statusDur: 0.6, wind: 0.38 }),
    M({ id: "falling-links", name: "Falling Links", kind: "rain", anim: "raise", range: 560, cd: 5.8, dmg: 10, count: 7, radius: 200, shape: "rock", status: "slow", statusDur: 0.4, wind: 0.34 }),
  ],
};

const P2 = { kind: "phase" as const, step: 2, at: 0.75, dmg: 1.14, kb: 1.12, cd: 0.86, speed: 1.05, act: 1.06 };
const P3 = { kind: "phase" as const, step: 3, at: 0.5, dmg: 1.28, kb: 1.18, cd: 0.76, speed: 1.1, act: 1.12 };
const P4 = { kind: "phase" as const, step: 4, at: 0.25, dmg: 1.44, kb: 1.28, cd: 0.66, speed: 1.16, act: 1.2 };

export const VINCULUM_PHASES: Form[] = [
  {
    ...P2, power: "magneto", title: "THE KEYS TURN", guard: 0.86,
    blurb: "Every lock on its body turns at once. Its iron plates bolt shut, and blows ring off them like a bell.",
    body: "hsl(212 14% 24%)", glow: KEYLIGHT, a: "hsl(212 10% 56%)", b: KEYLIGHT,
    moves: [
      M({ id: "chain-line", name: "Chain Line", kind: "beam", anim: "cast", range: 640, minRange: 70, cd: 4, dmg: 15, act: 0.32, status: "slow", statusDur: 0.7, wind: 0.32 }),
      M({ id: "toll-of-keys", name: "Toll of the Keys", kind: "burst", anim: "raise", range: 190, cd: 6.4, dmg: 16, radius: 220, kb: 520, lift: -300, status: "stun", statusDur: 0.3, wind: 0.36, rec: 0.32 }),
    ],
  },
  {
    ...P3, power: "magneto", title: "A THOUSAND CELLS", regen: 4,
    blurb: "It calls up every empty cell under the stair. Bars close round the field, and the rust on its plates seals over as fast as it cracks.",
    body: "hsl(18 40% 22%)", glow: "hsl(30 100% 60%)", a: RUST, b: KEYLIGHT,
    moves: [
      M({ id: "manacle-volley", name: "Manacle Volley", kind: "projectile", anim: "spin", range: 600, minRange: 70, cd: 3.2, dmg: 9, speed: 720, size: 14, count: 3, spread: 0.28, shape: "disc", status: "slow", statusDur: 0.5 }),
      M({ id: "solitary", name: "Solitary", kind: "blink", anim: "slam", range: 520, cd: 5.6, dmg: 17, kb: 460, status: "stun", statusDur: 0.4, wind: 0.3 }),
    ],
  },
  {
    ...P4, power: "magneto", title: "LIFE SENTENCE", guard: 0.8,
    blurb: "The keyhole in its face burns white. It reads the sentence out loud, and the whole field is the cell.",
    body: "hsl(212 18% 14%)", glow: "hsl(44 100% 78%)", a: "hsl(44 100% 62%)", b: "hsl(0 0% 100%)", dark: "hsl(212 30% 6%)",
    moves: [
      M({ id: "lockdown", name: "Lockdown", kind: "eruption", anim: "uppercut", range: 640, minRange: 40, cd: 5.4, dmg: 14, radius: 48, count: 6, lift: -640, status: "stun", statusDur: 0.35, wind: 0.34 }),
      M({ id: "the-sentence", name: "The Sentence", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 16, radius: 60, world: true, status: "slow", statusDur: 1.2, wind: 0.6, rec: 0.32 }),
    ],
  },
];

/** Every move Vinculum can use, in any phase. */
export const VINCULUM_ALL_MOVES: Move[] = [...VINCULUM.moves, ...VINCULUM_PHASES.flatMap((p) => p.moves)];

// ---------- move looks ----------
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["shackle-swing", "hsl(212 10% 62%)", KEYLIGHT, "spark", { glyph: "ring", trail: "echo", motion: "steady", burst: "crack" }],
  ["flung-padlock", "hsl(212 12% 44%)", KEYLIGHT, "chunk", { glyph: "cube", trail: "dots", motion: "wobble", burst: "crack" }],
  ["drag-to-the-cell", "hsl(212 10% 56%)", RUST, "spark", { glyph: "ring", trail: "dots", motion: "steady", burst: "spiral" }],
  ["turnkey-charge", IRON, KEYLIGHT, "dust", { glyph: "arrow", trail: "echo", motion: "steady", burst: "fountain" }],
  ["bars-rise", "hsl(212 12% 50%)", KEYLIGHT, "shard", { glyph: "cross", trail: "none", motion: "pulse", burst: "fountain" }],
  ["iron-cell", "hsl(212 14% 34%)", KEYLIGHT, "dust", { glyph: "hex", trail: "none", motion: "steady", burst: "ring" }],
  ["falling-links", "hsl(212 8% 58%)", RUST, "chunk", { glyph: "ring", trail: "streak", motion: "spin", burst: "scatter" }],
  ["chain-line", "hsl(212 10% 66%)", KEYLIGHT, "spark", { glyph: "diamond", trail: "dots", motion: "steady", burst: "crack" }],
  ["toll-of-keys", KEYLIGHT, "hsl(212 12% 40%)", "spark", { glyph: "star", trail: "none", motion: "spin", burst: "ring" }],
  ["manacle-volley", RUST, "hsl(212 10% 60%)", "chunk", { glyph: "ring", trail: "streak", motion: "spin", burst: "scatter" }],
  ["solitary", "hsl(212 20% 12%)", KEYLIGHT, "smoke", { glyph: "eye", trail: "echo", motion: "pulse", burst: "crack" }],
  ["lockdown", KEYLIGHT, "hsl(0 0% 100%)", "shard", { glyph: "cross", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["the-sentence", "hsl(44 100% 70%)", "hsl(212 30% 8%)", "glyph", { glyph: "hex", trail: "none", motion: "spin", burst: "ring" }],
];
const kindOf = new Map(VINCULUM_ALL_MOVES.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
