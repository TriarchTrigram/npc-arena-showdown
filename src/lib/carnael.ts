// Carnael, the Red Harvest: the boss of Legacy Mode's Chapter 6, the finale. A four-winged reaper in black and red, sealed under
// Zenith's stair before the first Chosen was made. Zenith's light held the seal shut; the rebellion dimmed that light,
// and the seal broke. Its scythe is the Hollow King's kind of blade, only longer, red and hungrier. It fights Zenith in
// the chapter's last scene, and Zenith and Aeon fuse into Zenaeon to take it down (zenaeon.ts).
// It is a little stronger than Zenith: more health and harder phases (Zenith is 1000 health). The light it reaped from
// Zenith's seal came out dark, so besides its own scythe work it fights with dark copies of Zenith's moves, black and red
// where Zenith's are gold (each one names the Zenith move it mirrors). Zenaeon is tuned to stay ahead of it.
// Its body is drawn in boss-designs.ts (the red scythe, horns and robe) and carnael-look.ts (its four wings).
import type { FighterDef, Move } from "./fighters";
import type { Form } from "./forms";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const BLOOD = "hsl(356 92% 52%)";
export const EMBER = "hsl(8 100% 66%)";
export const CHAR = "hsl(350 30% 7%)";

export const CARNAEL: FighterDef = {
  id: "umbra", boss: "carnael", name: "Carnael", power: "The Red Harvest", role: "attacker",
  ability: "A four-winged reaper sealed under Zenith's stair before the first Chosen was made. It reaps light the way the Hollow King reaps souls, and it has been hungry for a very long time. Its scythe is red to the shaft. It drank Zenith's light through the seal for an age, and it fights with dark copies of Zenith's own moves.",
  color: CHAR, glow: BLOOD, hp: 1380, speed: 116,
  moves: [
    M({ id: "red-reap", name: "Red Reap", kind: "melee", anim: "slam", range: 124, cd: 0.9, dmg: 17, kb: 360, status: "burn", statusDur: 0.6 }),
    M({ id: "blood-crescent", name: "Blood Crescent", kind: "projectile", anim: "thrust", range: 660, minRange: 80, cd: 2.6, dmg: 13, speed: 700, size: 22, pierce: true, shape: "blade", kb: 300 }),
    M({ id: "harvest-hook", name: "Harvest Hook", kind: "pull", anim: "cast", range: 520, minRange: 110, cd: 4.2, dmg: 12, status: "slow", statusDur: 0.8, wind: 0.26 }),
    M({ id: "carrion-dive", name: "Carrion Dive", kind: "dash", anim: "lunge", range: 460, cd: 3.8, dmg: 16, dist: 460, act: 0.24, kb: 380, lift: -240 }),
    M({ id: "red-furrows", name: "Red Furrows", kind: "eruption", anim: "uppercut", range: 560, minRange: 40, cd: 5.2, dmg: 13, radius: 46, count: 3, lift: -600, status: "burn", statusDur: 0.6, wind: 0.32 }),
    M({ id: "killing-field", name: "Killing Field", kind: "zone", anim: "slam", range: 420, cd: 9, dmg: 7, radius: 170, dur: 4.5, pullIn: 130, status: "burn", statusDur: 0.6, wind: 0.36 }),
    M({ id: "reaping-wheel", name: "Reaping Wheel", kind: "burst", anim: "raise", range: 180, cd: 6.5, dmg: 18, radius: 220, kb: 560, lift: -320, wind: 0.34, rec: 0.32 }),
    // dark copies of Zenith: Meridian Lance, Meridian Step, Breath of God
    M({ id: "eclipse-lance", name: "Eclipse Lance", kind: "beam", anim: "cast", range: 640, minRange: 70, cd: 3.4, dmg: 16, act: 0.34, status: "blind", statusDur: 0.6, wind: 0.32 }),
    M({ id: "grave-step", name: "Grave Step", kind: "blink", anim: "slam", range: 660, minRange: 110, cd: 3.8, dmg: 15, kb: 340, lift: -280 }),
    M({ id: "breath-of-the-grave", name: "Breath of the Grave", kind: "heal", anim: "raise", range: 2000, cd: 18, dmg: 0, heal: 55, below: 0.35, wind: 0.42 }),
    // more dark copies of Zenith, to open with 17 moves the same as Zenith: Crown Strike, Divine Knuckle, Palm of
    // Heaven, Noon Flare, Solar Crown, Starcrown Rain, Sky Tether
    M({ id: "black-crown", name: "Black Crown", kind: "melee", anim: "thrust", range: 82, cd: 0.9, dmg: 12, kb: 300 }),
    M({ id: "black-knuckle", name: "Black Knuckle", kind: "projectile", anim: "thrust", range: 640, minRange: 80, cd: 3.2, dmg: 19, speed: 560, size: 20, pierce: true, kb: 440, shape: "blade" }),
    M({ id: "palm-of-the-grave", name: "Palm of the Grave", kind: "beam", anim: "thrust", range: 640, minRange: 70, cd: 4, dmg: 18, act: 0.34, kb: 320, status: "blind", statusDur: 0.6, wind: 0.3 }),
    M({ id: "dusk-flare", name: "Dusk Flare", kind: "burst", anim: "raise", range: 160, cd: 7, dmg: 17, radius: 200, kb: 500, lift: -360, status: "burn", statusDur: 0.5, wind: 0.34, rec: 0.35 }),
    M({ id: "grave-crown", name: "Grave Crown", kind: "dash", anim: "lunge", range: 440, cd: 4.2, dmg: 17, dist: 440, act: 0.24, kb: 420, lift: -240 }),
    M({ id: "deathcrown-rain", name: "Deathcrown Rain", kind: "rain", anim: "raise", range: 600, cd: 5, dmg: 11, count: 10, radius: 210, shape: "shard", status: "burn", statusDur: 0.4 }),
    M({ id: "grave-tether", name: "Grave Tether", kind: "pull", anim: "cast", range: 480, minRange: 110, cd: 4, dmg: 11, status: "slow", statusDur: 0.8, wind: 0.26 }),
    M({ id: "reaper-rend", name: "Reaper Rend", kind: "melee", anim: "spin", range: 132, cd: 1.4, dmg: 19, kb: 400, status: "burn", statusDur: 0.7 }),
    M({ id: "scarlet-barrage", name: "Scarlet Barrage", kind: "projectile", anim: "cast", range: 640, minRange: 80, cd: 3.4, dmg: 11, speed: 740, size: 15, count: 5, spread: 0.4, pierce: true, shape: "blade", kb: 260 }),
    M({ id: "crimson-vortex", name: "Crimson Vortex", kind: "zone", anim: "raise", range: 460, cd: 8.5, dmg: 9, radius: 190, dur: 4.8, pullIn: 160, status: "slow", statusDur: 0.8, wind: 0.34 }),
  ],
};

const P2 = { kind: "phase" as const, step: 2, at: 0.75, dmg: 1.32, kb: 1.18, cd: 0.78, speed: 1.12, act: 1.12 };
const P3 = { kind: "phase" as const, step: 3, at: 0.5, dmg: 1.5, kb: 1.28, cd: 0.68, speed: 1.2, act: 1.2 };
const P4 = { kind: "phase" as const, step: 4, at: 0.25, dmg: 1.75, kb: 1.4, cd: 0.54, speed: 1.28, act: 1.28 };

export const CARNAEL_PHASES: Form[] = [
  {
    ...P2, power: "umbra", title: "THE RED HARVEST", drain: 0.16,
    blurb: "Its blade drinks every hit. The light it reaps runs down the shaft in red rivers and closes its wounds.",
    body: "hsl(350 34% 9%)", glow: BLOOD, a: "hsl(356 90% 48%)", b: EMBER,
    moves: [
      M({ id: "severing-line", name: "Severing Line", kind: "beam", anim: "cast", range: 660, minRange: 70, cd: 3.8, dmg: 16, act: 0.3, status: "burn", statusDur: 0.6, wind: 0.3 }),
      // dark copies of Zenith: Tithe of Ages, Zenith Fall
      M({ id: "red-tithe", name: "Red Tithe", kind: "burst", anim: "raise", range: 2000, cd: 14, dmg: 12, radius: 60, harvest: true, heal: 9, wind: 0.48, rec: 0.3 }),
      M({ id: "nightfall", name: "Nightfall", kind: "rain", anim: "raise", range: 560, cd: 5.4, dmg: 9, count: 7, radius: 180, shape: "shard", status: "blind", statusDur: 0.4, wind: 0.36, rec: 0.3 }),
      M({ id: "thousand-cuts", name: "Thousand Cuts", kind: "rain", anim: "raise", range: 580, cd: 5.2, dmg: 9, count: 9, radius: 210, shape: "blade", status: "slow", statusDur: 0.5, wind: 0.34 }),
      M({ id: "blood-surge", name: "Blood Surge", kind: "dash", anim: "lunge", range: 520, cd: 3.2, dmg: 21, dist: 520, act: 0.22, kb: 440, lift: -300, status: "burn", statusDur: 0.8 }),
      M({ id: "sanguine-spire", name: "Sanguine Spire", kind: "eruption", anim: "uppercut", range: 600, minRange: 40, cd: 4.8, dmg: 16, radius: 52, count: 4, lift: -680, status: "burn", statusDur: 0.7, wind: 0.3 }),
    ],
  },
  {
    ...P3, power: "umbra", title: "FOUR WINGS OF RUIN", dodge: 0.18,
    blurb: "All four wings tear open, ragged and dripping red. It slips hits on their wind and cuts the air with their edges.",
    body: "hsl(354 50% 12%)", glow: "hsl(2 100% 60%)", a: "hsl(0 0% 6%)", b: BLOOD,
    moves: [
      M({ id: "wing-shear", name: "Wing Shear", kind: "projectile", anim: "spin", range: 620, minRange: 70, cd: 3, dmg: 9, speed: 760, size: 14, count: 4, spread: 0.34, shape: "blade" }),
      // dark copies of Zenith: Noon Flare, Grasp of God
      M({ id: "midnight-flare", name: "Midnight Flare", kind: "burst", anim: "raise", range: 160, cd: 7, dmg: 17, radius: 200, kb: 500, lift: -360, status: "blind", statusDur: 0.6, wind: 0.34, rec: 0.35 }),
      M({ id: "grave-grasp", name: "Grasp of the Grave", kind: "pull", anim: "cast", range: 540, minRange: 110, cd: 4.4, dmg: 13, status: "stun", statusDur: 0.35, wind: 0.26 }),
      M({ id: "execution", name: "Execution", kind: "melee", anim: "slam", range: 128, cd: 2.1, dmg: 26, kb: 640, lift: -320, status: "stun", statusDur: 0.4, wind: 0.28 }),
      M({ id: "phantom-scythe", name: "Phantom Scythe", kind: "blink", anim: "slam", range: 700, minRange: 90, cd: 3.2, dmg: 22, kb: 420, lift: -320, status: "stun", statusDur: 0.4 }),
      M({ id: "ash-tempest", name: "Ash Tempest", kind: "projectile", anim: "spin", range: 680, minRange: 60, cd: 3.4, dmg: 12, speed: 800, size: 16, count: 6, spread: 0.48, pierce: true, shape: "blade", status: "blind", statusDur: 0.5 }),
    ],
  },
  {
    ...P4, power: "umbra", title: "THE LAST HARVEST", guard: 0.76,
    blurb: "The sky turns the colour of its blade. It raises the scythe once, and the whole field is ready to be reaped.",
    body: "hsl(0 0% 4%)", glow: "hsl(356 100% 60%)", a: "hsl(356 100% 50%)", b: "hsl(20 100% 80%)", dark: "hsl(350 60% 4%)",
    moves: [
      M({ id: "crimson-reaping", name: "Crimson Reaping", kind: "eruption", anim: "uppercut", range: 620, minRange: 40, cd: 5.4, dmg: 15, radius: 54, count: 5, lift: -720, wind: 0.34 }),
      // dark copies of Zenith's ABOVE ALL: Word of Light, Firmament
      M({ id: "word-of-ruin", name: "Word of Ruin", kind: "beam", anim: "thrust", range: 1100, minRange: 60, cd: 4.4, dmg: 25, act: 0.42, kb: 480, status: "blind", statusDur: 1, wind: 0.42 }),
      M({ id: "black-firmament", name: "Black Firmament", kind: "rain", anim: "raise", range: 700, cd: 5, dmg: 11, count: 14, radius: 260, shape: "shard", status: "burn", statusDur: 0.4, wind: 0.4 }),
      M({ id: "end-of-harvest", name: "End of the Harvest", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 17, radius: 60, world: true, status: "burn", statusDur: 0.8, wind: 0.55, rec: 0.3 }),
      M({ id: "reap-the-sky", name: "Reap the Sky", kind: "beam", anim: "cast", range: 1100, minRange: 60, cd: 4, dmg: 28, act: 0.4, kb: 520, status: "burn", statusDur: 1, wind: 0.38 }),
      M({ id: "scarlet-eclipse", name: "Scarlet Eclipse", kind: "burst", anim: "raise", range: 2000, cd: 11, dmg: 22, radius: 80, world: true, status: "stun", statusDur: 0.5, wind: 0.5, rec: 0.28 }),
    ],
  },
];

/** Every move Carnael can use, in any phase (for the boss looks that mark its hits). */
export const CARNAEL_ALL_MOVES: Move[] = [...CARNAEL.moves, ...CARNAEL_PHASES.flatMap((p) => p.moves)];

// ---------- move looks ----------
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["red-reap", BLOOD, CHAR, "ember", { glyph: "crescent", trail: "echo", motion: "steady", burst: "crack" }],
  ["blood-crescent", BLOOD, EMBER, "ember", { glyph: "crescent", trail: "ribbon", motion: "spin", burst: "crack" }],
  ["harvest-hook", "hsl(356 80% 40%)", EMBER, "ember", { glyph: "fang", trail: "ribbon", motion: "steady", burst: "spiral" }],
  ["carrion-dive", CHAR, BLOOD, "dust", { glyph: "arrow", trail: "echo", motion: "steady", burst: "fountain" }],
  ["red-furrows", BLOOD, "hsl(20 100% 70%)", "ember", { glyph: "fang", trail: "none", motion: "pulse", burst: "fountain" }],
  ["killing-field", "hsl(356 70% 30%)", BLOOD, "smoke", { glyph: "cross", trail: "none", motion: "spin", burst: "ring" }],
  ["reaping-wheel", BLOOD, "hsl(0 0% 8%)", "ember", { glyph: "crescent", trail: "none", motion: "spin", burst: "ring" }],
  ["severing-line", EMBER, BLOOD, "spark", { glyph: "diamond", trail: "streak", motion: "steady", burst: "crack" }],
  ["thousand-cuts", BLOOD, "hsl(0 0% 96%)", "shard", { glyph: "crescent", trail: "streak", motion: "steady", burst: "scatter" }],
  ["wing-shear", "hsl(0 0% 10%)", BLOOD, "dust", { glyph: "feather", trail: "streak", motion: "spin", burst: "scatter" }],
  ["execution", "hsl(0 0% 100%)", BLOOD, "spark", { glyph: "crescent", trail: "echo", motion: "pulse", burst: "crack" }],
  ["crimson-reaping", "hsl(356 100% 50%)", EMBER, "ember", { glyph: "fang", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["end-of-harvest", BLOOD, "hsl(0 0% 4%)", "ember", { glyph: "crescent", trail: "none", motion: "spin", burst: "ring" }],
  // the dark copies of Zenith's moves: Zenith's own glyphs, in black and red
  ["eclipse-lance", "hsl(0 0% 6%)", BLOOD, "spark", { glyph: "diamond", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["grave-step", CHAR, BLOOD, "smoke", { glyph: "diamond", trail: "echo", motion: "steady", burst: "ring" }],
  ["breath-of-the-grave", BLOOD, "hsl(0 0% 6%)", "smoke", { glyph: "heart", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["red-tithe", "hsl(356 80% 34%)", "hsl(0 0% 4%)", "ember", { glyph: "eye", trail: "none", motion: "pulse", burst: "spiral" }],
  ["nightfall", "hsl(0 0% 8%)", BLOOD, "shard", { glyph: "star", trail: "streak", motion: "spin", burst: "scatter" }],
  ["midnight-flare", "hsl(0 0% 4%)", EMBER, "smoke", { glyph: "star", trail: "none", motion: "pulse", burst: "ring" }],
  ["grave-grasp", BLOOD, CHAR, "smoke", { glyph: "fang", trail: "ribbon", motion: "steady", burst: "spiral" }],
  ["word-of-ruin", "hsl(0 0% 4%)", BLOOD, "spark", { glyph: "eye", trail: "ribbon", motion: "steady", burst: "ring" }],
  ["black-firmament", "hsl(0 0% 6%)", BLOOD, "shard", { glyph: "star", trail: "streak", motion: "spin", burst: "crack" }],
  ["black-crown", "hsl(0 0% 5%)", BLOOD, "spark", { glyph: "cross", trail: "none", motion: "steady", burst: "ring" }],
  ["black-knuckle", CHAR, BLOOD, "spark", { glyph: "arrow", trail: "streak", motion: "steady", burst: "crack" }],
  ["palm-of-the-grave", "hsl(0 0% 5%)", BLOOD, "smoke", { glyph: "eye", trail: "ribbon", motion: "steady", burst: "ring" }],
  ["dusk-flare", BLOOD, "hsl(0 0% 4%)", "ember", { glyph: "star", trail: "none", motion: "pulse", burst: "fountain" }],
  ["grave-crown", CHAR, BLOOD, "dust", { glyph: "crescent", trail: "echo", motion: "steady", burst: "scatter" }],
  ["deathcrown-rain", "hsl(0 0% 6%)", BLOOD, "shard", { glyph: "star", trail: "streak", motion: "spin", burst: "scatter" }],
  ["grave-tether", BLOOD, CHAR, "smoke", { glyph: "fang", trail: "ribbon", motion: "steady", burst: "spiral" }],
  ["reaper-rend", BLOOD, EMBER, "ember", { glyph: "crescent", trail: "ribbon", motion: "spin", burst: "crack" }],
  ["scarlet-barrage", EMBER, BLOOD, "shard", { glyph: "crescent", trail: "streak", motion: "spin", burst: "scatter" }],
  ["crimson-vortex", CHAR, BLOOD, "smoke", { glyph: "ring", trail: "none", motion: "spin", burst: "spiral" }],
  ["blood-surge", BLOOD, EMBER, "ember", { glyph: "arrow", trail: "echo", motion: "steady", burst: "fountain" }],
  ["sanguine-spire", EMBER, CHAR, "ember", { glyph: "fang", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["phantom-scythe", "hsl(0 0% 100%)", BLOOD, "spark", { glyph: "crescent", trail: "echo", motion: "steady", burst: "ring" }],
  ["ash-tempest", CHAR, EMBER, "dust", { glyph: "feather", trail: "streak", motion: "spin", burst: "scatter" }],
  ["reap-the-sky", BLOOD, "hsl(20 100% 80%)", "spark", { glyph: "crescent", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["scarlet-eclipse", "hsl(0 0% 4%)", BLOOD, "ember", { glyph: "eye", trail: "none", motion: "pulse", burst: "ring" }],
];
const kindOf = new Map(CARNAEL_ALL_MOVES.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
