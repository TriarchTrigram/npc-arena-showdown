// Tetrael, the four-winged herald: Zenith's own right hand, and the boss of stage 13 in Zenith's Chapter (Book 5).
// It is no Chosen and holds no gift: Zenith keeps it behind the throne, and in the stage 10 scene sends it down the
// stair to wait for the player (story-scene.tsx, `vision`). It laughs at everything. Its moves are its wings: feathers
// thrown, rained and cut, dives on the wind, and a beat of all four at once. Its four wings are its second layer
// (tetrael-look.ts, used by boss-looks.ts); its phases sit in BOSS_PHASES (bosses.ts).
import type { FighterDef, Move } from "./fighters";
import type { Form } from "./forms";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const ROSE = "hsl(336 100% 72%)";
export const PLUME = "hsl(44 90% 80%)";
const NIGHT = "hsl(264 28% 16%)";

export const TETRAEL: FighterDef = {
  id: "aero", boss: "tetrael", name: "Tetrael", power: "The Four Wings", role: "trickster",
  ability: "Zenith's own herald, kept behind the throne where none of the Chosen are allowed to stand. Four wings, a mask that never stops smiling, and a laugh you can hear all the way down the stair. It does whatever Zenith asks, and it enjoys every second of it.",
  color: NIGHT, glow: ROSE, hp: 880, speed: 110,
  moves: [
    M({ id: "wing-cleave", name: "Wing Cleave", kind: "melee", anim: "spin", range: 104, cd: 1, dmg: 13, kb: 300 }),
    M({ id: "quill-storm", name: "Quill Storm", kind: "projectile", anim: "thrust", range: 600, minRange: 80, cd: 2.4, dmg: 6, speed: 760, size: 10, count: 5, spread: 0.3, shape: "blade" }),
    M({ id: "four-winds-dive", name: "Four Winds Dive", kind: "dash", anim: "lunge", range: 440, cd: 3.8, dmg: 15, dist: 440, act: 0.24, kb: 360, lift: -220 }),
    M({ id: "plume-fall", name: "Plume Fall", kind: "rain", anim: "raise", range: 580, cd: 5, dmg: 9, count: 9, radius: 200, shape: "blade", status: "slow", statusDur: 0.5, wind: 0.34 }),
    M({ id: "halo-split", name: "Halo Split", kind: "beam", anim: "cast", range: 640, minRange: 70, cd: 3.8, dmg: 15, act: 0.32, status: "blind", statusDur: 0.6, wind: 0.3 }),
    M({ id: "feather-snare", name: "Feather Snare", kind: "pull", anim: "cast", range: 500, minRange: 110, cd: 4.4, dmg: 11, status: "slow", statusDur: 0.8, wind: 0.26 }),
    M({ id: "mocking-step", name: "Mocking Step", kind: "blink", anim: "kick", range: 660, minRange: 110, cd: 3.6, dmg: 15, kb: 340, lift: -280 }),
  ],
};

const P2 = { kind: "phase" as const, step: 2, at: 0.75, dmg: 1.14, kb: 1.1, cd: 0.86, speed: 1.06, act: 1.06 };
const P3 = { kind: "phase" as const, step: 3, at: 0.5, dmg: 1.28, kb: 1.16, cd: 0.76, speed: 1.12, act: 1.12 };
const P4 = { kind: "phase" as const, step: 4, at: 0.25, dmg: 1.44, kb: 1.26, cd: 0.66, speed: 1.2, act: 1.2 };

export const TETRAEL_PHASES: Form[] = [
  {
    ...P2, power: "aero", title: "THE FIRST PAIR OPENS", dodge: 0.12,
    blurb: "Its upper wings open all the way for the first time. It slips some hits on the draught they make, and throws quills that go straight through.",
    body: "hsl(264 30% 20%)", glow: ROSE, a: "hsl(336 90% 64%)", b: PLUME,
    moves: [
      M({ id: "rose-quill", name: "Rose Quill", kind: "projectile", anim: "thrust", range: 660, minRange: 80, cd: 3.2, dmg: 16, speed: 620, size: 16, pierce: true, kb: 380, shape: "blade" }),
      M({ id: "wingbeat", name: "Wingbeat", kind: "burst", anim: "raise", range: 170, cd: 6, dmg: 14, radius: 200, kb: 520, lift: -320, wind: 0.32, rec: 0.32 }),
    ],
  },
  {
    ...P3, power: "aero", title: "GILDED LAUGHTER", drain: 0.1,
    blurb: "Its laugh turns to gold light in the air and hangs there. Every hit it lands takes a little health back.",
    body: "hsl(40 40% 30%)", glow: PLUME, a: "hsl(44 100% 66%)", b: ROSE,
    moves: [
      M({ id: "gilded-laughter", name: "Gilded Laughter", kind: "zone", anim: "raise", range: 420, cd: 9, dmg: 6, radius: 160, dur: 4.5, pullIn: 140, status: "slow", statusDur: 0.6, wind: 0.36 }),
      M({ id: "heavens-talon", name: "Heaven's Talon", kind: "melee", anim: "slam", range: 112, cd: 2.2, dmg: 21, kb: 560, lift: -280, status: "stun", statusDur: 0.3, wind: 0.28 }),
    ],
  },
  {
    ...P4, power: "aero", title: "ALL FOUR WINGS", guard: 0.8,
    blurb: "All four wings spread at once and blot out the sky. The last beat of them throws the whole stair into the air.",
    body: "hsl(0 0% 96%)", glow: ROSE, a: "hsl(336 100% 70%)", b: "hsl(0 0% 100%)", dark: "hsl(264 50% 6%)",
    moves: [
      M({ id: "last-laugh", name: "The Last Laugh", kind: "eruption", anim: "uppercut", range: 600, minRange: 40, cd: 5.6, dmg: 14, radius: 50, count: 4, lift: -720, wind: 0.34 }),
      M({ id: "four-wing-eclipse", name: "Four Wing Eclipse", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 15, radius: 60, world: true, status: "blind", statusDur: 0.8, wind: 0.55, rec: 0.3 }),
    ],
  },
];

/** Every move Tetrael can use, in any phase (for the boss looks that mark its hits). */
export const TETRAEL_ALL_MOVES: Move[] = [...TETRAEL.moves, ...TETRAEL_PHASES.flatMap((p) => p.moves)];

// ---------- move looks ----------
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["wing-cleave", ROSE, PLUME, "petal", { glyph: "feather", trail: "echo", motion: "spin", burst: "scatter" }],
  ["quill-storm", PLUME, ROSE, "petal", { glyph: "feather", trail: "streak", motion: "steady", burst: "scatter" }],
  ["four-winds-dive", "hsl(336 90% 66%)", "hsl(0 0% 100%)", "petal", { glyph: "arrow", trail: "ribbon", motion: "steady", burst: "fountain" }],
  ["plume-fall", PLUME, "hsl(336 80% 76%)", "petal", { glyph: "feather", trail: "sparkle", motion: "wobble", burst: "scatter" }],
  ["halo-split", "hsl(0 0% 100%)", ROSE, "spark", { glyph: "ring", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["wingbeat", ROSE, "hsl(264 60% 70%)", "petal", { glyph: "feather", trail: "none", motion: "pulse", burst: "ring" }],
  ["rose-quill", "hsl(336 100% 70%)", "hsl(0 0% 100%)", "petal", { glyph: "feather", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["mocking-step", "hsl(336 100% 74%)", PLUME, "petal", { glyph: "crescent", trail: "echo", motion: "steady", burst: "spiral" }],
  ["feather-snare", PLUME, "hsl(264 60% 70%)", "petal", { glyph: "feather", trail: "ribbon", motion: "wobble", burst: "spiral" }],
  ["gilded-laughter", "hsl(44 100% 70%)", ROSE, "star", { glyph: "crescent", trail: "none", motion: "spin", burst: "spiral" }],
  ["heavens-talon", "hsl(0 0% 100%)", "hsl(44 100% 70%)", "spark", { glyph: "fang", trail: "echo", motion: "pulse", burst: "crack" }],
  ["last-laugh", ROSE, "hsl(0 0% 100%)", "petal", { glyph: "crescent", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["four-wing-eclipse", "hsl(264 60% 60%)", ROSE, "petal", { glyph: "feather", trail: "none", motion: "spin", burst: "ring" }],
];
const kindOf = new Map(TETRAEL_ALL_MOVES.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
