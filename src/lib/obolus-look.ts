// Obolus's second layer (see obolus.ts): three tithe coins circling it, a faint warm glow from the ledger at its side, and
// the charge, mark, floor sign and landing flourish every boss look carries (boss-looks.ts). Its robe, mask, cap and
// balance scale are drawn with its design in boss-designs.ts, where the scale can follow the move.
import { COINLIGHT } from "./obolus";
import { TAU, INK, ring, dot, glowDot, drift, hsla, seg, easeOut, mid, hh, type BossLook } from "./boss-looks-kit";

/** One coin seen at an angle: a gold disc squashed by `tilt` (1 face-on, 0 edge-on), with a slot punched through it. */
function coin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, tilt: number, s: number, a: number) {
  const w = Math.max(0.2, Math.abs(tilt));
  ctx.fillStyle = hsla(42, 88, 54, a);
  ctx.strokeStyle = INK;
  ctx.globalAlpha = a;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.ellipse(x, y, r * w, r, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (w > 0.45) {
    ctx.fillStyle = hsla(282, 40, 12, a);
    ctx.fillRect(x - 0.6 * s * w, y - r * 0.45, 1.2 * s * w, r * 0.9);
  }
}

export const OBOLUS_LOOK: BossLook = {
  back: (ctx, r, s, face, t, alive) => {
    if (!alive) return;
    const c = mid(r.neck, r.hip, 0.5);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, c.x, c.y, 78 * s, COINLIGHT, 0.08 + 0.03 * Math.sin(t * 1.8));
    ctx.restore();
  },
  front: (ctx, r, s, face, t, alive) => {
    ctx.save();
    // the ledger at its hip: a small bound book on a cord, glowing at the page edge
    const lx = r.hip.x - face * 10 * s, ly = r.hip.y + 4 * s;
    ctx.fillStyle = alive ? "hsl(282 30% 18%)" : "hsl(282 4% 26%)";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.rect(lx - 5 * s, ly, 10 * s, 13 * s);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = alive ? "hsl(48 60% 86%)" : "hsl(48 4% 60%)";
    ctx.fillRect(lx + face * 3 * s - 1 * s, ly + 1.5 * s, 2 * s, 10 * s);
    if (alive) {
      // three tithe coins orbiting its chest, turning as they go
      for (let i = 0; i < 3; i++) {
        const a = t * 1.4 + (i / 3) * TAU;
        const x = r.neck.x + Math.cos(a) * 30 * s, y = r.neck.y + 18 * s + Math.sin(a) * 9 * s;
        coin(ctx, x, y, 4 * s, Math.cos(t * 4 + i * 2), s, Math.sin(a) > 0 ? 1 : 0.6);
      }
      // motes of light drifting up out of the coins
      drift(5, t, 0.35, 23, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 80 * s + Math.sin(t * 2 + i) * 4 * s, y = r.hip.y - k * 110 * s;
        dot(ctx, x, y, (2 - k * 1.4) * s, hsla(50, 100, 80, 1 - k));
      });
    }
    ctx.restore();
  },
  charge: (ctx, h, s, t, k, face) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x, h.y, (8 + 12 * k) * s, COINLIGHT, 0.35 + 0.5 * k);
    ctx.globalCompositeOperation = "source-over";
    // a coin spinning faster and faster in the hand
    coin(ctx, h.x, h.y - 2 * s, (4 + 3 * k) * s, Math.cos(t * (6 + k * 14)), s, 0.6 + 0.4 * k);
    ctx.restore();
  },
  mark: (ctx, x, y, R, k, face, seed) => {
    const fade = 1 - k;
    ctx.save();
    // a coin stamped on the hit: a gold ring with a slot, and a receipt of sparks
    ring(ctx, x, y, R * (0.5 + k * 0.5), hsla(46, 100, 64, fade), 3 * fade + 1);
    ctx.fillStyle = hsla(50, 100, 84, fade);
    ctx.fillRect(x - 1.2, y - R * 0.3 * fade, 2.4, R * 0.6 * fade);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      const a = seed + (i / 6) * TAU;
      const d = R * (0.5 + k * 0.9);
      dot(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 2.2 * fade + 0.4, hsla(48, 100, 70, fade));
    }
    ctx.restore();
  },
  sign: (ctx, x, g, s, k, t) => {
    ctx.save();
    const a = Math.min(1, k * 1.4) * (k > 0.85 ? (1 - k) / 0.15 : 1);
    const e = easeOut(Math.min(1, k * 1.3));
    ring(ctx, x, g, 80 * s * e, hsla(46, 100, 60, a), 2.2 * s, 0.22);
    // a ring of coins standing on edge round where it will land, turning to face out
    for (let i = 0; i < 12; i++) {
      const an = t * 0.3 + (i / 12) * TAU;
      coin(ctx, x + Math.cos(an) * 80 * s * e, g + Math.sin(an) * 18 * s * e - 5 * s, 4.5 * s, Math.cos(an * 2 + t * 3), s, a);
    }
    ctx.restore();
  },
  burst: (ctx, x, g, s, e, t) => {
    ctx.save();
    const fade = 1 - seg(e, 0.3, 1);
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, x, g - 60 * s, 90 * s * (0.6 + e), COINLIGHT, 0.4 * fade);
    ctx.globalCompositeOperation = "source-over";
    // the tithe flung out: coins spinning away in every direction
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + hh(i) * 0.4;
      const d = 30 * s + e * 160 * s;
      coin(ctx, x + Math.cos(a) * d, g - 60 * s + Math.sin(a) * d * 0.7, 4.5 * s * fade + 0.5, Math.cos(t * 8 + i), s, fade);
    }
    ctx.restore();
  },
};
