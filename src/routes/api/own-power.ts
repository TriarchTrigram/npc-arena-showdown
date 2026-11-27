import { createFileRoute } from "@tanstack/react-router";
import { generateMessage } from "@lovable.dev/ai-gateway";
import { z } from "zod";
import {
  ANIMS,
  FIGHTERS,
  MAX_OWN_MOVES,
  MIN_OWN_MOVES,
  OWN_BURSTS,
  OWN_GLYPHS,
  OWN_KINDS,
  OWN_MOTIONS,
  OWN_SIZES,
  OWN_SPARKS,
  OWN_SPEEDS,
  OWN_STRENGTHS,
  OWN_TRAILS,
  ROLES,
  STATUSES,
  cleanOwn,
  type OwnKind,
} from "@/lib/fighters";

const Body = z.object({ idea: z.string().trim().min(2).max(60) });

const KIND_WORDS: Record<OwnKind, string> = {
  melee: "a close strike in front",
  projectile: "shots fired from the hand",
  beam: "a held ray from the hand",
  burst: "a blast all around the user",
  dash: "a rush forward through enemies",
  eruption: "pillars bursting up from the ground under the target",
  rain: "pieces falling from the sky around the target",
  blink: "vanish and reappear behind the target to strike",
  heal: "heals the user",
  zone: "a lingering field on the ground",
  pull: "yanks the target in",
};

const enumOf = (xs: readonly string[]) => z.enum(xs as [string, ...string[]]);
const clamp = (v: number, lo: number, hi: number) =>
  Math.round(Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo)));

const MoveDesign = z.object({
  name: z.string(),
  kind: enumOf(OWN_KINDS),
  anim: enumOf(ANIMS),
  strength: enumOf(OWN_STRENGTHS),
  size: enumOf(OWN_SIZES),
  speed: enumOf(OWN_SPEEDS),
  count: z.number(),
  arc: z.boolean(),
  pierce: z.boolean(),
  effect: z.boolean(),
  hue: z.number(),
  spark: enumOf(OWN_SPARKS),
  glyph: enumOf(OWN_GLYPHS),
  trail: enumOf(OWN_TRAILS),
  motion: enumOf(OWN_MOTIONS),
  burst: enumOf(OWN_BURSTS),
});

const Answer = z.object({
  fits: z.boolean(),
  name: z.string(),
  word: z.string(),
  about: z.string(),
  base: enumOf(FIGHTERS.map((f) => f.id)),
  role: enumOf(ROLES),
  mainHue: z.number(),
  mainSaturation: z.number(),
  mainLightness: z.number(),
  glowHue: z.number(),
  glowLightness: z.number(),
  spark: enumOf(OWN_SPARKS),
  effect: enumOf([...STATUSES, "none"]),
  moves: z.array(MoveDesign).min(1),
});

const takenNames = FIGHTERS.flatMap((f) => f.moves.map((m) => m.name)).join(", ");
const kindList = OWN_KINDS.map((k) => `${k}: ${KIND_WORDS[k]}`).join("\n");

const SYSTEM = `You design powers for NPC Arena, a game where stick figures with elemental powers fight.
A player typed a power idea. Turn it into an original power the game can play, with moves nobody in the game has.
Return ONLY valid JSON (no markdown fences, no commentary) matching this exact schema:
{
  "fits": boolean (false when hateful, sexual, about hurting real people, or immortal/invincible/unkillable),
  "name": string (1-3 words Title Case, max 22 chars),
  "word": string (1 short word, max 10 letters),
  "about": string (one plain sentence under 100 chars),
  "base": one of ${JSON.stringify(FIGHTERS.map((f) => f.id))},
  "role": one of ${JSON.stringify(ROLES)},
  "mainHue": number (0-359),
  "mainSaturation": number (30-100),
  "mainLightness": number (25-62),
  "glowHue": number (0-359),
  "glowLightness": number (60-92),
  "spark": one of ${JSON.stringify(OWN_SPARKS)},
  "effect": one of ${JSON.stringify([...STATUSES, "none"])},
  "moves": array of ${MIN_OWN_MOVES} to ${MAX_OWN_MOVES} objects, each with:
    { "name": string, "kind": one of ${JSON.stringify(OWN_KINDS)}, "anim": one of ${JSON.stringify(ANIMS)}, "strength": one of ${JSON.stringify(OWN_STRENGTHS)}, "size": one of ${JSON.stringify(OWN_SIZES)}, "speed": one of ${JSON.stringify(OWN_SPEEDS)}, "count": number, "arc": boolean, "pierce": boolean, "effect": boolean, "hue": number (0-359), "spark": one of ${JSON.stringify(OWN_SPARKS)}, "glyph": one of ${JSON.stringify(OWN_GLYPHS)}, "trail": one of ${JSON.stringify(OWN_TRAILS)}, "motion": one of ${JSON.stringify(OWN_MOTIONS)}, "burst": one of ${JSON.stringify(OWN_BURSTS)} }
}
- The first move is a close strike (kind "melee"). Use a mix after that.
- Move names come from the idea, 1 to 3 plain words, no numbers, all different. Never use: ${takenNames}.
- Plain words, no em dashes, no hype, UK spelling (colour, armour).

Kinds of move:
${kindList}`;

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export const Route = createFileRoute("/api/own-power")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ ok: false, code: "short" }, { status: 400 });

        try {
          const response = await generateMessage({
            model: "anthropic/claude-haiku-5-5",
            max_tokens: 4000,
            system: SYSTEM,
            messages: [{ role: "user", content: `The player's power idea: ${JSON.stringify(parsed.data.idea)}` }],
          });
          const rawText = response.content
            .filter((block): block is { type: "text"; text: string } => block.type === "text")
            .map((block) => block.text)
            .join("")
            .trim();
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            return Response.json({ ok: false, code: "failed" });
          }
          const validated = Answer.safeParse(JSON.parse(jsonMatch[0]));
          if (!validated.success) {
            console.error("own power validation failed", validated.error);
            return Response.json({ ok: false, code: "failed" });
          }
          const object = validated.data;
          if (!object.fits) return Response.json({ ok: false, code: "refused" });
          const power = cleanOwn({
            id: newId(),
            name: object.name,
            word: object.word,
            about: object.about,
            base: object.base,
            role: object.role,
            color: hsl(clamp(object.mainHue, 0, 359), clamp(object.mainSaturation, 30, 100), clamp(object.mainLightness, 25, 62)),
            glow: hsl(clamp(object.glowHue, 0, 359), 100, clamp(object.glowLightness, 60, 92)),
            spark: object.spark,
            status: object.effect === "none" ? null : object.effect,
            moves: object.moves,
          });
          if (!power) {
            return Response.json({ ok: false, code: "failed" });
          }
          return Response.json({ ok: true, power });
        } catch (error) {
          console.error("own power failed:", error);
          return Response.json({ ok: false, code: "failed" });
        }
      },
    },
  },
});