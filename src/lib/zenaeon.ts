// Zenaeon: Zenith and Aeon fused into one being, the highest light and the first. It exists only for the last fight of
// Legacy Mode's Chapter 6: when Carnael breaks Zenith's guard, Aeon comes down and the two old lights become one to
// take the reaper down (the "clash" scene in story-scene.tsx). It fights on the player's side of that stage alone.
// Its body is Aeon's (one great eye of white fire, boss-designs.ts) wearing Zenith's crown and gauntlets (zenaeon-look.ts).
import type { FighterDef, Move } from "./fighters";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const DAWN = "hsl(46 100% 72%)";
const DEEP = "hsl(226 48% 20%)";

export const ZENAEON: FighterDef = {
  id: "lux", boss: "zenaeon", name: "Zenaeon", power: "The Highest Light", role: "control",
  ability: "Zenith and Aeon as one being: the light that lit the first sky and the one that rules the top of it. It only exists while Carnael does, and it has one thing to do.",
  color: DEEP, glow: DAWN, hp: 1780, speed: 122,
  moves: [
    M({ id: "twin-dawn-strike", name: "Twin Dawn Strike", kind: "melee", anim: "jab", range: 108, cd: 0.78, dmg: 20, kb: 360 }),
    M({ id: "first-and-highest", name: "First and Highest", kind: "beam", anim: "cast", range: 760, minRange: 70, cd: 3.1, dmg: 24, act: 0.34, status: "blind", statusDur: 0.6, wind: 0.28 }),
    M({ id: "crown-of-stars", name: "Crown of Stars", kind: "rain", anim: "raise", range: 640, cd: 4.4, dmg: 13, count: 10, radius: 220, shape: "orb", wind: 0.3 }),
    M({ id: "sky-splitter", name: "Sky Splitter", kind: "projectile", anim: "thrust", range: 700, minRange: 80, cd: 2.2, dmg: 16, speed: 820, size: 20, pierce: true, shape: "disc", kb: 360 }),
    M({ id: "armillary-wheel", name: "Armillary Wheel", kind: "zone", anim: "raise", range: 460, cd: 7.8, dmg: 10, radius: 190, dur: 4.8, erase: true, status: "slow", statusDur: 0.7, wind: 0.32 }),
    M({ id: "ascension-step", name: "Ascension Step", kind: "blink", anim: "kick", range: 680, minRange: 100, cd: 3.2, dmg: 22, kb: 400, lift: -320 }),
    M({ id: "dawnfall", name: "Dawnfall", kind: "burst", anim: "slam", range: 210, cd: 5.8, dmg: 25, radius: 250, kb: 600, lift: -380, wind: 0.32, rec: 0.3 }),
    M({ id: "light-before-light", name: "Light Before Light", kind: "heal", anim: "raise", range: 2000, cd: 12, dmg: 0, heal: 85, below: 0.55, wind: 0.36, act: 0.28 }),
    M({ id: "eternal-meridian", name: "Eternal Meridian", kind: "beam", anim: "thrust", range: 900, minRange: 60, cd: 3.6, dmg: 26, act: 0.38, kb: 480, status: "stun", statusDur: 0.4, wind: 0.32 }),
    M({ id: "first-sky-judgment", name: "First Sky Judgment", kind: "burst", anim: "raise", range: 2000, cd: 10.5, dmg: 23, radius: 75, world: true, status: "blind", statusDur: 0.6, wind: 0.44, rec: 0.28 }),
  ],
};

// ---------- move looks ----------
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["twin-dawn-strike", DAWN, "hsl(0 0% 100%)", "star", { glyph: "star", trail: "echo", motion: "steady", burst: "crack" }],
  ["first-and-highest", "hsl(0 0% 100%)", DAWN, "spark", { glyph: "eye", trail: "streak", motion: "steady", burst: "ring" }],
  ["crown-of-stars", DAWN, "hsl(210 100% 86%)", "star", { glyph: "star", trail: "sparkle", motion: "spin", burst: "scatter" }],
  ["sky-splitter", "hsl(210 100% 80%)", DAWN, "spark", { glyph: "ring", trail: "ribbon", motion: "spin", burst: "crack" }],
  ["armillary-wheel", DAWN, "hsl(226 60% 50%)", "star", { glyph: "ring", trail: "none", motion: "spin", burst: "spiral" }],
  ["ascension-step", "hsl(0 0% 100%)", DAWN, "star", { glyph: "arrow", trail: "echo", motion: "steady", burst: "fountain" }],
  ["dawnfall", DAWN, "hsl(0 0% 100%)", "star", { glyph: "eye", trail: "none", motion: "pulse", burst: "ring" }],
  ["light-before-light", "hsl(0 0% 100%)", DAWN, "star", { glyph: "star", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["eternal-meridian", "hsl(0 0% 100%)", "hsl(210 100% 82%)", "spark", { glyph: "diamond", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["first-sky-judgment", DAWN, "hsl(0 0% 100%)", "star", { glyph: "star", trail: "none", motion: "pulse", burst: "ring" }],
];
const kindOf = new Map(ZENAEON.moves.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
