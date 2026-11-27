// Vinculum's second layer (see vinculum.ts): a ring of old iron keys at its hip, flakes of rust falling off it, and the
// charge, mark, floor sign and landing flourish every boss look carries (boss-looks.ts). Its armour, crossed chains,
// padlock head and chain flail are drawn with its design in boss-designs.ts, where the flail can follow the move.
import { KEYLIGHT } from "./vinculum";
import { TAU, INK, ring, dot, glowDot, drift, hsla, seg, easeOut, mid, hh, type BossLook } from "./boss-looks-kit";

/** One old key: a ring bow, a shaft and a toothed bit, hanging from (x, y) at angle `ang` (0 points down). */
function key(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, s: number, col: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6 * s;
  ctx.beginPath();
  ctx.moveTo(0, 3 * s);
  ctx.lineTo(0, len);
  ctx.stroke();
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.4 * s;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 3 * s, 0, TAU);
  ctx.stroke();
  // the bit: two teeth off the end of the shaft
  ctx.fillStyle = col;
  ctx.fillRect(0, len - 5 * s, 3.4 * s, 1.8 * s);
  ctx.fillRect(0, len - 2 * s, 4.4 * s, 1.8 * s);
  ctx.restore();
}

/** Cell bars standing in a ring on the floor around (x, g), each `h` tall: the near ones over the far ones. */
function bars(ctx: CanvasRenderingContext2D, x: number, g: number, R: number, h: number, n: number, s: number, a: number, rot: number) {
  for (let i = 0; i < n; i++) {
    const an = rot + (i / n) * TAU;
    const bx = x + Math.cos(an) * R, by = g + Math.sin(an) * R * 0.22;
    ctx.strokeStyle = hsla(212, 12, 18, a);
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - h);
    ctx.stroke();
    ctx.strokeStyle = hsla(212, 14, 62, a);
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
    // a spike of keylight on top of each bar
    dot(ctx, bx, by - h, 2 * s, hsla(44, 100, 66, a));
  }
}

export const VINCULUM_LOOK: BossLook = {
  back: (ctx, r, s, face, t, alive) => {
    if (!alive) return;
    const c = mid(r.neck, r.hip, 0.4);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, c.x, c.y, 80 * s, KEYLIGHT, 0.09 + 0.03 * Math.sin(t * 1.6));
    ctx.restore();
  },
  front: (ctx, r, s, face, t, alive) => {
    ctx.save();
    // the keyring at its hip: a big iron ring and five keys that swing as it walks
    const kx = r.hip.x - face * 9 * s, ky = r.hip.y + 2 * s;
    ring(ctx, kx, ky, 6 * s, alive ? "hsl(212 12% 54%)" : "hsl(212 4% 44%)", 2 * s);
    for (let i = 0; i < 5; i++) {
      const sway = alive ? Math.sin(t * 3 + i * 0.9) * 0.18 : 0.1;
      key(ctx, kx + (i - 2) * 2.4 * s, ky + 5 * s, (i - 2) * 0.22 + sway, (13 + (i % 2) * 4) * s, s, alive ? (i === 2 ? KEYLIGHT : "hsl(36 30% 52%)") : "hsl(36 4% 44%)");
    }
    if (alive) {
      // flakes of rust coming off its plates
      drift(5, t, 0.3, 41, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 90 * s + Math.sin(t * 2 + i) * 4 * s, y = r.neck.y + k * 120 * s;
        dot(ctx, x, y, (2 - k) * s, hsla(18, 62, 42, 1 - k));
      });
    }
    ctx.restore();
  },
  charge: (ctx, h, s, t, k, face) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x, h.y, (8 + 12 * k) * s, KEYLIGHT, 0.35 + 0.5 * k);
    // a keyhole of light turning in the hand
    ctx.strokeStyle = hsla(44, 100, 72, 0.4 + 0.5 * k);
    ctx.lineWidth = 2 * s;
    for (let i = 0; i < 2; i++) {
      const a = t * 4 + i * Math.PI;
      ctx.beginPath();
      ctx.arc(h.x, h.y, (1 - k) * 22 * s + 7 * s, a, a + 1.6);
      ctx.stroke();
    }
    ctx.restore();
  },
  mark: (ctx, x, y, R, k, face, seed) => {
    const fade = 1 - k;
    ctx.save();
    // a shackle snapping shut on the hit: a ring that closes, and sparks off the iron
    ctx.strokeStyle = hsla(212, 14, 70, fade);
    ctx.lineWidth = 3 * fade + 1;
    ctx.beginPath();
    ctx.arc(x, y, R * (0.9 - k * 0.4), -Math.PI / 2 + 0.6 * fade, -Math.PI / 2 + TAU - 0.6 * fade);
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const a = seed + (i / 5) * TAU;
      const d = R * (0.4 + k * 0.9);
      dot(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 2.4 * fade + 0.4, hsla(44, 100, 66, fade));
    }
    ctx.restore();
  },
  sign: (ctx, x, g, s, k, t) => {
    ctx.save();
    const a = Math.min(1, k * 1.4) * (k > 0.85 ? (1 - k) / 0.15 : 1);
    const e = easeOut(Math.min(1, k * 1.3));
    ring(ctx, x, g, 80 * s * e, hsla(44, 100, 60, a), 2.2 * s, 0.22);
    // the cell closes: bars rise out of the floor all round where it will land
    bars(ctx, x, g, 80 * s, 70 * s * e, 10, s, a, t * 0.15);
    ctx.restore();
  },
  burst: (ctx, x, g, s, e, t) => {
    ctx.save();
    const fade = 1 - seg(e, 0.3, 1);
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, x, g - 60 * s, 90 * s * (0.6 + e), KEYLIGHT, 0.4 * fade);
    ctx.globalCompositeOperation = "source-over";
    // links and keys flung out as the lock springs
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + hh(i) * 0.4;
      const d = 30 * s + e * 150 * s;
      const px = x + Math.cos(a) * d, py = g - 60 * s + Math.sin(a) * d * 0.7;
      if (i % 2) key(ctx, px, py, a + t * 3, 12 * s * fade + 1, s, hsla(36, 40, 56, fade));
      else ring(ctx, px, py, 4 * s * fade + 0.5, hsla(212, 14, 62, fade), 2 * s);
    }
    ctx.restore();
  },
};
