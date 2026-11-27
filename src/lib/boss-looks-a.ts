// The Story bosses' second layer, part one: Nullshade to the Somnarch. See boss-looks.ts for what each piece is.
import type { BossDesign } from "./fighters";
import {
  TAU, HEAD, INK, poly, ring, dot, spiral, fling, wings, flake, glowDot, crystal, zig, star4, drift, floorRing, spokes, fp, hh, hsla,
  clamp, seg, easeOut, mid, flame, type BossLook,
} from "./boss-looks-kit";

export const LOOKS_A: Partial<Record<BossDesign, BossLook>> = {
  // ----- Nullshade: an atom of matter and antimatter round its body, pairs of particles born and torn apart beside it -----
  antimatter: {
    back: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.neck);
      // a shadow of itself, the antimatter twin, standing a step behind
      ctx.strokeStyle = hsla(186, 100, 70, alive ? 0.22 : 0.08);
      ctx.lineWidth = 5 * s;
      const o = -face * 6 * s;
      ctx.beginPath();
      ctx.moveTo(r.hip.x + o, r.hip.y);
      ctx.lineTo(r.neck.x + o, r.neck.y);
      ctx.stroke();
      ring(ctx, r.head.x + o, r.head.y, HEAD * s, hsla(186, 100, 70, alive ? 0.22 : 0.08), 2 * s);
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // two orbits crossing, white matter on one, dark antimatter on the other
      for (let i = 0; i < 2; i++) {
        const tilt = i ? 0.55 : -0.55, rx = 40 * s, ry = 11 * s;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(tilt);
        ctx.strokeStyle = i ? hsla(275, 80, 60, 0.45) : hsla(186, 100, 75, 0.5);
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, Math.PI, TAU);
        ctx.stroke();
        ctx.restore();
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const c = mid(r.hip, r.neck);
      for (let i = 0; i < 2; i++) {
        const tilt = i ? 0.55 : -0.55, an = t * (i ? -2.6 : 2.6) + i;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(tilt);
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = i ? hsla(275, 80, 60, 0.45) : hsla(186, 100, 75, 0.5);
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.ellipse(0, 0, 40 * s, 11 * s, 0, 0, Math.PI);
        ctx.stroke();
        const px = Math.cos(an) * 40 * s, py = Math.sin(an) * 11 * s;
        if (i === 0) glowDot(ctx, px, py, 7 * s, "hsl(186 100% 90%)");
        else {
          ctx.globalCompositeOperation = "source-over";
          dot(ctx, px, py, 3.4 * s, "hsl(268 70% 6%)");
          ring(ctx, px, py, 3.4 * s, "hsl(275 90% 70%)", 1.2 * s);
        }
        ctx.restore();
      }
      // pairs born out of nothing beside it, flying apart and gone
      ctx.globalCompositeOperation = "lighter";
      drift(4, t, 0.7, 11, (i, k, r1, r2) => {
        const bx = c.x + (r1 - 0.5) * 70 * s, by = c.y + (r2 - 0.5) * 60 * s, a = r1 * TAU, d = k * 14 * s, f = 1 - k;
        if (k < 0.1) glowDot(ctx, bx, by, 8 * s, "hsl(0 0% 100%)", 1 - k * 10);
        dot(ctx, bx + Math.cos(a) * d, by + Math.sin(a) * d, 1.6 * s, hsla(186, 100, 85, f));
        dot(ctx, bx - Math.cos(a) * d, by - Math.sin(a) * d, 1.6 * s, hsla(285, 90, 70, f));
      });
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(186 100% 80%)", 0.5);
      for (let i = 0; i < 8; i++) {
        const w = i % 2 ? -1 : 1, a = w * t * 5 + i * 0.8, R = (8 + (1 - k) * 22) * s;
        if (w > 0) dot(ctx, h.x + Math.cos(a) * R, h.y + Math.sin(a) * R, 1.8 * s, "hsl(186 100% 90%)");
        else { ctx.globalCompositeOperation = "source-over"; dot(ctx, h.x + Math.cos(a) * R, h.y + Math.sin(a) * R, 2 * s, "hsl(268 70% 8%)"); ctx.globalCompositeOperation = "lighter"; }
      }
      ring(ctx, h.x, h.y, 7 * s * k, hsla(186, 100, 80, 0.9), 1.6 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, rr = R * (1 - easeOut(k) * 0.8);
      // a ring half matter, half antimatter, collapsing on itself and annihilating
      ring(ctx, x, y, rr, hsla(186, 100, 85, f), 3 * f + 0.6, 1, seed * 3 + k * 4, seed * 3 + k * 4 + Math.PI);
      ring(ctx, x, y, rr, hsla(285, 90, 65, f), 3 * f + 0.6, 1, seed * 3 + k * 4 + Math.PI, seed * 3 + k * 4 + TAU);
      if (k > 0.55) glowDot(ctx, x, y, R * 0.9 * (k - 0.5) * 2, "hsl(0 0% 100%)", (1 - k) * 2);
    },
    sign: (ctx, x, g, s, k) => {
      const R = 46 * s * k;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hsla(268, 60, 5, 0.45 * k);
      ctx.beginPath();
      ctx.ellipse(x, g, R * 1.6, R * 0.42, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x - R * 0.45, g, R, hsla(186, 100, 75, 0.8 * k), 2 * s, 0, TAU * k);
      floorRing(ctx, x + R * 0.45, g, R, hsla(285, 90, 65, 0.8 * k), 2 * s, TAU * (1 - k), TAU);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 50 * s;
      ring(ctx, x, cy, (20 + e * 120) * s, hsla(186, 100, 85, f), 4 * s * f);
      ring(ctx, x, cy, (10 + e * 80) * s, hsla(285, 90, 65, f), 3 * s * f);
      fling(14, 3, (a, r1, i) => {
        const d = e * 140 * r1 * s;
        dot(ctx, x + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, 2.2 * s * f, i % 2 ? hsla(285, 90, 70, f) : hsla(186, 100, 90, f));
      });
    },
  },

  // ----- Maelstrom: a storm cloud over its head raining down its back, sea spray round its feet -----
  maelstrom: {
    back: (ctx, r, s, face, t, alive) => {
      const cx = r.head.x - face * 4 * s, cy = r.head.y - 32 * s;
      if (alive) {
        // rain falling from the cloud behind it
        ctx.strokeStyle = hsla(195, 80, 75, 0.45);
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        drift(12, t, 2.2, 21, (i, k, r1) => {
          const rx = cx + (r1 - 0.5) * 50 * s, ry = cy + 6 * s + k * 90 * s;
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2 * s, ry + 7 * s);
        });
        ctx.stroke();
      }
      // the cloud itself
      for (let i = 0; i < 5; i++) {
        const px = cx + (i - 2) * 9 * s + Math.sin(t * 1.4 + i) * 1.5 * s, py = cy + (i % 2 ? -4 : 1) * s;
        dot(ctx, px, py, (8 + (i % 2) * 3) * s, alive ? "hsl(215 26% 30% / 0.95)" : "hsl(215 10% 30% / 0.6)");
      }
      if (!alive) return;
      // lightning flickering inside it now and then
      const fl = Math.floor(t * 3) % 5 === 0 && Math.sin(t * 40) > 0;
      if (fl) {
        ctx.globalCompositeOperation = "lighter";
        glowDot(ctx, cx, cy, 26 * s, "hsl(190 100% 85%)", 0.6);
        ctx.strokeStyle = "hsl(190 100% 90%)";
        ctx.lineWidth = 1.6 * s;
        zig(ctx, { x: cx - 8 * s, y: cy }, { x: cx + 6 * s, y: cy + 22 * s }, 4, 5 * s, Math.floor(t * 3));
        ctx.stroke();
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const gy = Math.max(r.fF.y, r.fB.y) + 2 * s, gx = r.hip.x;
      ctx.globalCompositeOperation = "lighter";
      // foam churning round the feet
      for (let i = 0; i < 3; i++) {
        const a0 = t * (2 + i) + i * 2;
        ring(ctx, gx, gy - i * 3 * s, (22 + i * 6) * s, hsla(190, 100, 88, 0.5 - i * 0.12), 2 * s, 0.25, a0, a0 + 2.2);
      }
      // drops flicked up and falling
      drift(6, t, 1.3, 23, (i, k, r1) => {
        const a = -Math.PI / 2 + (r1 - 0.5) * 2.2, v = 60 * s;
        dot(ctx, gx + Math.cos(a) * v * k, gy + Math.sin(a) * v * k + 90 * s * k * k, 1.5 * s, hsla(190, 100, 85, 1 - k));
      });
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(190 100% 70%)", 0.5);
      spiral(ctx, h.x, h.y, 14 * s * k + 4 * s, 3, -t * 7, hsla(190, 100, 80, 0.85), 1.6 * s);
      if (Math.sin(t * 25) > 0.4) {
        ctx.strokeStyle = "hsl(55 100% 90%)";
        ctx.lineWidth = 1.2 * s;
        zig(ctx, { x: h.x, y: h.y - 18 * s }, { x: h.x, y: h.y }, 3, 4 * s, Math.floor(t * 20));
        ctx.stroke();
      }
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      spiral(ctx, x, y, R * (0.4 + e * 0.6), 3, seed + k * 6, hsla(195, 100, 78, f), 2 * f + 0.5);
      // a crown of spray
      fling(9, seed, (a, r1) => {
        const d = R * e * r1;
        dot(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d - R * 0.5 * Math.sin(k * Math.PI), 2 * f + 0.5, hsla(190, 100, 88, f));
      });
    },
    sign: (ctx, x, g, s, k, t) => {
      const R = 70 * s * k;
      spiral(ctx, x, g, R, 4, -t * 3, hsla(195, 100, 70, 0.7 * k), 2 * s, 0.26, 0.9);
      floorRing(ctx, x, g, R, hsla(205, 80, 60, 0.8 * k), 2.4 * s);
    },
    burst: (ctx, x, g, s, e, t) => {
      const f = 1 - e;
      // the lightning that brought it down
      if (e < 0.35) {
        ctx.strokeStyle = hsla(55, 100, 92, 1 - e / 0.35);
        ctx.lineWidth = 3 * s;
        zig(ctx, { x: x + 20 * s, y: g - 360 * s }, { x, y: g - 10 * s }, 9, 14 * s, 5);
        ctx.stroke();
      }
      fling(16, 7, (a, r1, i) => {
        const up = Math.abs(Math.sin(a)) * 0.6 + 0.4, d = e * 90 * r1 * s;
        dot(ctx, x + Math.cos(a) * d, g - (up * 120 * s * e - 160 * s * e * e), 2.2 * s * f, hsla(190, 100, 85, f));
      });
      floorRing(ctx, x, g, (20 + e * 110) * s, hsla(190, 100, 80, f), 3 * s * f);
    },
  },

  // ----- Magmaw: a column of smoke off its shoulders, lava dripping from its jaw and hand, embers rising -----
  magmaw: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      // smoke pouring up off the shoulders
      drift(7, t, 0.45, 31, (i, k, r1) => {
        const x = r.shoulder.x - face * (4 + k * 20) * s + Math.sin(t + i) * 4 * s, y = r.shoulder.y - k * 90 * s;
        dot(ctx, x, y, (5 + k * 12) * s, hsla(20, 8, 22 + r1 * 8, 0.45 * (1 - k)));
      });
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, r.shoulder.x, r.shoulder.y, 30 * s, "hsl(24 100% 50%)", 0.25);
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // lava dripping off the jaw and the front hand, stretching as it falls
      for (const [p, sd] of [[{ x: r.head.x + face * 6 * s, y: r.head.y + 9 * s }, 1], [r.hF, 2]] as const) {
        drift(2, t, 0.8, 33 + sd, (i, k) => {
          const y = p.y + k * k * 60 * s, len = (2 + k * 6) * s;
          ctx.strokeStyle = hsla(28 - k * 14, 100, 60 - k * 15, 1 - k);
          ctx.lineWidth = 2.4 * s * (1 - k * 0.5);
          ctx.beginPath();
          ctx.moveTo(p.x + (i - 0.5) * 3 * s, y - len);
          ctx.lineTo(p.x + (i - 0.5) * 3 * s, y);
          ctx.stroke();
        });
      }
      // embers rising round it
      drift(8, t, 0.6, 35, (i, k, r1, r2) => {
        dot(ctx, r.hip.x + (r1 - 0.5) * 60 * s + Math.sin(t * 3 + i) * 4 * s, r.hip.y + 20 * s - k * 110 * s, (1 + r2) * s, hsla(30, 100, 62, 1 - k));
      });
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 20 * s * k, "hsl(24 100% 55%)", 0.7);
      dot(ctx, h.x, h.y, 7 * s * k, "hsl(36 100% 65%)");
      // crust plates closing over the molten ball, cracks of light between them
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 4; i++) {
        const a = i * 1.6 + t * 0.6;
        ctx.fillStyle = "hsl(12 25% 14%)";
        ctx.beginPath();
        ctx.arc(h.x, h.y, 7.5 * s * k, a, a + 1.1);
        ctx.lineTo(h.x + Math.cos(a + 0.55) * 3 * s * k, h.y + Math.sin(a + 0.55) * 3 * s * k);
        ctx.closePath();
        ctx.fill();
      }
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      ring(ctx, x, y, R * (0.3 + e * 0.6), hsla(24, 100, 58, f), 3 * f + 0.5);
      fling(10, seed, (a, r1) => {
        const d = R * e * r1 * 1.1;
        dot(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d + R * 0.6 * k * k, (2.5 - k * 1.5) * R / 40, hsla(30 - k * 15, 100, 60, f));
      });
    },
    sign: (ctx, x, g, s, k) => {
      ctx.strokeStyle = hsla(26, 100, 58, 0.85 * k);
      ctx.lineWidth = 2.4 * s;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + 0.3, p = fp(x, g, 80 * s * k, a);
        zig(ctx, { x, y: g }, p, 4, 5 * s, i * 3);
        ctx.stroke();
      }
      ctx.fillStyle = hsla(30, 100, 55, 0.5 * k);
      ctx.beginPath();
      ctx.ellipse(x, g, 22 * s * k, 6 * s * k, 0, 0, TAU);
      ctx.fill();
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // a fountain of lava thrown up and falling back
      fling(18, 9, (a, r1, i) => {
        const vx = Math.cos(a) * 90 * r1 * s, vy = (180 + r1 * 80) * s;
        const px = x + vx * e, py = g - vy * e + 300 * s * e * e;
        if (py < g) dot(ctx, px, py, (3 - e * 1.5) * s, hsla(32 - i % 3 * 6, 100, 60, f));
      });
      floorRing(ctx, x, g, (16 + e * 90) * s, hsla(24, 100, 55, f), 4 * s * f);
    },
  },

  // ----- Everwinter: snowflakes frozen still in the air round it, a gold pendulum behind, an hourglass at the hip -----
  everwinter: {
    back: (ctx, r, s, face, t, alive) => {
      // a clock pendulum swinging slowly behind its body
      const piv = { x: r.neck.x - face * 3 * s, y: r.neck.y - 4 * s }, a = Math.sin(t * 1.6) * 0.35;
      const bob = { x: piv.x + Math.sin(a) * 52 * s, y: piv.y + Math.cos(a) * 52 * s };
      ctx.strokeStyle = alive ? "hsl(44 80% 60%)" : "hsl(44 10% 50%)";
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(piv.x, piv.y);
      ctx.lineTo(bob.x, bob.y);
      ctx.stroke();
      dot(ctx, bob.x, bob.y, 5.5 * s, alive ? "hsl(44 90% 66%)" : "hsl(44 10% 50%)");
      ring(ctx, bob.x, bob.y, 5.5 * s, INK, 1.4 * s);
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // snowflakes caught in stopped time: they hang where they are and barely turn
      for (let i = 0; i < 7; i++) {
        const px = r.hip.x + (hh(i * 3 + 1) - 0.5) * 110 * s, py = r.head.y - 20 * s + hh(i * 7 + 2) * 90 * s;
        flake(ctx, px, py, (3 + hh(i) * 3) * s, i + t * 0.05, hsla(200, 90, 88, 0.55 + 0.25 * Math.sin(t * 1.5 + i)), 1 * s);
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      // an hourglass on the hip, its sand running
      const hx = r.hip.x + face * 9 * s, hy = r.hip.y - 2 * s, w = 4.5 * s, hgt = 8 * s;
      ctx.fillStyle = "hsl(200 60% 90% / 0.6)";
      ctx.beginPath();
      ctx.moveTo(hx - w, hy - hgt); ctx.lineTo(hx + w, hy - hgt); ctx.lineTo(hx, hy); ctx.lineTo(hx + w, hy + hgt); ctx.lineTo(hx - w, hy + hgt); ctx.lineTo(hx, hy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = alive ? "hsl(44 85% 60%)" : "hsl(44 10% 45%)";
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
      if (!alive) return;
      const sand = (t * 0.1) % 1;
      ctx.fillStyle = "hsl(44 90% 70%)";
      ctx.beginPath();
      ctx.moveTo(hx - w * (1 - sand) * 0.8, hy - hgt * (1 - sand) * 0.8); ctx.lineTo(hx + w * (1 - sand) * 0.8, hy - hgt * (1 - sand) * 0.8); ctx.lineTo(hx, hy);
      ctx.fill();
      ctx.fillRect(hx - 0.5 * s, hy, 1 * s, hgt);
      // cold breath now and then
      const br = (t * 0.5) % 1;
      if (br < 0.4) dot(ctx, r.head.x + face * (12 + br * 30) * s, r.head.y + 3 * s - br * 6 * s, (2 + br * 10) * s, hsla(200, 60, 95, 0.4 * (1 - br / 0.4)));
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(200 100% 85%)", 0.6);
      flake(ctx, h.x, h.y, 10 * s * k, t * 0.3, "hsl(200 100% 92%)", 1.4 * s);
      // a clock hand ticking round it
      const a = Math.floor(t * 4) * (TAU / 12) - Math.PI / 2;
      ctx.strokeStyle = "hsl(44 100% 70%)";
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(h.x + Math.cos(a) * 15 * s * k, h.y + Math.sin(a) * 15 * s * k);
      ctx.stroke();
      ring(ctx, h.x, h.y, 15 * s * k, hsla(44, 100, 70, 0.6), 1 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k), rr = R * (0.5 + e * 0.5);
      flake(ctx, x, y, rr * 0.55, seed, hsla(200, 100, 90, f), 2 * f + 0.5);
      spokes(ctx, x, y, rr * 0.85, rr, 12, 0, hsla(44, 100, 70, f), 1.5 * f + 0.4);
    },
    sign: (ctx, x, g, s, k, t) => {
      const R = 74 * s * k;
      floorRing(ctx, x, g, R, hsla(200, 90, 85, 0.85 * k), 2.2 * s);
      spokes(ctx, x, g, R * 0.84, R, 12, 0, hsla(44, 100, 70, 0.8 * k), 2 * s);
      const a = t * 2.2, p = fp(x, g, R * 0.75, a);
      ctx.strokeStyle = hsla(44, 100, 72, k);
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.moveTo(x, g);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // the moment time stops: a white flash and ice thrown off it
      glowDot(ctx, x, g - 50 * s, (40 + e * 80) * s, "hsl(200 100% 95%)", f * 0.8);
      fling(10, 13, (a, r1) => {
        const d = (18 + e * 80 * r1) * s;
        crystal(ctx, x + Math.cos(a) * d, g - 50 * s + Math.sin(a) * d * 0.8, a, 16 * s, 3.5 * s, hsla(200, 90, 88, f), hsla(200, 100, 96, f), 1 * s);
      });
    },
  },

  // ----- The Riftmaker: mirror shards circling behind it, a seam of torn reality down its body -----
  riftmaker: {
    back: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.head);
      // mirror shards turning behind it, each catching a different colour
      for (let i = 0; i < 6; i++) {
        const a = t * 0.5 + (i / 6) * TAU, R = 44 * s, px = c.x + Math.cos(a) * R, py = c.y + Math.sin(a) * R * 0.6;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(a * 1.5);
        ctx.scale(Math.cos(t * 1.3 + i) * 0.5 + 0.7, 1);
        poly(ctx, 0, 0, 7 * s, 3, i);
        const gr = ctx.createLinearGradient(-7 * s, -7 * s, 7 * s, 7 * s);
        gr.addColorStop(0, alive ? "hsl(318 100% 75% / 0.8)" : "hsl(250 10% 40% / 0.5)");
        gr.addColorStop(1, alive ? "hsl(186 100% 70% / 0.7)" : "hsl(250 10% 30% / 0.5)");
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.strokeStyle = alive ? "hsl(0 0% 100% / 0.8)" : INK;
        ctx.lineWidth = 1 * s;
        ctx.stroke();
        ctx.restore();
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // a seam of torn reality from neck to hip, flickering
      ctx.strokeStyle = hsla(318, 100, 75, 0.65 + 0.3 * Math.sin(t * 9));
      ctx.lineWidth = 1.8 * s;
      zig(ctx, r.neck, r.hip, 6, 3 * s, Math.floor(t * 6));
      ctx.stroke();
      // the picture slipping sideways for a moment
      if (Math.floor(t * 2.5) % 4 === 0) {
        const gy = r.neck.y + hh(Math.floor(t * 10)) * 40 * s;
        ctx.fillStyle = hsla(186, 100, 70, 0.3);
        ctx.fillRect(r.hip.x - 18 * s + face * 4 * s, gy, 36 * s, 3 * s);
        ctx.fillStyle = hsla(318, 100, 70, 0.3);
        ctx.fillRect(r.hip.x - 18 * s - face * 4 * s, gy + 4 * s, 36 * s, 2 * s);
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(318 100% 70%)", 0.55);
      // a triangle folding over itself again and again
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(t * 2 + (i * TAU) / 3);
        ctx.scale(Math.cos(t * 4 + i), 1);
        poly(ctx, 0, 0, 11 * s * k, 3, 0);
        ctx.strokeStyle = i % 2 ? "hsl(186 100% 75%)" : "hsl(318 100% 78%)";
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
        ctx.restore();
      }
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // reality cracking like a mirror: lines out and a shard at each end
      fling(7, seed, (a, r1, i) => {
        const d = R * (0.3 + e * 0.8) * r1;
        ctx.strokeStyle = i % 2 ? hsla(186, 100, 75, f) : hsla(318, 100, 78, f);
        ctx.lineWidth = 1.6 * f + 0.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
        ctx.stroke();
        poly(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 4 * R / 40, 3, a + k * 3);
        ctx.stroke();
      });
    },
    sign: (ctx, x, g, s, k, t) => {
      // the floor folding up like paper towards where it will stand
      for (let i = -5; i <= 5; i++) {
        const dx = i * 14 * s * (0.4 + k * 0.6);
        ctx.strokeStyle = i % 2 ? hsla(318, 100, 72, 0.7 * k) : hsla(186, 100, 72, 0.5 * k);
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.moveTo(x + dx - 8 * s, g - 10 * s);
        ctx.lineTo(x + dx + 8 * s, g + 10 * s);
        ctx.stroke();
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, w = 26 * s * Math.sin(Math.min(1, e * 2) * Math.PI), top = g - 190 * s;
      // the tear it came through, zipping shut
      if (w > 0.5) {
        ctx.fillStyle = hsla(318, 100, 80, 0.5 * f);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.quadraticCurveTo(x + w, g - 95 * s, x, g);
        ctx.quadraticCurveTo(x - w, g - 95 * s, x, top);
        ctx.fill();
      }
      fling(10, 17, (a, r1) => {
        const d = (10 + e * 120 * r1) * s;
        poly(ctx, x + Math.cos(a) * d, g - 80 * s + Math.sin(a) * d, 5 * s * f, 3, a + e * 6);
        ctx.strokeStyle = hsla(318, 100, 85, f);
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
      });
    },
  },

  // ----- The Hollow King: souls circling it, chains hanging off its belt, grave fire on its shoulders -----
  hollow: {
    back: (ctx, r, s, face, t, alive) => {
      // chains hanging from the belt behind it, swaying
      ctx.strokeStyle = alive ? "hsl(170 8% 45%)" : "hsl(170 4% 35%)";
      ctx.lineWidth = 1.4 * s;
      for (let c = 0; c < 2; c++) {
        const sw = Math.sin(t * 2 + c) * 4 * s;
        for (let i = 0; i < 6; i++) {
          const px = r.hip.x - face * (4 + c * 7) * s + sw * (i / 6), py = r.hip.y + 2 * s + i * 4.5 * s;
          ctx.beginPath();
          ctx.ellipse(px, py, (i % 2 ? 1.4 : 2.4) * s, 2.6 * s, 0, 0, TAU);
          ctx.stroke();
        }
      }
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // souls circling it, their tails streaming behind
      const c = mid(r.hip, r.head);
      for (let i = 0; i < 4; i++) {
        const a = t * 1.1 + (i / 4) * TAU, R = 42 * s, py = c.y + Math.sin(a * 2) * 10 * s;
        const px = c.x + Math.cos(a) * R;
        if (Math.sin(a) > 0) continue;
        for (let j = 0; j < 6; j++) dot(ctx, c.x + Math.cos(a - j * 0.09) * R, py + j * 1.2 * s, (3.5 - j * 0.5) * s, hsla(152, 90, 64, 0.5 - j * 0.07));
        glowDot(ctx, px, py, 8 * s, "hsl(152 92% 70%)", 0.6);
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      const c = mid(r.hip, r.head);
      for (let i = 0; i < 4; i++) {
        const a = t * 1.1 + (i / 4) * TAU, R = 42 * s, py = c.y + Math.sin(a * 2) * 10 * s;
        if (Math.sin(a) <= 0) continue;
        for (let j = 0; j < 6; j++) dot(ctx, c.x + Math.cos(a - j * 0.09) * R, py + j * 1.2 * s, (3.5 - j * 0.5) * s, hsla(152, 90, 64, 0.55 - j * 0.07));
        const px = c.x + Math.cos(a) * R;
        glowDot(ctx, px, py, 9 * s, "hsl(152 92% 74%)", 0.7);
        dot(ctx, px - 1.5 * s, py - 1 * s, 0.9 * s, "hsl(170 30% 10%)");
        dot(ctx, px + 1.5 * s, py - 1 * s, 0.9 * s, "hsl(170 30% 10%)");
      }
      // grave fire burning on both shoulders
      for (const sh of [r.shoulder, { x: r.shoulder.x - face * 8 * s, y: r.shoulder.y + 1 * s }]) {
        flame(ctx, sh.x, sh.y - 2 * s, -Math.PI / 2, 12 * s, 3.5 * s, t, sh.x, hsla(152, 92, 60, 0.75));
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(152 92% 60%)", 0.6);
      // souls spiralling into the hand, a wailing face forming
      for (let i = 0; i < 5; i++) {
        const a = t * 4 + (i / 5) * TAU, R = (6 + (1 - k) * 24) * s;
        glowDot(ctx, h.x + Math.cos(a) * R, h.y + Math.sin(a) * R, 4 * s, "hsl(152 92% 75%)", 0.8);
      }
      ctx.globalCompositeOperation = "source-over";
      dot(ctx, h.x - 2 * s * k, h.y - 1.5 * s * k, 1 * s * k, "hsl(170 30% 8%)");
      dot(ctx, h.x + 2 * s * k, h.y - 1.5 * s * k, 1 * s * k, "hsl(170 30% 8%)");
      ring(ctx, h.x, h.y + 2.5 * s * k, 1.3 * s * k, "hsl(170 30% 8%)", 1 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k), sc = R / 40;
      // a soul pulled up out of whoever was hit, wailing as it goes
      const gy = y - e * R * 1.1;
      glowDot(ctx, x, gy, 12 * sc, "hsl(152 92% 72%)", f);
      ctx.strokeStyle = hsla(152, 92, 70, f * 0.8);
      ctx.lineWidth = 2 * sc * f + 0.5;
      ctx.beginPath();
      ctx.moveTo(x - 6 * sc, gy + 4 * sc);
      ctx.quadraticCurveTo(x, gy + 20 * sc, x + Math.sin(k * 10) * 4 * sc, y);
      ctx.stroke();
      ring(ctx, x, y, R * (0.3 + e * 0.7), hsla(152, 92, 64, f), 2 * f + 0.4, 0.4);
    },
    sign: (ctx, x, g, s, k, t) => {
      const R = 76 * s * k;
      floorRing(ctx, x, g, R, hsla(152, 92, 60, 0.8 * k), 2.2 * s);
      // little grave crosses standing round the ring
      ctx.strokeStyle = hsla(152, 70, 70, 0.8 * k);
      ctx.lineWidth = 1.8 * s;
      for (let i = 0; i < 8; i++) {
        const p = fp(x, g, R * 0.85, (i / 8) * TAU + 0.2);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - 12 * s * k);
        ctx.moveTo(p.x - 4 * s, p.y - 8 * s * k);
        ctx.lineTo(p.x + 4 * s, p.y - 8 * s * k);
        ctx.stroke();
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // hands of the dead clawing up out of the floor round it
      ctx.strokeStyle = hsla(152, 80, 70, f);
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 6; i++) {
        const p = fp(x, g, (40 + i % 2 * 20) * s, (i / 6) * TAU + 0.4), up = Math.sin(Math.min(1, e * 2.2) * Math.PI) * 26 * s;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - up);
        for (let j = -1; j <= 1; j++) { ctx.moveTo(p.x, p.y - up); ctx.lineTo(p.x + j * 4 * s, p.y - up - 6 * s); }
        ctx.stroke();
      }
      glowDot(ctx, x, g - 60 * s, 70 * s, "hsl(152 92% 66%)", 0.5 * f);
    },
  },

  // ----- The Black Sun: beads of light circling it like an eclipse's edge, loops of dark fire arcing off its hand -----
  blacksun: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const c = mid(r.hip, r.neck);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 9; i++) {
        const a = t * 0.8 + (i / 9) * TAU;
        if (Math.sin(a) > 0) continue;
        glowDot(ctx, c.x + Math.cos(a) * 38 * s, c.y + Math.sin(a) * 9 * s, 5 * s, "hsl(42 100% 70%)", 0.8);
      }
      // a slow solar wind streaming off it
      ctx.strokeStyle = hsla(40, 100, 60, 0.25);
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      drift(8, t, 0.9, 41, (i, k, r1) => {
        const y = r.head.y + r1 * 70 * s, x = r.hip.x - face * (10 + k * 80) * s;
        ctx.moveTo(x, y);
        ctx.lineTo(x - face * 12 * s, y);
      });
      ctx.stroke();
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const c = mid(r.hip, r.neck);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 9; i++) {
        const a = t * 0.8 + (i / 9) * TAU;
        if (Math.sin(a) <= 0) continue;
        glowDot(ctx, c.x + Math.cos(a) * 38 * s, c.y + Math.sin(a) * 9 * s, 5.5 * s, "hsl(46 100% 76%)", 0.95);
      }
      // a loop of fire arcing from the front hand up over the shoulder
      const h = r.hF, sh = r.shoulder, lift = (22 + Math.sin(t * 2) * 6) * s;
      for (let j = 0; j < 2; j++) {
        ctx.strokeStyle = j ? hsla(46, 100, 80, 0.6) : hsla(24, 100, 50, 0.5);
        ctx.lineWidth = (j ? 1.5 : 4) * s;
        ctx.beginPath();
        ctx.moveTo(h.x, h.y);
        ctx.bezierCurveTo(h.x, h.y - lift * 1.6, sh.x + face * 6 * s, sh.y - lift * 1.6, sh.x, sh.y);
        ctx.stroke();
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 22 * s * k, "hsl(40 100% 60%)", 0.7);
      ring(ctx, h.x, h.y, 8 * s * k, "hsl(46 100% 80%)", 2 * s);
      ctx.globalCompositeOperation = "source-over";
      dot(ctx, h.x, h.y, 7 * s * k, "hsl(30 40% 6%)");
      ctx.globalCompositeOperation = "lighter";
      // the diamond ring: one blinding point on the edge
      const a = t * 3;
      star4(ctx, h.x + Math.cos(a) * 8 * s * k, h.y + Math.sin(a) * 8 * s * k, 7 * s * k, "hsl(50 100% 92%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k), rr = R * (0.35 + e * 0.5);
      ring(ctx, x, y, rr, hsla(44, 100, 70, f), 3 * f + 0.5);
      spokes(ctx, x, y, rr * 1.1, rr * (1.4 + e * 0.4), 12, seed, hsla(40, 100, 60, f * 0.8), 1.5 * f + 0.3);
      const a = seed * 5;
      star4(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr, R * 0.5 * f, hsla(50, 100, 92, f));
    },
    sign: (ctx, x, g, s, k) => {
      // the moon's shadow sliding over the floor to cover where it stands
      const off = (1 - k) * 90 * s;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hsla(30, 40, 5, 0.55 * k);
      ctx.beginPath();
      ctx.ellipse(x - off, g, 60 * s, 15 * s, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, g, 62 * s, hsla(42, 100, 66, 0.8 * k), 2.4 * s);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 55 * s;
      // the corona flaring out round the dark
      spokes(ctx, x, cy, 30 * s, (40 + e * 110) * s, 18, e, hsla(42, 100, 66, f), 3 * s * f);
      ring(ctx, x, cy, (30 + e * 30) * s, hsla(46, 100, 80, f), 4 * s * f);
    },
  },

  // ----- The Axiom: planets in orbit round it, the first shapes (triangle, circle, square) turning over its head -----
  axiom: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const c = mid(r.hip, r.neck);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) {
        const R = (34 + i * 12) * s;
        ctx.strokeStyle = hsla(272, 100, 80, 0.18);
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, R, R * 0.3, -0.2, 0, TAU);
        ctx.stroke();
      }
      // star dust drifting down
      drift(10, t, 0.35, 51, (i, k, r1) => star4(ctx, c.x + (r1 - 0.5) * 120 * s, r.head.y - 30 * s + k * 120 * s, 2 * s * Math.sin(k * Math.PI), "hsl(272 100% 88%)"));
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const c = mid(r.hip, r.neck);
      ctx.globalCompositeOperation = "lighter";
      // three planets on their orbits, one with a ring
      for (let i = 0; i < 3; i++) {
        const R = (34 + i * 12) * s, a = t * (1.2 - i * 0.3) + i * 2;
        const px = c.x + Math.cos(a) * R, py = c.y + Math.sin(a) * R * 0.3;
        const pr = Math.cos(-0.2), rx = c.x + (px - c.x) * pr - (py - c.y) * Math.sin(-0.2), ry = c.y + (px - c.x) * Math.sin(-0.2) + (py - c.y) * pr;
        glowDot(ctx, rx, ry, 7 * s, i === 1 ? "hsl(200 100% 70%)" : "hsl(300 90% 72%)", 0.9);
        if (i === 2) ring(ctx, rx, ry, 6 * s, "hsl(44 100% 75% / 0.8)", 1 * s, 0.3);
      }
      // the first shapes turning slowly over the head
      const hx = r.head.x, hy = r.head.y - 26 * s;
      ctx.strokeStyle = hsla(44, 100, 78, 0.7);
      ctx.lineWidth = 1.2 * s;
      for (let i = 0; i < 3; i++) {
        const a = t * 0.7 + (i / 3) * TAU, px = hx + Math.cos(a) * 14 * s, py = hy + Math.sin(a) * 4 * s;
        if (i === 1) { ctx.beginPath(); ctx.arc(px, py, 3.5 * s, 0, TAU); ctx.stroke(); }
        else { poly(ctx, px, py, 4 * s, i ? 4 : 3, t + i); ctx.stroke(); }
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 20 * s * k, "hsl(272 100% 75%)", 0.6);
      spiral(ctx, h.x, h.y, 15 * s * (1.3 - k * 0.5), 2, t * 4, hsla(280, 100, 85, 0.9), 1.6 * s, 0.6, 0.8);
      glowDot(ctx, h.x, h.y, 5 * s, "hsl(0 0% 100%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      spiral(ctx, x, y, R * (0.4 + e * 0.6), 2, seed + k * 3, hsla(280, 100, 82, f), 2 * f + 0.4, 0.6, 0.7);
      star4(ctx, x, y, R * 0.6 * f, hsla(0, 0, 100, f));
    },
    sign: (ctx, x, g, s, k) => {
      // a star map drawn on the floor, its stars joining up one by one
      const pts = Array.from({ length: 7 }, (_, i) => fp(x, g, (30 + hh(i * 3) * 50) * s, (i / 7) * TAU + hh(i) * 0.6));
      ctx.strokeStyle = hsla(272, 100, 80, 0.6 * k);
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      const n = Math.floor(k * 7);
      for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % 7]; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
      ctx.stroke();
      pts.forEach((p, i) => i <= n && star4(ctx, p.x, p.y, 5 * s, hsla(44, 100, 85, k)));
      floorRing(ctx, x, g, 84 * s * k, hsla(272, 100, 75, 0.5 * k), 1.6 * s);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 55 * s;
      // a small big bang
      glowDot(ctx, x, cy, (30 + e * 60) * s, "hsl(0 0% 100%)", f * 0.9);
      ring(ctx, x, cy, (20 + e * 140) * s, hsla(272, 100, 80, f), 3 * s * f, 0.7);
      fling(20, 19, (a, r1) => star4(ctx, x + Math.cos(a) * e * 150 * r1 * s, cy + Math.sin(a) * e * 110 * r1 * s, 4 * s * f, hsla(44, 100, 88, f)));
    },
  },

  // ----- The Lanternmaw: a glowing dorsal fin down its back, bubbles rising, a shoal of little fish round its lure -----
  lanternmaw: {
    back: (ctx, r, s, face, t, alive) => {
      // a ragged fin down its back, lit with dots of light
      const b = -face;
      ctx.fillStyle = alive ? "hsl(196 40% 16%)" : "hsl(196 8% 22%)";
      ctx.beginPath();
      ctx.moveTo(r.neck.x, r.neck.y);
      for (let i = 0; i <= 5; i++) {
        const p = mid(r.neck, r.hip, i / 5), w = Math.sin((i / 5) * Math.PI) * 14 * s + Math.sin(t * 3 + i) * 2 * s;
        ctx.lineTo(p.x + b * (6 + w), p.y - 3 * s);
        ctx.lineTo(p.x + b * 4 * s, p.y + 2 * s);
      }
      ctx.lineTo(r.hip.x, r.hip.y);
      ctx.closePath();
      ctx.fill();
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 1; i < 5; i++) {
        const p = mid(r.neck, r.hip, i / 5);
        glowDot(ctx, p.x + b * 8 * s, p.y, 4 * s, "hsl(66 100% 64%)", 0.5 + 0.5 * Math.sin(t * 2 - i));
      }
      // bubbles rising from it
      drift(7, t, 0.5, 61, (i, k, r1) => ring(ctx, r.hip.x + (r1 - 0.5) * 50 * s + Math.sin(t * 2 + i) * 3 * s, r.hip.y + 20 * s - k * 120 * s, (1.5 + r1 * 2) * s, hsla(190, 80, 80, 0.6 * (1 - k)), 1 * s));
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // a shoal of little glowing fish wheeling round its head and lure
      const cx = r.head.x + face * 14 * s, cy = r.head.y - 14 * s;
      for (let i = 0; i < 6; i++) {
        const a = t * 1.6 + (i / 6) * TAU + Math.sin(t + i) * 0.3, R = (22 + (i % 3) * 5) * s;
        const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R * 0.5, dir = Math.sin(a) > 0 ? -1 : 1;
        ctx.fillStyle = hsla(66, 100, 70, 0.8);
        ctx.beginPath();
        ctx.ellipse(px, py, 3 * s, 1.4 * s, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px - dir * 3 * s, py);
        ctx.lineTo(px - dir * 6 * s, py - 1.8 * s);
        ctx.lineTo(px - dir * 6 * s, py + 1.8 * s);
        ctx.fill();
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 22 * s * k, "hsl(66 100% 64%)", 0.7);
      dot(ctx, h.x, h.y, 4 * s * k, "hsl(66 100% 92%)");
      // ripples pulled in towards the light
      for (let i = 0; i < 3; i++) ring(ctx, h.x, h.y, (1 - ((t * 1.5 + i / 3) % 1)) * 26 * s, hsla(190, 90, 75, 0.6 * k), 1.2 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      for (let i = 0; i < 3; i++) ring(ctx, x, y, R * e * (0.4 + i * 0.3), hsla(190, 90, 78, f * (1 - i * 0.25)), 2 * f + 0.4);
      fling(6, seed, (a, r1) => ring(ctx, x + Math.cos(a) * R * 0.4 * r1, y - e * R * r1, 2.5 * R / 40, hsla(66, 100, 80, f), 1));
    },
    sign: (ctx, x, g, s, k, t) => {
      // light through water dancing on the floor
      for (let i = 0; i < 4; i++) {
        const R = (20 + i * 18) * s * k;
        ctx.strokeStyle = hsla(i % 2 ? 66 : 190, 100, 70, 0.5 * k);
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        for (let j = 0; j <= 30; j++) {
          const a = (j / 30) * TAU, w = R + Math.sin(a * 5 + t * 3 + i) * 4 * s, p = fp(x, g, w, a);
          j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // a column of bubbles rushing up
      fling(18, 23, (a, r1, i) => ring(ctx, x + Math.cos(a) * 30 * r1 * s, g - e * (100 + r1 * 160) * s, (2 + (i % 3)) * s, hsla(190, 90, 82, f), 1.2 * s));
      glowDot(ctx, x, g - 60 * s, 60 * s, "hsl(66 100% 64%)", 0.5 * f);
    },
  },

  // ----- The Sporemother: little mushrooms on its shoulders, glowing spores drifting off, mycelium threads down its limbs -----
  sporemother: {
    back: (ctx, r, s, face, t, alive) => {
      // a cluster of small caps on the back shoulder
      for (let i = 0; i < 3; i++) {
        const bx = r.shoulder.x - face * (6 + i * 5) * s, by = r.shoulder.y - (2 + (i % 2) * 4) * s, w = (5 - i) * s;
        ctx.strokeStyle = "hsl(40 20% 80%)";
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.moveTo(bx, by + 4 * s);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.fillStyle = alive ? "hsl(318 40% 44%)" : "hsl(318 8% 35%)";
        ctx.beginPath();
        ctx.ellipse(bx, by, w, w * 0.6, 0, Math.PI, TAU);
        ctx.fill();
        if (alive) dot(ctx, bx - w * 0.3, by - w * 0.3, 0.8 * s, "hsl(170 100% 80%)");
      }
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      drift(12, t, 0.3, 71, (i, k, r1, r2) => {
        const x = r.hip.x + (r1 - 0.5) * 80 * s + Math.sin(t * 1.5 + i) * 6 * s, y = r.hip.y + 10 * s - k * 120 * s;
        glowDot(ctx, x, y, (2 + r2 * 2) * s, i % 3 ? "hsl(170 100% 70%)" : "hsl(318 100% 75%)", Math.sin(k * Math.PI));
      });
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // fine threads down the front limbs, a pulse of light running down them
      const pulse = (t * 0.8) % 1;
      for (const path of [[r.shoulder, r.eF, r.hF], [r.hip, r.kF, r.fF]]) {
        ctx.strokeStyle = hsla(170, 100, 70, 0.35);
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(path[0].x + 2 * s, path[0].y);
        ctx.lineTo(path[1].x + 2 * s, path[1].y);
        ctx.lineTo(path[2].x + 2 * s, path[2].y);
        ctx.stroke();
        const q = pulse < 0.5 ? mid(path[0], path[1], pulse * 2) : mid(path[1], path[2], (pulse - 0.5) * 2);
        glowDot(ctx, q.x + 2 * s, q.y, 4 * s, "hsl(170 100% 75%)", 0.9);
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(170 100% 60%)", 0.6);
      // a pod opening, petals peeling back to let the spores out
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + t * 0.5;
        ctx.fillStyle = hsla(318, 50, 50, 0.8);
        ctx.beginPath();
        ctx.ellipse(h.x + Math.cos(a) * 5 * s * k, h.y + Math.sin(a) * 5 * s * k, 5 * s * k, 2 * s, a, 0, TAU);
        ctx.fill();
      }
      for (let i = 0; i < 6; i++) dot(ctx, h.x + Math.cos(i + t * 3) * 14 * s * k, h.y + Math.sin(i + t * 3) * 14 * s * k, 1.4 * s, "hsl(170 100% 80%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // a soft puff of spores
      fling(9, seed, (a, r1, i) => glowDot(ctx, x + Math.cos(a) * R * e * r1, y + Math.sin(a) * R * e * r1 * 0.8, R * 0.3 * (0.5 + e), i % 2 ? "hsl(170 100% 70%)" : "hsl(318 90% 72%)", f * 0.6));
    },
    sign: (ctx, x, g, s, k) => {
      // threads of mycelium spreading through the floor
      ctx.strokeStyle = hsla(170, 100, 70, 0.7 * k);
      ctx.lineWidth = 1.4 * s;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.2, p1 = fp(x, g, 45 * s * k, a), p2 = fp(x, g, 80 * s * k, a + 0.3), p3 = fp(x, g, 76 * s * k, a - 0.3);
        zig(ctx, { x, y: g }, p1, 3, 4 * s, i);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p3.x, p3.y); ctx.stroke();
        dot(ctx, p1.x, p1.y, 2 * s * k, hsla(318, 100, 75, k));
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, grow = Math.min(1, e * 3);
      // a ring of mushrooms springing up round it
      for (let i = 0; i < 7; i++) {
        const p = fp(x, g, 58 * s, (i / 7) * TAU + 0.3), hgt = 12 * s * grow, w = 7 * s * grow;
        ctx.fillStyle = hsla(40, 20, 85, f);
        ctx.fillRect(p.x - 1 * s, p.y - hgt, 2 * s, hgt);
        ctx.fillStyle = hsla(318, 60, 55, f);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - hgt, w, w * 0.55, 0, Math.PI, TAU);
        ctx.fill();
      }
      glowDot(ctx, x, g - 30 * s, (30 + e * 70) * s, "hsl(170 100% 70%)", 0.5 * f);
    },
  },

  // ----- The Mnemovore: frames of memories it has eaten circling it, words crumbling off its long fingers -----
  mnemovore: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const c = mid(r.hip, r.head);
      // picture frames of eaten memories, fading in and out as it forgets them
      for (let i = 0; i < 5; i++) {
        const a = t * 0.35 + (i / 5) * TAU, px = c.x + Math.cos(a) * 46 * s, py = c.y + Math.sin(a) * 18 * s - 6 * s;
        const fade = 0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.7);
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(Math.sin(t * 0.6 + i) * 0.2);
        ctx.fillStyle = hsla(30 + i * 50, 40, 70, 0.25 * fade);
        ctx.fillRect(-7 * s, -5 * s, 14 * s, 10 * s);
        ctx.strokeStyle = hsla(300, 60, 88, 0.7 * fade);
        ctx.lineWidth = 1.2 * s;
        ctx.setLineDash([3 * s, 2 * s * (1 + (1 - fade) * 3)]);
        ctx.strokeRect(-7 * s, -5 * s, 14 * s, 10 * s);
        ctx.restore();
      }
      ctx.setLineDash([]);
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // letters crumbling off the fingers and blowing away
      ctx.strokeStyle = hsla(300, 100, 85, 0.7);
      ctx.lineWidth = 1 * s;
      for (const h of [r.hF, r.hB]) {
        drift(4, t, 0.6, 81 + h.x * 0, (i, k, r1) => {
          const x = h.x - face * k * 30 * s + Math.sin(t * 2 + i) * 3 * s, y = h.y - k * 40 * s, w = 3 * s * (1 - k);
          ctx.globalAlpha = 1 - k;
          ctx.beginPath();
          if (r1 < 0.33) { ctx.moveTo(x - w, y); ctx.lineTo(x + w, y); ctx.moveTo(x, y - w); ctx.lineTo(x, y + w); }
          else if (r1 < 0.66) { ctx.arc(x, y, w * 0.7, 0, TAU); }
          else { ctx.moveTo(x - w, y + w); ctx.lineTo(x, y - w); ctx.lineTo(x + w, y + w); }
          ctx.stroke();
        });
      }
      ctx.globalAlpha = 1;
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(300 100% 80%)", 0.55);
      // a memory's frame being drawn in and swallowed
      const w = (16 - k * 10) * s;
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(t * 1.5);
      ctx.strokeStyle = "hsl(300 100% 90%)";
      ctx.lineWidth = 1.4 * s;
      ctx.strokeRect(-w, -w * 0.7, w * 2, w * 1.4);
      ctx.restore();
      spiral(ctx, h.x, h.y, 8 * s, 2, -t * 5, hsla(300, 100, 88, 0.7), 1 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k), w = R * (0.5 + e * 0.4);
      // a frame round whoever was hit, its edges rubbed out
      ctx.strokeStyle = hsla(300, 100, 88, f);
      ctx.lineWidth = 2 * f + 0.4;
      ctx.setLineDash([R * 0.25 * f + 1, R * 0.12 * (1 + k * 4)]);
      ctx.strokeRect(x - w, y - w * 0.75, w * 2, w * 1.5);
      ctx.setLineDash([]);
      fling(6, seed, (a, r1) => { ctx.fillStyle = hsla(300, 80, 90, f * 0.7); ctx.fillRect(x + Math.cos(a) * w * r1 * 1.3, y + Math.sin(a) * w * r1 - e * 10, 3 * R / 40, 3 * R / 40); });
    },
    sign: (ctx, x, g, s, k, t) => {
      // empty frames laid on the floor, blinking out as they're forgotten
      ctx.lineWidth = 1.6 * s;
      for (let i = 0; i < 6; i++) {
        const p = fp(x, g, (30 + (i % 2) * 34) * s * k, (i / 6) * TAU + 0.5), on = 0.5 + 0.5 * Math.sin(t * 3 + i * 2);
        ctx.strokeStyle = hsla(300, 100, 85, 0.75 * k * on);
        ctx.strokeRect(p.x - 9 * s, p.y - 3 * s, 18 * s, 6 * s);
      }
      floorRing(ctx, x, g, 70 * s * k, hsla(300, 80, 80, 0.4 * k), 1.4 * s);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // a blank white smear across the world, frames scattering out of it
      const w = (40 + e * 200) * s;
      const gr = ctx.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, hsla(300, 100, 95, 0));
      gr.addColorStop(0.5, hsla(300, 100, 95, 0.6 * f));
      gr.addColorStop(1, hsla(300, 100, 95, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(x - w, g - 90 * s, w * 2, 70 * s);
      fling(8, 29, (a, r1) => { ctx.strokeStyle = hsla(300, 100, 90, f); ctx.lineWidth = 1.2 * s; ctx.strokeRect(x + Math.cos(a) * e * 130 * r1 * s - 6 * s, g - 55 * s + Math.sin(a) * e * 70 * r1 * s - 4 * s, 12 * s, 8 * s); });
    },
  },

  // ----- The Dustmoth: a pale moon behind it with little moths circling, dust sifting off its shoulders -----
  dustmoth: {
    back: (ctx, r, s, face, t, alive) => {
      const mx = r.head.x - face * 16 * s, my = r.head.y - 24 * s;
      // a pale moon it can never reach
      glowDot(ctx, mx, my, 30 * s, alive ? "hsl(208 100% 88%)" : "hsl(208 10% 60%)", alive ? 0.35 : 0.15);
      dot(ctx, mx, my, 11 * s, alive ? "hsl(208 60% 92% / 0.85)" : "hsl(208 5% 55% / 0.5)");
      if (!alive) return;
      // dust sifting off the shoulders
      drift(10, t, 0.4, 91, (i, k, r1) => dot(ctx, r.shoulder.x + (r1 - 0.5) * 30 * s + Math.sin(t + i) * 4 * s, r.shoulder.y + k * 80 * s, 1.1 * s, hsla(32, 20, 75, 0.6 * (1 - k))));
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const mx = r.head.x - face * 16 * s, my = r.head.y - 24 * s;
      // moths circling the moon
      for (let i = 0; i < 4; i++) {
        const a = t * (1.5 + i * 0.2) + i * 1.6, R = (16 + i * 3) * s;
        wings(ctx, mx + Math.cos(a) * R, my + Math.sin(a) * R * 0.6, 3.5 * s, t * 22 + i, hsla(32, 30, 82, 0.9), 1.4 * s);
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(208 100% 84%)", 0.5);
      spiral(ctx, h.x, h.y, (20 - k * 10) * s, 3, t * 3, hsla(32, 30, 80, 0.7), 1 * s);
      wings(ctx, h.x, h.y, 8 * s * k, t * 18, "hsl(208 100% 92%)", 1.8 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // a wing's eyespot left on whoever was hit
      ring(ctx, x, y, R * 0.5 * (0.6 + e * 0.6), hsla(208, 100, 85, f), 2.4 * f + 0.4);
      ring(ctx, x, y, R * 0.25 * (0.6 + e * 0.6), hsla(32, 60, 70, f), 2 * f + 0.4);
      fling(10, seed, (a, r1) => dot(ctx, x + Math.cos(a) * R * e * r1, y + Math.sin(a) * R * e * r1, 1.5 * R / 40, hsla(32, 20, 80, f)));
    },
    sign: (ctx, x, g, s, k, t) => {
      floorRing(ctx, x, g, 60 * s * k, hsla(208, 100, 85, 0.6 * k), 2 * s);
      spiral(ctx, x, g, 70 * s * k, 3, t, hsla(32, 25, 78, 0.6 * k), 1.6 * s, 0.26, 0.8);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // a swarm of moths flung out from where it lands
      fling(16, 31, (a, r1, i) => wings(ctx, x + Math.cos(a) * e * 150 * r1 * s, g - 60 * s + Math.sin(a) * e * 90 * r1 * s, 4 * s, e * 40 + i, hsla(32, 30, 84, f), 1.4 * s));
      floorRing(ctx, x, g, (20 + e * 100) * s, hsla(32, 20, 75, f * 0.7), 3 * s * f);
    },
  },

  // ----- The Somnarch: a crescent moon cradling its head, dream bubbles rising, sleepy stars twinkling round it -----
  somnarch: {
    back: (ctx, r, s, face, t, alive) => {
      // a crescent moon it rests its head against
      const cx = r.head.x - face * 6 * s, cy = r.head.y - 2 * s;
      ctx.fillStyle = alive ? "hsl(46 90% 72%)" : "hsl(46 10% 55%)";
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * s, 0, TAU);
      ctx.moveTo(cx + face * 7 * s + 18 * s, cy - 4 * s);
      ctx.arc(cx + face * 7 * s, cy - 4 * s, 18 * s, 0, TAU);
      ctx.fill("evenodd");
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // dream bubbles rising, shimmering
      drift(6, t, 0.25, 101, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 70 * s + Math.sin(t + i) * 6 * s, y = r.hip.y - k * 130 * s, R = (3 + r1 * 4) * s;
        ring(ctx, x, y, R, hsla(250 + i * 25, 80, 80, 0.6 * Math.sin(k * Math.PI)), 1.2 * s);
        dot(ctx, x - R * 0.35, y - R * 0.35, R * 0.2, hsla(0, 0, 100, 0.7 * Math.sin(k * Math.PI)));
      });
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 6; i++) {
        const px = r.hip.x + (hh(i * 5) - 0.5) * 90 * s, py = r.head.y - 10 * s + hh(i * 9) * 70 * s;
        star4(ctx, px, py, (2 + 2 * Math.max(0, Math.sin(t * 1.2 + i * 2))) * s, "hsl(46 100% 82%)");
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(46 100% 70%)", 0.5);
      spiral(ctx, h.x, h.y, 14 * s * k, 1, t * 5, hsla(46, 100, 80, 0.9), 1.6 * s, 1, 2.2);
      spiral(ctx, h.x, h.y, 14 * s * k, 1, t * 5 + Math.PI, hsla(260, 80, 80, 0.8), 1.6 * s, 1, 2.2);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k;
      spiral(ctx, x, y, R * (0.5 + k * 0.4), 1, seed + k * 8, hsla(46, 100, 80, f), 2 * f + 0.4, 1, 2.2);
      fling(5, seed, (a, r1) => ring(ctx, x + Math.cos(a) * R * 0.6 * r1, y - k * R * r1, 3 * R / 40, hsla(260, 80, 85, f), 1));
    },
    sign: (ctx, x, g, s, k, t) => {
      spiral(ctx, x, g, 76 * s * k, 1, t * 1.5, hsla(46, 100, 75, 0.7 * k), 2 * s, 0.26, 2.5);
      spiral(ctx, x, g, 76 * s * k, 1, t * 1.5 + Math.PI, hsla(260, 80, 75, 0.6 * k), 2 * s, 0.26, 2.5);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 55 * s;
      // a great dream bubble that swells and pops into stars
      if (e < 0.4) ring(ctx, x, cy, (40 + e * 100) * s, hsla(260, 80, 85, 1 - e / 0.4), 2.5 * s);
      else fling(14, 37, (a, r1) => star4(ctx, x + Math.cos(a) * (80 + (e - 0.4) * 100 * r1) * s, cy + Math.sin(a) * (80 + (e - 0.4) * 80 * r1) * s, 5 * s * f, hsla(46, 100, 82, f)));
    },
  },
};
