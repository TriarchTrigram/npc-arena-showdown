// The Story bosses' second layer, part two: the Hush to Primeva and the Titans. See boss-looks.ts for what each piece is.
import type { BossDesign } from "./fighters";
import {
  TAU, poly, ring, dot, spiral, fling, hex, glowDot, crystal, zig, leaf, star4, drift, floorRing, spokes, fp, hh, hsla,
  easeOut, mid, rock, type BossLook,
} from "./boss-looks-kit";

export const LOOKS_B: Partial<Record<BossDesign, BossLook>> = {
  // ----- The Hush: sound pulled in towards the bell and swallowed, ash falling off the veil -----
  hush: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      // rings of sound closing in on it from all round and vanishing
      for (let i = 0; i < 4; i++) {
        const q = 1 - ((t * 0.5 + i / 4) % 1);
        ring(ctx, r.head.x, r.head.y, (14 + q * 70) * s, hsla(354, 70, 60, 0.35 * (1 - q) * q * 4), 1.6 * s);
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      // ash drifting down off the veil
      drift(10, t, 0.3, 111, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 50 * s + Math.sin(t * 1.3 + i) * 5 * s, y = r.neck.y + k * 90 * s;
        dot(ctx, x, y, 1.2 * s, hsla(350, 10, 60, 0.6 * (1 - k)));
      });
      // a note that tries to sound and is struck out
      const n = (t * 0.4) % 1;
      if (n < 0.5) {
        const x = r.head.x + 22 * s, y = r.head.y - 18 * s - n * 20 * s, a = 1 - n * 2;
        ring(ctx, x, y, 3 * s, hsla(354, 90, 70, a), 1.4 * s);
        ctx.strokeStyle = hsla(354, 90, 70, a);
        ctx.beginPath();
        ctx.moveTo(x + 3 * s, y); ctx.lineTo(x + 3 * s, y - 10 * s);
        ctx.moveTo(x - 6 * s, y - 8 * s); ctx.lineTo(x + 8 * s, y + 4 * s);
        ctx.stroke();
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 16 * s * k, "hsl(354 90% 60%)", 0.6);
      for (let i = 0; i < 3; i++) ring(ctx, h.x, h.y, (1 - ((t * 2 + i / 3) % 1)) * 28 * s, hsla(354, 90, 66, 0.7 * k), 1.4 * s);
      ctx.globalCompositeOperation = "source-over";
      dot(ctx, h.x, h.y, 4 * s * k, "hsl(350 20% 6%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k;
      // the sound of the hit sucked back in and a crack where it was
      for (let i = 0; i < 3; i++) ring(ctx, x, y, R * (1 - k) * (0.5 + i * 0.25), hsla(354, 90, 66, f), 2 * f + 0.4);
      ctx.strokeStyle = hsla(30, 60, 70, f);
      ctx.lineWidth = 1.6 * f + 0.4;
      zig(ctx, { x: x - R * 0.5, y: y - R * 0.3 }, { x: x + R * 0.5, y: y + R * 0.3 }, 5, R * 0.12, seed);
      ctx.stroke();
    },
    sign: (ctx, x, g, s, k, t) => {
      for (let i = 0; i < 4; i++) {
        const q = 1 - ((t * 0.7 + i / 4) % 1);
        floorRing(ctx, x, g, (10 + q * 80) * s * k, hsla(354, 80, 60, 0.6 * k * (1 - q * 0.5)), 1.8 * s);
      }
      ctx.fillStyle = hsla(350, 20, 5, 0.5 * k);
      ctx.beginPath();
      ctx.ellipse(x, g, 20 * s * k, 5 * s * k, 0, 0, TAU);
      ctx.fill();
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 75 * s;
      // one silent toll: a single ring that leaves no sound behind
      ring(ctx, x, cy, (20 + e * 170) * s, hsla(354, 90, 70, f), 5 * s * f);
      ring(ctx, x, cy, (10 + e * 110) * s, hsla(30, 60, 70, f * 0.6), 2 * s * f);
    },
  },

  // ----- The Elder Dark: a starless cloak behind it full of eyes that open and close, dead stars drifting round it -----
  elderdark: {
    back: (ctx, r, s, face, t, alive) => {
      const b = -face, S = r.shoulder;
      // a cloak of night with no stars in it
      ctx.fillStyle = "hsl(262 50% 5% / 0.9)";
      ctx.beginPath();
      ctx.moveTo(S.x, S.y);
      ctx.quadraticCurveTo(S.x + b * 40 * s, S.y + 10 * s, S.x + b * (36 + Math.sin(t) * 4) * s, r.fF.y);
      ctx.lineTo(r.hip.x + b * 4 * s, r.fF.y - 6 * s);
      ctx.lineTo(r.hip.x, r.hip.y);
      ctx.closePath();
      ctx.fill();
      if (!alive) return;
      ctx.strokeStyle = "hsl(268 100% 70% / 0.4)";
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
      // eyes opening in it, looking about, closing again
      for (let i = 0; i < 4; i++) {
        const open = Math.max(0, Math.sin(t * 0.7 + i * 1.9));
        if (open < 0.05) continue;
        const ex = S.x + b * (12 + hh(i) * 20) * s, ey = S.y + (12 + i * 14) * s;
        ctx.fillStyle = hsla(268, 100, 82, 0.9);
        ctx.beginPath();
        ctx.ellipse(ex, ey, 3.5 * s, 2.2 * s * open, 0, 0, TAU);
        ctx.fill();
        dot(ctx, ex + Math.sin(t * 0.9 + i) * 1.2 * s, ey, 1.1 * s * open, "hsl(262 60% 6%)");
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const c = mid(r.hip, r.head);
      // dead stars drifting round it: grey cinders with a last violet rim
      for (let i = 0; i < 5; i++) {
        const a = t * 0.4 + (i / 5) * TAU, px = c.x + Math.cos(a) * 48 * s, py = c.y + Math.sin(a * 1.3) * 26 * s;
        dot(ctx, px, py, 2.4 * s, "hsl(262 8% 40%)");
        ring(ctx, px, py, 3.6 * s, hsla(268, 100, 75, 0.5), 1 * s);
      }
    },
    charge: (ctx, h, s, t, k) => {
      ctx.globalCompositeOperation = "source-over";
      dot(ctx, h.x, h.y, 10 * s * k, "hsl(262 60% 4%)");
      ctx.globalCompositeOperation = "lighter";
      ring(ctx, h.x, h.y, 10 * s * k, "hsl(268 100% 75%)", 1.4 * s);
      // an eye opening in the dark
      const open = Math.min(1, k * 1.4);
      ctx.fillStyle = "hsl(268 100% 85%)";
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 6 * s * k, 3 * s * open, 0, 0, TAU);
      ctx.fill();
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, open = Math.sin(Math.min(1, k * 1.6) * Math.PI);
      // an eye opening on whoever was hit, then shutting
      ctx.fillStyle = hsla(268, 100, 82, f);
      ctx.beginPath();
      ctx.ellipse(x, y, R * 0.6, R * 0.3 * open, 0, 0, TAU);
      ctx.fill();
      ring(ctx, x, y, R * (0.5 + k * 0.6), hsla(268, 100, 70, f * 0.7), 2 * f + 0.4);
    },
    sign: (ctx, x, g, s, k, t) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hsla(262, 60, 4, 0.7 * k);
      ctx.beginPath();
      ctx.ellipse(x, g, 80 * s * k, 21 * s * k, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const p = fp(x, g, (20 + hh(i) * 50) * s * k, i * 1.3), open = Math.max(0, Math.sin(t * 2 + i * 2));
        ctx.fillStyle = hsla(268, 100, 82, k);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 4 * s, 1.6 * s * open, 0, 0, TAU);
        ctx.fill();
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, up = Math.sin(Math.min(1, e * 1.8) * Math.PI);
      // arms of night lashing up out of the floor
      for (let i = 0; i < 6; i++) {
        const p = fp(x, g, 50 * s, (i / 6) * TAU + 0.2), L = 70 * s * up;
        ctx.strokeStyle = hsla(262, 50, 8, f);
        ctx.lineWidth = 5 * s;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x + Math.sin(i + e * 6) * 20 * s, p.y - L * 0.6, p.x + Math.cos(i) * 14 * s, p.y - L);
        ctx.stroke();
        ctx.strokeStyle = hsla(268, 100, 75, f * 0.7);
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
      }
    },
  },

  // ----- Perihelion: a trail of ice and rock streaming off it, a cold glowing coma round its head -----
  perihelion: {
    back: (ctx, r, s, face, t, alive, vx) => {
      if (!alive) return;
      const b = vx > 30 ? -1 : vx < -30 ? 1 : -face, sp = 1 + Math.min(1.5, Math.abs(vx) / 200);
      // ice and rock debris streaming behind
      drift(9, t, 0.9, 121, (i, k, r1) => {
        const x = r.head.x + b * k * 110 * s * sp, y = r.head.y + (r1 - 0.5) * 30 * s + k * 20 * s;
        if (i % 3) dot(ctx, x, y, 1.6 * s * (1 - k), hsla(190, 100, 85, 1 - k));
        else { ctx.fillStyle = hsla(212, 20, 50, 1 - k); poly(ctx, x, y, 2.6 * s, 5, i + t); ctx.fill(); }
      });
      // the straight blue ion tail
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createLinearGradient(r.head.x, 0, r.head.x + b * 130 * s * sp, 0);
      g.addColorStop(0, hsla(205, 100, 75, 0.45));
      g.addColorStop(1, hsla(205, 100, 75, 0));
      ctx.strokeStyle = g;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(r.head.x, r.head.y - 3 * s);
      ctx.lineTo(r.head.x + b * 130 * s * sp, r.head.y - 10 * s);
      ctx.stroke();
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, r.head.x, r.head.y, (26 + Math.sin(t * 3) * 3) * s, "hsl(190 100% 85%)", 0.35);
      for (let i = 0; i < 3; i++) star4(ctx, r.head.x + Math.cos(t * 2 + i * 2) * 18 * s, r.head.y + Math.sin(t * 2 + i * 2) * 14 * s, 3 * s * Math.abs(Math.sin(t * 4 + i)), "hsl(190 100% 95%)");
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 16 * s * k, "hsl(190 100% 80%)", 0.6);
      // a tiny comet looping round the hand, its tail behind it
      for (let j = 0; j < 8; j++) {
        const a = t * 7 - j * 0.18, R = 13 * s * k;
        dot(ctx, h.x + Math.cos(a) * R, h.y + Math.sin(a) * R * 0.7, (3 - j * 0.3) * s, hsla(190, 100, 85, 1 - j / 8));
      }
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // ice shards bursting off a streak of light
      ctx.strokeStyle = hsla(190, 100, 88, f);
      ctx.lineWidth = 2.5 * f + 0.4;
      ctx.beginPath();
      ctx.moveTo(x - face * R * (0.3 + e), y - R * 0.3 * e);
      ctx.lineTo(x, y);
      ctx.stroke();
      fling(7, seed, (a, r1) => crystal(ctx, x + Math.cos(a) * R * e * r1, y + Math.sin(a) * R * e * r1, a, R * 0.3, R * 0.07, hsla(190, 90, 85, f), hsla(190, 100, 96, f), 1));
    },
    sign: (ctx, x, g, s, k, t) => {
      // an orbit on the floor, a bright point racing round it to its closest pass
      ctx.strokeStyle = hsla(190, 100, 80, 0.6 * k);
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.ellipse(x + 30 * s, g, 90 * s * k, 16 * s * k, 0, 0, TAU);
      ctx.stroke();
      const a = t * 4;
      glowDot(ctx, x + 30 * s + Math.cos(a) * 90 * s * k, g + Math.sin(a) * 16 * s * k, 10 * s, "hsl(190 100% 90%)", k);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // a streak down from the sky, a crater and a spray of ice
      if (e < 0.3) {
        ctx.strokeStyle = hsla(190, 100, 92, 1 - e / 0.3);
        ctx.lineWidth = 6 * s;
        ctx.beginPath();
        ctx.moveTo(x - 160 * s, g - 300 * s);
        ctx.lineTo(x, g - 20 * s);
        ctx.stroke();
      }
      floorRing(ctx, x, g, (20 + e * 100) * s, hsla(190, 100, 80, f), 4 * s * f);
      fling(12, 41, (a, r1) => crystal(ctx, x + Math.cos(a) * e * 100 * r1 * s, g - 20 * s - Math.abs(Math.sin(a)) * e * 90 * r1 * s, a, 12 * s, 3 * s, hsla(190, 90, 85, f), hsla(190, 100, 96, f), 1 * s));
    },
  },

  // ----- Asterion: a great hunter drawn in stars behind it, three bright stars at its belt -----
  asterion: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // its constellation drawn large behind it: a bow, drawn
      const cx = r.hip.x - face * 30 * s, cy = r.neck.y - 6 * s;
      const pts = [[0, -40], [-face * 14, -20], [-face * 18, 0], [-face * 14, 20], [0, 40], [face * 10, 0]].map(([dx, dy]) => ({ x: cx + dx * s, y: cy + dy * s }));
      ctx.strokeStyle = hsla(44, 100, 75, 0.22);
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) { ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[i + 1 > 4 ? 4 : i + 1].x, pts[i + 1 > 4 ? 4 : i + 1].y); }
      ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[5].x, pts[5].y); ctx.lineTo(pts[4].x, pts[4].y);
      ctx.stroke();
      pts.forEach((p, i) => star4(ctx, p.x, p.y, (2 + Math.abs(Math.sin(t * 1.5 + i)) * 2) * s, "hsl(44 100% 85%)"));
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // three stars in a row across the belt
      for (let i = -1; i <= 1; i++) {
        const x = r.hip.x + i * 5 * s, y = r.hip.y - 2 * s + i * 1.2 * s;
        glowDot(ctx, x, y, 6 * s, "hsl(200 100% 85%)", 0.7);
        star4(ctx, x, y, (3 + Math.sin(t * 3 + i) * 1) * s, "hsl(0 0% 100%)");
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 16 * s * k, "hsl(44 100% 74%)", 0.6);
      // four stars drawing their lines in to the hand
      ctx.strokeStyle = hsla(44, 100, 80, 0.7 * k);
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + 0.4 + t * 0.3, R = 24 * s;
        const px = h.x + Math.cos(a) * R, py = h.y + Math.sin(a) * R;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (h.x - px) * k, py + (h.y - py) * k);
        ctx.stroke();
        star4(ctx, px, py, 3 * s, "hsl(44 100% 88%)");
      }
      star4(ctx, h.x, h.y, 7 * s * k, "hsl(0 0% 100%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // a little constellation pinned where it struck
      const pts = Array.from({ length: 5 }, (_, i) => ({ x: x + Math.cos(i * 1.3 + seed) * R * (0.3 + e * 0.5), y: y + Math.sin(i * 1.3 + seed) * R * (0.3 + e * 0.5) }));
      ctx.strokeStyle = hsla(44, 100, 80, f * 0.8);
      ctx.lineWidth = 1.2 * f + 0.3;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      pts.forEach((p) => star4(ctx, p.x, p.y, R * 0.14 * f + 1, hsla(44, 100, 90, f)));
    },
    sign: (ctx, x, g, s, k) => {
      const pts = Array.from({ length: 8 }, (_, i) => fp(x, g, (24 + hh(i * 5) * 60) * s, i * 0.8 + hh(i)));
      const n = Math.floor(k * 8);
      ctx.strokeStyle = hsla(44, 100, 78, 0.6 * k);
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      for (let i = 1; i < n; i++) { ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.stroke();
      pts.forEach((p, i) => i < n && star4(ctx, p.x, p.y, 5 * s, hsla(44, 100, 88, k)));
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // shooting stars falling in on the spot
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.35, d = (1 - Math.min(1, e * 1.6)) * 220 * s;
        const px = x + Math.cos(a) * d, py = g - 40 * s + Math.sin(a) * d;
        ctx.strokeStyle = hsla(44, 100, 85, f);
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(a) * 30 * s, py + Math.sin(a) * 30 * s);
        ctx.stroke();
      }
      floorRing(ctx, x, g, (30 + e * 90) * s, hsla(44, 100, 75, f), 3 * s * f);
    },
  },

  // ----- Carina: soft clouds of nebula turning round it, new stars flaring into life beside it -----
  carina: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      const c = mid(r.hip, r.head);
      for (let i = 0; i < 5; i++) {
        const a = t * 0.25 + (i / 5) * TAU, px = c.x + Math.cos(a) * 34 * s, py = c.y + Math.sin(a) * 26 * s;
        glowDot(ctx, px, py, (22 + (i % 2) * 8) * s, i % 2 ? "hsl(326 100% 70%)" : "hsl(160 80% 60%)", 0.18);
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      const c = mid(r.hip, r.head);
      // new stars being born: a flare, then a small steady point
      drift(5, t, 0.35, 131, (i, k, r1, r2) => {
        const px = c.x + (r1 - 0.5) * 90 * s, py = c.y + (r2 - 0.5) * 80 * s;
        if (k < 0.15) glowDot(ctx, px, py, 14 * s * (k / 0.15), "hsl(326 100% 90%)", 1 - k / 0.15);
        star4(ctx, px, py, 3 * s * Math.sin(k * Math.PI), "hsl(0 0% 100%)");
      });
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 22 * s * (1.2 - k * 0.4), "hsl(326 100% 70%)", 0.4);
      glowDot(ctx, h.x + 4 * s, h.y - 3 * s, 14 * s * (1.2 - k * 0.4), "hsl(160 80% 60%)", 0.35);
      spiral(ctx, h.x, h.y, 14 * s, 2, t * 2, hsla(326, 100, 80, 0.5), 1.4 * s);
      star4(ctx, h.x, h.y, 8 * s * k, "hsl(0 0% 100%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      glowDot(ctx, x, y, R * (0.5 + e * 0.6), "hsl(326 100% 72%)", f * 0.5);
      glowDot(ctx, x + R * 0.2, y - R * 0.1, R * (0.3 + e * 0.5), "hsl(160 80% 62%)", f * 0.4);
      star4(ctx, x, y, R * 0.5 * (1 - e * 0.5), hsla(0, 0, 100, f));
    },
    sign: (ctx, x, g, s, k, t) => {
      for (let i = 0; i < 4; i++) {
        const p = fp(x, g, 40 * s * k, t * 0.4 + i * 1.6);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(1, 0.3);
        glowDot(ctx, 0, 0, 40 * s * k, i % 2 ? "hsl(326 100% 70%)" : "hsl(160 80% 60%)", 0.35 * k);
        ctx.restore();
      }
      for (let i = 0; i < 6; i++) { const p = fp(x, g, hh(i) * 70 * s * k, i * 1.1); star4(ctx, p.x, p.y, 4 * s * Math.abs(Math.sin(t * 3 + i)), hsla(0, 0, 100, k)); }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 55 * s;
      glowDot(ctx, x, cy, (40 + e * 90) * s, "hsl(326 100% 70%)", 0.5 * f);
      glowDot(ctx, x, cy, (20 + e * 70) * s, "hsl(160 80% 60%)", 0.4 * f);
      fling(12, 43, (a, r1) => star4(ctx, x + Math.cos(a) * e * 120 * r1 * s, cy + Math.sin(a) * e * 90 * r1 * s, 5 * s * f, hsla(0, 0, 100, f)));
    },
  },

  // ----- Vela: a pulse ringing out of its chest on every beat, magnetic field lines looping round its body -----
  vela: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      const c = mid(r.hip, r.neck, 0.6);
      // the field: loops from pole to pole round its body
      for (let i = 1; i <= 3; i++) {
        const w = (12 + i * 10) * s;
        for (const side of [-1, 1]) {
          ctx.strokeStyle = hsla(i % 2 ? 32 : 200, 100, 70, 0.28);
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y - 40 * s);
          ctx.bezierCurveTo(c.x + side * w * 1.4, c.y - 30 * s, c.x + side * w * 1.4, c.y + 30 * s, c.x, c.y + 40 * s);
          ctx.stroke();
          const q = ((t * 0.6 + i * 0.3) % 1), y = c.y - 40 * s + q * 80 * s, bulge = Math.sin(q * Math.PI) * w * 1.05;
          dot(ctx, c.x + side * bulge, y, 1.4 * s, hsla(32, 100, 80, 0.8));
        }
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      const c = mid(r.hip, r.neck, 0.6), q = (t * 1.2) % 1;
      // a ring out of the chest on every beat
      ring(ctx, c.x, c.y, (6 + q * 50) * s, hsla(32, 100, 70, 0.6 * (1 - q)), 2 * s * (1 - q) + 0.5);
      if (q < 0.1) glowDot(ctx, c.x, c.y, 16 * s, "hsl(32 100% 80%)", 1 - q * 10);
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 16 * s * k, "hsl(32 100% 66%)", 0.6);
      // a tiny pulsar: two beams sweeping round a bright point
      const a = t * 9;
      for (const d of [0, Math.PI]) {
        ctx.strokeStyle = hsla(200, 100, 80, 0.8);
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(h.x, h.y);
        ctx.lineTo(h.x + Math.cos(a + d) * 20 * s * k, h.y + Math.sin(a + d) * 20 * s * k);
        ctx.stroke();
      }
      dot(ctx, h.x, h.y, 3 * s, "hsl(0 0% 100%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      ring(ctx, x, y, R * (0.2 + e * 0.8), hsla(32, 100, 70, f), 3 * f + 0.4);
      const a = seed * 2 + k;
      ctx.strokeStyle = hsla(200, 100, 82, f);
      ctx.lineWidth = 2 * f + 0.3;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(a) * R, y - Math.sin(a) * R);
      ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
      ctx.stroke();
    },
    sign: (ctx, x, g, s, k, t) => {
      for (let i = 0; i < 3; i++) {
        const q = (t * 1.2 + i / 3) % 1;
        floorRing(ctx, x, g, q * 90 * s * k, hsla(32, 100, 66, 0.7 * k * (1 - q)), 2 * s);
      }
      spokes(ctx, x, g, 0, 90 * s * k, 2, t * 3, hsla(200, 100, 80, 0.6 * k), 2.4 * s);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 55 * s, a = e * 5;
      // the lighthouse beams sweeping once round the arena
      for (const d of [0, Math.PI]) {
        const gr = ctx.createLinearGradient(x, cy, x + Math.cos(a + d) * 300 * s, cy + Math.sin(a + d) * 300 * s);
        gr.addColorStop(0, hsla(200, 100, 85, 0.7 * f));
        gr.addColorStop(1, hsla(200, 100, 85, 0));
        ctx.strokeStyle = gr;
        ctx.lineWidth = 10 * s * f;
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x + Math.cos(a + d) * 300 * s, cy + Math.sin(a + d) * 300 * s);
        ctx.stroke();
      }
      ring(ctx, x, cy, (10 + e * 80) * s, hsla(32, 100, 70, f), 3 * s * f);
    },
  },

  // ----- Aeon: gold rings of an armillary turning round it, the first light rising off it like dust -----
  aeon: {
    back: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.neck);
      // three gold rings at different tilts, half behind it
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(i * 1.05 + t * 0.12);
        ctx.strokeStyle = alive ? hsla(44, 90, 62, 0.75) : "hsl(44 10% 45%)";
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.ellipse(0, 0, 44 * s, 12 * s, 0, Math.PI, TAU);
        ctx.stroke();
        ctx.restore();
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.neck);
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(i * 1.05 + t * 0.12);
        ctx.strokeStyle = alive ? hsla(44, 90, 66, 0.85) : "hsl(44 10% 45%)";
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.ellipse(0, 0, 44 * s, 12 * s, 0, 0, Math.PI);
        ctx.stroke();
        if (alive) { const a = t * (0.8 + i * 0.3); glowDot(ctx, Math.cos(a) * 44 * s, Math.sin(a) * 12 * s, 4 * s, "hsl(46 100% 80%)"); }
        ctx.restore();
      }
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      drift(10, t, 0.3, 141, (i, k, r1) => dot(ctx, c.x + (r1 - 0.5) * 70 * s, r.fF.y - k * 150 * s, 1.3 * s, hsla(46, 100, 80, Math.sin(k * Math.PI))));
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 22 * s * k, "hsl(46 100% 70%)", 0.7);
      spokes(ctx, h.x, h.y, 6 * s, (8 + 12 * k) * s, 10, t, hsla(46, 100, 82, 0.8), 1.4 * s);
      dot(ctx, h.x, h.y, 4 * s * k, "hsl(0 0% 100%)");
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      ctx.strokeStyle = hsla(46, 100, 80, f);
      ctx.lineWidth = 1.8 * f + 0.4;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + seed, r0 = R * 0.2, r1 = R * (0.4 + e * 0.6) * (i % 2 ? 0.7 : 1);
        ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
        ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      }
      ctx.stroke();
      ring(ctx, x, y, R * 0.3 * (1 + e), hsla(44, 90, 65, f), 2 * f + 0.4);
    },
    sign: (ctx, x, g, s, k, t) => {
      for (let i = 0; i < 3; i++) floorRing(ctx, x, g, (40 + i * 18) * s * k, hsla(44, 90, 62, 0.7 * k), 1.8 * s, t * (i % 2 ? 1 : -1), t * (i % 2 ? 1 : -1) + TAU * 0.8);
      spokes(ctx, x, g, 20 * s * k, 30 * s * k, 12, 0, hsla(46, 100, 80, 0.7 * k), 1.6 * s);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // dawn: a band of light along the horizon and a pillar where it stands
      const w = (60 + e * 260) * s;
      const gr = ctx.createLinearGradient(x - w, 0, x + w, 0);
      gr.addColorStop(0, hsla(46, 100, 80, 0));
      gr.addColorStop(0.5, hsla(46, 100, 85, 0.6 * f));
      gr.addColorStop(1, hsla(46, 100, 80, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(x - w, g - 8 * s, w * 2, 16 * s);
      const p = 22 * s * f;
      ctx.fillStyle = hsla(46, 100, 88, 0.5 * f);
      ctx.fillRect(x - p, g - 260 * s, p * 2, 260 * s);
    },
  },

  // ----- Orogen: boulders slowly orbiting it, jade crystals and moss on its shoulders, grit trickling from its joints -----
  orogen: {
    back: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.neck);
      for (let i = 0; i < 4; i++) {
        const a = t * 0.4 + (i / 4) * TAU;
        if (Math.sin(a) > 0) continue;
        const px = c.x + Math.cos(a) * 46 * s, py = c.y + Math.sin(a) * 10 * s - 8 * s + Math.sin(t + i) * 3 * s;
        rock(ctx, px, py, (5 + (i % 2) * 2) * s, i, t * 0.3);
        ctx.fillStyle = alive ? "hsl(28 10% 36%)" : "hsl(28 4% 30%)";
        ctx.fill();
        ctx.strokeStyle = "hsl(28 10% 18%)";
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.neck);
      for (let i = 0; i < 4; i++) {
        const a = t * 0.4 + (i / 4) * TAU;
        if (Math.sin(a) <= 0) continue;
        const px = c.x + Math.cos(a) * 46 * s, py = c.y + Math.sin(a) * 10 * s - 8 * s + Math.sin(t + i) * 3 * s;
        rock(ctx, px, py, (5 + (i % 2) * 2) * s, i, t * 0.3);
        ctx.fillStyle = alive ? "hsl(28 10% 42%)" : "hsl(28 4% 30%)";
        ctx.fill();
        ctx.strokeStyle = "hsl(28 10% 18%)";
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
        if (alive) glowDot(ctx, px, py, 4 * s, "hsl(150 80% 62%)", 0.5);
      }
      // jade crystals and moss on the shoulder
      ctx.fillStyle = alive ? "hsl(110 30% 32%)" : "hsl(110 5% 30%)";
      ctx.beginPath();
      ctx.ellipse(r.shoulder.x, r.shoulder.y - 2 * s, 8 * s, 3.5 * s, 0, Math.PI, TAU);
      ctx.fill();
      for (let i = 0; i < 3; i++) crystal(ctx, r.shoulder.x + (i - 1) * 4 * s, r.shoulder.y - 3 * s, -Math.PI / 2 + (i - 1) * 0.4, (8 + (i === 1 ? 4 : 0)) * s, 2.2 * s, alive ? "hsl(150 70% 50%)" : "hsl(150 5% 40%)", "hsl(150 40% 20%)", 1 * s);
      if (!alive) return;
      // grit trickling from the knees and elbows
      for (const j of [r.kF, r.eF]) drift(2, t, 0.9, 151 + j.x * 0, (i, k) => dot(ctx, j.x + (i - 0.5) * 3 * s, j.y + k * 40 * s, 1 * s, hsla(28, 10, 55, 1 - k)));
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 16 * s * k, "hsl(150 80% 62%)", 0.5);
      // chunks of stone pulled in and locking round the fist, jade light in the seams
      ctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + 0.3, R = (6 + (1 - k) * 18) * s;
        rock(ctx, h.x + Math.cos(a) * R, h.y + Math.sin(a) * R, 3.2 * s, i, a);
        ctx.fillStyle = "hsl(28 10% 40%)";
        ctx.fill();
      }
      ctx.globalCompositeOperation = "lighter";
      ring(ctx, h.x, h.y, 6 * s, hsla(150, 80, 65, 0.8 * k), 1.4 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      ctx.strokeStyle = hsla(150, 80, 65, f);
      ctx.lineWidth = 2 * f + 0.4;
      for (let i = 0; i < 4; i++) { zig(ctx, { x, y }, { x: x + Math.cos(i * 1.6 + seed) * R * e, y: y + Math.sin(i * 1.6 + seed) * R * e }, 3, R * 0.08, i + seed); ctx.stroke(); }
      fling(6, seed, (a, r1) => { rock(ctx, x + Math.cos(a) * R * e * r1, y + Math.sin(a) * R * e * r1 + R * 0.5 * k * k, R * 0.1, a, a); ctx.fillStyle = hsla(28, 10, 50, f); ctx.fill(); });
    },
    sign: (ctx, x, g, s, k) => {
      // fault lines splitting the floor, jade light coming up through them
      ctx.strokeStyle = hsla(150, 80, 62, 0.85 * k);
      ctx.lineWidth = 2.4 * s;
      for (const side of [-1, 1]) { zig(ctx, { x, y: g }, { x: x + side * 100 * s * k, y: g + side * 4 * s }, 6, 4 * s, side + 3); ctx.stroke(); }
      for (let i = 0; i < 4; i++) { zig(ctx, { x, y: g }, fp(x, g, 60 * s * k, i * 1.6 + 0.8), 3, 3 * s, i); ctx.stroke(); }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, up = Math.sin(Math.min(1, e * 1.5) * Math.PI);
      // slabs of rock thrust up out of the floor round it, and fall back
      for (let i = 0; i < 5; i++) {
        const p = fp(x, g, (50 + (i % 2) * 18) * s, (i / 5) * TAU + 0.6), h = (24 + hh(i) * 20) * s * up;
        ctx.fillStyle = hsla(28, 10, 40, f + 0.2);
        ctx.beginPath();
        ctx.moveTo(p.x - 7 * s, p.y);
        ctx.lineTo(p.x - 4 * s, p.y - h);
        ctx.lineTo(p.x + 5 * s, p.y - h * 0.85);
        ctx.lineTo(p.x + 7 * s, p.y);
        ctx.closePath();
        ctx.fill();
      }
      floorRing(ctx, x, g, (20 + e * 110) * s, hsla(150, 80, 62, f), 3 * s * f);
    },
  },

  // ----- Gnarlroot: leaves drifting down round it, vines winding up its arms, fireflies in its branches -----
  gnarlroot: {
    back: (ctx, r, s, face, t, alive) => {
      // leaves falling and turning
      drift(7, t, 0.25, 161, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 100 * s + Math.sin(t * 1.4 + i * 2) * 10 * s, y = r.head.y - 30 * s + k * 140 * s;
        leaf(ctx, x, y, t * 2 + i, 6 * s, 2.4 * s, alive ? hsla(92 - (i % 3) * 30, 70, 45, 1 - k) : hsla(40, 10, 40, 1 - k), hsla(92, 40, 20, 1 - k), 0.8 * s);
      });
    },
    front: (ctx, r, s, face, t, alive) => {
      // a vine winding round the front arm
      ctx.strokeStyle = alive ? "hsl(100 50% 36%)" : "hsl(100 5% 32%)";
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const k = i / 16, p = k < 0.5 ? mid(r.shoulder, r.eF, k * 2) : mid(r.eF, r.hF, (k - 0.5) * 2), w = Math.sin(k * 16) * 4 * s;
        i ? ctx.lineTo(p.x + w * 0.3, p.y + w) : ctx.moveTo(p.x, p.y);
      }
      ctx.stroke();
      for (let i = 1; i < 4; i++) { const p = mid(r.shoulder, r.eF, i / 4); leaf(ctx, p.x, p.y, -Math.PI / 2 + i, 5 * s, 2 * s, alive ? "hsl(92 70% 48%)" : "hsl(92 5% 38%)", "hsl(92 40% 20%)", 0.8 * s); }
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const px = r.head.x + Math.sin(t * 0.7 + i * 2.1) * 30 * s, py = r.head.y - 20 * s + Math.cos(t * 0.9 + i) * 16 * s;
        glowDot(ctx, px, py, 4 * s, "hsl(70 100% 65%)", 0.4 + 0.5 * Math.max(0, Math.sin(t * 3 + i * 2)));
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 16 * s * k, "hsl(92 80% 60%)", 0.5);
      // a seed splitting and putting out leaves
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "hsl(28 40% 30%)";
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 3 * s, 4 * s, 0, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 4; i++) leaf(ctx, h.x, h.y, (i / 4) * TAU + t, 12 * s * k, 4 * s * k, "hsl(92 70% 50%)", "hsl(92 40% 22%)", 0.8 * s);
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      fling(8, seed, (a, r1, i) => leaf(ctx, x + Math.cos(a) * R * e * r1, y + Math.sin(a) * R * e * r1, a + k * 4, R * 0.25, R * 0.09, hsla(92 - i * 8, 70, 50, f), hsla(92, 40, 22, f), 0.8));
      ctx.strokeStyle = hsla(28, 40, 45, f);
      ctx.lineWidth = 1.6 * f + 0.4;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(i * 1.57 + 0.8) * R * 0.5 * e, y + Math.sin(i * 1.57 + 0.8) * R * 0.5 * e); ctx.stroke(); }
    },
    sign: (ctx, x, g, s, k) => {
      // roots spreading out under the floor
      ctx.strokeStyle = hsla(92, 70, 55, 0.75 * k);
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + 0.4, p = fp(x, g, 80 * s * k, a), q = fp(x, g, 40 * s * k, a + 0.2);
        ctx.beginPath();
        ctx.moveTo(x, g);
        ctx.quadraticCurveTo(q.x, q.y, p.x, p.y);
        ctx.stroke();
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // a ring of saplings shooting up, leaves bursting off them
      for (let i = 0; i < 6; i++) {
        const p = fp(x, g, 60 * s, (i / 6) * TAU), h = 30 * s * Math.min(1, e * 2.5);
        ctx.strokeStyle = hsla(28, 40, 35, f + 0.2);
        ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - h); ctx.stroke();
        leaf(ctx, p.x, p.y - h, -Math.PI / 2 - 0.6, 9 * s, 3.5 * s, hsla(92, 70, 50, f), hsla(92, 40, 22, f), 0.8 * s);
        leaf(ctx, p.x, p.y - h, -Math.PI / 2 + 0.6, 9 * s, 3.5 * s, hsla(92, 70, 50, f), hsla(92, 40, 22, f), 0.8 * s);
      }
      fling(14, 47, (a, r1) => leaf(ctx, x + Math.cos(a) * e * 140 * r1 * s, g - 50 * s + Math.sin(a) * e * 80 * r1 * s, a + e * 5, 6 * s, 2.5 * s, hsla(92, 70, 52, f), hsla(92, 40, 22, f), 0.8 * s));
    },
  },

  // ----- Ambrel: cells of honeycomb floating round it, resin dripping from its hands, a pair of bees in its orbit -----
  ambrel: {
    back: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.head);
      for (let i = 0; i < 7; i++) {
        const a = t * 0.3 + (i / 7) * TAU, px = c.x + Math.cos(a) * (40 + (i % 2) * 8) * s, py = c.y + Math.sin(a) * 30 * s;
        hex(ctx, px, py, 5 * s);
        ctx.fillStyle = alive ? hsla(40, 100, 55, 0.35 + 0.2 * Math.sin(t * 2 + i)) : "hsl(40 10% 40% / 0.4)";
        ctx.fill();
        ctx.strokeStyle = alive ? "hsl(44 100% 70% / 0.8)" : "hsl(40 5% 35%)";
        ctx.lineWidth = 1 * s;
        ctx.stroke();
      }
    },
    front: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      // resin dripping slowly off the hands, stretching
      for (const h of [r.hF, r.hB]) {
        const q = (t * 0.45 + (h === r.hB ? 0.5 : 0)) % 1, len = q * 22 * s;
        ctx.strokeStyle = hsla(38, 100, 55, 0.85);
        ctx.lineWidth = 2.6 * s * (1 - q * 0.6);
        ctx.beginPath(); ctx.moveTo(h.x, h.y + 3 * s); ctx.lineTo(h.x, h.y + 3 * s + len); ctx.stroke();
        dot(ctx, h.x, h.y + 3 * s + len, 2.4 * s, hsla(40, 100, 60, 0.9));
      }
      // two bees on their rounds
      for (let i = 0; i < 2; i++) {
        const a = t * 2.4 + i * Math.PI, px = r.head.x + Math.cos(a) * 26 * s, py = r.head.y - 6 * s + Math.sin(a * 2) * 10 * s;
        ctx.fillStyle = "hsl(44 100% 55%)";
        ctx.beginPath(); ctx.ellipse(px, py, 3 * s, 2 * s, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = "hsl(30 30% 12%)";
        ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.moveTo(px, py - 2 * s); ctx.lineTo(px, py + 2 * s); ctx.stroke();
        ctx.fillStyle = hsla(0, 0, 100, 0.7);
        ctx.beginPath(); ctx.ellipse(px, py - 3 * s, 2 * s, 1.2 * s * Math.abs(Math.sin(t * 40 + i)), 0, 0, TAU); ctx.fill();
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(44 100% 60%)", 0.6);
      // a drop of amber forming with something small caught inside
      ctx.fillStyle = "hsl(38 100% 55% / 0.85)";
      ctx.beginPath();
      ctx.moveTo(h.x, h.y - 10 * s * k);
      ctx.quadraticCurveTo(h.x + 8 * s * k, h.y + 2 * s * k, h.x, h.y + 7 * s * k);
      ctx.quadraticCurveTo(h.x - 8 * s * k, h.y + 2 * s * k, h.x, h.y - 10 * s * k);
      ctx.fill();
      dot(ctx, h.x, h.y + 1 * s, 1.6 * s * k, "hsl(30 40% 20%)");
      hex(ctx, h.x, h.y, 16 * s * k);
      ctx.strokeStyle = hsla(44, 100, 75, 0.6);
      ctx.lineWidth = 1 * s;
      ctx.stroke();
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // honeycomb setting round whoever was hit
      for (let i = 0; i < 7; i++) {
        const cx = i ? x + Math.cos((i / 6) * TAU) * R * 0.38 * e : x, cy = i ? y + Math.sin((i / 6) * TAU) * R * 0.38 * e : y;
        hex(ctx, cx, cy, R * 0.2);
        ctx.strokeStyle = hsla(44, 100, 70, f);
        ctx.lineWidth = 1.6 * f + 0.3;
        ctx.stroke();
      }
    },
    sign: (ctx, x, g, s, k) => {
      // honeycomb tiling over the floor, filling out from the middle
      ctx.lineWidth = 1.4 * s;
      for (let q = -3; q <= 3; q++) for (let w = -1; w <= 1; w++) {
        const cx = x + (q + (w % 2 ? 0.5 : 0)) * 17 * s, cy = g + w * 4.5 * s, d = Math.hypot(q, w * 2) / 4;
        if (d > k) continue;
        hex(ctx, cx, cy, 9.5 * s, 0.26);
        ctx.strokeStyle = hsla(44, 100, 66, 0.75 * k);
        ctx.stroke();
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // amber crystallising: hexagon shards thrust up and flung out
      fling(12, 53, (a, r1) => {
        hex(ctx, x + Math.cos(a) * e * 120 * r1 * s, g - 50 * s + Math.sin(a) * e * 80 * r1 * s - e * 20 * s, 6 * s * f);
        ctx.fillStyle = hsla(40, 100, 58, f * 0.8);
        ctx.fill();
      });
      glowDot(ctx, x, g - 50 * s, (30 + e * 60) * s, "hsl(44 100% 66%)", 0.6 * f);
    },
  },

  // ----- Coilvast: a serpent ring eating its own tail turning round its waist, old scales flaking off it -----
  coilvast: {
    back: (ctx, r, s, face, t, alive) => {
      const c = { x: r.hip.x, y: r.hip.y - 8 * s };
      ctx.strokeStyle = alive ? "hsl(232 30% 28%)" : "hsl(232 5% 30%)";
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 34 * s, 9 * s, 0.08, Math.PI, TAU);
      ctx.stroke();
      if (!alive) return;
      // scales flaking off and drifting down, still glowing at the edge
      drift(7, t, 0.35, 171, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 60 * s + Math.sin(t + i) * 5 * s, y = r.neck.y + k * 90 * s;
        ctx.fillStyle = hsla(18, 100, 62, 0.8 * (1 - k));
        poly(ctx, x, y, 2.6 * s, 4, t * 2 + i, 0.6);
        ctx.fill();
      });
    },
    front: (ctx, r, s, face, t, alive) => {
      const c = { x: r.hip.x, y: r.hip.y - 8 * s };
      // the world serpent: a ring eating its own tail, its seams glowing, the head always coming round
      ctx.strokeStyle = alive ? "hsl(232 30% 32%)" : "hsl(232 5% 32%)";
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 34 * s, 9 * s, 0.08, 0, Math.PI);
      ctx.stroke();
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = hsla(18, 100, 62, 0.7);
      ctx.lineWidth = 1 * s;
      ctx.setLineDash([3 * s, 5 * s]);
      ctx.lineDashOffset = -t * 20 * s;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 34 * s, 9 * s, 0.08, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      const a = t * 0.9, hx = c.x + Math.cos(a) * 34 * s, hy = c.y + Math.sin(a) * 9 * s;
      if (Math.sin(a) > -0.2) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "hsl(232 30% 26%)";
        ctx.beginPath(); ctx.ellipse(hx, hy, 5 * s, 3.5 * s, a + Math.PI / 2, 0, TAU); ctx.fill();
        dot(ctx, hx, hy - 1 * s, 1.2 * s, "hsl(18 100% 66%)");
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 18 * s * k, "hsl(18 100% 60%)", 0.6);
      // a small serpent coiling tighter round the fist
      ctx.strokeStyle = "hsl(18 100% 66%)";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) {
        const q = i / 30, a = t * 5 + q * 3 * TAU, R = (18 - q * 12) * s * (1.3 - k * 0.4);
        const px = h.x + Math.cos(a) * R, py = h.y + Math.sin(a) * R * 0.6;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // two fang marks and the coil closing round them
      ctx.strokeStyle = hsla(18, 100, 66, f);
      ctx.lineWidth = 2.4 * f + 0.4;
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(x + d * R * 0.2, y, R * 0.3 * (0.6 + e * 0.4), d > 0 ? Math.PI : 0, d > 0 ? Math.PI * 1.6 : -Math.PI * 0.6, d < 0); ctx.stroke(); }
      ring(ctx, x, y, R * (0.9 - e * 0.3), hsla(232, 60, 70, f * 0.7), 1.6 * f + 0.3, 0.5, seed, seed + TAU * 0.85);
    },
    sign: (ctx, x, g, s, k, t) => {
      // the serpent drawing itself round in a ring on the floor until it bites its tail
      const R = 74 * s;
      floorRing(ctx, x, g, R, hsla(18, 100, 60, 0.85 * k), 4 * s, t * 0.5, t * 0.5 + TAU * k);
      const p = fp(x, g, R, t * 0.5 + TAU * k);
      dot(ctx, p.x, p.y, 4 * s * k, hsla(18, 100, 70, k));
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // coils heaving up out of the floor
      for (let i = 0; i < 4; i++) {
        const cx = x + (i - 1.5) * 44 * s, h = 40 * s * Math.sin(Math.min(1, e * 1.8) * Math.PI);
        ctx.strokeStyle = hsla(232, 30, 30, f + 0.2);
        ctx.lineWidth = 9 * s;
        ctx.beginPath(); ctx.ellipse(cx, g, 18 * s, h, 0, Math.PI, TAU); ctx.stroke();
        ctx.strokeStyle = hsla(18, 100, 62, f);
        ctx.lineWidth = 1.6 * s;
        ctx.stroke();
      }
    },
  },

  // ----- Anvilheart: a chimney of smoke and sparks off its back, embers circling, glowing runes on its forearm -----
  anvilheart: {
    back: (ctx, r, s, face, t, alive) => {
      if (!alive) return;
      const sx = r.shoulder.x - face * 10 * s, sy = r.shoulder.y - 6 * s;
      drift(6, t, 0.4, 181, (i, k, r1) => dot(ctx, sx + Math.sin(t + i) * 5 * s - face * k * 14 * s, sy - k * 90 * s, (4 + k * 10) * s, hsla(18, 6, 26 + r1 * 8, 0.5 * (1 - k))));
      ctx.globalCompositeOperation = "lighter";
      drift(8, t, 1.1, 183, (i, k, r1) => dot(ctx, sx + (r1 - 0.5) * 20 * s * k, sy - k * 70 * s, 1.3 * s, hsla(40, 100, 65, 1 - k)));
    },
    front: (ctx, r, s, face, t, alive) => {
      // runes hammered into the front forearm, glowing with the forge's heat
      const a = r.eF, b = r.hF, on = alive ? 0.6 + 0.4 * Math.sin(t * 2.5) : 0.15;
      ctx.strokeStyle = hsla(38, 100, 62, on);
      ctx.lineWidth = 1.2 * s;
      for (let i = 1; i <= 3; i++) {
        const p = mid(a, b, i / 4);
        ctx.beginPath();
        ctx.moveTo(p.x - 2 * s, p.y - 2 * s); ctx.lineTo(p.x + 2 * s, p.y + 2 * s);
        if (i % 2) { ctx.moveTo(p.x + 2 * s, p.y - 2 * s); ctx.lineTo(p.x - 2 * s, p.y + 2 * s); }
        ctx.stroke();
      }
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // embers wheeling round it
      const c = mid(r.hip, r.neck);
      for (let i = 0; i < 6; i++) {
        const an = t * 1.4 + (i / 6) * TAU;
        dot(ctx, c.x + Math.cos(an) * 40 * s, c.y + Math.sin(an * 2) * 12 * s, 1.6 * s, hsla(32 + (i % 3) * 8, 100, 62, 0.8));
      }
    },
    charge: (ctx, h, s, t, k) => {
      glowDot(ctx, h.x, h.y, 20 * s * k, "hsl(38 100% 60%)", 0.7);
      // an ingot heating from red to white, sparks jumping off it
      ctx.fillStyle = `hsl(${20 + k * 30} 100% ${50 + k * 40}%)`;
      ctx.fillRect(h.x - 7 * s * k, h.y - 3 * s * k, 14 * s * k, 6 * s * k);
      for (let i = 0; i < 4; i++) {
        const q = (t * 3 + i / 4) % 1, a = -Math.PI / 2 + (hh(i + Math.floor(t * 3)) - 0.5) * 2;
        dot(ctx, h.x + Math.cos(a) * q * 24 * s, h.y + Math.sin(a) * q * 24 * s + q * q * 10 * s, 1.3 * s, hsla(44, 100, 75, 1 - q));
      }
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // a hammer-blow: a star of sparks and a ring of white heat
      ring(ctx, x, y, R * (0.25 + e * 0.6), hsla(44, 100, 80, f), 3 * f + 0.4);
      fling(12, seed, (a, r1) => {
        const d = R * e * r1 * 1.2;
        ctx.strokeStyle = hsla(38, 100, 65, f);
        ctx.lineWidth = 1.4 * f + 0.3;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * d * 0.7, y + Math.sin(a) * d * 0.7 + R * 0.4 * k * k);
        ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d + R * 0.4 * k * k);
        ctx.stroke();
      });
    },
    sign: (ctx, x, g, s, k, t) => {
      // a forge circle on the floor heating from red to white
      const L = 40 + k * 45;
      floorRing(ctx, x, g, 76 * s, `hsl(${16 + k * 26} 100% ${L}% / ${0.85 * k})`, 3 * s);
      floorRing(ctx, x, g, 60 * s, `hsl(${16 + k * 26} 100% ${L}% / ${0.6 * k})`, 1.6 * s);
      ctx.strokeStyle = `hsl(${16 + k * 26} 100% ${L}% / ${0.8 * k})`;
      ctx.lineWidth = 1.6 * s;
      for (let i = 0; i < 6; i++) {
        const p = fp(x, g, 68 * s, (i / 6) * TAU + t * 0.2);
        ctx.beginPath(); ctx.moveTo(p.x - 3 * s, p.y - 2 * s); ctx.lineTo(p.x + 3 * s, p.y + 2 * s); ctx.moveTo(p.x + 3 * s, p.y - 2 * s); ctx.lineTo(p.x - 3 * s, p.y + 2 * s); ctx.stroke();
      }
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e;
      // the anvil's ring: a fountain of sparks and a shock rolling out
      fling(24, 59, (a, r1, i) => {
        const vx = Math.cos(a) * 110 * r1 * s, vy = (160 + r1 * 120) * s, px = x + vx * e, py = g - vy * e + 280 * s * e * e;
        if (py < g) dot(ctx, px, py, 1.6 * s, hsla(38 + (i % 3) * 6, 100, 66, f));
      });
      floorRing(ctx, x, g, (20 + e * 130) * s, hsla(44, 100, 80, f), 4 * s * f);
    },
  },

  // ----- Primeva: her five children's stones circling her on one ring, her heartbeat running down her limbs -----
  primeva: {
    back: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.neck);
      // the ring the five stones ride
      ctx.strokeStyle = alive ? hsla(350, 100, 70, 0.3) : "hsl(286 5% 35% / 0.4)";
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y - 6 * s, 46 * s, 14 * s, -0.1, Math.PI, TAU);
      ctx.stroke();
      stones(ctx, c, s, t, alive, false);
    },
    front: (ctx, r, s, face, t, alive) => {
      const c = mid(r.hip, r.neck);
      ctx.strokeStyle = alive ? hsla(350, 100, 70, 0.35) : "hsl(286 5% 35% / 0.4)";
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y - 6 * s, 46 * s, 14 * s, -0.1, 0, Math.PI);
      ctx.stroke();
      stones(ctx, c, s, t, alive, true);
      if (!alive) return;
      // the heartbeat, lub-dub, running out of the chest along the limbs
      ctx.globalCompositeOperation = "lighter";
      const ph = (t * 1.1) % 1, beat = Math.max(Math.exp(-ph * 30), Math.exp(-Math.abs(ph - 0.22) * 30) * 0.7);
      const chest = mid(r.neck, r.hip, 0.3);
      glowDot(ctx, chest.x, chest.y, (10 + beat * 12) * s, "hsl(350 100% 66%)", 0.4 + beat * 0.5);
      const q = (ph * 2.5) % 1;
      for (const path of [[r.shoulder, r.eF, r.hF], [r.shoulder, r.eB, r.hB], [r.hip, r.kF, r.fF], [r.hip, r.kB, r.fB]]) {
        const p = q < 0.5 ? mid(path[0], path[1], q * 2) : mid(path[1], path[2], (q - 0.5) * 2);
        glowDot(ctx, p.x, p.y, 4 * s, "hsl(350 100% 70%)", 0.8 * (1 - q));
      }
    },
    charge: (ctx, h, s, t, k) => {
      const ph = (t * 1.6) % 1, beat = Math.max(Math.exp(-ph * 25), Math.exp(-Math.abs(ph - 0.2) * 25) * 0.7);
      glowDot(ctx, h.x, h.y, (14 + beat * 10) * s * k, "hsl(350 100% 62%)", 0.7);
      dot(ctx, h.x, h.y, (4 + beat * 3) * s * k, "hsl(350 100% 80%)");
      // the five stones drawn in round it
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU - Math.PI / 2 + t, R = (8 + (1 - k) * 16) * s;
        glowDot(ctx, h.x + Math.cos(a) * R, h.y + Math.sin(a) * R, 4 * s, STONE[i], 0.9);
      }
    },
    mark: (ctx, x, y, R, k, face, seed) => {
      const f = 1 - k, e = easeOut(k);
      // a heartbeat line drawn across whoever was hit
      const w = R * (0.5 + e * 0.6);
      ctx.strokeStyle = hsla(350, 100, 70, f);
      ctx.lineWidth = 2.2 * f + 0.4;
      ctx.beginPath();
      ctx.moveTo(x - w, y);
      ctx.lineTo(x - w * 0.3, y);
      ctx.lineTo(x - w * 0.15, y - R * 0.5);
      ctx.lineTo(x + w * 0.05, y + R * 0.35);
      ctx.lineTo(x + w * 0.2, y - R * 0.15);
      ctx.lineTo(x + w * 0.3, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();
      ring(ctx, x, y, R * (0.3 + e * 0.7), hsla(350, 100, 66, f * 0.6), 1.6 * f + 0.3);
    },
    sign: (ctx, x, g, s, k) => {
      // a five-pointed star on the floor with a child's stone at each point
      const R = 70 * s * k, pts = Array.from({ length: 5 }, (_, i) => fp(x, g, R, (i / 5) * TAU - Math.PI / 2));
      ctx.strokeStyle = hsla(350, 100, 66, 0.75 * k);
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      for (let i = 0; i <= 5; i++) { const p = pts[(i * 2) % 5]; i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
      ctx.stroke();
      pts.forEach((p, i) => glowDot(ctx, p.x, p.y, 8 * s, STONE[i], k));
      floorRing(ctx, x, g, R, hsla(350, 100, 70, 0.5 * k), 1.4 * s);
    },
    burst: (ctx, x, g, s, e) => {
      const f = 1 - e, cy = g - 55 * s;
      // the world's heart beats twice and the stones flash
      ring(ctx, x, cy, (20 + e * 150) * s, hsla(350, 100, 70, f), 4 * s * f);
      if (e > 0.15) ring(ctx, x, cy, (20 + (e - 0.15) * 150) * s, hsla(350, 100, 70, f * 0.7), 3 * s * f);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; glowDot(ctx, x + Math.cos(a) * 50 * s, cy + Math.sin(a) * 50 * s, 12 * s, STONE[i], f); }
    },
  },
};

/** Primeva's five children: Orogen's jade, Gnarlroot's green, Ambrel's amber, Coilvast's ember, Anvilheart's gold. */
const STONE = ["hsl(150 80% 62%)", "hsl(92 80% 60%)", "hsl(44 100% 66%)", "hsl(18 100% 62%)", "hsl(38 100% 60%)"];
function stones(ctx: CanvasRenderingContext2D, c: { x: number; y: number }, s: number, t: number, alive: boolean, front: boolean) {
  for (let i = 0; i < 5; i++) {
    const a = t * 0.6 + (i / 5) * TAU, sn = Math.sin(a);
    if (front ? sn <= 0 : sn > 0) continue;
    const ex = Math.cos(a) * 46 * s, ey = sn * 14 * s, rot = -0.1;
    const px = c.x + ex * Math.cos(rot) - ey * Math.sin(rot), py = c.y - 6 * s + ex * Math.sin(rot) + ey * Math.cos(rot);
    if (alive) { ctx.save(); ctx.globalCompositeOperation = "lighter"; glowDot(ctx, px, py, 9 * s, STONE[i], 0.5); ctx.restore(); }
    poly(ctx, px, py, 4 * s, 6, t + i);
    ctx.fillStyle = alive ? STONE[i] : "hsl(286 5% 40%)";
    ctx.fill();
    ctx.strokeStyle = "hsl(286 30% 14%)";
    ctx.lineWidth = 1 * s;
    ctx.stroke();
  }
}
