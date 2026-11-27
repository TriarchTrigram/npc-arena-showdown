// Zenith's Chosen: the enemies of Zenith's own Story chapter (Book 5). Zenith made each of them a gift of power, so
// each fights like one roster element (its `base`, which gives it that element's voice and move shapes) under its
// own name, moves and colours, and carries one gifted move: a smaller copy of one of Zenith's own attacks, drawn in
// Zenith's gold. Unlike other minions they wear a halo and arrive with entrances of their own (chosen-intros.ts).
import { DEF_BY_ID, type ChosenId, type FighterDef, type MinionKind, type Power } from "./fighters";
import { borrowLook } from "./move-looks";
import { HP, ROLE, SPEED, movesFor, surgeOf } from "./minions";
import { GOLD, ZENITH, ZENITH_ALL_MOVES } from "./zenith";

/** The Chosen stand closer to Zenith than any boss's minions, so they bring a little more health. */
const GIFTED_HP = 1.2;

type Spec = {
  kind: MinionKind;
  base: Power;
  name: string;
  color: string;
  power: string;
  ability: string;
  tone: [string, string];
  /** Its own names for its moves, in the order movesFor picks them. */
  moves: string[];
  /** Zenith's move it was given a share of, and what it calls its copy. */
  gift: { from: string; name: string };
};

/** Zenith with every move it has in either mode, so a gift can be any of them. */
const GIVER: FighterDef = { ...ZENITH, moves: ZENITH_ALL_MOVES };

function chosen(id: ChosenId, s: Spec): FighterDef {
  const d = DEF_BY_ID[s.base];
  const key = `chosen-${id}`;
  const own = movesFor(s.kind, d.moves).map((m, i) => {
    const mid = `${key}-${i}`;
    borrowLook(mid, m.id, s.tone[0], s.tone[1]);
    return { ...m, id: mid, name: s.moves[i] ?? m.name };
  });
  const giftId = `${key}-gift`;
  borrowLook(giftId, s.gift.from, GOLD, "hsl(0 0% 100%)");
  const gift = surgeOf(GIVER, s.gift.from, giftId, s.gift.name);
  return {
    id: s.base, name: s.name, power: s.power, role: ROLE[s.kind], ability: s.ability,
    color: s.color, glow: GOLD, hp: Math.round(HP[s.kind] * GIFTED_HP), speed: Math.round(d.speed * SPEED[s.kind]),
    moves: [...own, gift],
    minion: { kind: s.kind, mark: GOLD, chosen: id },
  };
}

export const CHOSEN: Record<ChosenId, FighterDef> = {
  seraphling: chosen("seraphling", {
    kind: "grunt", base: "aero", name: "Seraphling", color: "hsl(40 40% 82%)",
    power: "Wings of Morning", ability: "Zenith gave it two wings of morning light. It is the smallest of the Chosen, and the fastest down out of the sky.",
    tone: ["hsl(44 90% 74%)", "hsl(0 0% 100%)"], moves: ["Feather Kick", "Wingbeat Rush", "Feather Blade"],
    gift: { from: "meridian-step", name: "Morning Step" },
  }),
  cantor: chosen("cantor", {
    kind: "caster", base: "psy", name: "Cantor", color: "hsl(272 30% 60%)",
    power: "The Hymn", ability: "Zenith gave it a hymn with no end. Whatever hears it is lifted, pushed and held by the notes.",
    tone: ["hsl(276 70% 70%)", "hsl(46 100% 84%)"], moves: ["Hushing Palm", "Rising Hymn", "Choir Wave", "Final Chord"],
    gift: { from: "palm-of-heaven", name: "Hymn of Heaven" },
  }),
  starforged: chosen("starforged", {
    kind: "grunt", base: "electro", name: "Starforged", color: "hsl(214 30% 40%)",
    power: "Star Iron", ability: "Zenith hammered it out of a fallen star. It still glows like hot iron and crackles when it moves.",
    tone: ["hsl(200 100% 70%)", "hsl(0 0% 100%)"], moves: ["Star Iron Fist", "Meteor Line", "Starfall Shot"],
    gift: { from: "star-knuckle", name: "Star Knuckle" },
  }),
  pillarbearer: chosen("pillarbearer", {
    kind: "brute", base: "terra", name: "Pillar Bearer", color: "hsl(36 24% 52%)",
    power: "Heaven's Weight", ability: "Zenith gave it one of the pillars that hold up the sky to carry. It has never once put it down.",
    tone: ["hsl(40 50% 60%)", "hsl(48 100% 80%)"], moves: ["Pillar Fist", "Rising Column", "Heaven's Weight"],
    gift: { from: "fists-of-creation", name: "Stones of Creation" },
  }),
  hourmonk: chosen("hourmonk", {
    kind: "caster", base: "chrono", name: "Hour Monk", color: "hsl(210 24% 46%)",
    power: "Borrowed Hours", ability: "Zenith lent it hours from the end of the world. It spends them slowing others down and gives them back to itself.",
    tone: ["hsl(42 70% 66%)", "hsl(210 80% 86%)"], moves: ["Borrowed Second", "Hour Bolt", "Stopped Hour", "Given Back"],
    gift: { from: "seal-ring", name: "Ring of Hours" },
  }),
  haloknight: chosen("haloknight", {
    kind: "elite", base: "lux", name: "Halo Knight", color: "hsl(44 36% 88%)",
    power: "Crown Light", ability: "Zenith took a star out of its own crown and set it in this knight's halo. It guards the stairs to the throne.",
    tone: ["hsl(46 100% 70%)", "hsl(0 0% 100%)"], moves: ["Halo Strike", "Oath Beam", "Crown Flare", "Lances of the Throne"],
    gift: { from: "judgement-palm", name: "Small Judgement" },
  }),
  gloamreaper: chosen("gloamreaper", {
    kind: "elite", base: "umbra", name: "Gloam Reaper", color: "hsl(240 30% 18%)",
    power: "Scepter Shard", ability: "Zenith broke a shard off the Millennium Scepter and gave it to the one Chosen it trusts with the dark. It cuts the air open to walk through.",
    tone: ["hsl(220 80% 76%)", "hsl(46 100% 80%)"], moves: ["Shard Slash", "Gloam Step", "Dusk Orb", "Night of Ages"],
    gift: { from: "royal-strike", name: "Hundred Year Reap" },
  }),
};

/** A stage of the Chosen written as letters, one per Chosen. */
const CODE: Record<string, ChosenId> = { s: "seraphling", c: "cantor", f: "starforged", p: "pillarbearer", h: "hourmonk", k: "haloknight", r: "gloamreaper" };
export const chosenOf = (code: string): ChosenId[] => [...code].map((k) => CODE[k]);
