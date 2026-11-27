// Story mode: chapters of stages. The player brings two fighters into each stage and either fuses
// them into one hybrid or sends them in side by side with team attacks. Progress lives in the browser.
import { fusionOrder, hybridOf, withTeamAttack, type ChosenId, type FighterDef, type MinionKind, type Power } from "./fighters";
import { BOSSES, type BossId } from "./bosses";
import { MINIONS } from "./minions";
import { ZENITH } from "./zenith";
import { TETRAEL } from "./tetrael";
import { ZENAEON } from "./zenaeon";
import { CHOSEN, chosenOf } from "./zenith-chosen";

export { fusionOrder };

export type Stage = {
  /** The boss's minions on the other side, by kind (see minions.ts). */
  foes: MinionKind[];
  /** Share of their normal health the minions bring, so a crowd stays beatable for a pair. */
  enemyHp?: number;
  boss?: StoryBoss;
  /** Whose minions they are, as a Story chapter index into MINIONS, when not this chapter's own (Legacy's rebel armies). */
  crew?: number;
  /** Zenith's Chapter only: the Chosen on the other side, in place of minions (zenith-chosen.ts). */
  chosen?: ChosenId[];
  /**
   * Who fights this stage for the player in place of their pair. Only Legacy's Chapter 6 boss stage has one: Zenith and
   * Aeon fused into Zenaeon, made in the "clash" scene that opens the stage.
   */
  ally?: "zenaeon";
};

/**
 * Who can wait on a boss stage: a Story boss at the end of its chapter, Zenith itself at the end of its own chapter,
 * or Tetrael, Zenith's herald, on stage 13 of Zenith's Chapter (the one boss stage that is not a chapter's last).
 */
export type StoryBoss = BossId | "zenith" | "tetrael";
/** The fighter a boss stage's boss fights as. */
export const storyBoss = (id: StoryBoss): FighterDef => (id === "zenith" ? ZENITH : id === "tetrael" ? TETRAEL : BOSSES[id]);
/** Whether a beaten Story boss joins the roster: every chapter boss does, but not Zenith (it joins another way) or its herald. */
export const joinsRoster = (id: StoryBoss): id is BossId => id !== "zenith" && id !== "tetrael";

export type Chapter = {
  stages: Stage[];
  /** Its number inside its book, when it is not simply its place in the book (Legacy's 5 and 6 were written before 2 to 4, out of list order). */
  num?: number;
  /** Opens only once Zenith has joined the roster (it has been beaten once): passed in through `extraOpen`. */
  needsZenith?: boolean;
};

const KIND: Record<string, MinionKind> = { g: "grunt", c: "caster", b: "brute", e: "elite" };
/** A stage of minions written as letters: g grunt, c caster, b brute, e the lieutenant. */
const st = (code: string, enemyHp?: number): Stage => ({ foes: [...code].map((k) => KIND[k]), ...(enemyHp ? { enemyHp } : {}) });
/** A stage of one rebel boss's army in Legacy Mode: the minions of Story chapter `crew`, written as letters like `st`. */
const rb = (crew: number, code: string, enemyHp?: number): Stage => ({ ...st(code, enemyHp), crew });
/** A stage of Zenith's Chosen, one letter each (see zenith-chosen.ts). */
const zc = (code: string, enemyHp?: number): Stage => ({ foes: [], chosen: chosenOf(code), ...(enemyHp ? { enemyHp } : {}) });

/**
 * The chapters of every book in one list. Book 1's chapters are nine stages of the boss's minions, then the boss;
 * Book 2's are eight, then the boss; Book 3's seven, then the boss; Book 4's six, then the boss. A chapter opens once the one before it is cleared,
 * so Book 2 opens once the Reign 8 (Book 1's eight bosses) have all fallen, Book 3 once the Elder Dark has, and Book 4 once Aeon has.
 */
export const CHAPTERS: Chapter[] = [
  {
    // Chapter 1: The Rift Opens
    stages: [
      st("g"),
      st("c"),
      st("b"),
      st("gc", 0.8),
      st("bg", 0.68),
      st("cc", 0.75),
      st("ggc", 0.4),
      st("bcg", 0.42),
      st("egc", 0.48),
      { foes: [], boss: "nullshade" },
    ],
  },
  {
    // Chapter 2: The Storm Coast
    stages: [
      st("g"),
      st("c"),
      st("b"),
      st("gc", 0.8),
      st("bc", 0.75),
      st("gg", 0.75),
      st("cgb", 0.45),
      st("bgc", 0.48),
      st("egg", 0.5),
      { foes: [], boss: "maelstrom" },
    ],
  },
  {
    // Chapter 3: The Ember Wastes
    stages: [
      st("g"),
      st("c"),
      st("b"),
      st("gb", 0.82),
      st("cc", 0.8),
      st("bg", 0.7),
      st("ggc", 0.45),
      st("bbc", 0.34),
      st("egcb", 0.3),
      { foes: [], boss: "magmaw" },
    ],
  },
  {
    // Chapter 4: The Frozen Clock
    stages: [
      st("c"),
      st("g"),
      st("b"),
      st("cg", 0.85),
      st("gc", 0.75),
      st("bb", 0.65),
      st("ccg", 0.34),
      st("bgc", 0.45),
      st("egcb", 0.23),
      { foes: [], boss: "everwinter" },
    ],
  },
  {
    // Chapter 5: The Heart of the Rift
    stages: [
      st("g"),
      st("c"),
      st("bg", 0.8),
      st("gcc", 0.46),
      st("bgg", 0.46),
      st("ccb", 0.4),
      st("ggcb", 0.27),
      st("bbcc", 0.19),
      st("egcbg", 0.16),
      { foes: [], boss: "riftmaker" },
    ],
  },
  {
    // Chapter 6: The Hollow Kingdom
    stages: [
      st("g"),
      st("gc", 0.85),
      st("cc", 0.8),
      st("bg", 0.7),
      st("ggc", 0.45),
      st("ccb", 0.45),
      st("bbg", 0.38),
      st("ggcb", 0.22),
      st("egcbc", 0.13),
      { foes: [], boss: "hollowking" },
    ],
  },
  {
    // Chapter 7: The Dying Sun
    stages: [
      st("c"),
      st("gc", 0.85),
      st("bb", 0.65),
      st("gc", 0.8),
      st("bcg", 0.46),
      st("ccg", 0.46),
      st("bgc", 0.44),
      st("ggcb", 0.2),
      st("ebgcc", 0.14),
      { foes: [], boss: "blacksun" },
    ],
  },
  {
    // Chapter 8: The Edge of Everything
    stages: [
      st("b"),
      st("cc", 0.85),
      st("bg", 0.7),
      st("gc", 0.8),
      st("ccg", 0.45),
      st("bbg", 0.44),
      st("gcb", 0.44),
      st("ggcc", 0.2),
      st("ebcgc", 0.13),
      { foes: [], boss: "axiom" },
    ],
  },
  // ---------- Book 2: The Elder Dark. Nine stages a chapter: eight of minions, then the boss. ----------
  {
    // Book 2, chapter 1: Lights Under the Sea
    stages: [
      st("g"),
      st("c"),
      st("gb", 0.8),
      st("cc", 0.8),
      st("bgc", 0.48),
      st("ggc", 0.46),
      st("bbcg", 0.26),
      st("egcb", 0.24),
      { foes: [], boss: "lanternmaw" },
    ],
  },
  {
    // Book 2, chapter 2: The Singing Rot
    stages: [
      st("c"),
      st("g"),
      st("gc", 0.82),
      st("bb", 0.66),
      st("ccg", 0.46),
      st("bgc", 0.46),
      st("ggcb", 0.26),
      st("ecbg", 0.24),
      { foes: [], boss: "sporemother" },
    ],
  },
  {
    // Book 2, chapter 3: The City That Forgets
    stages: [
      st("g"),
      st("cg", 0.85),
      st("bc", 0.78),
      st("gg", 0.78),
      st("cbg", 0.46),
      st("ccb", 0.44),
      st("gbcc", 0.24),
      st("egbc", 0.22),
      { foes: [], boss: "mnemovore" },
    ],
  },
  {
    // Book 2, chapter 4: The Moth Moon
    stages: [
      st("b"),
      st("gc", 0.85),
      st("cc", 0.8),
      st("bgg", 0.48),
      st("gcb", 0.46),
      st("ccbg", 0.27),
      st("bbgc", 0.23),
      st("egcbc", 0.15),
      { foes: [], boss: "dustmoth" },
    ],
  },
  {
    // Book 2, chapter 5: The Sleeping Valley
    stages: [
      st("g"),
      st("gg", 0.82),
      st("cg", 0.8),
      st("bc", 0.72),
      st("ggc", 0.46),
      st("cbg", 0.44),
      st("bbgc", 0.24),
      st("egcbg", 0.15),
      { foes: [], boss: "somnarch" },
    ],
  },
  {
    // Book 2, chapter 6: The Silent Bells
    stages: [
      st("c"),
      st("gc", 0.85),
      st("bg", 0.72),
      st("ccg", 0.46),
      st("bgc", 0.44),
      st("ggbc", 0.26),
      st("bbcg", 0.22),
      st("ecbgc", 0.14),
      { foes: [], boss: "hush" },
    ],
  },
  {
    // Book 2, chapter 7: The Elder Dark
    stages: [
      st("gg", 0.85),
      st("cb", 0.8),
      st("ggc", 0.5),
      st("bcg", 0.46),
      st("ccbg", 0.27),
      st("bbgc", 0.24),
      st("eggcc", 0.16),
      st("ebcgb", 0.15),
      { foes: [], boss: "elderdark" },
    ],
  },
  // ---------- Book 3: The Celestials. Eight stages a chapter: seven of minions, then the boss. ----------
  {
    // Book 3, chapter 1: The Falling Star
    stages: [
      st("g"),
      st("gc", 0.84),
      st("bg", 0.78),
      st("ccg", 0.5),
      st("bgc", 0.46),
      st("ggcb", 0.27),
      st("ebcg", 0.24),
      { foes: [], boss: "perihelion" },
    ],
  },
  {
    // Book 3, chapter 2: The Hunter in the Stars
    stages: [
      st("gg", 0.85),
      st("cb", 0.8),
      st("gcg", 0.5),
      st("bbc", 0.46),
      st("ccgb", 0.27),
      st("egbcg", 0.16),
      st("ebcbc", 0.15),
      { foes: [], boss: "asterion" },
    ],
  },
  {
    // Book 3, chapter 3: Where Stars Are Born
    stages: [
      st("gc", 0.82),
      st("bc", 0.78),
      st("ggb", 0.5),
      st("ccb", 0.45),
      st("gcbg", 0.26),
      st("ebcg", 0.2),
      st("ebccg", 0.15),
      { foes: [], boss: "carina" },
    ],
  },
  {
    // Book 3, chapter 4: The Spinning Heart
    stages: [
      st("gb", 0.8),
      st("cc", 0.78),
      st("gbc", 0.48),
      st("bbg", 0.44),
      st("ccgb", 0.25),
      st("egcbg", 0.15),
      st("ebbcc", 0.14),
      { foes: [], boss: "vela" },
    ],
  },
  {
    // Book 3, chapter 5: The Eye of the Sky, the book's finale
    stages: [
      st("gc", 0.8),
      st("cb", 0.74),
      st("gcb", 0.46),
      st("bcg", 0.42),
      st("gcbc", 0.24),
      st("ecbgc", 0.15),
      st("ebcbcg", 0.12),
      { foes: [], boss: "aeon" },
    ],
  },
  // ---------- Book 4: The Titans. Seven stages a chapter: six of minions, then the boss. ----------
  {
    // Book 4, chapter 1: The Waking Mountain
    stages: [
      st("gc", 0.8),
      st("bg", 0.74),
      st("gcb", 0.45),
      st("ccbg", 0.25),
      st("egcbg", 0.15),
      st("ebcbcg", 0.12),
      { foes: [], boss: "orogen" },
    ],
  },
  {
    // Book 4, chapter 2: The Root Below
    stages: [
      st("cg", 0.8),
      st("gb", 0.74),
      st("cbg", 0.45),
      st("ggcb", 0.25),
      st("ebgcc", 0.15),
      st("ecbgbc", 0.12),
      { foes: [], boss: "gnarlroot" },
    ],
  },
  {
    // Book 4, chapter 3: The Amber Hollow
    stages: [
      st("bc", 0.78),
      st("gcg", 0.48),
      st("bcb", 0.42),
      st("cgbc", 0.24),
      st("egbcb", 0.14),
      st("ebcgcb", 0.11),
      { foes: [], boss: "ambrel" },
    ],
  },
  {
    // Book 4, chapter 4: The Coiled Deep
    stages: [
      st("gb", 0.78),
      st("cgc", 0.48),
      st("bgb", 0.42),
      st("gcbg", 0.24),
      st("ecbcg", 0.14),
      st("ebgcbc", 0.11),
      { foes: [], boss: "coilvast" },
    ],
  },
  {
    // Book 4, chapter 5: The Forge at the Core
    stages: [
      st("gc", 0.78),
      st("bcg", 0.47),
      st("gbg", 0.42),
      st("cbgc", 0.24),
      st("egbcg", 0.14),
      st("ecbgcb", 0.11),
      { foes: [], boss: "anvilheart" },
    ],
  },
  {
    // Book 4, chapter 6: The Heart of the World, the book's finale
    stages: [
      st("gc", 0.8),
      st("bcg", 0.48),
      st("gbc", 0.42),
      st("cbgb", 0.24),
      st("egbcg", 0.15),
      st("ebcgcb", 0.12),
      { foes: [], boss: "primeva" },
    ],
  },
  // ---------- Book 5: Zenith. One chapter of fourteen stages: thirteen of Zenith's Chosen, then Zenith itself. ----------
  // It opens once Zenith has been beaten in its secret phase, ABOVE ALL (zenithStoryOpen in quests.ts), not by
  // clearing Book 4. Letters: s Seraphling, c Cantor, f Starforged, p Pillar Bearer, h Hour Monk, k Halo Knight, r Gloam Reaper.
  {
    // Zenith's Chapter: The Highest Point
    stages: [
      zc("s"),
      zc("c"),
      zc("f"),
      zc("p"),
      zc("h"),
      zc("sc", 0.8),
      zc("fp", 0.72),
      zc("k"),
      zc("shc", 0.48),
      zc("pfc", 0.44),
      zc("r"),
      zc("kshf", 0.16),
      // stage 13: Tetrael, Zenith's herald, sent down the stair in the stage 10 scene (VISION_STAGE)
      { foes: [], boss: "tetrael" },
      { foes: [], boss: "zenith" },
    ],
  },
  // ---------- Legacy Mode: the bosses' rebellion against Zenith, its own mode beside Story, an age before it. The rebels are
  // the bosses the player fights: the Hollow King warned the Reign 8, who gathered to put the rebellion down, while Aeon was
  // sent up the stair to warn Zenith. The player brings two loyal bosses (`champions` on the pair). Six chapters, six
  // stages each: five of the rebel bosses' armies (Story minion crews, `rb`), then a rebel boss. Beaten, each one lays down
  // its banner and can fight for the player. Its first chapter is always open. Never reorder these: progress is by position. ----------
  {
    // Legacy, chapter 1: The First Spark. The Lanternmaw lights the first rebel fire in the valley of ash, and its
    // drowned congregation is the first army to answer it. (No lieutenants here: theirs is also called the Lamplighter.)
    stages: [
      rb(8, "g"),
      rb(8, "gc", 0.8),
      rb(8, "bc", 0.72),
      rb(8, "ggc", 0.5),
      rb(8, "bgc", 0.46),
      { foes: [], boss: "lanternmaw" },
    ],
  },
  {
    // Legacy, chapter 6, the finale: The Red Harvest. Written ahead of chapters 2 to 5, so it carries its own number, and it
    // opens once Zenith has joined the roster. The rebels' last armies hold the stair for Carnael. Its boss stage opens on the
    // "clash" scene: Carnael breaks Zenith, Aeon arrives with its warning, and the two fuse into Zenaeon, who fights the
    // reaper in the player's place.
    num: 6,
    needsZenith: true,
    stages: [
      rb(14, "gcb", 0.7),
      rb(12, "bbc", 0.64),
      rb(14, "ggcc", 0.52),
      rb(12, "ebg", 0.72),
      rb(14, "egcb", 0.58),
      { foes: [], boss: "carnael", ally: "zenaeon" },
    ],
  },
  {
    // Legacy, chapter 5: The Warden Below. Vinculum, the jailer under the stair, joins the rebellion and means to open the
    // one cell it was made to keep shut. Beaten, it drops the key, but the lock is already broken, and Carnael gets out (Chapter 6).
    num: 5,
    stages: [
      rb(23, "bg", 0.9),
      rb(22, "gcc", 0.66),
      rb(23, "bbg", 0.6),
      rb(22, "gcbc", 0.5),
      rb(23, "ebc", 0.68),
      { foes: [], boss: "vinculum" },
    ],
  },
  {
    // Legacy, chapter 2: The Unpaid Tithe. Obolus, the Tithe Taker who keeps Zenith's ledger, turns rebel and carries the
    // tithe of light off to the rebels' camp instead of up the stair.
    num: 2,
    stages: [
      rb(10, "gc", 0.85),
      rb(11, "bg", 0.76),
      rb(10, "cc", 0.8),
      rb(11, "bcg", 0.52),
      rb(10, "egc", 0.55),
      { foes: [], boss: "obolus" },
    ],
  },
  {
    // Legacy, chapter 3: The Silent Bell. Campanel, the bell that rings every dawn at the foot of the stair, sides with the
    // rebels and holds its tongue, so no morning comes to anyone still loyal. The Hush's silent order keeps the tower.
    num: 3,
    stages: [
      rb(13, "gb", 0.85),
      rb(13, "cc", 0.8),
      rb(13, "bgc", 0.56),
      rb(13, "ggb", 0.55),
      rb(13, "ecb", 0.6),
      { foes: [], boss: "campanel" },
    ],
  },
  {
    // Legacy, chapter 4: The Lamps of the Stair. Ignifer, the Lamplighter, turns rebel and puts out Zenith's lamps one by one
    // as the rebels climb. Beaten, it is too late: the stair is dark, and the light at the top of the sky flickers for the first
    // time (which is where Chapter 5, the Warden, picks up).
    num: 4,
    stages: [
      rb(24, "gc", 0.9),
      rb(15, "bb", 0.74),
      rb(24, "gcb", 0.6),
      rb(15, "ccg", 0.6),
      rb(24, "ebg", 0.64),
      { foes: [], boss: "ignifer" },
    ],
  },
];

/** Zenith's own chapter: the last chapter of Story, and the whole of Book 5. Legacy Mode's chapters come after it. */
export const ZENITH_CH = 26;
/** The stage (0-based) of Zenith's Chapter that opens with Zenith sending its herald down the stair: stage 10. */
export const VISION_STAGE = 9;

/** The books of Story mode: where each starts in CHAPTERS and how many chapters it will have once it is all written. */
export const BOOKS = [
  { first: 0, planned: 8 },
  { first: 8, planned: 7 },
  { first: 15, planned: 5 },
  { first: 20, planned: 6 },
  { first: 26, planned: 1 },
  // Legacy Mode, the bosses' rebellion against Zenith: shown in its own mode, never among Story's books
  { first: 27, planned: 6 },
] as const;

/** The book that holds Legacy Mode's chapters. */
export const LEGACY_BOOK = 5;
/** Legacy's Chapter 6, the finale, the Red Harvest (index 28): it opens once Zenith has joined the roster. */
export const LEGACY_FINALE = 28;
/** Legacy's Chapter 6 as an `extraOpen` entry, when `open` (pass `legacyFinaleOpen()` from quests.ts). */
export const legacyFinaleExtra = (open: boolean): number[] => (open ? [LEGACY_FINALE] : []);
/** Whether a chapter belongs to Legacy Mode rather than Story. */
export const isLegacy = (ch: number) => bookOf(ch) === LEGACY_BOOK;
/** The books one mode shows: Story's five, or Legacy's one. */
export const booksFor = (legacy: boolean): number[] => (legacy ? [LEGACY_BOOK] : BOOKS.map((_, i) => i).filter((i) => i !== LEGACY_BOOK));
/** Chapters drawn in Zenith's world (its own chapter and every Legacy chapter): its map colours and its sky. */
export const inZenithRealm = (ch: number) => ch === ZENITH_CH || isLegacy(ch);

/** Which book (0-based) a chapter belongs to. */
export const bookOf = (ch: number) => {
  let b = 0;
  while (b + 1 < BOOKS.length && ch >= BOOKS[b + 1].first) b++;
  return b;
};
/** The chapters of one book that exist so far, as indexes into CHAPTERS, in the order of their numbers. */
export const chaptersOf = (book: number) => {
  const end = BOOKS[book + 1]?.first ?? CHAPTERS.length;
  return Array.from({ length: Math.max(0, Math.min(end, CHAPTERS.length) - BOOKS[book].first) }, (_, i) => BOOKS[book].first + i).sort((a, b) => chapterInBook(a) - chapterInBook(b));
};
/** A chapter's number inside its own book, from 1. */
export const chapterInBook = (ch: number) => CHAPTERS[ch]?.num ?? ch - BOOKS[bookOf(ch)].first + 1;
/** The last chapter of a whole book: beating its boss finishes the book. */
export const endsBook = (ch: number) => chapterInBook(ch) === BOOKS[bookOf(ch)].planned;

/**
 * The chapter played after this one. Story's follow the list; Legacy's go by their numbers, since they were not written
 * in order (Chapter 2 sits after Chapter 6 in the list). Past the last, CHAPTERS.length.
 */
export const nextChapter = (ch: number): number => {
  if (!isLegacy(ch)) return ch + 1;
  const n = chapterInBook(ch);
  return chaptersOf(LEGACY_BOOK).find((c) => chapterInBook(c) > n) ?? CHAPTERS.length;
};
/** The chapter played before this one, in the same order as `nextChapter` (-1 before the first). */
export const prevChapter = (ch: number): number => {
  if (!isLegacy(ch)) return ch - 1;
  const n = chapterInBook(ch);
  return chaptersOf(LEGACY_BOOK).filter((c) => chapterInBook(c) < n).pop() ?? -1;
};

/** How many stages a chapter has (Book 1 has ten, Book 2 nine, Book 3 eight, Book 4 seven, Zenith's Chapter fourteen, Legacy six). */
export const stagesIn = (ch: number) => CHAPTERS[ch]?.stages.length ?? 10;
/** The boss's stage, the last of the chapter. */
export const lairOf = (ch: number) => stagesIn(ch) - 1;

/**
 * The player's pair. In Legacy Mode the player fights for Zenith as two loyal bosses, so a Legacy pair also carries
 * `champions`: the two bosses who fight side by side in place of `a` and `b` (bosses cannot fuse).
 */
export type Pair = { a: Power; b: Power; fuse: boolean; champions?: [BossId, BossId] };

/** The bosses who stand with Zenith from the start of Legacy: the Reign 8, gathered by the Hollow King's warning. */
export const LOYAL_BOSSES: BossId[] = ["hollowking", "nullshade", "maelstrom", "magmaw", "everwinter", "riftmaker", "blacksun", "axiom"];
/** Every boss who can fight for the player in Legacy: the Reign 8, then each boss this browser has beaten. Never Carnael. */
export const championPool = (beaten: BossId[]): BossId[] => [...new Set([...LOYAL_BOSSES, ...beaten])].filter((id) => id !== "carnael");
/** A boss's health when it fights for the player, so a pair of bosses stays a fair fight for the rebels. */
const CHAMPION_HP = 135;
/** A boss fighting on the player's side in Legacy. */
export const championOf = (id: BossId): FighterDef => ({ ...BOSSES[id], hp: Math.min(BOSSES[id].hp, CHAMPION_HP) });

/** Team attacks need two different fighters; the same fighter twice can only fuse. Legacy's two bosses always fight side by side. */
export const canTeam = (p: Pair) => !!p.champions || p.a !== p.b;

/** Who fights for the player on a stage: its ally when it has one (Zenaeon), otherwise their own pair. */
export const sideFor = (p: Pair, stage: Stage | undefined): FighterDef[] => (stage?.ally === "zenaeon" ? [ZENAEON] : playerSide(p));

/** The player's side: Legacy's two loyal bosses, one hybrid, or two fighters each carrying a team attack. */
export function playerSide(p: Pair): FighterDef[] {
  if (p.champions) return p.champions.map(championOf);
  if (p.fuse || !canTeam(p)) {
    const [a, b] = fusionOrder(p.a, p.b);
    return [hybridOf(a, b)];
  }
  return [withTeamAttack(p.a, p.b), withTeamAttack(p.b, p.a)];
}

export function enemySide(ch: number, stage: Stage): FighterDef[] {
  if (stage.boss) return [storyBoss(stage.boss)];
  const share = stage.enemyHp ?? 1;
  if (stage.chosen) {
    return stage.chosen.map((id) => {
      const d = CHOSEN[id];
      // a Halo Knight or Gloam Reaper leads the others, so it keeps more of its health, like a lieutenant
      const k = d.minion?.kind === "elite" ? Math.max(0.35, Math.min(1, share * 1.6)) : share;
      return k === 1 ? d : { ...d, hp: Math.round(d.hp * k) };
    });
  }
  const crew = MINIONS[stage.crew ?? ch] ?? MINIONS[0];
  return stage.foes.map((kind) => {
    const d = crew[kind];
    // the lieutenant leads the crowd, so it keeps more of its health than the minions beside it
    const k = kind === "elite" ? Math.max(0.35, Math.min(1, share * 1.6)) : share;
    return k === 1 ? d : { ...d, hp: Math.round(d.hp * k) };
  });
}

/** Everyone in the fight, with the player on team 0 and the stage on team 1. */
export function stageLineup(p: Pair, ch: number, stage: Stage): { defs: FighterDef[]; teams: number[] } {
  const mine = sideFor(p, stage);
  const theirs = enemySide(ch, stage);
  return { defs: [...mine, ...theirs], teams: [...mine.map(() => 0), ...theirs.map(() => 1)] };
}

// ---------- Saved progress (this browser only) ----------

const PROGRESS_KEY = "npc-arena-story";

/** How many stages of each chapter are cleared, and how many times each chapter's boss has been beaten. */
export type Progress = { cleared: number[]; wins: number[] };

/** Beat a chapter's boss this many times, and own a quest fighter, to skip straight to that boss. */
export const SKIP_AFTER = 2;

/** Whether "Skip to the boss" is open for this chapter. */
export const canSkipToBoss = (p: Progress, ch: number, hasQuester: boolean) =>
  hasQuester && (p.cleared[ch] ?? 0) >= stagesIn(ch) && (p.wins[ch] ?? 0) >= SKIP_AFTER;

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "null");
    if (raw && Array.isArray(raw.cleared)) {
      const cleared = CHAPTERS.map((_, i) => Math.max(0, Math.min(stagesIn(i), Number(raw.cleared[i]) || 0)));
      const saved: unknown[] = Array.isArray(raw.wins) ? raw.wins : [];
      // a chapter cleared before boss wins were counted has at least its one win
      const wins = cleared.map((c, i) => Math.max(c >= stagesIn(i) ? 1 : 0, Math.min(9999, Math.floor(Number(saved[i]) || 0))));
      return { cleared, wins };
    }
  } catch {
    // unreadable storage starts fresh
  }
  return { cleared: CHAPTERS.map(() => 0), wins: CHAPTERS.map(() => 0) };
}

/**
 * A chapter opens once every stage of the one before it is cleared, or it is in `extraOpen` (a developer-mode pick kept
 * open besides real progress). Zenith's Chapter never opens from Book 4: only from `extraOpen`, which callers fill
 * with `zenithOpenExtra` once Zenith has been beaten in its secret phase. Legacy's Chapter 6 (`needsZenith`) opens the
 * same way, from `legacyFinaleExtra` once Zenith has joined the roster.
 */
export const chapterOpen = (cleared: number[], ch: number, extraOpen: number[] = []) =>
  ch === ZENITH_CH || CHAPTERS[ch]?.needsZenith ? extraOpen.includes(ch) : ch === 0 || ch === BOOKS[LEGACY_BOOK].first || (cleared[prevChapter(ch)] ?? 0) >= stagesIn(prevChapter(ch)) || extraOpen.includes(ch);

/** The furthest open chapter of one mode (Story, or Legacy when `legacy`): where that mode picks up. */
export function furthestOpen(cleared: number[], extraOpen: number[], legacy: boolean): number {
  const chs = booksFor(legacy).flatMap((b) => chaptersOf(b));
  let at = chs[0] ?? 0;
  for (let i = 1; i < chs.length && chapterOpen(cleared, chs[i], extraOpen); i++) at = chs[i];
  return at;
}

/** Zenith's Chapter as an `extraOpen` entry, when `open` (pass `zenithStoryOpen()` from quests.ts). */
export const zenithOpenExtra = (open: boolean): number[] => (open ? [ZENITH_CH] : []);

/** Every chapter of each book in `books` — what a developer-mode book pick keeps open. */
export const chaptersOfBooks = (books: number[]): number[] => books.flatMap((b) => chaptersOf(b));

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // storage full or blocked: progress just isn't kept
  }
}


const SEEN_KEY = "npc-arena-story-intros";

/** The chapters whose opening scene this browser has already watched. */
export function loadSeenIntros(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < CHAPTERS.length) : [];
  } catch {
    return [];
  }
}

export function markIntroSeen(ch: number) {
  try {
    const seen = new Set(loadSeenIntros());
    seen.add(ch);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // storage blocked: the intro just plays again next time
  }
}

/**
 * The Story bosses this browser has beaten, in chapter order, plus any in `extra` (a developer-mode pick
 * kept unlocked besides real progress). Each one is a fighter you can pick outside Story.
 */
export const bossesBeaten = (cleared: number[], extra: BossId[] = []): BossId[] => {
  const real = CHAPTERS.flatMap((ch, i) => {
    const boss = ch.stages[lairOf(i)]?.boss;
    // Zenith stays the secret boss: beating it in its own chapter does not add it to the roster
    return boss && joinsRoster(boss) && (cleared[i] ?? 0) >= stagesIn(i) ? [boss] : [];
  });
  return [...new Set([...real, ...extra])];
};

/** How many bosses can join the roster from Story, counting Zenith, which joins another way. */
export const ROSTER_BOSS_TOTAL = new Set(CHAPTERS.flatMap((c) => { const b = c.stages[c.stages.length - 1]?.boss; return b && joinsRoster(b) ? [b] : []; })).size + 1;

/** Every chapter with every stage cleared: what developer mode treats as open. */
export const allCleared = (): number[] => CHAPTERS.map((_, i) => stagesIn(i));

/** The book and chapter (both from 1) each boss closes. */
export const bossChapter = (id: BossId): { book: number; chapter: number } => {
  const ch = Math.max(0, CHAPTERS.findIndex((c) => c.stages.some((s) => s.boss === id)));
  return { book: bookOf(ch) + 1, chapter: chapterInBook(ch) };
};
