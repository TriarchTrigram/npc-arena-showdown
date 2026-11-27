// What happens between the entrances and READY in a one-on-one fight: a few seconds where the two fighters react to
// each other, say a line each in speech bubbles, and touch off a small burst of their powers.
// The engine (`arena-engine.ts`) plays these: it walks the fighters, holds the poses named here, draws the bubbles
// and throws the bursts. The words are in strings under `arena.prefight`, keyed by each line's `key`.
// Fighters with history (Nova, Pyro, the Riftmaker before and after his fall, the Axiom) have scenes of their own in
// PRE_FIGHTS. Everyone else plays an exchange: the first speaks its opening line (`<cast>Open`), the other answers
// with its own reply (`<cast>Reply`), each in its own pose and colours from TAUNTS. Story minions have none.
import type { FighterDef } from "./fighters";
import type { PShape } from "./move-looks";

/** Poses the engine knows for these moments; "idle" is the fighter's own breathing stance. */
export type PrePose =
  | "idle" | "wave" | "highfive" | "reach" | "offer" | "point" | "flick" | "flex" | "crouch"
  | "fold" | "beckon" | "raise" | "bow" | "shrug" | "laugh";

/** Which of the pair: 0 is the first in `pair`, 1 the second. */
type Who = 0 | 1;

export type PreFight = {
  id: string;
  /** The two fighters, by cast key (see `castKey`); the same key twice is a mirror match. */
  pair: [string, string];
  /** Seconds it lasts. */
  len: number;
  /** From `at` on, this fighter holds `pose`, and walks toward the other until it has covered `to` of the way (0 home, 1 close enough to touch). */
  acts: { who: Who; at: number; pose: PrePose; to?: number }[];
  /** Speech bubbles over a fighter's head. */
  lines: { who: Who; at: number; until: number; key: string }[];
  /** Bursts of particles at a fighter's front hand, over the head, or between the two. */
  bursts: { at: number; who: Who | "mid"; where?: "hand" | "head"; n: number; spd: number; shape: PShape; a: string; b: string; grav: number; ring?: boolean }[];
  /** A twinkling star held on a fighter's front hand from `at` to `until`. */
  stars?: { who: Who; at: number; until: number; color: string }[];
  /** Walking speed, pixels per second. */
  walk?: number;
};

const PINK = "hsl(324 85% 76%)";
const STARLIGHT = "hsl(48 100% 88%)";
const EMBER = "hsl(22 100% 58%)";
const FLAME = "hsl(42 100% 64%)";
const RIFT = "hsl(40 100% 66%)";
const RIFT_PURPLE = "hsl(300 90% 66%)";
const FALLEN = "hsl(280 100% 70%)";
const AXIOM = "hsl(200 100% 80%)";
const WHITE = "hsl(0 0% 100%)";

export const PRE_FIGHTS: PreFight[] = [
  // Pyro checks in on Nova like he does every day, they meet in the middle for a high five, then square up.
  {
    id: "pyro-nova", pair: ["pyro", "nova"], len: 5.4,
    acts: [
      { who: 0, at: 0, pose: "wave" },
      { who: 1, at: 0, pose: "idle" },
      { who: 0, at: 1.3, pose: "idle", to: 1 },
      { who: 1, at: 1.3, pose: "idle", to: 1 },
      { who: 0, at: 2.55, pose: "highfive", to: 1 },
      { who: 1, at: 2.55, pose: "highfive", to: 1 },
      { who: 0, at: 3.3, pose: "idle", to: 0 },
      { who: 1, at: 3.3, pose: "idle", to: 0 },
      { who: 0, at: 4.4, pose: "crouch", to: 0 },
      { who: 1, at: 4.6, pose: "crouch", to: 0 },
    ],
    lines: [
      { who: 0, at: 0.15, until: 1.9, key: "pyroNova1" },
      { who: 1, at: 1.9, until: 3.3, key: "pyroNova2" },
      { who: 0, at: 3.5, until: 5.3, key: "pyroNova3" },
    ],
    bursts: [
      { at: 2.85, who: "mid", n: 22, spd: 300, shape: "star", a: PINK, b: STARLIGHT, grav: 0, ring: true },
      { at: 2.85, who: "mid", n: 18, spd: 260, shape: "ember", a: EMBER, b: FLAME, grav: -200 },
    ],
  },
  // Nova meets the Riftmaker as he was before the fall. She walks up slowly; he opens a tiny rift and hands her a star.
  {
    id: "nova-pastrift", pair: ["nova", "pastrift"], len: 6, walk: 150,
    acts: [
      { who: 0, at: 0, pose: "idle", to: 0.55 },
      { who: 1, at: 0, pose: "idle" },
      { who: 0, at: 1.5, pose: "reach", to: 0.55 },
      { who: 1, at: 2.4, pose: "offer" },
      { who: 0, at: 4.1, pose: "idle", to: 0 },
      { who: 1, at: 4.1, pose: "idle" },
      { who: 0, at: 4.9, pose: "point", to: 0 },
      { who: 1, at: 4.9, pose: "point" },
    ],
    lines: [
      { who: 0, at: 0.3, until: 2.2, key: "novaRift1" },
      { who: 1, at: 2.3, until: 4, key: "novaRift2" },
      { who: 0, at: 4.1, until: 5.9, key: "novaRift3" },
    ],
    bursts: [
      { at: 2.6, who: 1, where: "hand", n: 14, spd: 160, shape: "spark", a: RIFT, b: STARLIGHT, grav: 0, ring: true },
      { at: 3.7, who: 1, where: "hand", n: 20, spd: 220, shape: "star", a: PINK, b: RIFT, grav: -40 },
    ],
    stars: [{ who: 1, at: 2.7, until: 3.7, color: STARLIGHT }],
  },
  // The old crew: the Riftmaker calls a race to the first hit and Pyro fires up.
  {
    id: "pyro-pastrift", pair: ["pyro", "pastrift"], len: 4.2,
    acts: [
      { who: 0, at: 0, pose: "idle" },
      { who: 1, at: 0, pose: "point" },
      { who: 0, at: 1.8, pose: "flex" },
      { who: 1, at: 3, pose: "crouch" },
      { who: 0, at: 3.2, pose: "crouch" },
    ],
    lines: [
      { who: 1, at: 0.15, until: 1.9, key: "pyroRift1" },
      { who: 0, at: 1.9, until: 3.7, key: "pyroRift2" },
    ],
    bursts: [
      { at: 2, who: 0, where: "hand", n: 22, spd: 240, shape: "ember", a: EMBER, b: FLAME, grav: -260, ring: true },
      { at: 3.1, who: 1, where: "hand", n: 14, spd: 200, shape: "spark", a: RIFT_PURPLE, b: RIFT, grav: 0 },
    ],
  },
  // Nova against Nova: one flicks her hair, so does the other.
  {
    id: "nova-nova", pair: ["nova", "nova"], len: 3.8,
    acts: [
      { who: 0, at: 0, pose: "flick" },
      { who: 1, at: 0, pose: "idle" },
      { who: 0, at: 1.4, pose: "idle" },
      { who: 1, at: 1.6, pose: "flick" },
      { who: 1, at: 3, pose: "crouch" },
      { who: 0, at: 3, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.2, until: 1.7, key: "novaNova1" },
      { who: 1, at: 1.7, until: 3.4, key: "novaNova2" },
    ],
    bursts: [
      { at: 0.35, who: 0, where: "head", n: 12, spd: 150, shape: "star", a: PINK, b: STARLIGHT, grav: 0 },
      { at: 1.95, who: 1, where: "head", n: 12, spd: 150, shape: "star", a: PINK, b: STARLIGHT, grav: 0 },
    ],
  },
  // The Riftmaker before his fall meets what he becomes. He steps closer; his corrupted self folds its arms and waits.
  {
    id: "pastrift-riftmaker", pair: ["pastrift", "riftmaker"], len: 6.4, walk: 130,
    acts: [
      { who: 0, at: 0, pose: "idle", to: 0.4 },
      { who: 1, at: 0, pose: "fold" },
      { who: 0, at: 1.5, pose: "reach", to: 0.4 },
      { who: 1, at: 2.3, pose: "beckon" },
      { who: 0, at: 4.3, pose: "point", to: 0 },
      { who: 1, at: 5.7, pose: "crouch" },
      { who: 0, at: 5.8, pose: "crouch", to: 0 },
    ],
    lines: [
      { who: 0, at: 0.3, until: 2.2, key: "pastFallen1" },
      { who: 1, at: 2.3, until: 4.3, key: "pastFallen2" },
      { who: 0, at: 4.4, until: 6.3, key: "pastFallen3" },
    ],
    bursts: [
      { at: 2.5, who: 1, where: "hand", n: 20, spd: 220, shape: "glyph", a: FALLEN, b: WHITE, grav: 0, ring: true },
      { at: 4.6, who: 0, where: "hand", n: 22, spd: 260, shape: "star", a: RIFT_PURPLE, b: RIFT, grav: 0, ring: true },
    ],
  },
  // Nova finds her best friend as the Axiom left him, and asks him to come home.
  {
    id: "nova-riftmaker", pair: ["nova", "riftmaker"], len: 6.2, walk: 150,
    acts: [
      { who: 0, at: 0, pose: "reach", to: 0.35 },
      { who: 1, at: 0, pose: "idle" },
      { who: 1, at: 2.1, pose: "shrug" },
      { who: 0, at: 4.1, pose: "idle", to: 0 },
      { who: 0, at: 4.5, pose: "offer", to: 0 },
      { who: 1, at: 5.6, pose: "crouch" },
      { who: 0, at: 5.7, pose: "crouch", to: 0 },
    ],
    lines: [
      { who: 0, at: 0.2, until: 2.1, key: "novaFallen1" },
      { who: 1, at: 2.2, until: 4.1, key: "novaFallen2" },
      { who: 0, at: 4.2, until: 6.1, key: "novaFallen3" },
    ],
    bursts: [
      { at: 2.4, who: 1, where: "hand", n: 16, spd: 200, shape: "glyph", a: FALLEN, b: WHITE, grav: 0 },
      { at: 5.4, who: 0, where: "hand", n: 26, spd: 320, shape: "star", a: PINK, b: STARLIGHT, grav: 0, ring: true },
    ],
    stars: [{ who: 0, at: 4.6, until: 5.4, color: STARLIGHT }],
  },
  // Pyro has kept his promise every day since the fall, and tells the Riftmaker so.
  {
    id: "pyro-riftmaker", pair: ["pyro", "riftmaker"], len: 6,
    acts: [
      { who: 0, at: 0, pose: "point" },
      { who: 1, at: 0, pose: "idle" },
      { who: 1, at: 2.1, pose: "laugh" },
      { who: 0, at: 4.1, pose: "flex" },
      { who: 1, at: 5.4, pose: "crouch" },
      { who: 0, at: 5.5, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.1, key: "pyroFallen1" },
      { who: 1, at: 2.2, until: 4.1, key: "pyroFallen2" },
      { who: 0, at: 4.2, until: 5.9, key: "pyroFallen3" },
    ],
    bursts: [
      { at: 2.4, who: 1, where: "hand", n: 14, spd: 180, shape: "glyph", a: FALLEN, b: WHITE, grav: 0 },
      { at: 4.3, who: 0, where: "hand", n: 26, spd: 260, shape: "ember", a: EMBER, b: FLAME, grav: -260, ring: true },
    ],
  },
  // Nova faces the one who took her friend.
  {
    id: "nova-axiom", pair: ["nova", "axiom"], len: 6,
    acts: [
      { who: 0, at: 0, pose: "point" },
      { who: 1, at: 0, pose: "idle" },
      { who: 1, at: 2.1, pose: "fold" },
      { who: 0, at: 4.1, pose: "raise" },
      { who: 1, at: 5.4, pose: "crouch" },
      { who: 0, at: 5.5, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.1, key: "novaAxiom1" },
      { who: 1, at: 2.2, until: 4.1, key: "novaAxiom2" },
      { who: 0, at: 4.2, until: 5.9, key: "novaAxiom3" },
    ],
    bursts: [
      { at: 2.4, who: 1, where: "head", n: 16, spd: 160, shape: "ring", a: AXIOM, b: WHITE, grav: 0 },
      { at: 4.5, who: 0, where: "head", n: 30, spd: 340, shape: "star", a: PINK, b: STARLIGHT, grav: 0, ring: true },
    ],
  },
  // The Axiom meets the Riftmaker before it found him.
  {
    id: "pastrift-axiom", pair: ["axiom", "pastrift"], len: 4.6,
    acts: [
      { who: 0, at: 0, pose: "beckon" },
      { who: 1, at: 0, pose: "idle" },
      { who: 0, at: 2.1, pose: "idle" },
      { who: 1, at: 2.1, pose: "point" },
      { who: 0, at: 4, pose: "crouch" },
      { who: 1, at: 4.1, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.1, key: "axiomPast1" },
      { who: 1, at: 2.2, until: 4.2, key: "axiomPast2" },
    ],
    bursts: [
      { at: 0.4, who: 0, where: "hand", n: 16, spd: 160, shape: "ring", a: AXIOM, b: WHITE, grav: 0 },
      { at: 2.4, who: 1, where: "hand", n: 22, spd: 260, shape: "star", a: RIFT_PURPLE, b: RIFT, grav: 0, ring: true },
    ],
  },
  // The Axiom and its work: the Riftmaker bows.
  {
    id: "axiom-riftmaker", pair: ["axiom", "riftmaker"], len: 4.4,
    acts: [
      { who: 0, at: 0, pose: "fold" },
      { who: 1, at: 0, pose: "idle" },
      { who: 1, at: 2, pose: "bow" },
      { who: 0, at: 3.8, pose: "crouch" },
      { who: 1, at: 3.9, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2, key: "axiomFallen1" },
      { who: 1, at: 2.1, until: 4, key: "axiomFallen2" },
    ],
    bursts: [{ at: 2.2, who: 1, where: "head", n: 16, spd: 160, shape: "glyph", a: FALLEN, b: AXIOM, grav: 0 }],
  },
  // Nadir meets his father. He walks a little way in and asks the one thing he wants to know; Zenith doesn't answer it.
  {
    id: "nadir-zenith", pair: ["nadir", "zenith"], len: 6.4, walk: 110,
    acts: [
      { who: 0, at: 0, pose: "idle", to: 0.4 },
      { who: 1, at: 0, pose: "fold" },
      { who: 0, at: 1.7, pose: "reach", to: 0.4 },
      { who: 1, at: 3.4, pose: "raise" },
      { who: 0, at: 5.6, pose: "crouch", to: 0.4 },
      { who: 1, at: 5.7, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.2, until: 1.7, key: "nadirZenith1" },
      { who: 1, at: 1.7, until: 3.4, key: "nadirZenith2" },
      { who: 0, at: 3.4, until: 4.6, key: "nadirZenith3" },
      { who: 1, at: 4.6, until: 6.3, key: "nadirZenith4" },
    ],
    bursts: [
      { at: 3.6, who: 1, where: "head", n: 22, spd: 220, shape: "ring", a: "hsl(46 100% 70%)", b: WHITE, grav: 0, ring: true },
      { at: 4.8, who: 0, where: "hand", n: 14, spd: 160, shape: "ring", a: "hsl(46 92% 72%)", b: "hsl(248 40% 56%)", grav: -40 },
    ],
  },
  // Carnael vs Zenith: ancient seal-breaker vs the highest light
  {
    id: "carnael-zenith", pair: ["carnael", "zenith"], len: 6.2, walk: 100,
    acts: [
      { who: 0, at: 0, pose: "point", to: 0.25 },
      { who: 1, at: 0, pose: "fold" },
      { who: 1, at: 2.0, pose: "raise" },
      { who: 0, at: 4.0, pose: "laugh", to: 0.35 },
      { who: 0, at: 5.5, pose: "crouch", to: 0.35 },
      { who: 1, at: 5.6, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.0, key: "carnaelZenith1" },
      { who: 1, at: 2.05, until: 4.0, key: "carnaelZenith2" },
      { who: 0, at: 4.05, until: 5.9, key: "carnaelZenith3" },
    ],
    bursts: [
      { at: 2.2, who: 1, where: "head", n: 24, spd: 260, shape: "star", a: "hsl(46 100% 72%)", b: WHITE, grav: -40, ring: true },
      { at: 4.2, who: "mid", n: 28, spd: 320, shape: "ember", a: "hsl(356 100% 54%)", b: "hsl(46 100% 72%)", grav: -100, ring: true },
    ],
  },
  // Pyro vs Cryo: fire and ice rivalry
  {
    id: "pyro-cryo", pair: ["pyro", "cryo"], len: 5.2,
    acts: [
      { who: 0, at: 0, pose: "flex" },
      { who: 1, at: 0, pose: "fold" },
      { who: 1, at: 2.2, pose: "point" },
      { who: 0, at: 4.4, pose: "crouch" },
      { who: 1, at: 4.5, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.2, key: "pyroCryo1" },
      { who: 1, at: 2.25, until: 4.4, key: "pyroCryo2" },
    ],
    bursts: [
      { at: 0.4, who: 0, where: "hand", n: 18, spd: 220, shape: "ember", a: EMBER, b: FLAME, grav: -140 },
      { at: 2.5, who: 1, where: "hand", n: 18, spd: 220, shape: "shard", a: "hsl(195 100% 78%)", b: WHITE, grav: 80 },
    ],
  },
  // Umbra vs Lux: shadow vs light
  {
    id: "umbra-lux", pair: ["umbra", "lux"], len: 5.2,
    acts: [
      { who: 0, at: 0, pose: "beckon" },
      { who: 1, at: 0, pose: "raise" },
      { who: 0, at: 4.4, pose: "crouch" },
      { who: 1, at: 4.5, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.2, key: "umbraLux1" },
      { who: 1, at: 2.25, until: 4.4, key: "umbraLux2" },
    ],
    bursts: [
      { at: 2.4, who: "mid", n: 24, spd: 260, shape: "star", a: "hsl(48 100% 74%)", b: "hsl(270 80% 42%)", grav: 0, ring: true },
    ],
  },
  // Electro vs Aero: lightning vs wind
  {
    id: "electro-aero", pair: ["electro", "aero"], len: 5.0,
    acts: [
      { who: 0, at: 0, pose: "point" },
      { who: 1, at: 0, pose: "wave" },
      { who: 0, at: 4.2, pose: "crouch" },
      { who: 1, at: 4.3, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.1, key: "electroAero1" },
      { who: 1, at: 2.15, until: 4.2, key: "electroAero2" },
    ],
    bursts: [
      { at: 0.4, who: 0, where: "hand", n: 18, spd: 260, shape: "spark", a: "hsl(52 100% 64%)", b: WHITE, grav: 0 },
      { at: 2.4, who: 1, where: "hand", n: 18, spd: 240, shape: "dust", a: "hsl(178 85% 74%)", b: WHITE, grav: -60 },
    ],
  },
  // Chrono vs Gravity: time vs space
  {
    id: "chrono-gravity", pair: ["chrono", "gravity"], len: 5.2,
    acts: [
      { who: 0, at: 0, pose: "raise" },
      { who: 1, at: 0, pose: "fold" },
      { who: 1, at: 2.2, pose: "beckon" },
      { who: 0, at: 4.4, pose: "crouch" },
      { who: 1, at: 4.5, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.2, key: "chronoGravity1" },
      { who: 1, at: 2.25, until: 4.4, key: "chronoGravity2" },
    ],
    bursts: [
      { at: 2.4, who: "mid", n: 22, spd: 220, shape: "ring", a: "hsl(190 95% 68%)", b: "hsl(276 90% 66%)", grav: 0, ring: true },
    ],
  },
  // Hollow King vs Carnael: soul reaper vs light reaper
  {
    id: "hollow-carnael", pair: ["hollow", "carnael"], len: 5.4,
    acts: [
      { who: 0, at: 0, pose: "point" },
      { who: 1, at: 0, pose: "laugh" },
      { who: 0, at: 4.6, pose: "crouch" },
      { who: 1, at: 4.7, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.3, key: "hollowCarnael1" },
      { who: 1, at: 2.35, until: 4.6, key: "hollowCarnael2" },
    ],
    bursts: [
      { at: 2.5, who: "mid", n: 24, spd: 280, shape: "ember", a: "hsl(148 90% 56%)", b: "hsl(356 100% 54%)", grav: -80, ring: true },
    ],
  },
  // Aeon vs Zenith: first sky vs highest light
  {
    id: "aeon-zenith", pair: ["aeon", "zenith"], len: 5.4,
    acts: [
      { who: 0, at: 0, pose: "raise" },
      { who: 1, at: 0, pose: "fold" },
      { who: 1, at: 2.3, pose: "raise" },
      { who: 0, at: 4.6, pose: "crouch" },
      { who: 1, at: 4.7, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.3, key: "aeonZenith1" },
      { who: 1, at: 2.35, until: 4.6, key: "aeonZenith2" },
    ],
    bursts: [
      { at: 2.5, who: "mid", n: 24, spd: 260, shape: "star", a: "hsl(210 100% 82%)", b: "hsl(46 100% 72%)", grav: -30, ring: true },
    ],
  },
  // Vinculum vs Carnael: jailer vs prisoner
  {
    id: "vinculum-carnael", pair: ["vinculum", "carnael"], len: 5.4,
    acts: [
      { who: 0, at: 0, pose: "beckon" },
      { who: 1, at: 0, pose: "laugh" },
      { who: 0, at: 4.6, pose: "crouch" },
      { who: 1, at: 4.7, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: 0.15, until: 2.3, key: "vinculumCarnael1" },
      { who: 1, at: 2.35, until: 4.6, key: "vinculumCarnael2" },
    ],
    bursts: [
      { at: 2.5, who: "mid", n: 22, spd: 260, shape: "spark", a: "hsl(30 20% 72%)", b: "hsl(356 100% 54%)", grav: 160, ring: true },
    ],
  },
];

/** How one fighter carries itself in an exchange with anyone it has no scene with. */
type Taunt = {
  /** The pose while it speaks first, and the one while it answers. */
  open: PrePose;
  reply: PrePose;
  /** A quick pose held before `open`. */
  lead?: PrePose;
  /** The burst's particles; its colours are the fighter's glow and colour unless `a`/`b` say otherwise. */
  shape: PShape;
  where?: "hand" | "head";
  grav?: number;
  a?: string;
  b?: string;
  /** Holds up a star of this colour while it speaks first, and lets it go as a burst. */
  star?: string;
};

export const TAUNTS: Record<string, Taunt> = {
  // the original fighters
  pyro: { open: "flex", reply: "point", shape: "ember", grav: -240 },
  cryo: { open: "fold", reply: "shrug", shape: "flake", grav: 120 },
  electro: { open: "raise", reply: "laugh", shape: "bolt", where: "head" },
  terra: { open: "flex", reply: "fold", shape: "chunk", grav: 900 },
  aero: { open: "beckon", reply: "shrug", shape: "spark", grav: -40 },
  hydro: { open: "beckon", reply: "laugh", shape: "drop", grav: 700 },
  umbra: { open: "fold", reply: "bow", shape: "smoke", grav: -50 },
  lux: { open: "raise", reply: "point", shape: "spark", where: "head" },
  gravi: { open: "point", reply: "fold", shape: "ring" },
  tele: { open: "shrug", reply: "laugh", shape: "ring" },
  vita: { open: "wave", reply: "bow", shape: "plus", grav: -140 },
  toxi: { open: "laugh", reply: "shrug", shape: "bubble", grav: -110 },
  chrono: { open: "point", reply: "fold", shape: "ring" },
  magneto: { open: "flex", reply: "beckon", shape: "shard", grav: 700 },
  psy: { open: "raise", reply: "point", shape: "ring", where: "head" },
  shift: { open: "shrug", reply: "laugh", shape: "dot" },
  nova: { lead: "flick", open: "offer", reply: "flick", shape: "star", a: PINK, b: STARLIGHT, star: STARLIGHT },
  // quest fighters
  spatio: { open: "point", reply: "shrug", shape: "shard" },
  hexizon: { open: "raise", reply: "laugh", shape: "pixel", where: "head", grav: -60 },
  gamma: { open: "flex", reply: "fold", shape: "spark", grav: -120 },
  velo: { open: "beckon", reply: "laugh", shape: "spark" },
  portal: { open: "beckon", reply: "shrug", shape: "ring" },
  sono: { open: "raise", reply: "point", shape: "ring", where: "head" },
  paper: { open: "bow", reply: "shrug", shape: "leaf", grav: 120 },
  crys: { open: "fold", reply: "flex", shape: "shard", grav: 300 },
  sand: { open: "beckon", reply: "shrug", shape: "dust", grav: 300 },
  pastrift: { open: "point", reply: "laugh", shape: "star", a: RIFT_PURPLE, b: RIFT },
  merc: { open: "beckon", reply: "flex", shape: "drop", grav: 600 },
  alch: { open: "offer", reply: "bow", shape: "spark", grav: 200 },
  nadir: { open: "fold", reply: "shrug", shape: "ring", grav: -40 },
  // the new generation
  plasma: { open: "raise", reply: "flex", shape: "spark", grav: -60 },
  flora: { open: "wave", reply: "bow", shape: "leaf", grav: 140 },
  chaos: { open: "beckon", reply: "laugh", shape: "star", grav: -40 },
  // the fourth generation
  smoke: { open: "shrug", reply: "laugh", shape: "smoke", grav: -60 },
  aurora: { open: "raise", reply: "bow", shape: "spark", grav: -30 },
  glass: { open: "point", reply: "laugh", shape: "shard", grav: 300 },
  thread: { open: "beckon", reply: "bow", shape: "spark", grav: 80 },
  swarm: { open: "wave", reply: "laugh", shape: "dust", grav: -20 },
  rust: { open: "flex", reply: "fold", shape: "chunk", grav: 800 },
  // Story bosses, by design
  antimatter: { open: "fold", reply: "bow", shape: "smoke" },
  maelstrom: { open: "beckon", reply: "point", shape: "drop", grav: 600 },
  magmaw: { open: "flex", reply: "laugh", shape: "ember", grav: -220 },
  everwinter: { open: "raise", reply: "fold", shape: "flake", grav: 80 },
  riftmaker: { open: "point", reply: "laugh", shape: "glyph", a: FALLEN, b: WHITE },
  hollow: { open: "beckon", reply: "bow", shape: "smoke", grav: -40 },
  blacksun: { open: "raise", reply: "fold", shape: "ring", where: "head" },
  axiom: { open: "fold", reply: "point", shape: "ring", a: AXIOM, b: WHITE },
  lanternmaw: { open: "beckon", reply: "laugh", shape: "bubble", grav: -60 },
  sporemother: { open: "raise", reply: "bow", shape: "dust", grav: -40 },
  mnemovore: { open: "point", reply: "laugh", shape: "glyph", where: "head" },
  dustmoth: { open: "raise", reply: "fold", shape: "dust", grav: 160 },
  somnarch: { open: "bow", reply: "shrug", shape: "smoke", grav: -30 },
  hush: { open: "fold", reply: "point", shape: "ring" },
  elderdark: { open: "raise", reply: "fold", shape: "smoke", grav: -20 },
  perihelion: { open: "point", reply: "flex", shape: "ember", grav: -160 },
  asterion: { open: "raise", reply: "point", shape: "star", where: "head" },
  carina: { open: "beckon", reply: "laugh", shape: "star", grav: -20 },
  vela: { open: "flex", reply: "point", shape: "ring" },
  aeon: { open: "raise", reply: "bow", shape: "spark", where: "head" },
  orogen: { open: "flex", reply: "fold", shape: "chunk", grav: 900 },
  gnarlroot: { open: "raise", reply: "beckon", shape: "leaf", grav: 120 },
  ambrel: { open: "beckon", reply: "bow", shape: "drop", grav: 300 },
  coilvast: { open: "fold", reply: "laugh", shape: "ember", grav: -80 },
  anvilheart: { open: "flex", reply: "point", shape: "spark", grav: 400 },
  primeva: { open: "beckon", reply: "raise", shape: "drop", grav: 200 },
  carnael: { open: "point", reply: "laugh", shape: "ember", grav: -160 },
  vinculum: { open: "beckon", reply: "fold", shape: "spark", grav: 320 },
  obolus: { open: "point", reply: "shrug", shape: "spark", grav: 260 },
  campanel: { open: "raise", reply: "fold", shape: "ember", grav: -60 },
  ignifer: { open: "point", reply: "shrug", shape: "ember", grav: -120 },
  zenith: { open: "raise", reply: "fold", shape: "star", grav: -40 },
  // one of a kind: any fused fighter, and the fighter you made
  hybrid: { open: "flex", reply: "shrug", shape: "spark" },
  own: { open: "wave", reply: "point", shape: "spark" },
};

/**
 * Who a fighter is for these moments: a Story boss by its design, any fused fighter as "hybrid", the fighter you
 * made as "own", everyone else by id. Story minions have no part in them.
 */
export function castKey(d: FighterDef): string | null {
  if (d.minion) return null;
  if (d.custom) return "own";
  if (d.parents) return "hybrid";
  return d.boss ?? d.id;
}

/** How long each line of an exchange stays up, in seconds. */
const SAY = 2.2;

function burstOf(d: FighterDef, t: Taunt, who: Who, at: number, ring: boolean): PreFight["bursts"][number] {
  return {
    at, who, where: t.where ?? "hand", n: ring ? 24 : 18, spd: ring ? 300 : 220, shape: t.shape,
    a: t.a ?? d.glow, b: t.b ?? (d.boss ? WHITE : d.color), grav: t.grav ?? 0, ring,
  };
}

/** The first fighter says its opening line in its own pose; the second answers with its reply in its own. */
function exchange(x: FighterDef, kx: string, y: FighterDef, ky: string): PreFight | null {
  const tx = TAUNTS[kx], ty = TAUNTS[ky];
  if (!tx || !ty) return null;
  const mirror = kx === ky;
  const o = tx.lead ? 0.55 : 0;
  const r = o + SAY;
  const end = r + SAY;
  const openBurst = tx.star ? o + 1.6 : o + 0.4;
  return {
    id: `${kx}-${ky}`, pair: [kx, ky], len: end + 0.55,
    acts: [
      ...(tx.lead ? [{ who: 0 as const, at: 0, pose: tx.lead }] : []),
      { who: 0, at: o, pose: tx.open },
      { who: 1, at: 0, pose: "idle" },
      { who: 0, at: r, pose: "idle" },
      { who: 1, at: r, pose: ty.reply },
      { who: 0, at: end, pose: "crouch" },
      { who: 1, at: end + 0.15, pose: "crouch" },
    ],
    lines: [
      { who: 0, at: o + 0.1, until: r, key: mirror ? "mirrorOpen" : `${kx}Open` },
      { who: 1, at: r + 0.1, until: end + 0.2, key: mirror ? "mirrorReply" : `${ky}Reply` },
    ],
    bursts: [burstOf(x, tx, 0, openBurst, !!tx.star), burstOf(y, ty, 1, r + 0.35, false)],
    stars: tx.star ? [{ who: 0, at: o + 0.15, until: openBurst, color: tx.star }] : undefined,
  };
}

/**
 * The moment two fighters play before READY, and which of them is the first of its pair.
 * A scene of their own comes first. Otherwise they trade lines: the one on the left speaks first,
 * except that a boss facing anyone who is not a boss always has the last word.
 */
export function preFightFor(a: FighterDef, b: FighterDef): { spec: PreFight; first: 0 | 1 } | null {
  const ka = castKey(a), kb = castKey(b);
  if (!ka || !kb) return null;
  for (const spec of PRE_FIGHTS) {
    const [x, y] = spec.pair;
    if (ka === x && kb === y) return { spec, first: 0 };
    if (ka === y && kb === x) return { spec, first: 1 };
  }
  const bFirst = !!a.boss && !b.boss;
  const spec = bFirst ? exchange(b, kb, a, ka) : exchange(a, ka, b, kb);
  return spec ? { spec, first: bFirst ? 1 : 0 } : null;
}
