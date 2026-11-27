// Ignifer's second layer (see ignifer.ts): a warm lamplight held round it, sparks drifting up off its wick, and the
// charge, mark, floor sign and landing flourish every boss look carries (boss-looks.ts). Its coat, candle head and
// lighting pole are drawn with its design in boss-designs.ts, where the pole follows the move.
import { WICKLIGHT } from "./ignifer";
import { TAU, ring, dot, glowDot, drift, hsla, seg, easeOut, mid, hh, type BossLook } from "./boss-looks-kit";

export const IGNIFER_LOOK: BossLook = {
  back: (ctx, r, s, face, t, alive) => {
    if (!alive) return;
    const c = mid(r.neck, r.hip, 0.2);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // lamplight that never quite holds still
    glowDot(ctx, c.x, c.y - 14 * s, 78 * s, WICKLIGHT, 0.08 + 0.025 * Math.sin(t * 9) + 0.02 * Math.sin(t * 3.3));
    ctx.restore();
  },
  front: (ctx, r, s, face, t, alive) => {
    if (!alive) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // sparks lifting off the wick and winking out as they climb
    drift(6, t, 0.55, 47, (i, k, r1) => {
      const x = r.head.x + (r1 - 0.5) * 22 * s + Math.sin(t * 3 + i * 1.7) * 6 * s * k, y = r.head.y - 22 * s - k * 70 * s;
      dot(ctx, x, y, (1.8 - k * 1.3) * s, hsla(36 + k * 10, 100, 70, 1 - k));
    });
    ctx.restore();
  },
  charge: (ctx, h, s, t, k, face) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x, h.y, (8 + 14 * k) * s, WICKLIGHT, 0.35 + 0.5 * k);
    // embers drawn in to the hand like a flame catching
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 2;
      const d = (26 - k * 18) * s * (0.6 + 0.4 * hh(i));
      dot(ctx, h.x + Math.cos(a) * d, h.y + Math.sin(a) * d, (1.4 + k) * s, hsla(30, 100, 62, 0.5 + 0.5 * k));
    }
    ctx.restore();
  },
  mark: (ctx, x, y, R, k, face, seed) => {
    const fade = 1 - k;
    ctx.save();
    // a flare where the flame lands: a ring of heat and a few sparks thrown upward
    ring(ctx, x, y, R * (0.3 + k * 0.8), hsla(30, 100, 62, fade), 3 * fade + 1);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (hh(i + seed) - 0.5) * 2.4;
      const d = R * (0.4 + k * 1.1);
      dot(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 2 * fade + 0.4, hsla(40, 100, 72, fade));
    }
    ctx.restore();
  },
  sign: (ctx, x, g, s, k, t) => {
    ctx.save();
    const a = Math.min(1, k * 1.4) * (k > 0.85 ? (1 - k) / 0.15 : 1);
    const e = easeOut(Math.min(1, k * 1.3));
    // a row of little lamp flames on the floor either side of where it will land, lighting one after another
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const on = seg(k, Math.abs(i) * 0.08, Math.abs(i) * 0.08 + 0.2);
      const fx = x + i * 22 * s * e;
      dot(ctx, fx, g - 4 * s, (2 + Math.sin(t * 12 + i) * 0.5) * s * on, hsla(38, 100, 66, a * on));
    }
    ring(ctx, x, g, 80 * s * e, hsla(42, 64, 50, a), 2.2 * s, 0.22);
    ctx.restore();
  },
  burst: (ctx, x, g, s, e, t) => {
    ctx.save();
    const fade = 1 - seg(e, 0.3, 1);
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, x, g - 60 * s, 90 * s * (0.6 + e), WICKLIGHT, 0.4 * fade);
    // it lands in a flare: a wide ring of heat and sparks thrown up out of the floor
    ring(ctx, x, g - 30 * s, (30 + e * 170) * s, hsla(32, 100, 64, fade), 3 * s * fade + 0.5, 0.5);
    for (let i = 0; i < 14; i++) {
      const a = -Math.PI / 2 + (hh(i) - 0.5) * 2.2;
      const d = (30 + e * 150 * (0.5 + hh(i + 7))) * s;
      dot(ctx, x + Math.cos(a) * d, g + Math.sin(a) * d, 2.4 * s * fade + 0.4, hsla(40, 100, 74, fade));
    }
    ctx.restore();
  },
};
