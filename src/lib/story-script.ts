// Who says what in Story mode's scenes. The words live in strings.json under story.script.c<chapter>;
// this file only says how many lines each scene has and who speaks each one.
import type { StringKey } from "@/lib/strings";
import { CHAPTERS, bookOf, lairOf } from "./story";

/** "zenith", "aeon" and "ally" speak only in the clash scene (Legacy's Chapter 5): Zenith, Aeon, and the two fused, Zenaeon. */
export type Speaker = "narrator" | "you" | "foe" | "boss" | "zenith" | "aeon" | "ally";
export type Line = { who: Speaker; key: StringKey };
/**
 * "vision" is the scene of Zenith sending its herald down the stair, before stage 10 of Zenith's Chapter. "clash" opens a
 * stage with an ally (Legacy's Chapter 5 boss): Carnael fights Zenith, Aeon comes down, and the two fuse into Zenaeon.
 */
export type SceneKind = "intro" | "stage" | "outro" | "ending" | "vision" | "clash";
export type Scene = { kind: SceneKind; ch: number; stage: number };

const k = (ch: number, part: string, n: number) => `story.script.c${ch + 1}.${part}.l${n}` as StringKey;

/** Book 2's epilogue, after the Elder Dark falls: the narrator, then the player's pair, then the closing line. */
const ENDING: Line[] = [
  { who: "narrator", key: "story.ending.l1" },
  { who: "narrator", key: "story.ending.l2" },
  { who: "narrator", key: "story.ending.l3" },
  { who: "narrator", key: "story.ending.l4" },
  { who: "you", key: "story.ending.l5" },
  { who: "narrator", key: "story.ending.l6" },
];

/** Book 3's epilogue, after Aeon falls: the same shape, the narrator, the player's pair, then the closing line. */
const ENDING3: Line[] = [
  { who: "narrator", key: "story.ending3.l1" },
  { who: "narrator", key: "story.ending3.l2" },
  { who: "narrator", key: "story.ending3.l3" },
  { who: "narrator", key: "story.ending3.l4" },
  { who: "you", key: "story.ending3.l5" },
  { who: "narrator", key: "story.ending3.l6" },
];

/** Book 4's epilogue, after Primeva lets her children stay: the same shape, the narrator, the player's pair, then the closing line. */
const ENDING4: Line[] = [
  { who: "narrator", key: "story.ending4.l1" },
  { who: "narrator", key: "story.ending4.l2" },
  { who: "narrator", key: "story.ending4.l3" },
  { who: "narrator", key: "story.ending4.l4" },
  { who: "you", key: "story.ending4.l5" },
  { who: "narrator", key: "story.ending4.l6" },
];

/** Book 5's epilogue, after Zenith is beaten in its own chapter: the same shape, the narrator, the player's pair, then the closing line. */
const ENDING5: Line[] = [
  { who: "narrator", key: "story.ending5.l1" },
  { who: "narrator", key: "story.ending5.l2" },
  { who: "narrator", key: "story.ending5.l3" },
  { who: "narrator", key: "story.ending5.l4" },
  { who: "you", key: "story.ending5.l5" },
  { who: "narrator", key: "story.ending5.l6" },
];

/**
 * The stage 10 scene of Zenith's Chapter: Zenith (the "boss" speaker) explains what will happen, its herald Tetrael
 * (the "foe" speaker) laughs and answers, and on the narrator's closing line it vanishes in an impact frame
 * (VISION_GONE, the line it disappears on).
 */
const VISION_LINES: Speaker[] = ["narrator", "boss", "boss", "boss", "foe", "foe", "narrator"];
export const VISION_GONE = VISION_LINES.length - 1;

/**
 * The clash scene of Legacy's Chapter 5 (the "boss" speaker is Carnael). Carnael climbs out of the broken seal and goes for
 * Zenith; from CLASH_FIGHT the two really fight behind the words, until CLASH_STOP, where Zenith is beaten to one knee.
 * Aeon comes down on CLASH_AEON, the two old lights fuse on CLASH_FUSE, and Zenaeon (the "ally") has the last word but one.
 */
const CLASH_LINES: Speaker[] = ["narrator", "boss", "zenith", "boss", "narrator", "zenith", "boss", "aeon", "zenith", "narrator", "ally", "boss"];
/** The line Carnael first speaks on: it climbs out of the seal just before. */
export const CLASH_REVEAL = 1;
export const CLASH_FIGHT = 3;
export const CLASH_STOP = 6;
export const CLASH_AEON = 7;
export const CLASH_FUSE = 9;

/** The lines of one scene: a chapter's opening, the words before a stage, the boss's last words, or a book's ending. */
export function sceneLines(scene: Scene): Line[] {
  const { kind, ch, stage } = scene;
  if (kind === "vision") return VISION_LINES.map((who, i) => ({ who, key: k(ch, "vision", i + 1) }));
  if (kind === "clash") return CLASH_LINES.map((who, i) => ({ who, key: k(ch, "clash", i + 1) }));
  if (kind === "ending") return bookOf(ch) === 4 ? ENDING5 : bookOf(ch) === 3 ? ENDING4 : bookOf(ch) === 2 ? ENDING3 : ENDING;
  if (kind === "intro") return [1, 2, 3].map((n) => ({ who: "narrator", key: k(ch, "intro", n) }));
  // a boss that is not the chapter's last (Zenith's herald on stage 13) has its own last words under its stage
  const midBoss = stage < lairOf(ch) && !!CHAPTERS[ch]?.stages[stage]?.boss;
  if (kind === "outro") {
    const part = midBoss ? `s${stage + 1}.outro` : "outro";
    return [{ who: "boss", key: k(ch, part, 1) }, { who: "you", key: k(ch, part, 2) }, { who: "narrator", key: k(ch, part, 3) }];
  }
  // a boss's stage: the last of the chapter (s10 in Book 1, s9 in Book 2, s8 in Book 3), or a boss stage before it
  if (stage >= lairOf(ch) || midBoss) {
    const part = `s${Math.min(stage, lairOf(ch)) + 1}`;
    return [{ who: "boss", key: k(ch, part, 1) }, { who: "you", key: k(ch, part, 2) }, { who: "boss", key: k(ch, part, 3) }];
  }
  return [{ who: "foe", key: k(ch, `s${stage + 1}`, 1) }, { who: "you", key: k(ch, `s${stage + 1}`, 2) }];
}
