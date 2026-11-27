// Carnael's second layer (see carnael.ts): four torn black wings edged in red, a horned skull mask with a red grin and a
// cracked red halo, plus the charge, mark, floor sign and landing flourish every boss look carries (boss-looks.ts).
// Its scythe and robe are drawn with its design in boss-designs.ts, where the swing can follow the move.
import { BLOOD, EMBER } from "./carnael";
import { TAU, HEAD, INK, ring, dot, glowDot, drift, hsla, seg, easeOut, mid, leaf, hh, zig, type BossLook } from "./boss-looks-kit";

/** One wing as a fan of long, ragged black feathers from `x, y` along `ang`, every other one torn short. */
function tornWing(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, n: number, fan: number, alive: boolean, s: number, seed: number) {
  const out = Math.cos(ang) >= 0 ? 1 : -1;
  const fill = alive ? "hsl(350 26% 6%)" : "hsl(350 6% 18%)";
  const edge = alive ? BLOOD : "hsl(350 8% 34%)";
  for (let i = n - 1; i >= 0; i--) {
    const k = i / (n - 1);
    const a = ang - out * fan * (k - 0.3);
    // torn feathers: some are cut short, all are a little uneven
    const torn = hh(seed + i * 3.1) < 0.35 ? 0.62 : 1;
    const l = len * (1 - k * 0.4) * torn * (0.92 + hh(seed + i) * 0.12);
    leaf(ctx, x, y, a, l, (8 - k * 3) * s, fill, edge, 1.3 * s);
  }
  // the bone along the top, with a hooked claw at the joint
  ctx.strokeStyle = alive ? "hsl(350 20% 14%)" : "hsl(350 6% 26%)";
  ctx.lineWidth = 3 * s;
  const jx = x + Math.cos(ang - out * 0.35) * len * 0.55, jy = y + Math.sin(ang - out * 0.35) * len * 0.55;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(jx, jy, x + Math.cos(ang + out * 0.1) * len, y + Math.sin(ang + out * 0.1) * len);
  ctx.stroke();
  ctx.fillStyle = alive ? EMBER : "hsl(350 6% 40%)";
  ctx.beginPath();
  ctx.moveTo(jx, jy);
  ctx.lineTo(jx + Math.cos(ang - out * 1.4) * 9 * s, jy + Math.sin(ang - out * 1.4) * 9 * s);
  ctx.lineTo(jx + Math.cos(ang - out * 0.6) * 4 * s, jy + Math.sin(ang - out * 0.6) * 4 * s);
  ctx.closePath();
  ctx.fill();
}

/** Its four wings: a long upper pair raised high, a lower pair swept down and back. */
export function redWings(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, face: number, t: number, alive: boolean, open = 1) {
  const flap = alive ? Math.sin(t * 2.8) * 0.14 : -0.35;
  const up = -Math.PI / 2;
  const bx = x - face * 6 * s;
  for (const side of [-1, 1]) {
    const la = up + side * (2.3 - flap * 0.5) * open + (1 - open) * side * 0.2;
    tornWing(ctx, bx, y + 10 * s, la, 62 * s, 6, 0.75, alive, s, 11 + side);
  }
  for (const side of [-1, 1]) {
    const ua = up + side * (0.7 + flap) * open + (1 - open) * side * 0.15;
    tornWing(ctx, bx, y, ua, 92 * s, 8, 0.95, alive, s, 31 + side);
  }
}

/** The mask: a black skull with two curling horns, a red grin and two red eyes that burn hotter as it attacks. */
function skull(ctx: CanvasRenderingContext2D, hx: number, hy: number, s: number, face: number, t: number, alive: boolean) {
  const cx = hx + face * 1.5 * s;
  // horns first, so the skull sits over their roots
  ctx.strokeStyle = alive ? "hsl(350 20% 10%)" : "hsl(350 6% 24%)";
  ctx.lineCap = "round";
  for (const e of [-1, 1]) {
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(cx + e * 6 * s, hy - 7 * s);
    ctx.quadraticCurveTo(cx + e * 20 * s, hy - 18 * s, cx + e * 14 * s, hy - 30 * s);
    ctx.stroke();
    ctx.strokeStyle = alive ? BLOOD : "hsl(350 8% 36%)";
    ctx.lineWidth = 1.4 * s;
    ctx.stroke();
    ctx.strokeStyle = alive ? "hsl(350 20% 10%)" : "hsl(350 6% 24%)";
  }
  ctx.fillStyle = alive ? "hsl(350 18% 9%)" : "hsl(350 6% 26%)";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.ellipse(cx, hy + 1 * s, 9.5 * s, 11.5 * s, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  // eyes: two slanted red slits
  for (const e of [-1, 1]) {
    const ex = cx + face * 2.5 * s + e * 3.8 * s, ey = hy - 1.5 * s;
    ctx.fillStyle = alive ? EMBER : INK;
    ctx.beginPath();
    ctx.moveTo(ex - 3 * s, ey - e * face * 1.2 * s);
    ctx.lineTo(ex + 3 * s, ey + e * face * 1.2 * s);
    ctx.lineTo(ex, ey + 2 * s);
    ctx.closePath();
    ctx.fill();
    if (alive) glowDot(ctx, ex, ey, 6 * s, BLOOD, 0.35 + Math.sin(t * 6 + e) * 0.1);
  }
  // the grin: a row of red teeth from cheek to cheek
  ctx.strokeStyle = alive ? BLOOD : INK;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  const gx = cx + face * 2 * s, gy = hy + 6 * s;
  ctx.moveTo(gx - 6 * s, gy - 1 * s);
  for (let i = 1; i <= 6; i++) ctx.lineTo(gx - 6 * s + i * 2 * s, gy + (i % 2 ? 2 : -0.5) * s);
  ctx.stroke();
}

export const CARNAEL_LOOK: BossLook = {
  back: (ctx, r, s, face, t, alive) => {
    const root = mid(r.neck, r.hip, 0.18);
    ctx.save();
    if (alive) {
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, root.x, root.y - 10 * s, 96 * s, BLOOD, 0.16);
      ctx.globalCompositeOperation = "source-over";
    }
    redWings(ctx, root.x, root.y, s, face, t, alive);
    ctx.restore();
  },
  front: (ctx, r, s, face, t, alive) => {
    ctx.save();
    skull(ctx, r.head.x, r.head.y, s, face, t, alive);
    // a halo cracked through, red, never quite closing
    const hx = r.head.x - face * 2 * s, hy = r.head.y - HEAD * s - 12 * s;
    const c = alive ? BLOOD : "hsl(350 8% 36%)";
    ring(ctx, hx, hy, 14 * s, c, 2.2 * s, 0.3, 0.2, Math.PI * 0.9);
    ring(ctx, hx, hy, 14 * s, c, 2.2 * s, 0.3, Math.PI * 1.1, Math.PI * 1.95);
    if (alive) {
      // red embers rising off it, and black feathers drifting down
      drift(5, t, 0.5, 17, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 120 * s, y = r.hip.y - k * 150 * s;
        dot(ctx, x, y, (2.4 - k * 1.6) * s, hsla(356, 100, 60, 1 - k));
      });
      drift(3, t, 0.35, 23, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 150 * s, y = r.neck.y - 40 * s + k * 140 * s;
        leaf(ctx, x, y, Math.PI / 2 + Math.sin(t * 2 + i) * 0.8, 9 * s, 3.5 * s, hsla(350, 26, 6, 1 - k), hsla(356, 92, 52, 1 - k), 1 * s);
      });
    }
    ctx.restore();
  },
  charge: (ctx, h, s, t, k, face) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x, h.y, (8 + 14 * k) * s, BLOOD, 0.4 + 0.5 * k);
    // red light dragged in toward the hand in hooks
    ctx.strokeStyle = hsla(8, 100, 66, 0.4 + 0.5 * k);
    ctx.lineWidth = 1.8 * s;
    for (let i = 0; i < 4; i++) {
      const a = -t * 5 + (i / 4) * TAU, d = (1 - k) * 30 * s + 8 * s;
      ctx.beginPath();
      ctx.arc(h.x, h.y, d, a, a + 0.9);
      ctx.stroke();
    }
    ctx.restore();
  },
  mark: (ctx, x, y, R, k, face, seed) => {
    const fade = 1 - k;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // a red crescent cut across the hit, and a spray of drops
    ctx.strokeStyle = hsla(356, 100, 58, fade);
    ctx.lineWidth = 3 * fade + 1;
    ctx.beginPath();
    ctx.arc(x - face * R * 0.3, y, R * (0.5 + k * 0.5), -0.9, 0.9);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = seed + (i / 6) * TAU;
      const d = R * (0.2 + k * 0.9);
      dot(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, (3 * fade + 0.5), hsla(8, 100, 62, fade));
    }
    ctx.restore();
  },
  sign: (ctx, x, g, s, k, t) => {
    ctx.save();
    const a = Math.min(1, k * 1.4) * (k > 0.85 ? (1 - k) / 0.15 : 1);
    const e = easeOut(Math.min(1, k * 1.3));
    ring(ctx, x, g, 70 * s * e, hsla(356, 100, 56, a), 2.4 * s, 0.25);
    // four red cuts across the floor, one for each wing
    ctx.strokeStyle = hsla(8, 100, 64, a);
    ctx.lineWidth = 2.2 * s;
    for (let i = 0; i < 4; i++) {
      const an = (i / 4) * TAU + Math.PI / 4 + t * 0.2;
      zig(ctx, { x, y: g }, { x: x + Math.cos(an) * 96 * s * e, y: g + Math.sin(an) * 24 * s * e }, 4, 5 * s, i * 3.3);
      ctx.stroke();
    }
    ctx.restore();
  },
  burst: (ctx, x, g, s, e, t) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const fade = 1 - seg(e, 0.3, 1);
    glowDot(ctx, x, g - 60 * s, 100 * s * (0.6 + e), BLOOD, 0.5 * fade);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + hh(i) * 0.4;
      const d = 30 * s + e * 160 * s;
      leaf(ctx, x + Math.cos(a) * d, g - 60 * s + Math.sin(a) * d * 0.7, a + t, 12 * s * fade, 4 * s * fade + 0.5, i % 2 ? "hsl(350 26% 8%)" : EMBER, BLOOD, 1 * s);
    }
    dot(ctx, x, g - 60 * s, 4 * s * fade, EMBER);
    ctx.restore();
  },
};
