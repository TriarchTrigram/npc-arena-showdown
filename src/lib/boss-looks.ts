// The Story bosses' second layer, drawn by the engine around their designs in boss-designs.ts (all 26, Books 1 to 4).
// - drawBossLook: what each one now wears on top of its design ("back" behind the body, "front" over it) and what drifts
//   off it at rest. Entries live in boss-looks-a.ts (Nullshade to the Somnarch) and boss-looks-b.ts (the Hush to Primeva).
// - drawBossCharge: its power gathering in the hand as a move winds up, and its own mark thrown off as the move leaves.
// - drawBossImpact: the same mark left on whoever a boss's move hits (from the fx loop in drawScene).
// - bossArrivalOf: an extra layer on each boss entrance (BOSS_INTROS in spawn-intros.ts): a sign of its power on the floor
//   before it lands, and a flourish of that power as it does.
// None of it is hair: only Nova wears hair.
import type { BossDesign } from "./fighters";
import { BOSSES } from "./bosses";
import type { BossRig } from "./boss-designs";
import type { Fx } from "./move-looks";
import type { IntroDraw } from "./spawn-intros";
import { clamp, seg, sigilK, type Arrival } from "./roster-looks";
import { LOOKS_A } from "./boss-looks-a";
import { LOOKS_B } from "./boss-looks-b";
import { ZENITH_ALL_MOVES } from "./zenith";
import { ZENITH_LOOK } from "./zenith-look";
import { TETRAEL_ALL_MOVES } from "./tetrael";
import { TETRAEL_LOOK } from "./tetrael-look";
import { CARNAEL_LOOK } from "./carnael-look";
import { VINCULUM_LOOK } from "./vinculum-look";
import { OBOLUS_LOOK } from "./obolus-look";
import { CAMPANEL_LOOK } from "./campanel-look";
import { IGNIFER_LOOK } from "./ignifer-look";
import { ZENAEON } from "./zenaeon";
import { ZENAEON_LOOK } from "./zenaeon-look";
import type { BossLook, Pt } from "./boss-looks-kit";

const LOOKS: Partial<Record<BossDesign, BossLook>> = { ...LOOKS_A, ...LOOKS_B, zenith: ZENITH_LOOK, tetrael: TETRAEL_LOOK, carnael: CARNAEL_LOOK, zenaeon: ZENAEON_LOOK, vinculum: VINCULUM_LOOK, obolus: OBOLUS_LOOK, campanel: CAMPANEL_LOOK, ignifer: IGNIFER_LOOK };

/** Draw a boss's new look in one layer: "back" goes under its design, "front" over it. */
export function drawBossLook(ctx: CanvasRenderingContext2D, design: BossDesign, layer: "back" | "front", r: BossRig, s: number, face: number, t: number, alive: boolean, vx: number) {
  const fn = LOOKS[design]?.[layer];
  if (!fn) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  fn(ctx, r, s, face, t, alive, vx);
  ctx.restore();
}

/**
 * A boss's power gathering in the hand: k runs 0..1 through the wind-up and stays up through the strike.
 * `release` (0..1) throws the boss's own mark off the hand as the move leaves it. Returns false when it has none.
 */
export function drawBossCharge(ctx: CanvasRenderingContext2D, design: BossDesign, h: Pt, s: number, t: number, k: number, face: number, release: number): boolean {
  const lk = LOOKS[design];
  if (!lk) return false;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  lk.charge(ctx, h, s, t, clamp(k, 0.05, 1), face);
  if (release > 0 && release < 1) {
    ctx.globalCompositeOperation = "lighter";
    lk.mark(ctx, h.x, h.y, 34 * s, release, face, 0.4);
  }
  ctx.restore();
  return true;
}

let moveOwner: Map<string, BossDesign> | null = null;
function ownerOf(moveId: string) {
  if (!moveOwner) {
    moveOwner = new Map();
    for (const b of Object.values(BOSSES)) if (b.boss) for (const m of b.moves) moveOwner.set(m.id, b.boss);
    // Zenith fights in two modes, so every move of both counts as its own
    for (const m of ZENITH_ALL_MOVES) moveOwner.set(m.id, "zenith");
    // Zenith's herald is in no Story boss list either
    for (const m of TETRAEL_ALL_MOVES) moveOwner.set(m.id, "tetrael");
    // nor is Zenaeon, Zenith and Aeon fused for Legacy's last fight
    for (const m of ZENAEON.moves) moveOwner.set(m.id, "zenaeon");
  }
  return moveOwner.get(moveId);
}

/** On a hit by one of a boss's moves, its own mark on top of the move's usual hit effect. */
export function drawBossImpact(ctx: CanvasRenderingContext2D, fx: Fx) {
  if (!fx.hit) return;
  const d = ownerOf(fx.id);
  const lk = d && LOOKS[d];
  if (!lk) return;
  const k = clamp(1 - fx.life / fx.max, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  lk.mark(ctx, fx.x, fx.y, 50 * fx.size, k, fx.dir, fx.seed);
  ctx.restore();
}

const arrivals = new Map<BossDesign, Arrival>();
/** The extra arrival layer for a boss: its sign on the floor, then a flourish as it lands. */
export function bossArrivalOf(design: BossDesign): Arrival | undefined {
  const lk = LOOKS[design];
  if (!lk) return undefined;
  let ar = arrivals.get(design);
  if (ar) return ar;
  ar = {
    back: ({ ctx, x, ground, s, u, t }: IntroDraw, hit: number) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      lk.sign(ctx, x, ground, s, k, t);
    },
    front: ({ ctx, x, ground, s, u, t }: IntroDraw, hit: number) => {
      const e = seg(u, hit, Math.min(1, hit + 0.3));
      if (e <= 0 || e >= 1) return;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      lk.burst(ctx, x, ground, s, e, t);
    },
  };
  arrivals.set(design, ar);
  return ar;
}
