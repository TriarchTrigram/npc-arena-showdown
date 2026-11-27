// Zenaeon's second layer (see zenaeon.ts): Aeon's gold armillary rings behind it and Zenith's crown of stars and
// gold gauntlets in front, with a ring of white fire round both where the two lights meet.
import { LOOKS_B } from "./boss-looks-b";
import { ZENITH_LOOK, setZenithLookStance } from "./zenith-look";
import { DAWN } from "./zenaeon";
import { TAU, ring, glowDot, mid, type BossLook } from "./boss-looks-kit";

const AEON = LOOKS_B.aeon!;

export const ZENAEON_LOOK: BossLook = {
  back: (ctx, r, s, face, t, alive, vx) => {
    if (alive) {
      const c = mid(r.hip, r.neck);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, c.x, c.y, 110 * s, DAWN, 0.18 + Math.sin(t * 2) * 0.04);
      // where the two lights meet: a slow ring of white fire round the whole body
      ring(ctx, c.x, c.y, (64 + Math.sin(t * 3) * 3) * s, "hsl(0 0% 100% / 0.4)", 2 * s, 1, t * 0.6, t * 0.6 + TAU * 0.8);
      ctx.restore();
    }
    AEON.back?.(ctx, r, s, face, t, alive, vx);
    ZENITH_LOOK.back?.(ctx, r, s, face, t, alive, vx);
  },
  front: (ctx, r, s, face, t, alive, vx) => {
    AEON.front?.(ctx, r, s, face, t, alive, vx);
    // Zenith's half wears its gauntlets: the fusion never takes up the scepter
    setZenithLookStance("fist");
    ZENITH_LOOK.front?.(ctx, r, s, face, t, alive, vx);
  },
  charge: ZENITH_LOOK.charge,
  mark: AEON.mark,
  sign: ZENITH_LOOK.sign,
  burst: AEON.burst,
};
