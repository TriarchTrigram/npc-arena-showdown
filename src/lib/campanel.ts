// Campanel, the Dawn Bell: the boss of Legacy Mode's Chapter 3. Every morning under Zenith's sky begins with one note
// rung at the foot of the stair, and Campanel is the bell that rings it. It joins the bosses' rebellion and holds its
// tongue, so no morning comes for anyone loyal to Zenith. A tall bell-ringer in a slate surplice whose head is a
// bronze bell with dawn light burning under the rim, a clapper swinging inside it, and a ringer's mallet in its hand.
// Beaten by the loyal bosses, it rings the dawn again. Its body is drawn in boss-designs.ts (surplice, bell head,
// mallet) and campanel-look.ts (sound rings, dawn glow).
import type { FighterDef, Move } from "./fighters";
import type { Form } from "./forms";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const SLATE = "hsl(214 24% 26%)";
export const BRONZE = "hsl(32 62% 46%)";
export const DAWNLIGHT = "hsl(28 100% 74%)";

export const CAMPANEL: FighterDef = {
  id: "aero", boss: "campanel", name: "Campanel", power: "The Dawn Note", role: "control",
  ability: "The bell at the foot of Zenith's stair. Every morning under the sky begins when it rings, and it has never once rung late. When Zenith tells it to hold its tongue, the sun waits with it.",
  color: SLATE, glow: DAWNLIGHT, hp: 880, speed: 100,
  moves: [
    M({ id: "clapper-strike", name: "Clapper Strike", kind: "melee", anim: "slam", range: 120, cd: 1, dmg: 13, kb: 380, status: "stun", statusDur: 0.16 }),
    M({ id: "rolling-toll", name: "Rolling Toll", kind: "projectile", anim: "thrust", range: 620, minRange: 90, cd: 2.4, dmg: 11, speed: 640, size: 22, pierce: true, shape: "wave", status: "slow", statusDur: 0.5 }),
    M({ id: "first-light", name: "First Light", kind: "beam", anim: "cast", range: 600, minRange: 80, cd: 4.4, dmg: 13, act: 0.3, status: "blind", statusDur: 0.6, wind: 0.3 }),
    M({ id: "toll-step", name: "Toll Step", kind: "blink", anim: "slam", range: 500, cd: 5.2, dmg: 14, kb: 400, status: "stun", statusDur: 0.26, wind: 0.24 }),
    M({ id: "great-peal", name: "The Great Peal", kind: "burst", anim: "raise", range: 190, cd: 5.4, dmg: 14, radius: 210, kb: 520, status: "stun", statusDur: 0.3, wind: 0.34, rec: 0.3 }),
    M({ id: "resonance", name: "Resonance", kind: "zone", anim: "slam", range: 440, cd: 8, dmg: 6, radius: 150, dur: 4.2, status: "slow", statusDur: 0.6, wind: 0.34 }),
    M({ id: "ringing-ground", name: "Ringing Ground", kind: "eruption", anim: "uppercut", range: 560, minRange: 40, cd: 4.8, dmg: 12, radius: 40, count: 3, lift: -480, wind: 0.3 }),
  ],
};

const P2 = { kind: "phase" as const, step: 2, at: 0.66, dmg: 1.14, kb: 1.1, cd: 0.86, speed: 1.06, act: 1.06 };
const P3 = { kind: "phase" as const, step: 3, at: 0.33, dmg: 1.3, kb: 1.2, cd: 0.74, speed: 1.12, act: 1.14 };

export const CAMPANEL_PHASES: Form[] = [
  {
    ...P2, power: "aero", title: "THE FIRST HOUR", guard: 0.88,
    blurb: "It rings the first hour of a morning that never came. The air in the arena hums, and every blow lands twice.",
    body: "hsl(214 26% 20%)", glow: DAWNLIGHT, a: BRONZE, b: DAWNLIGHT,
    moves: [
      M({ id: "swinging-arc", name: "Swinging Arc", kind: "dash", anim: "lunge", range: 440, cd: 4.6, dmg: 13, dist: 300, kb: 420, wind: 0.26 }),
      M({ id: "recall-toll", name: "Recall Toll", kind: "pull", anim: "cast", range: 540, minRange: 110, cd: 4.6, dmg: 10, status: "stun", statusDur: 0.2, wind: 0.28 }),
    ],
  },
  {
    ...P3, power: "aero", title: "THE BELL CRACKS", regen: 3,
    blurb: "A crack runs up the bronze, and the dawn it was holding back pours out of it. It rings with everything it has left.",
    body: "hsl(214 30% 14%)", glow: "hsl(36 100% 86%)", a: "hsl(28 100% 62%)", b: "hsl(0 0% 100%)", dark: "hsl(214 40% 6%)",
    moves: [
      M({ id: "shattered-chimes", name: "Shattered Chimes", kind: "rain", anim: "raise", range: 580, cd: 5.8, dmg: 9, count: 8, radius: 220, shape: "shard", status: "slow", statusDur: 0.5, wind: 0.34 }),
      M({ id: "dawn-chorus", name: "Dawn Chorus", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 15, radius: 60, world: true, status: "stun", statusDur: 0.4, wind: 0.6, rec: 0.32 }),
    ],
  },
];

/** Every move Campanel can use, in any phase. */
export const CAMPANEL_ALL_MOVES: Move[] = [...CAMPANEL.moves, ...CAMPANEL_PHASES.flatMap((p) => p.moves)];

// ---------- move looks ----------
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["clapper-strike", BRONZE, DAWNLIGHT, "spark", { glyph: "diamond", trail: "echo", motion: "steady", burst: "crack" }],
  ["rolling-toll", DAWNLIGHT, BRONZE, "spark", { glyph: "ring", trail: "echo", motion: "pulse", burst: "ring" }],
  ["first-light", "hsl(36 100% 84%)", "hsl(20 90% 60%)", "spark", { glyph: "star", trail: "dots", motion: "steady", burst: "ring" }],
  ["toll-step", SLATE, DAWNLIGHT, "smoke", { glyph: "ring", trail: "echo", motion: "pulse", burst: "crack" }],
  ["great-peal", BRONZE, DAWNLIGHT, "spark", { glyph: "ring", trail: "none", motion: "pulse", burst: "ring" }],
  ["resonance", "hsl(214 30% 36%)", DAWNLIGHT, "dust", { glyph: "ring", trail: "none", motion: "pulse", burst: "ring" }],
  ["ringing-ground", BRONZE, "hsl(36 100% 80%)", "shard", { glyph: "cube", trail: "none", motion: "pulse", burst: "fountain" }],
  ["swinging-arc", BRONZE, SLATE, "spark", { glyph: "arrow", trail: "streak", motion: "steady", burst: "crack" }],
  ["recall-toll", DAWNLIGHT, "hsl(214 30% 40%)", "spark", { glyph: "ring", trail: "dots", motion: "pulse", burst: "spiral" }],
  ["shattered-chimes", "hsl(32 70% 56%)", DAWNLIGHT, "shard", { glyph: "diamond", trail: "sparkle", motion: "spin", burst: "scatter" }],
  ["dawn-chorus", "hsl(36 100% 88%)", "hsl(214 40% 10%)", "glyph", { glyph: "star", trail: "none", motion: "pulse", burst: "ring" }],
];
const kindOf = new Map(CAMPANEL_ALL_MOVES.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
