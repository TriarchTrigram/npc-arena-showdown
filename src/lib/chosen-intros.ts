// How each of Zenith's Chosen enters a fight. They do not borrow their element's entrance like other minions:
// each was given its power by Zenith, and each arrives the way that gift lets it (see zenith-chosen.ts).
// The engine (`introOf` in arena-engine.ts) plays these exactly like the roster's entrances.
import type { ChosenId } from "./fighters";
import type { IntroBody, IntroPose, IntroSpec } from "./spawn-intros";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a), 0, 1);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeIn = (k: number) => k * k;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const hsla = (h: number, s: number, l: number, a: number) => `hsl(${h} ${s}% ${l}% / ${clamp(a, 0, 1)})`;
const base = (pose: IntroPose, o: Partial<IntroBody> = {}): IntroBody => ({ dx: 0, dy: 0, alpha: 1, sx: 1, sy: 1, pose, ...o });
const settle = (u: number, held: IntroPose, until: number): IntroPose => (u < until ? held : u < 0.86 ? "flex" : "stance");

const GOLD = "hsl(46 100% 70%)";
const WHITE = "hsl(0 0% 100%)";

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, inner: string, outer: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const CHOSEN_INTROS: Record<ChosenId, IntroSpec> = {
  // Seraphling: drops out of the top of the sky on two wings of light, glides the last of the way down, and folds
  // the wings away as it lands in a puff of gold feathers.
  seraphling: {
    len: 1.6, hit: 0.58, shake: 4, wave: [GOLD, WHITE],
    body: (u, s) => base(u < 0.58 ? "float" : settle(u, "land", 0.72), {
      dy: -(1 - easeOut(seg(u, 0, 0.58))) * 420 * s,
      dx: Math.sin(u * 9) * 18 * s * (1 - seg(u, 0.3, 0.58)),
      alpha: seg(u, 0, 0.12),
      solid: "hsl(48 100% 88%)", solidA: 0.6 * (1 - seg(u, 0.5, 0.82)),
    }),
    bursts: [
      { at: 0.58, n: 22, spd: 220, shape: "petal", a: "hsl(46 100% 82%)", b: WHITE, grav: 120, add: false, from: "body", dir: "out", size: [5, 9], life: 1.2 },
      { at: 0.6, n: 12, spd: 260, shape: "spark", a: GOLD, b: WHITE, grav: -30, add: true, from: "feet", dir: "flat" },
    ],
    trickle: { rate: 26, until: 0.56, spd: 30, shape: "petal", a: "hsl(46 100% 86%)", b: WHITE, grav: 60, add: false, from: "body", dir: "out", life: 1 },
    back: ({ ctx, x, ground, s, u, t, body }) => {
      const k = 1 - seg(u, 0.6, 0.82);
      if (k <= 0.01) return;
      // the two wings, beating on the way down and folding shut on landing
      const cx = x + body.dx, cy = ground + body.dy - 70 * s;
      const beat = Math.sin(t * 16) * 0.35 * (1 - seg(u, 0.5, 0.6));
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const side of [-1, 1]) {
        const span = 70 * s * k;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + side * span * 0.6, cy - span * (0.9 + beat), cx + side * span * 1.3, cy - span * (0.4 + beat));
        ctx.quadraticCurveTo(cx + side * span * 0.8, cy + span * 0.1, cx, cy + 12 * s);
        ctx.closePath();
        ctx.fillStyle = hsla(46, 100, 80, 0.45 * k);
        ctx.fill();
        ctx.strokeStyle = hsla(0, 0, 100, 0.8 * k);
        ctx.lineWidth = 2 * s;
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  // Cantor: a ring of gold letters spins up out of the floor, the hymn gets louder, and the Cantor rises out of
  // the middle of it singing, the letters scattering into the air as it lands.
  cantor: {
    len: 1.6, hit: 0.62, shake: 4, wave: ["hsl(280 80% 76%)", GOLD],
    body: (u, s) => base(u < 0.62 ? "rise" : settle(u, "flex", 0.76), {
      dy: (1 - easeOut(seg(u, 0.22, 0.62))) * 130 * s,
      clip: u < 0.66,
      solid: "hsl(280 80% 88%)", solidA: 0.7 * (1 - seg(u, 0.55, 0.86)),
    }),
    bursts: [
      { at: 0.62, n: 24, spd: 260, shape: "glyph", a: GOLD, b: "hsl(280 90% 84%)", grav: -50, add: true, from: "body", dir: "out", life: 1.1 },
      { at: 0.64, n: 10, spd: 160, shape: "star", a: WHITE, b: GOLD, grav: -80, add: true, from: "feet", dir: "up" },
    ],
    trickle: { rate: 30, until: 0.6, spd: 70, shape: "glyph", a: GOLD, b: "hsl(280 90% 84%)", grav: -90, add: true, from: "feet", dir: "up", spread: 60, life: 0.9 },
    back: ({ ctx, x, ground, s, u, t }) => {
      const k = easeOut(seg(u, 0, 0.3)) * (1 - seg(u, 0.62, 0.86));
      if (k <= 0.01) return;
      // the ring of letters on the floor, turning faster as the hymn builds
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const rx = 90 * s, ry = 20 * s;
      ctx.strokeStyle = hsla(46, 100, 70, 0.7 * k);
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.ellipse(x, ground, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      const spin = t * (2 + u * 6);
      for (let i = 0; i < 12; i++) {
        const a = spin + (i / 12) * Math.PI * 2;
        const px = x + Math.cos(a) * rx, py = ground + Math.sin(a) * ry - 10 * s - Math.max(0, Math.sin(t * 6 + i)) * 10 * s;
        ctx.fillStyle = hsla(i % 2 ? 280 : 46, 100, 80, 0.9 * k);
        ctx.fillRect(px - 2.5 * s, py - 6 * s, 5 * s, 12 * s);
        ctx.fillRect(px - 5 * s, py - 2 * s, 10 * s, 3 * s);
      }
      glow(ctx, x, ground - 40 * s, 80 * s, 80 * s, hsla(280, 90, 80, 0.3 * k), hsla(280, 90, 80, 0));
      ctx.restore();
    },
  },
  // Starforged: a star falls out of the sky at a slant, hits the spot in a white flash, and the Starforged is
  // standing in the crater, still glowing like hot iron.
  starforged: {
    len: 1.5, hit: 0.42, shake: 8, wave: ["hsl(200 100% 80%)", WHITE],
    body: (u, s) => base(u < 0.42 ? "crouch" : settle(u, "land", 0.64), {
      alpha: u < 0.4 ? 0 : 1,
      dy: u < 0.5 ? 6 * s : 0,
      solid: "hsl(200 100% 94%)", solidA: 1 - seg(u, 0.42, 0.9),
    }),
    bursts: [
      { at: 0.42, n: 30, spd: 420, shape: "spark", a: "hsl(200 100% 80%)", b: WHITE, grav: 300, add: true, from: "feet", dir: "up", spread: 1.2 },
      { at: 0.42, n: 14, spd: 240, shape: "chunk", a: "hsl(220 20% 40%)", b: "hsl(220 20% 60%)", grav: 900, add: false, from: "feet", dir: "up", size: [4, 8] },
      { at: 0.46, n: 10, spd: 120, shape: "star", a: GOLD, b: WHITE, grav: -40, add: true, from: "body", dir: "out" },
    ],
    back: ({ ctx, x, ground, s, u }) => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      if (u < 0.42) {
        // the falling star and its tail
        const k = easeIn(seg(u, 0, 0.42));
        const sx = lerp(x - 420 * s, x, k), sy = lerp(ground - 560 * s, ground - 20 * s, k);
        const g = ctx.createLinearGradient(sx - 160 * s, sy - 210 * s, sx, sy);
        g.addColorStop(0, hsla(200, 100, 80, 0));
        g.addColorStop(1, hsla(200, 100, 90, 0.9));
        ctx.strokeStyle = g;
        ctx.lineWidth = 10 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx - 160 * s, sy - 210 * s);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        glow(ctx, sx, sy, 26 * s, 26 * s, hsla(0, 0, 100, 1), hsla(200, 100, 80, 0));
      } else {
        // the crater glowing and cooling
        const k = 1 - seg(u, 0.42, 0.95);
        glow(ctx, x, ground, 110 * s, 22 * s, hsla(200, 100, 86, 0.8 * k), hsla(200, 100, 70, 0));
        glow(ctx, x, ground - 50 * s, 120 * s * (0.6 + seg(u, 0.42, 0.6)), 120 * s, hsla(0, 0, 100, 0.5 * (1 - seg(u, 0.42, 0.62))), hsla(200, 100, 80, 0));
      }
      ctx.restore();
    },
  },
  // Pillar Bearer: a pillar of gold light slams down out of the sky onto the spot and cracks the floor, then fades
  // from the top down, leaving the Bearer braced under the weight it was given to carry.
  pillarbearer: {
    len: 1.7, hit: 0.34, shake: 11, wave: [GOLD, "hsl(30 80% 60%)"],
    body: (u, s) => base(u < 0.6 ? "guard" : settle(u, "flex", 0.76), {
      alpha: seg(u, 0.3, 0.42),
      sy: u < 0.6 ? 0.9 : 1,
      solid: "hsl(44 100% 80%)", solidA: 1 - seg(u, 0.5, 0.88),
    }),
    bursts: [
      { at: 0.34, n: 26, spd: 360, shape: "chunk", a: "hsl(36 30% 50%)", b: "hsl(40 40% 70%)", grav: 900, add: false, from: "feet", dir: "up", size: [4, 9] },
      { at: 0.34, n: 18, spd: 300, shape: "spark", a: GOLD, b: WHITE, grav: 0, add: true, from: "feet", dir: "flat" },
      { at: 0.62, n: 14, spd: 140, shape: "dust", a: "hsl(40 30% 70%)", b: "hsl(40 30% 86%)", grav: -30, add: false, from: "feet", dir: "flat", life: 1 },
    ],
    back: ({ ctx, x, ground, s, u }) => {
      ctx.save();
      // the cracks it leaves in the floor
      if (u >= 0.34) {
        const k = 1 - seg(u, 0.7, 1);
        ctx.strokeStyle = hsla(46, 100, 70, 0.9 * k);
        ctx.lineWidth = 3 * s;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(x, ground);
          ctx.lineTo(x + side * 40 * s, ground + 4 * s);
          ctx.lineTo(x + side * 70 * s, ground - 2 * s);
          ctx.lineTo(x + side * 110 * s, ground + 5 * s);
          ctx.stroke();
        }
      }
      // the pillar: falls fast, holds, then drains away from the top
      const fall = easeIn(seg(u, 0, 0.34));
      const fade = seg(u, 0.4, 0.8);
      if (fade < 1) {
        ctx.globalCompositeOperation = "lighter";
        const w = 54 * s;
        const bottom = lerp(ground - 700 * s, ground, fall);
        const top = Math.min(bottom, lerp(ground - 900 * s, ground, fade));
        const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
        g.addColorStop(0, hsla(46, 100, 70, 0));
        g.addColorStop(0.5, hsla(46, 100, 80, 0.75));
        g.addColorStop(1, hsla(46, 100, 70, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - w, top - 300 * s * (1 - fade), w * 2, bottom - top + 300 * s * (1 - fade));
      }
      ctx.restore();
    },
  },
  // Hour Monk: a clock face opens on the floor, its hand sweeps a full turn backwards, and the Monk is pulled
  // together out of the copies of itself it left at every other hour.
  hourmonk: {
    len: 1.6, hit: 0.6, shake: 4, wave: ["hsl(44 80% 70%)", "hsl(210 60% 80%)"],
    body: (u, s) => base(u < 0.6 ? "float" : settle(u, "guard", 0.74), {
      alpha: 0.2 + 0.8 * seg(u, 0.3, 0.6),
      echo: { spread: (1 - easeOut(seg(u, 0.1, 0.6))) * 110 * s, alpha: 0.5 * (1 - seg(u, 0.5, 0.62)) },
      solid: "hsl(44 80% 84%)", solidA: 0.8 * (1 - seg(u, 0.56, 0.86)),
    }),
    bursts: [
      { at: 0.6, n: 20, spd: 220, shape: "ring", a: "hsl(44 80% 72%)", b: "hsl(210 70% 86%)", grav: 0, add: true, from: "body", dir: "out" },
      { at: 0.62, n: 12, spd: 120, shape: "dust", a: "hsl(40 60% 70%)", b: GOLD, grav: 40, add: false, from: "body", dir: "out", life: 1 },
    ],
    back: ({ ctx, x, ground, s, u }) => {
      const k = easeOut(seg(u, 0, 0.25)) * (1 - seg(u, 0.62, 0.9));
      if (k <= 0.01) return;
      // the clock face laid flat on the floor, its twelve marks and one hand winding back
      ctx.save();
      const rx = 100 * s, ry = 24 * s;
      ctx.strokeStyle = hsla(44, 80, 72, 0.8 * k);
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.ellipse(x, ground, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * rx * 0.82, ground + Math.sin(a) * ry * 0.82);
        ctx.lineTo(x + Math.cos(a) * rx, ground + Math.sin(a) * ry);
        ctx.stroke();
      }
      const hand = -Math.PI / 2 - easeOut(seg(u, 0.05, 0.6)) * Math.PI * 2;
      ctx.lineWidth = 4 * s;
      ctx.strokeStyle = hsla(210, 70, 86, 0.95 * k);
      ctx.beginPath();
      ctx.moveTo(x, ground);
      ctx.lineTo(x + Math.cos(hand) * rx * 0.9, ground + Math.sin(hand) * ry * 0.9);
      ctx.stroke();
      ctx.restore();
    },
  },
  // Halo Knight: kneels in the dark while a great halo comes down out of the sky around it, settles at its feet
  // and flares, and the Knight stands up with the light running off its armour.
  haloknight: {
    len: 1.8, hit: 0.56, shake: 7, wave: [GOLD, WHITE],
    body: (u, s) => base(u < 0.56 ? "crouch" : settle(u, "rise", 0.72), {
      alpha: 0.25 + 0.75 * seg(u, 0.2, 0.5),
      solid: "hsl(48 100% 90%)", solidA: 1 - seg(u, 0.56, 0.9),
    }),
    bursts: [
      { at: 0.56, n: 30, spd: 340, shape: "star", a: GOLD, b: WHITE, grav: -40, add: true, from: "feet", dir: "up", spread: 0.9 },
      { at: 0.56, n: 18, spd: 380, shape: "spark", a: "hsl(46 100% 80%)", b: WHITE, grav: 0, add: true, from: "feet", dir: "flat" },
    ],
    back: ({ ctx, x, ground, s, u }) => {
      const k = 1 - seg(u, 0.6, 0.92);
      if (k <= 0.01) return;
      // the halo, wide as a doorway, sinking from the sky to the floor
      const y = lerp(ground - 360 * s, ground, easeOut(seg(u, 0, 0.56)));
      const flare = 1 + seg(u, 0.56, 0.7) * 0.4;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 24 * s;
      ctx.strokeStyle = hsla(46, 100, 76, 0.95 * k);
      ctx.lineWidth = 7 * s;
      ctx.beginPath();
      ctx.ellipse(x, y, 74 * s * flare, 18 * s * flare, 0, 0, Math.PI * 2);
      ctx.stroke();
      // a column of light under the halo while it falls
      if (u < 0.56) {
        const g = ctx.createLinearGradient(0, y, 0, ground);
        g.addColorStop(0, hsla(46, 100, 80, 0.35));
        g.addColorStop(1, hsla(46, 100, 80, 0.05));
        ctx.fillStyle = g;
        ctx.fillRect(x - 70 * s, y, 140 * s, ground - y);
      }
      ctx.restore();
    },
  },
  // Gloam Reaper: a crescent cut opens in the air with a gold edge, the dark behind it spills out, and the Reaper
  // steps through it sideways with the shard of the Millennium Scepter on its back. The cut closes behind it.
  gloamreaper: {
    len: 1.7, hit: 0.5, shake: 7, wave: ["hsl(220 90% 80%)", "hsl(250 50% 20%)"],
    body: (u, s) => base(u < 0.5 ? "guard" : settle(u, "flex", 0.72), {
      dx: -(1 - easeOut(seg(u, 0.3, 0.56))) * 50 * s,
      alpha: seg(u, 0.3, 0.5),
      solid: "hsl(250 40% 12%)", solidA: 1 - seg(u, 0.5, 0.86),
    }),
    bursts: [
      { at: 0.5, n: 26, spd: 300, shape: "smoke", a: "hsl(250 40% 16%)", b: "hsl(250 30% 32%)", grav: -40, add: false, from: "body", dir: "out", size: [8, 16], life: 1 },
      { at: 0.5, n: 16, spd: 360, shape: "shard", a: "hsl(210 100% 86%)", b: GOLD, grav: 200, add: true, from: "body", dir: "out" },
    ],
    back: ({ ctx, x, ground, s, u, face }) => {
      const open = easeOut(seg(u, 0.05, 0.32)) * (1 - easeIn(seg(u, 0.56, 0.84)));
      if (open <= 0.01) return;
      // the cut in the air: a crescent of night with a pale gold rim
      const cx = x - face * 20 * s, cy = ground - 80 * s, h = 120 * s;
      const w = 46 * s * open;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.quadraticCurveTo(cx + w * 1.6, cy, cx, cy + h);
      ctx.quadraticCurveTo(cx + w * 0.3, cy, cx, cy - h);
      ctx.closePath();
      ctx.fillStyle = hsla(250, 60, 6, 0.95);
      ctx.fill();
      ctx.shadowColor = "hsl(210 100% 86%)";
      ctx.shadowBlur = 16 * s;
      ctx.strokeStyle = hsla(46, 100, 76, 0.95);
      ctx.lineWidth = 3 * s;
      ctx.stroke();
      ctx.restore();
    },
  },
};
