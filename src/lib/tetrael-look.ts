// Tetrael's second layer (see tetrael.ts): four wings behind it, a smiling white mask, a halo cut in two, plus the
// charge, mark, floor sign and landing flourish every boss look carries (boss-looks.ts).
import { PLUME, ROSE } from "./tetrael";
import { TAU, HEAD, INK, ring, dot, glowDot, drift, hsla, seg, easeOut, mid, leaf, hh, type BossLook } from "./boss-looks-kit";

/** One wing as a fan of feathers from `x, y`, pointing along `ang`: the leading feathers longest. */
function wing(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, n: number, fan: number, fill: string, edge: string, s: number) {
  const out = Math.cos(ang) >= 0 ? 1 : -1;
  for (let i = n - 1; i >= 0; i--) {
    const k = i / (n - 1);
    // the fan sweeps from the leading edge (k = 0) round to the trailing edge
    const a = ang - out * fan * (k - 0.35);
    const l = len * (1 - k * 0.45);
    leaf(ctx, x, y, a, l, (9 - k * 3) * s, fill, edge, 1.4 * s);
  }
  // the bone along the top of the wing
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + Math.cos(ang - out * 0.4) * len * 0.5, y + Math.sin(ang - out * 0.4) * len * 0.5, x + Math.cos(ang + out * 0.12) * len, y + Math.sin(ang + out * 0.12) * len);
  ctx.stroke();
}

/** Its four wings: the upper pair pale and gold-edged, the lower pair night-violet edged in rose. */
export function fourWings(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, face: number, t: number, alive: boolean, open = 1) {
  const flap = alive ? Math.sin(t * 2.2) * 0.12 : -0.3;
  const up = -Math.PI / 2;
  const dim = "hsl(264 12% 44%)";
  const bx = x - face * 6 * s;
  for (const side of [-1, 1]) {
    // lower pair first, so the upper pair lies over them
    const la = up + side * (2.2 - flap * 0.6) * open + (1 - open) * side * 0.2;
    wing(ctx, bx, y + 8 * s, la, 58 * s, 6, 0.7, alive ? "hsl(264 40% 20%)" : "hsl(264 10% 24%)", alive ? ROSE : dim, s);
  }
  for (const side of [-1, 1]) {
    const ua = up + side * (0.75 + flap) * open + (1 - open) * side * 0.15;
    wing(ctx, bx, y, ua, 84 * s, 7, 0.95, alive ? "hsl(40 40% 92%)" : "hsl(264 10% 60%)", alive ? "hsl(44 90% 62%)" : dim, s);
  }
}

/** The mask: a white face that never stops smiling, two thin rose eyes. */
function mask(ctx: CanvasRenderingContext2D, hx: number, hy: number, s: number, face: number, t: number, alive: boolean) {
  const cx = hx + face * 1.5 * s;
  ctx.fillStyle = alive ? "hsl(40 30% 95%)" : "hsl(264 8% 70%)";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.ellipse(cx, hy + 1 * s, 9.5 * s, 11.5 * s, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  // eyes: thin crescents tilted up, as if it is laughing behind the mask
  ctx.strokeStyle = alive ? ROSE : INK;
  ctx.lineWidth = 2 * s;
  for (const e of [-1, 1]) {
    const ex = cx + face * 2.5 * s + e * 3.6 * s, ey = hy - 2 * s;
    ctx.beginPath();
    ctx.arc(ex, ey + 1.5 * s, 2.6 * s, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  // the smile, wide and thin
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.arc(cx + face * 2 * s, hy + 2 * s, 6 * s, Math.PI * 0.18, Math.PI * 0.82);
  ctx.stroke();
  if (alive) glowDot(ctx, cx + face * 2.5 * s, hy - 1 * s, 10 * s, ROSE, 0.12 + Math.sin(t * 4) * 0.05);
}

export const TETRAEL_LOOK: BossLook = {
  back: (ctx, r, s, face, t, alive) => {
    const root = mid(r.neck, r.hip, 0.18);
    ctx.save();
    if (alive) {
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, root.x, root.y - 10 * s, 90 * s, ROSE, 0.14);
      ctx.globalCompositeOperation = "source-over";
    }
    fourWings(ctx, root.x, root.y, s, face, t, alive);
    ctx.restore();
  },
  front: (ctx, r, s, face, t, alive) => {
    ctx.save();
    mask(ctx, r.head.x, r.head.y, s, face, t, alive);
    // a halo cut clean in two, the halves drifting apart and back
    const gap = alive ? 3 + Math.sin(t * 1.6) * 2 : 1;
    const hx = r.head.x - face * 2 * s, hy = r.head.y - HEAD * s - 9 * s;
    ring(ctx, hx - gap * s, hy, 13 * s, alive ? PLUME : "hsl(264 10% 56%)", 2.2 * s, 0.32, Math.PI * 0.55, Math.PI * 1.45);
    ring(ctx, hx + gap * s, hy, 13 * s, alive ? PLUME : "hsl(264 10% 56%)", 2.2 * s, 0.32, -Math.PI * 0.45, Math.PI * 0.45);
    if (alive) {
      // loose feathers drifting down off the wings
      drift(4, t, 0.4, 13, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 140 * s, y = r.neck.y - 40 * s + k * 140 * s;
        leaf(ctx, x, y, Math.PI / 2 + Math.sin(t * 2 + i) * 0.8, 9 * s, 3.5 * s, hsla(40, 40, 92, 1 - k), hsla(44, 90, 62, 1 - k), 1 * s);
      });
    }
    ctx.restore();
  },
  charge: (ctx, h, s, t, k, face) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x, h.y, (8 + 12 * k) * s, ROSE, 0.35 + 0.5 * k);
    for (let i = 0; i < 4; i++) {
      const a = t * 4 + (i / 4) * TAU, d = (1 - k) * 28 * s + 6 * s;
      leaf(ctx, h.x + Math.cos(a) * d, h.y + Math.sin(a) * d, a + Math.PI, 9 * s, 3.5 * s, PLUME, ROSE, 1 * s);
    }
    ctx.restore();
  },
  mark: (ctx, x, y, R, k, face, seed) => {
    const fade = 1 - k;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ring(ctx, x, y, R * (0.4 + k * 0.7), hsla(336, 100, 72, fade), 2);
    for (let i = 0; i < 4; i++) {
      const a = seed + (i / 4) * TAU + k * 0.6;
      const d = R * (0.2 + k * 0.9);
      leaf(ctx, x + Math.cos(a) * d * 0.3, y + Math.sin(a) * d * 0.3, a, R * 0.5 * fade + 2, R * 0.16 * fade + 1, hsla(40, 40, 92, fade), hsla(336, 100, 72, fade), 1.2);
    }
    ctx.restore();
  },
  sign: (ctx, x, g, s, k, t) => {
    ctx.save();
    const a = Math.min(1, k * 1.4) * (k > 0.85 ? (1 - k) / 0.15 : 1);
    const e = easeOut(Math.min(1, k * 1.3));
    ring(ctx, x, g, 64 * s * e, hsla(336, 100, 72, a), 2 * s, 0.25);
    // four wing strokes on the floor, one for each wing
    ctx.strokeStyle = hsla(44, 90, 70, a);
    ctx.lineWidth = 2.4 * s;
    for (let i = 0; i < 4; i++) {
      const an = (i / 4) * TAU + Math.PI / 4 + t * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, g);
      ctx.quadraticCurveTo(x + Math.cos(an - 0.5) * 50 * s * e, g + Math.sin(an - 0.5) * 12 * s * e, x + Math.cos(an) * 90 * s * e, g + Math.sin(an) * 22 * s * e);
      ctx.stroke();
    }
    ctx.restore();
  },
  burst: (ctx, x, g, s, e, t) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const fade = 1 - seg(e, 0.3, 1);
    glowDot(ctx, x, g - 60 * s, 90 * s * (0.6 + e), ROSE, 0.45 * fade);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + hh(i) * 0.4;
      const d = 30 * s + e * 150 * s;
      leaf(ctx, x + Math.cos(a) * d, g - 60 * s + Math.sin(a) * d * 0.7, a + t, 12 * s * fade, 4 * s * fade + 0.5, i % 2 ? PLUME : "hsl(0 0% 100%)", ROSE, 1 * s);
    }
    dot(ctx, x, g - 60 * s, 4 * s * fade, "hsl(0 0% 100%)");
    ctx.restore();
  },
};
