// Zenith, the secret boss. It is in no Story chapter: it sits at the highest point of the sky above the home
// arena holding the fourth generation of fighters sealed in its crown, and comes down only when someone calls it
// (typing its name on the arena screen, or knocking seven times on the arena; see home.tsx). Beating it breaks
// the seal (`breakSeal` in quests.ts). Its moves are drawn from their own designs (designLook), its phases sit in
// BOSS_PHASES (bosses.ts), and its crown, halo, zenith ray and the weapon of its mode are its second layer
// (zenith-look.ts, used by boss-looks.ts).
//
// Zenith is the strongest boss in the game: more health than any Story boss and harder phases. It fights in one of
// two modes, Fist Mode and Scepter Mode, with 26 moves each, and switches between them all through a fight, plus
// once at every new phase. Low on health it turns to a third, Summoner Mode (SUMMONER below), and calls beaten bosses
// to fight for it (`zenithDecide` / `switchStance` in arena-engine.ts). Each mode opens with 17 of its moves and unlocks 3 more at each
// of phases 2, 3 and 4; the secret phase, ABOVE ALL, adds its own 5 on top of whichever mode it is in.
import type { FighterDef, Move } from "./fighters";
import type { Form } from "./forms";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const GOLD = "hsl(46 100% 70%)";
const NIGHT = "hsl(232 45% 18%)";

// ---------- Fist Mode: bare hands of light ----------
// No lingering fields: everything it does is a blow, thrown, rained or driven straight through.
const FIST: Move[][] = [
  [
    M({ id: "crown-strike", name: "Crown Strike", kind: "melee", anim: "thrust", range: 82, cd: 0.9, dmg: 11, kb: 280 }),
    M({ id: "heaven-jab", name: "Heaven Jab", kind: "melee", anim: "jab", range: 80, cd: 0.5, dmg: 9, kb: 160 }),
    M({ id: "genesis-hook", name: "Genesis Hook", kind: "melee", anim: "spin", range: 90, cd: 1.3, dmg: 14, kb: 340, lift: -200 }),
    M({ id: "sky-breaker", name: "Sky Breaker", kind: "melee", anim: "kick", range: 96, cd: 1.6, dmg: 15, kb: 260, lift: -520 }),
    M({ id: "haymaker-of-ages", name: "Haymaker of Ages", kind: "melee", anim: "slam", range: 104, cd: 3, dmg: 22, kb: 620, status: "stun", statusDur: 0.4, wind: 0.32 }),
    M({ id: "thousand-fists", name: "Thousand Fists", kind: "projectile", anim: "jab", range: 560, minRange: 70, cd: 2.2, dmg: 5, speed: 820, size: 9, count: 8, spread: 0.24, shape: "orb" }),
    M({ id: "divine-knuckle", name: "Divine Knuckle", kind: "projectile", anim: "thrust", range: 640, minRange: 80, cd: 3.2, dmg: 18, speed: 560, size: 20, pierce: true, kb: 420, shape: "orb" }),
    M({ id: "palm-of-heaven", name: "Palm of Heaven", kind: "beam", anim: "thrust", range: 640, minRange: 70, cd: 4, dmg: 17, act: 0.34, kb: 300, status: "blind", statusDur: 0.6, wind: 0.3 }),
    M({ id: "ascension", name: "Ascension", kind: "eruption", anim: "uppercut", range: 520, minRange: 40, cd: 5.5, dmg: 14, radius: 50, count: 3, lift: -760, wind: 0.34 }),
    M({ id: "noon-flare", name: "Noon Flare", kind: "burst", anim: "raise", range: 160, cd: 7, dmg: 16, radius: 190, kb: 480, lift: -360, wind: 0.34, rec: 0.35 }),
    M({ id: "meridian-step", name: "Meridian Step", kind: "blink", anim: "kick", range: 640, minRange: 110, cd: 4, dmg: 14, kb: 320, lift: -300 }),
    M({ id: "solar-crown", name: "Solar Crown", kind: "dash", anim: "lunge", range: 440, cd: 4.2, dmg: 16, dist: 440, act: 0.24, kb: 400, lift: -220 }),
    M({ id: "halo-rush", name: "Halo Rush", kind: "dash", anim: "lunge", range: 380, cd: 3.6, dmg: 13, dist: 380, act: 0.22, kb: 300, status: "stun", statusDur: 0.25 }),
    M({ id: "fists-of-creation", name: "Fists of Creation", kind: "rain", anim: "raise", range: 580, cd: 5, dmg: 10, count: 8, radius: 180, size: 14, shape: "rock", status: "stun", statusDur: 0.2, wind: 0.34 }),
    M({ id: "grasp-of-god", name: "Grasp of God", kind: "pull", anim: "cast", range: 520, minRange: 110, cd: 4.2, dmg: 12, status: "stun", statusDur: 0.35, wind: 0.26 }),
    M({ id: "judgement-palm", name: "Judgement Palm", kind: "burst", anim: "slam", range: 150, cd: 6, dmg: 18, radius: 180, kb: 520, lift: -300, status: "stun", statusDur: 0.3, wind: 0.32, rec: 0.32 }),
    M({ id: "breath-of-god", name: "Breath of God", kind: "heal", anim: "raise", range: 2000, cd: 18, dmg: 0, heal: 45, below: 0.35, wind: 0.45 }),
  ],
  [
    M({ id: "seven-heavens", name: "Seven Heavens Combo", kind: "melee", anim: "jab", range: 88, cd: 0.9, dmg: 12, kb: 200, crit: 0.25 }),
    M({ id: "fist-of-dawn", name: "Fist of Dawn", kind: "eruption", anim: "uppercut", range: 560, minRange: 40, cd: 5, dmg: 15, radius: 52, count: 3, lift: -780, wind: 0.3 }),
    M({ id: "star-knuckle", name: "Star Knuckle Barrage", kind: "projectile", anim: "thrust", range: 600, minRange: 80, cd: 3, dmg: 7, speed: 700, size: 12, count: 6, spread: 0.3, shape: "disc", status: "blind", statusDur: 0.3 }),
  ],
  [
    M({ id: "omnipotent-fist", name: "Omnipotent Fist", kind: "blink", anim: "slam", range: 720, minRange: 90, cd: 3.6, dmg: 22, kb: 480, lift: -360 }),
    M({ id: "sun-crusher", name: "Sun Crusher", kind: "rain", anim: "raise", range: 620, cd: 6, dmg: 14, count: 5, radius: 200, size: 18, shape: "rock", status: "stun", statusDur: 0.35, wind: 0.4 }),
    M({ id: "zero-distance", name: "Zero Distance Punch", kind: "melee", anim: "thrust", range: 76, cd: 2.4, dmg: 26, kb: 720, status: "stun", statusDur: 0.3, wind: 0.24 }),
  ],
  [
    M({ id: "genesis-impact", name: "Genesis Impact", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 16, radius: 60, world: true, status: "stun", statusDur: 0.4, wind: 0.55, rec: 0.3 }),
    M({ id: "heavens-spear", name: "Heaven's Spear", kind: "beam", anim: "thrust", range: 1000, minRange: 60, cd: 4.6, dmg: 24, act: 0.42, kb: 520, status: "blind", statusDur: 0.8, wind: 0.4 }),
    M({ id: "the-last-fist", name: "The Last Fist", kind: "dash", anim: "lunge", range: 600, cd: 5, dmg: 28, dist: 600, act: 0.28, kb: 700, lift: -300, status: "stun", statusDur: 0.4, wind: 0.3 }),
  ],
];

// ---------- Scepter Mode: the Millennium Scepter, a thousand years of rule ----------
// Reach and time: it never heals itself, it takes a tithe instead, and it leaves fields where the hours run slow.
const SCEPTER: Move[][] = [
  [
    M({ id: "meridian-lance", name: "Meridian Lance", kind: "beam", anim: "cast", range: 620, minRange: 70, cd: 3.2, dmg: 15, act: 0.34, status: "blind", statusDur: 0.6, wind: 0.32 }),
    M({ id: "zenith-fall", name: "Zenith Fall", kind: "rain", anim: "raise", range: 560, cd: 5, dmg: 9, count: 7, radius: 170, shape: "shard", status: "stun", statusDur: 0.2, wind: 0.36, rec: 0.3 }),
    M({ id: "seal-ring", name: "Seal Ring", kind: "zone", anim: "slam", range: 420, cd: 9, dmg: 6, radius: 150, dur: 4.5, pullIn: 160, status: "slow", statusDur: 0.6, wind: 0.36 }),
    M({ id: "star-seal", name: "Star Seal", kind: "projectile", anim: "thrust", range: 600, minRange: 80, cd: 2.4, dmg: 7, speed: 640, size: 11, count: 4, spread: 0.2, shape: "disc" }),
    M({ id: "sky-tether", name: "Sky Tether", kind: "pull", anim: "cast", range: 480, minRange: 110, cd: 4, dmg: 10, status: "stun", statusDur: 0.3, wind: 0.26 }),
    M({ id: "noon-pillar", name: "Noon Pillar", kind: "eruption", anim: "slam", range: 620, minRange: 40, cd: 6, dmg: 13, radius: 46, count: 5, lift: -640, status: "blind", statusDur: 0.8, wind: 0.36 }),
    M({ id: "starcrown-rain", name: "Starcrown Rain", kind: "rain", anim: "raise", range: 600, cd: 5, dmg: 10, count: 10, radius: 210, shape: "shard", status: "stun", statusDur: 0.2, wind: 0.36 }),
    M({ id: "royal-strike", name: "Royal Strike", kind: "melee", anim: "spin", range: 120, cd: 1, dmg: 13, kb: 300 }),
    M({ id: "sovereign-blow", name: "Sovereign Blow", kind: "melee", anim: "slam", range: 130, cd: 1.8, dmg: 17, kb: 420, lift: -260, status: "slow", statusDur: 0.6 }),
    M({ id: "decree-bolt", name: "Decree Bolt", kind: "projectile", anim: "thrust", range: 640, minRange: 80, cd: 2.6, dmg: 12, speed: 760, size: 16, pierce: true, shape: "shard" }),
    M({ id: "orb-of-ages", name: "Orb of Ages", kind: "projectile", anim: "spin", range: 560, minRange: 80, cd: 3.4, dmg: 14, speed: 520, size: 18, pierce: true, shape: "orb" }),
    M({ id: "edict-step", name: "Edict Step", kind: "blink", anim: "spin", range: 680, minRange: 100, cd: 3.6, dmg: 18, kb: 380, lift: -260 }),
    M({ id: "eon-sweep", name: "Eon Sweep", kind: "burst", anim: "spin", range: 170, cd: 5.5, dmg: 16, radius: 200, kb: 460, status: "slow", statusDur: 0.8, wind: 0.3 }),
    M({ id: "royal-procession", name: "Royal Procession", kind: "dash", anim: "lunge", range: 420, cd: 4, dmg: 15, dist: 420, act: 0.24, kb: 360 }),
    M({ id: "scepter-ray", name: "Scepter Ray", kind: "beam", anim: "cast", range: 700, minRange: 70, cd: 4.8, dmg: 15, act: 0.36, status: "slow", statusDur: 1, wind: 0.34 }),
    M({ id: "moon-spires", name: "Moon Spires", kind: "eruption", anim: "slam", range: 600, minRange: 40, cd: 5.6, dmg: 13, radius: 44, count: 4, lift: -700, wind: 0.36 }),
    M({ id: "hour-hand", name: "Hour Hand", kind: "pull", anim: "cast", range: 560, minRange: 110, cd: 4.6, dmg: 12, status: "slow", statusDur: 0.8, wind: 0.26 }),
  ],
  [
    M({ id: "century-smite", name: "Century Smite", kind: "melee", anim: "slam", range: 136, cd: 2.2, dmg: 22, kb: 560, lift: -300, status: "stun", statusDur: 0.3, wind: 0.3 }),
    M({ id: "jewel-rain", name: "Jewel Rain", kind: "rain", anim: "raise", range: 600, cd: 5, dmg: 9, count: 10, radius: 200, shape: "shard", status: "slow", statusDur: 0.5, wind: 0.36 }),
    M({ id: "court-of-hours", name: "Court of Hours", kind: "zone", anim: "spin", range: 440, cd: 9, dmg: 7, radius: 160, dur: 4.5, pullIn: 180, status: "slow", statusDur: 0.6, wind: 0.34 }),
  ],
  [
    M({ id: "apex", name: "Apex", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 12, radius: 60, world: true, status: "blind", statusDur: 1, wind: 0.55, rec: 0.25 }),
    M({ id: "thousand-jewels", name: "Thousand Jewels", kind: "projectile", anim: "spin", range: 640, minRange: 70, cd: 3.4, dmg: 7, speed: 700, size: 14, count: 9, spread: 0.5, pierce: true, shape: "shard" }),
    M({ id: "tithe-of-ages", name: "Tithe of Ages", kind: "burst", anim: "raise", range: 2000, cd: 15, dmg: 10, radius: 60, harvest: true, heal: 6, wind: 0.5, rec: 0.3 }),
  ],
  [
    M({ id: "end-of-ages", name: "End of Ages", kind: "beam", anim: "thrust", range: 1100, minRange: 60, cd: 5, dmg: 26, act: 0.44, kb: 520, status: "slow", statusDur: 1, wind: 0.44 }),
    M({ id: "final-decree", name: "The Final Decree", kind: "blink", anim: "slam", range: 760, minRange: 90, cd: 4, dmg: 26, kb: 560, lift: -420, status: "stun", statusDur: 0.35 }),
    M({ id: "last-millennium", name: "Last Millennium", kind: "dash", anim: "lunge", range: 620, cd: 5.2, dmg: 24, dist: 620, act: 0.3, kb: 600, status: "slow", statusDur: 1 }),
  ],
];

export type ZenithStance = "fist" | "scepter" | "summoner";

/**
 * Zenith's modes: the name shown when it changes, the short tag beside its health bar, and its moves by phase.
 * Summoner Mode has no moves of its own: it keeps back with the far-reaching moves of both other modes while the
 * bosses it called fight for it (see SUMMONER below and `zenithDecide` in arena-engine.ts).
 */
export const ZENITH_STANCES: Record<ZenithStance, { name: string; tag: string; tiers: Move[][] }> = {
  fist: { name: "Fist Mode", tag: "FIST MODE", tiers: FIST },
  scepter: { name: "Scepter Mode", tag: "SCEPTER MODE", tiers: SCEPTER },
  summoner: { name: "Summoner Mode", tag: "SUMMONER MODE", tiers: [] },
};

/**
 * Summoner Mode. Once its health runs low, Zenith saves what is left: it steps back, raises the scepter and calls up
 * bosses that have already been beaten, possessed by its light, to fight for it. While any of them stands, every hit
 * on Zenith lands at half strength. It goes back to its fists or the scepter when they have all fallen or the hold
 * runs out, and can call again after a rest.
 */
export const SUMMONER = {
  /** The share of health at or below which it starts calling. */
  at: 0.4,
  /** Seconds it stays in Summoner Mode at most, and seconds before it may call again. */
  hold: 14,
  rest: 20,
  /** What a hit on Zenith is worth while one of its possessed bosses stands. */
  ward: 0.5,
  /** A possessed boss's health and damage, as a share of the real boss's. */
  hp: 0.4,
  dmg: 0.75,
};

const FAR_KINDS: Move["kind"][] = ["projectile", "beam", "rain", "zone", "eruption", "pull"];

/** A beaten boss as Zenith calls it back: its own body and moves, weaker, its eyes and light turned to Zenith's gold. */
export function possessed(def: FighterDef): FighterDef {
  return {
    ...def,
    glow: GOLD,
    hp: Math.round(def.hp * SUMMONER.hp),
    moves: def.moves.map((m) => ({ ...m, dmg: Math.max(2, Math.round(m.dmg * SUMMONER.dmg)) })),
  };
}

export const ZENITH: FighterDef = {
  id: "lux", boss: "zenith", name: "Zenith", power: "The Highest Point", role: "control",
  ability: "The arena's secret champion and the strongest boss there is. It waits at the highest point of the sky with the fourth generation sealed in its crown of stars, comes down only for someone who calls it, and fights with its bare fists or the Millennium Scepter, whichever it decides.",
  color: NIGHT, glow: GOLD, hp: 1100, speed: 108,
  // the fight starts it in a mode it picks itself (see the engine); Fist Mode's opening moves stand in until then
  moves: FIST[0],
};

const P2 = { kind: "phase" as const, step: 2, at: 0.75, dmg: 1.2, kb: 1.12, cd: 0.84, speed: 1.08, act: 1.08 };
const P3 = { kind: "phase" as const, step: 3, at: 0.5, dmg: 1.36, kb: 1.2, cd: 0.74, speed: 1.14, act: 1.14 };
const P4 = { kind: "phase" as const, step: 4, at: 0.25, dmg: 1.55, kb: 1.3, cd: 0.62, speed: 1.22, act: 1.22 };

// A phase's new moves come from the mode Zenith is in (ZENITH_STANCES), so the phases themselves carry none.
export const ZENITH_PHASES: Form[] = [
  {
    ...P2, power: "lux", title: "FIRST SEAL CRACKED", guard: 0.9,
    blurb: "One star in its crown splits open. Light leaks out of the crack and three more moves of its mode wake up.",
    body: "hsl(232 40% 24%)", glow: GOLD, a: "hsl(40 100% 62%)", b: "hsl(0 0% 100%)",
    moves: [],
  },
  {
    ...P3, power: "lux", title: "HIGH NOON", drain: 0.12, guard: 0.85,
    blurb: "The sun stands straight overhead and casts no shadows. Every hit it lands takes a little light back.",
    body: "hsl(44 60% 40%)", glow: "hsl(0 0% 100%)", a: "hsl(48 100% 66%)", b: "hsl(30 100% 60%)",
    moves: [],
  },
  {
    ...P4, power: "lux", title: "THE LAST SEAL", drain: 0.14, guard: 0.72,
    blurb: "Its crown breaks open and the sealed fighters' light pours through it. The whole sky falls on the arena at once.",
    body: "hsl(0 0% 96%)", glow: GOLD, a: "hsl(46 100% 72%)", b: "hsl(232 80% 70%)", dark: "hsl(232 60% 8%)",
    moves: [],
  },
];

/**
 * The secret phase, ABOVE ALL. Zenith has been holding back: once its outer seal is broken (Wisp and Boreal freed),
 * every later summons brings this fifth phase too, and only beating it opens the heart of the crown (HEART_IDS in
 * fighters.ts) and Zenith's own Story chapter. home.tsx switches it on per fight with `setZenithSecret` (bosses.ts).
 */
export const ZENITH_SECRET: Form = {
  kind: "phase", step: 5, at: 0.15, dmg: 1.8, kb: 1.4, cd: 0.52, speed: 1.3, act: 1.3,
  power: "lux", title: "ABOVE ALL", label: "Secret Phase", drain: 0.18, guard: 0.5, regen: 2.5,
  blurb: "Zenith stops holding back. The sky over the arena opens all the way up, every star in it turns to look down, and the whole of heaven fights on its side.",
  body: "hsl(0 0% 100%)", glow: "hsl(0 0% 100%)", a: GOLD, b: "hsl(200 100% 82%)", dark: "hsl(240 70% 4%)",
  moves: [
    M({ id: "firmament", name: "Firmament", kind: "rain", anim: "raise", range: 700, cd: 4.5, dmg: 11, count: 14, radius: 260, shape: "shard", status: "stun", statusDur: 0.2, wind: 0.4 }),
    M({ id: "word-of-light", name: "Word of Light", kind: "beam", anim: "thrust", range: 1100, minRange: 60, cd: 4.2, dmg: 24, act: 0.42, kb: 460, status: "blind", statusDur: 1, wind: 0.42 }),
    M({ id: "sky-unmade", name: "Sky Unmade", kind: "burst", anim: "raise", range: 2000, cd: 11, dmg: 16, radius: 60, world: true, status: "stun", statusDur: 0.4, wind: 0.6, rec: 0.3 }),
    M({ id: "throne-step", name: "Throne Step", kind: "blink", anim: "slam", range: 700, minRange: 90, cd: 3.4, dmg: 20, kb: 420, lift: -420 }),
    M({ id: "first-dawn", name: "First Dawn", kind: "heal", anim: "raise", range: 2000, cd: 16, dmg: 0, heal: 40, below: 0.12, wind: 0.5, rec: 0.3 }),
  ],
};

/** The moves Zenith fights with in a mode at a phase step (1 before its first phase, 5 in ABOVE ALL). */
export function zenithMovesAt(stance: ZenithStance, step: number): Move[] {
  if (stance === "summoner") {
    const both = [...zenithMovesAt("fist", step), ...zenithMovesAt("scepter", step)];
    return both.filter((m, i) => FAR_KINDS.includes(m.kind) && both.findIndex((x) => x.id === m.id) === i);
  }
  const tiers = ZENITH_STANCES[stance].tiers;
  const moves = tiers.slice(0, Math.min(tiers.length, Math.max(1, step))).flat();
  return step >= 5 ? [...moves, ...ZENITH_SECRET.moves] : moves;
}

/** Every move Zenith can use, in either mode and any phase (for the boss looks that mark its hits). */
export const ZENITH_ALL_MOVES: Move[] = [...FIST.flat(), ...SCEPTER.flat(), ...ZENITH_SECRET.moves];

// ---------- move looks ----------
// Every move is drawn from its own design, in its phase's colours.
const GEM = "hsl(200 100% 86%)";
const looks: [string, string, string, PShape, Omit<OwnDraw, "kind">][] = [
  ["crown-strike", GOLD, "hsl(0 0% 100%)", "star", { glyph: "star", trail: "none", motion: "steady", burst: "ring" }],
  ["meridian-lance", "hsl(46 100% 64%)", "hsl(0 0% 100%)", "spark", { glyph: "diamond", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["zenith-fall", "hsl(50 100% 72%)", "hsl(220 80% 80%)", "star", { glyph: "star", trail: "streak", motion: "spin", burst: "scatter" }],
  ["seal-ring", "hsl(232 70% 60%)", GOLD, "ring", { glyph: "ring", trail: "none", motion: "spin", burst: "ring" }],
  ["ascension", "hsl(46 100% 66%)", "hsl(232 80% 82%)", "spark", { glyph: "arrow", trail: "sparkle", motion: "steady", burst: "fountain" }],
  ["star-seal", GOLD, "hsl(232 70% 70%)", "star", { glyph: "cross", trail: "dots", motion: "spin", burst: "spiral" }],
  ["noon-flare", "hsl(40 100% 62%)", "hsl(0 0% 100%)", "spark", { glyph: "star", trail: "none", motion: "pulse", burst: "ring" }],
  ["sky-tether", "hsl(40 100% 62%)", "hsl(0 0% 100%)", "spark", { glyph: "arrow", trail: "ribbon", motion: "steady", burst: "spiral" }],
  ["meridian-step", "hsl(46 100% 70%)", "hsl(232 80% 80%)", "star", { glyph: "diamond", trail: "echo", motion: "steady", burst: "ring" }],
  ["noon-pillar", "hsl(48 100% 66%)", "hsl(30 100% 60%)", "ember", { glyph: "hex", trail: "none", motion: "pulse", burst: "fountain" }],
  ["solar-crown", "hsl(46 100% 66%)", "hsl(30 100% 60%)", "ember", { glyph: "star", trail: "streak", motion: "spin", burst: "scatter" }],
  ["apex", "hsl(0 0% 100%)", GOLD, "star", { glyph: "eye", trail: "none", motion: "pulse", burst: "ring" }],
  ["starcrown-rain", "hsl(46 100% 72%)", "hsl(232 80% 70%)", "star", { glyph: "star", trail: "sparkle", motion: "spin", burst: "crack" }],
  // Fist Mode: gold knuckles of light
  ["heaven-jab", GOLD, "hsl(0 0% 100%)", "spark", { glyph: "orb", trail: "none", motion: "steady", burst: "scatter" }],
  ["genesis-hook", "hsl(40 100% 64%)", "hsl(0 0% 100%)", "star", { glyph: "crescent", trail: "echo", motion: "spin", burst: "spiral" }],
  ["sky-breaker", "hsl(48 100% 70%)", "hsl(232 80% 82%)", "spark", { glyph: "arrow", trail: "streak", motion: "steady", burst: "fountain" }],
  ["haymaker-of-ages", "hsl(36 100% 60%)", "hsl(0 0% 100%)", "ember", { glyph: "cube", trail: "none", motion: "pulse", burst: "crack" }],
  ["thousand-fists", GOLD, "hsl(0 0% 100%)", "spark", { glyph: "orb", trail: "echo", motion: "steady", burst: "scatter" }],
  ["divine-knuckle", "hsl(46 100% 76%)", "hsl(30 100% 60%)", "star", { glyph: "hex", trail: "streak", motion: "pulse", burst: "ring" }],
  ["palm-of-heaven", "hsl(48 100% 80%)", "hsl(0 0% 100%)", "spark", { glyph: "flower", trail: "ribbon", motion: "steady", burst: "ring" }],
  ["halo-rush", GOLD, "hsl(200 100% 82%)", "star", { glyph: "ring", trail: "echo", motion: "steady", burst: "scatter" }],
  ["fists-of-creation", "hsl(42 100% 64%)", "hsl(232 80% 80%)", "ember", { glyph: "cube", trail: "streak", motion: "spin", burst: "crack" }],
  ["grasp-of-god", "hsl(46 100% 72%)", "hsl(0 0% 100%)", "spark", { glyph: "fang", trail: "ribbon", motion: "steady", burst: "spiral" }],
  ["judgement-palm", "hsl(0 0% 100%)", GOLD, "star", { glyph: "cross", trail: "none", motion: "pulse", burst: "ring" }],
  ["breath-of-god", "hsl(46 100% 82%)", "hsl(0 0% 100%)", "star", { glyph: "heart", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["seven-heavens", GOLD, "hsl(232 80% 80%)", "star", { glyph: "star", trail: "dots", motion: "spin", burst: "scatter" }],
  ["fist-of-dawn", "hsl(30 100% 62%)", "hsl(48 100% 80%)", "ember", { glyph: "arrow", trail: "sparkle", motion: "pulse", burst: "fountain" }],
  ["star-knuckle", "hsl(46 100% 70%)", "hsl(200 100% 82%)", "star", { glyph: "star", trail: "dots", motion: "spin", burst: "spiral" }],
  ["omnipotent-fist", "hsl(0 0% 100%)", GOLD, "star", { glyph: "eye", trail: "echo", motion: "pulse", burst: "crack" }],
  ["sun-crusher", "hsl(36 100% 60%)", "hsl(50 100% 80%)", "ember", { glyph: "hex", trail: "streak", motion: "spin", burst: "crack" }],
  ["zero-distance", "hsl(0 0% 100%)", "hsl(46 100% 66%)", "spark", { glyph: "diamond", trail: "none", motion: "pulse", burst: "ring" }],
  ["genesis-impact", GOLD, "hsl(0 0% 100%)", "star", { glyph: "flower", trail: "none", motion: "pulse", burst: "ring" }],
  ["heavens-spear", "hsl(0 0% 100%)", GOLD, "spark", { glyph: "arrow", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["the-last-fist", "hsl(46 100% 74%)", "hsl(0 0% 100%)", "star", { glyph: "cube", trail: "echo", motion: "steady", burst: "scatter" }],
  // Scepter Mode: gold, pale gem light and night blue
  ["royal-strike", GOLD, GEM, "star", { glyph: "star", trail: "ribbon", motion: "spin", burst: "spiral" }],
  ["sovereign-blow", "hsl(210 90% 80%)", GOLD, "spark", { glyph: "hex", trail: "echo", motion: "steady", burst: "crack" }],
  ["decree-bolt", GEM, GOLD, "spark", { glyph: "diamond", trail: "streak", motion: "steady", burst: "scatter" }],
  ["orb-of-ages", "hsl(220 80% 74%)", GOLD, "ring", { glyph: "orb", trail: "dots", motion: "spin", burst: "spiral" }],
  ["edict-step", "hsl(232 70% 64%)", GEM, "spark", { glyph: "cross", trail: "echo", motion: "steady", burst: "crack" }],
  ["eon-sweep", GEM, "hsl(232 80% 70%)", "ring", { glyph: "ring", trail: "none", motion: "spin", burst: "ring" }],
  ["royal-procession", "hsl(232 60% 56%)", GOLD, "star", { glyph: "star", trail: "ribbon", motion: "steady", burst: "scatter" }],
  ["scepter-ray", "hsl(200 100% 80%)", "hsl(0 0% 100%)", "spark", { glyph: "diamond", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["moon-spires", "hsl(220 80% 76%)", GOLD, "shard", { glyph: "hex", trail: "none", motion: "pulse", burst: "fountain" }],
  ["hour-hand", GOLD, GEM, "spark", { glyph: "arrow", trail: "dots", motion: "steady", burst: "spiral" }],
  ["century-smite", "hsl(0 0% 100%)", GEM, "spark", { glyph: "cube", trail: "echo", motion: "pulse", burst: "crack" }],
  ["jewel-rain", GEM, "hsl(232 80% 70%)", "shard", { glyph: "diamond", trail: "streak", motion: "spin", burst: "scatter" }],
  ["court-of-hours", "hsl(232 70% 60%)", GEM, "ring", { glyph: "spiral", trail: "none", motion: "spin", burst: "spiral" }],
  ["thousand-jewels", GEM, GOLD, "spark", { glyph: "diamond", trail: "sparkle", motion: "spin", burst: "scatter" }],
  ["tithe-of-ages", "hsl(232 80% 72%)", "hsl(0 0% 100%)", "star", { glyph: "eye", trail: "none", motion: "pulse", burst: "spiral" }],
  ["end-of-ages", "hsl(0 0% 100%)", GEM, "spark", { glyph: "arrow", trail: "ribbon", motion: "steady", burst: "ring" }],
  ["final-decree", GEM, "hsl(0 0% 100%)", "star", { glyph: "cross", trail: "echo", motion: "pulse", burst: "crack" }],
  ["last-millennium", "hsl(220 90% 70%)", GOLD, "spark", { glyph: "star", trail: "streak", motion: "steady", burst: "scatter" }],
  // ABOVE ALL
  ["firmament", "hsl(0 0% 100%)", GOLD, "star", { glyph: "star", trail: "streak", motion: "spin", burst: "crack" }],
  ["word-of-light", "hsl(0 0% 100%)", "hsl(200 100% 82%)", "spark", { glyph: "eye", trail: "ribbon", motion: "steady", burst: "ring" }],
  ["sky-unmade", GOLD, "hsl(0 0% 100%)", "star", { glyph: "flower", trail: "none", motion: "pulse", burst: "ring" }],
  ["throne-step", GOLD, "hsl(200 100% 82%)", "star", { glyph: "cross", trail: "echo", motion: "steady", burst: "fountain" }],
  ["first-dawn", "hsl(46 100% 80%)", "hsl(0 0% 100%)", "star", { glyph: "heart", trail: "none", motion: "pulse", burst: "fountain" }],
];
const kindOf = new Map(ZENITH_ALL_MOVES.map((m) => [m.id, m.kind]));
for (const [id, a, b, p, d] of looks) designLook(id, a, b, p, { kind: kindOf.get(id) ?? "projectile", ...d });
