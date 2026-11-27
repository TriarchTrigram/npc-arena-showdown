// Campanel's second layer (see campanel.ts): a warm dawn glow held behind it, rings of sound rolling off its bell head
// each time it hums, and the charge, mark, floor sign and landing flourish every boss look carries (boss-looks.ts). Its
// surplice, bell head, clapper and mallet are drawn with its design in boss-designs.ts, where the mallet follows the move.
import { DAWNLIGHT } from "./campanel";
import { TAU, ring, dot, glowDot, drift, hsla, seg, easeOut, mid, hh, type BossLook } from "./boss-looks-kit";

export const CAMPANEL_LOOK: BossLook = {
  back: (ctx, r, s, face, t, alive) => {
    if (!alive) return;
    const c = mid(r.neck, r.hip, 0.3);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, c.x, c.y - 10 * s, 84 * s, DAWNLIGHT, 0.08 + 0.03 * Math.sin(t * 1.4));
    ctx.restore();
  },
  front: (ctx, r, s, face, t, alive) => {
    if (!alive) return;
    ctx.save();
    // the hum: three rings rolling out from the bell head and fading, one after another
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.6 + i / 3) % 1;
      ring(ctx, r.head.x, r.head.y, (14 + k * 46) * s, hsla(30, 100, 74, 0.4 * (1 - k)), (1.6 - k) * s, 0.7);
    }
    // motes of dawn drifting up past the rim
    drift(5, t, 0.3, 31, (i, k, r1) => {
      const x = r.head.x + (r1 - 0.5) * 60 * s + Math.sin(t * 2 + i) * 4 * s, y = r.head.y + 10 * s - k * 90 * s;
      dot(ctx, x, y, (2 - k * 1.4) * s, hsla(32, 100, 78, 1 - k));
    });
    ctx.restore();
  },
  charge: (ctx, h, s, t, k, face) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x, h.y, (8 + 12 * k) * s, DAWNLIGHT, 0.35 + 0.5 * k);
    ctx.globalCompositeOperation = "source-over";
    // rings of sound closing in on the hand, faster as the note builds
    for (let i = 0; i < 3; i++) {
      const u = 1 - ((t * (1 + k * 2) + i / 3) % 1);
      ring(ctx, h.x, h.y, (6 + u * 26) * s, hsla(30, 100, 72, (1 - u) * (0.4 + 0.5 * k)), 1.4 * s);
    }
    ctx.restore();
  },
  mark: (ctx, x, y, R, k, face, seed) => {
    const fade = 1 - k;
    ctx.save();
    // the struck note: two rings ringing out of the hit, and a fan of bronze sparks
    ring(ctx, x, y, R * (0.4 + k * 0.7), hsla(30, 100, 70, fade), 3 * fade + 1);
    ring(ctx, x, y, R * (0.2 + k * 1.1), hsla(36, 100, 84, fade * 0.6), 1.5 * fade + 0.5);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      const a = seed + (i / 6) * TAU;
      const d = R * (0.5 + k * 0.9);
      dot(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 2.2 * fade + 0.4, hsla(32, 90, 62, fade));
    }
    ctx.restore();
  },
  sign: (ctx, x, g, s, k, t) => {
    ctx.save();
    const a = Math.min(1, k * 1.4) * (k > 0.85 ? (1 - k) / 0.15 : 1);
    const e = easeOut(Math.min(1, k * 1.3));
    // ripples of sound running across the floor where it will land, like a struck bell seen from above
    for (let i = 0; i < 4; i++) {
      const u = (t * 0.5 + i / 4) % 1;
      ring(ctx, x, g, (20 + u * 70) * s * e, hsla(30, 100, 66, a * (1 - u)), 2 * s, 0.22);
    }
    ring(ctx, x, g, 86 * s * e, hsla(32, 62, 46, a), 2.4 * s, 0.22);
    ctx.restore();
  },
  burst: (ctx, x, g, s, e, t) => {
    ctx.save();
    const fade = 1 - seg(e, 0.3, 1);
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, x, g - 60 * s, 90 * s * (0.6 + e), DAWNLIGHT, 0.4 * fade);
    // the note it lands on: a wide ring rolling out, and rays of dawn standing up out of the floor
    ring(ctx, x, g - 40 * s, (30 + e * 180) * s, hsla(30, 100, 72, fade), 3 * s * fade + 0.5, 0.5);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.28 + hh(i) * 0.06;
      const L = (40 + e * 140) * s;
      ctx.strokeStyle = hsla(36, 100, 82, 0.5 * fade);
      ctx.lineWidth = 3 * s * fade + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, g);
      ctx.lineTo(x + Math.cos(a) * L, g + Math.sin(a) * L);
      ctx.stroke();
    }
    ctx.restore();
  },
};
