// How the 17 starting fighters look, idle, charge their moves and arrive. The engine calls these on top of the
// stickman body, like the quest fighters' designs:
// - drawRosterLook: what each one wears ("back" behind the limbs, "front" over them) plus what drifts off them at rest.
//   Pyro: burning cuffs and rising embers. Cryo: an ice crown, a crystal pauldron and frosty breath. Electro: sparks
//   jumping hand to hand and crackling arcs. Terra: a stone helm, a boulder pauldron and rock gauntlets. Aero: a headband
//   with two long tails and wind curling round the legs. Hydro: a ring of water round the waist, drips falling from the
//   hands. Umbra: a pointed hood with one violet eye and a tattered shadow cloak. Lux: a halo and wings of light.
//   Gravi: two moons orbiting the head and a heavy belt. Tele: a visor and a small portal hovering at the back.
//   Vita: a leaf crown with a flower and a vine up the arm. Toxi: a gas mask, a tank on the back and dripping hands.
//   Chrono: a clockwork cog behind the shoulders and a monocle. Magneto: a horseshoe helmet and iron bits round the
//   fists. Psy: a third eye, rings of thought and floating stones. Shift: a mask that keeps changing shape and goo.
//   Nova keeps her own hair and scarf (quest-designs.ts) and only gets the stars that drift round her.
// - drawCharge: the power gathering in the hand while a move winds up and leaves it, one shape per element.
// - ARRIVAL: an extra layer on each fighter's entrance (spawn-intros.ts): a sigil on the floor before it lands
//   and a finishing flourish of its element when it does.
import { FIGHTERS, type Power } from "./fighters";
import type { BossRig } from "./boss-designs";
import type { Fx } from "./move-looks";
import type { IntroDraw } from "./spawn-intros";

type Pt = { x: number; y: number };
const TAU = Math.PI * 2;
const HEAD = 11;
const INK = "hsl(250 32% 14%)";

export const ROSTER_LOOK = new Set<Power>([
  "pyro", "cryo", "electro", "terra", "aero", "hydro", "umbra", "lux", "gravi", "tele", "vita", "toxi", "chrono", "magneto", "psy", "shift", "nova",
]);

/** Colours to draw in: the fighter's own, or a form's. */
export type RosterPaint = { a: string; b: string; glow: string };

// ---------- helpers ----------
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a), 0, 1);
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
/** Adds an alpha to an hsl() colour. */
const al = (c: string, a: number) => (c.includes("/") ? c : c.replace(")", ` / ${clamp(a, 0, 1)})`));
const hh = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const hsla = (h: number, s: number, l: number, a: number) => `hsl(${h} ${s}% ${l}% / ${clamp(a, 0, 1)})`;

function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 1) {
  if (r <= 0 || a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, al(c, a));
  g.addColorStop(1, al(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/** A teardrop flame from a base point towards an angle, flickering with time. */
function flame(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, w: number, t: number, seed: number, fill: string | CanvasGradient) {
  const fl = 1 + Math.sin(t * 17 + seed * 5) * 0.14 + Math.sin(t * 29 + seed) * 0.08;
  const L = len * fl;
  const tx = x + Math.cos(ang) * L + Math.sin(t * 13 + seed) * w * 0.35;
  const ty = y + Math.sin(ang) * L;
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  ctx.beginPath();
  ctx.moveTo(x + nx * w, y + ny * w);
  ctx.quadraticCurveTo(x + Math.cos(ang) * L * 0.55 + nx * w * 0.9, y + Math.sin(ang) * L * 0.55 + ny * w * 0.9, tx, ty);
  ctx.quadraticCurveTo(x + Math.cos(ang) * L * 0.55 - nx * w * 0.9, y + Math.sin(ang) * L * 0.55 - ny * w * 0.9, x - nx * w, y - ny * w);
  ctx.arc(x, y, w, ang - Math.PI / 2, ang + Math.PI / 2, true);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A crystal: a long diamond from a base point. */
function crystal(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, w: number, fill: string, edge: string, lw: number) {
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const mx = x + Math.cos(ang) * len * 0.3, my = y + Math.sin(ang) * len * 0.3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(mx + nx * w, my + ny * w);
  ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
  ctx.lineTo(mx - nx * w, my - ny * w);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** A jagged line between two points; the same seed draws the same zigzag. */
function zig(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, parts: number, amp: number, seed: number) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  for (let i = 1; i < parts; i++) {
    const k = i / parts, o = (hh(seed + i * 3.1) - 0.5) * 2 * amp;
    ctx.lineTo(a.x + dx * k + nx * o, a.y + dy * k + ny * o);
  }
  ctx.lineTo(b.x, b.y);
}

/** A rough rock polygon. */
function rock(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number, rot = 0) {
  ctx.beginPath();
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU, rr = r * (0.72 + hh(seed + i) * 0.38);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

function leaf(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, w: number, fill: string, edge: string, lw: number) {
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
  const mx = (x + ex) / 2, my = (y + ey) / 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(mx + nx * w, my + ny * w, ex, ey);
  ctx.quadraticCurveTo(mx - nx * w, my - ny * w, x, y);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function star4(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU - Math.PI / 2, rr = i % 2 ? r * 0.28 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
}

/** Particles drifting off the body at rest: each one loops through its life on its own clock. */
function drift(n: number, t: number, rate: number, seed: number, fn: (i: number, k: number, r1: number, r2: number) => void) {
  for (let i = 0; i < n; i++) {
    const r1 = hh(seed + i * 7.3), r2 = hh(seed + i * 3.7 + 1);
    const k = (((t * rate * (0.7 + r2 * 0.6) + r1) % 1) + 1) % 1;
    fn(i, k, r1, r2);
  }
}

const mid = (a: Pt, b: Pt, k = 0.5): Pt => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

// ---------- the looks ----------
type LookFn = (ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, vx: number, p: RosterPaint) => void;
type Look = { back?: LookFn; front?: LookFn };

const LOOKS: Partial<Record<Power, Look>> = {
  pyro: {
    front: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      // burning cuffs on both fists
      for (const [j, hp] of [r.hB, r.hF].entries()) {
        flame(ctx, hp.x, hp.y - 2 * s, -Math.PI / 2 - face * 0.25, 13 * s, 3.6 * s, t, j + 4, al(p.a, 0.75));
        flame(ctx, hp.x, hp.y - 2 * s, -Math.PI / 2 - face * 0.25, 7 * s, 1.8 * s, t, j + 6, al(p.glow, 0.9));
      }
      // embers rising off the head and shoulders
      drift(7, t, 0.7, 3, (i, k, r1, r2) => {
        const o = i % 2 ? r.head : r.shoulder;
        const x = o.x + (r1 - 0.5) * 22 * s + Math.sin(t * 3 + i) * 5 * s, y = o.y - 6 * s - k * 60 * s;
        glowDot(ctx, x, y, (2.6 + r2 * 2) * s * (1 - k), p.glow, 1 - k);
      });
      ctx.restore();
    },
  },

  cryo: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      // a crystal pauldron on the far shoulder
      const sh = r.shoulder, back = -face;
      ctx.save();
      for (const [ang, len, w] of [[-2.2, 20, 5], [-1.75, 26, 6], [-1.35, 17, 4.5]] as const) {
        const a = back > 0 ? ang : -Math.PI - ang;
        crystal(ctx, sh.x + back * 3 * s, sh.y + 2 * s, a, len * s, w * s, al(p.glow, 0.9), INK, 2 * s);
      }
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // ice crown
      for (const [i, off] of [-0.9, -0.45, 0, 0.45, 0.9].entries()) {
        const a = -Math.PI / 2 + off - face * 0.12;
        const len = (i === 2 ? 15 : i === 1 || i === 3 ? 11 : 8) * s;
        crystal(ctx, h.x + Math.cos(a) * HEAD * 0.85 * s, h.y + Math.sin(a) * HEAD * 0.85 * s, a, len, 3.2 * s, al(p.glow, 0.95), INK, 1.8 * s);
      }
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, h.x, h.y - HEAD * 1.6 * s, 10 * s, p.glow, 0.35 + Math.sin(t * 3) * 0.1);
      if (alive) {
        // frosty breath every couple of seconds
        const bk = (t * 0.45) % 1;
        if (bk < 0.45) {
          const k = bk / 0.45;
          for (let j = 0; j < 3; j++) glowDot(ctx, h.x + face * (HEAD + 4 + k * 18 + j * 4) * s, h.y + (3 - k * 6 + j * 2) * s, (4 + k * 6) * s, "hsl(195 80% 92%)", 0.45 * (1 - k));
        }
        // snowflakes drifting down round the body
        drift(6, t, 0.35, 11, (i, k, r1) => {
          const x = r.hip.x + (r1 - 0.5) * 70 * s + Math.sin(t * 1.5 + i * 2) * 6 * s, y = r.head.y - 20 * s + k * 110 * s;
          star4(ctx, x, y, 3 * s, al("hsl(195 90% 94%)", 0.8 * Math.sin(k * Math.PI)));
        });
      }
      ctx.restore();
    },
  },

  electro: {
    front: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      // a spark jumps hand to hand now and then
      const seed = Math.floor(t * 14);
      if (hh(seed) > 0.55) {
        ctx.strokeStyle = al(p.glow, 0.95);
        ctx.lineWidth = 2 * s;
        zig(ctx, r.hF, r.hB, 6, 7 * s, seed);
        ctx.stroke();
        ctx.strokeStyle = al(p.a, 0.5);
        ctx.lineWidth = 5 * s;
        ctx.stroke();
      }
      // little arcs crackling over the body
      for (let j = 0; j < 2; j++) {
        const sd = seed * 3 + j;
        if (hh(sd + 50) < 0.5) continue;
        const o = j ? r.hip : r.neck;
        const a = hh(sd) * TAU;
        ctx.strokeStyle = al(p.glow, 0.85);
        ctx.lineWidth = 1.5 * s;
        zig(ctx, o, { x: o.x + Math.cos(a) * 18 * s, y: o.y + Math.sin(a) * 18 * s }, 3, 4 * s, sd);
        ctx.stroke();
      }
      glowDot(ctx, r.hF.x, r.hF.y, 9 * s, p.glow, 0.35 + hh(seed) * 0.2);
      glowDot(ctx, r.hB.x, r.hB.y, 7 * s, p.glow, 0.25 + hh(seed + 1) * 0.2);
      ctx.restore();
    },
  },

  terra: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      ctx.save();
      // rock gauntlet on the far fist
      rock(ctx, r.hB.x, r.hB.y, 7.5 * s, 21, 0.4);
      ctx.fillStyle = "hsl(28 30% 34%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2 * s;
      ctx.stroke();
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      ctx.lineJoin = "round";
      // stone helm with a heavy brow
      ctx.beginPath();
      ctx.arc(h.x, h.y, (HEAD + 2.5) * s, Math.PI * 1.05, Math.PI * 1.95);
      ctx.lineTo(h.x + face * (HEAD + 4) * s, h.y - 2 * s);
      ctx.lineTo(h.x - face * (HEAD + 1) * s, h.y - 1 * s);
      ctx.closePath();
      ctx.fillStyle = "hsl(30 26% 40%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4 * s;
      ctx.stroke();
      ctx.strokeStyle = al(p.glow, 0.7);
      ctx.lineWidth = 1.4 * s;
      zig(ctx, { x: h.x - face * 3 * s, y: h.y - (HEAD + 2) * s }, { x: h.x + face * 2 * s, y: h.y - 3 * s }, 3, 2 * s, 5);
      ctx.stroke();
      // boulder pauldron
      rock(ctx, r.shoulder.x - face * 2 * s, r.shoulder.y - 1 * s, 10 * s, 33, 0.2);
      ctx.fillStyle = "hsl(28 34% 44%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4 * s;
      ctx.stroke();
      // rock gauntlet on the near fist, glowing seams
      rock(ctx, r.hF.x, r.hF.y, 8.5 * s, 41, t * 0);
      ctx.fillStyle = "hsl(28 30% 40%)";
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = al(p.glow, 0.8);
      ctx.lineWidth = 1.2 * s;
      zig(ctx, { x: r.hF.x - 5 * s, y: r.hF.y - 3 * s }, { x: r.hF.x + 4 * s, y: r.hF.y + 4 * s }, 3, 2 * s, 9);
      ctx.stroke();
      if (alive) {
        // grit falling from the gauntlets and pebbles hopping at the feet
        drift(5, t, 0.8, 17, (i, k, r1) => {
          const o = i % 2 ? r.hF : r.hB;
          ctx.fillStyle = al("hsl(30 30% 38%)", 1 - k);
          ctx.fillRect(o.x + (r1 - 0.5) * 12 * s, o.y + 6 * s + k * 26 * s, 2.4 * s, 2.4 * s);
        });
        drift(3, t, 0.5, 19, (i, k, r1) => {
          const x = (i % 2 ? r.fF : r.fB).x + (r1 - 0.5) * 20 * s, y = r.fF.y - Math.sin(k * Math.PI) * 9 * s;
          rock(ctx, x, y, 2.4 * s, 60 + i);
          ctx.fillStyle = "hsl(30 26% 42%)";
          ctx.fill();
        });
      }
      ctx.restore();
    },
  },

  aero: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head, back = -face, sp = Math.min(1, Math.abs(vx) / 260);
      ctx.save();
      ctx.lineCap = "round";
      // two long headband tails streaming in the wind
      for (const [j, len] of [56, 44].entries()) {
        const bx = h.x + back * HEAD * 0.9 * s, by = h.y - 3 * s;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        const pts: Pt[] = [];
        for (let i = 1; i <= 6; i++) {
          const k = i / 6;
          pts.push({
            x: bx + back * len * k * s * (0.85 + sp * 0.2),
            y: by + (j * 7 + k * (alive ? 6 - sp * 6 : 30)) * s + Math.sin(t * 9 - k * 4 + j * 1.3) * 6 * k * s,
          });
        }
        for (const q of pts) ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 6.5 * s;
        ctx.stroke();
        ctx.strokeStyle = j ? p.a : p.glow;
        ctx.lineWidth = 3.8 * s;
        ctx.stroke();
      }
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // the band itself
      ctx.beginPath();
      ctx.arc(h.x, h.y, HEAD * s, Math.PI * 1.08, Math.PI * 1.92);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6 * s;
      ctx.stroke();
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 3.4 * s;
      ctx.stroke();
      if (alive) {
        // wind curling round the legs and the body
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        for (let j = 0; j < 3; j++) {
          const cy = r.hip.y + (j - 0.6) * 22 * s, rx = (22 + j * 6) * s, ry = 6 * s;
          const a0 = t * (5 + j) + j * 2;
          ctx.beginPath();
          ctx.ellipse(r.hip.x, cy, rx, ry, -0.12, a0, a0 + 2.2);
          ctx.strokeStyle = al(p.glow, 0.45 - j * 0.1);
          ctx.lineWidth = 2 * s;
          ctx.stroke();
        }
        drift(4, t, 1.1, 23, (i, k, r1) => {
          const y = r.head.y + r1 * 80 * s, x = r.hip.x - face * (40 - k * 80) * s;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + face * 14 * s, y);
          ctx.strokeStyle = al(p.glow, 0.5 * Math.sin(k * Math.PI));
          ctx.lineWidth = 1.5 * s;
          ctx.stroke();
        });
      }
      ctx.restore();
    },
  },

  hydro: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      ctx.save();
      // the far half of the waist ring
      ctx.beginPath();
      ctx.ellipse(r.hip.x, r.hip.y - 6 * s, 20 * s, 6 * s, 0, Math.PI, TAU);
      ctx.strokeStyle = al(p.a, 0.6);
      ctx.lineWidth = 3.2 * s;
      ctx.stroke();
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      ctx.save();
      // the near half of the waist ring, droplets running round it
      ctx.beginPath();
      ctx.ellipse(r.hip.x, r.hip.y - 6 * s, 20 * s, 6 * s, 0, 0, Math.PI);
      ctx.strokeStyle = al(p.glow, 0.85);
      ctx.lineWidth = 3.2 * s;
      ctx.stroke();
      if (alive) {
        for (let j = 0; j < 4; j++) {
          const a = t * 2.4 + (j * TAU) / 4;
          if (Math.sin(a) < 0) continue;
          glowDot(ctx, r.hip.x + Math.cos(a) * 20 * s, r.hip.y - 6 * s + Math.sin(a) * 6 * s, 4 * s, p.glow, 0.9);
        }
        // drips falling from the hands
        drift(4, t, 0.9, 29, (i, k, r1) => {
          const o = i % 2 ? r.hF : r.hB;
          const y = o.y + 5 * s + k * k * 40 * s;
          ctx.beginPath();
          ctx.ellipse(o.x + (r1 - 0.5) * 6 * s, y, 1.8 * s, 3 * s, 0, 0, TAU);
          ctx.fillStyle = al(p.glow, 0.85 * (1 - k));
          ctx.fill();
        });
      }
      ctx.restore();
    },
  },

  umbra: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head, back = -face, sp = Math.min(1, Math.abs(vx) / 300);
      ctx.save();
      // tattered shadow cloak from the shoulders
      for (let j = 0; j < 3; j++) {
        const bx = r.neck.x + back * (j * 2) * s, by = r.neck.y + j * 3 * s;
        const len = (44 - j * 6) * s;
        const tipX = bx + back * len * (0.55 + sp * 0.45), tipY = by + len * (0.9 - sp * 0.55) + Math.sin(t * 6 + j) * 5 * s;
        ctx.beginPath();
        ctx.moveTo(bx - back * 2 * s, by);
        ctx.quadraticCurveTo(bx + back * 10 * s, by + len * 0.4, tipX - back * 4 * s, tipY);
        ctx.lineTo(tipX + back * 3 * s, tipY - 7 * s);
        ctx.lineTo(tipX + back * 6 * s, tipY + 2 * s);
        ctx.quadraticCurveTo(bx + back * 18 * s, by + len * 0.3, bx + back * 6 * s, by - 2 * s);
        ctx.closePath();
        ctx.fillStyle = j === 1 ? "hsl(272 40% 16%)" : "hsl(272 34% 11%)";
        ctx.fill();
        ctx.strokeStyle = al(p.glow, 0.55);
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
      }
      // the hood behind the head, pointed and drooping back
      ctx.beginPath();
      ctx.arc(h.x, h.y, (HEAD + 4) * s, Math.PI * 0.6, Math.PI * 2.4);
      ctx.quadraticCurveTo(h.x + back * (HEAD + 14) * s, h.y - 6 * s, h.x + back * (HEAD + 18) * s, h.y + 6 * s);
      ctx.closePath();
      ctx.fillStyle = "hsl(272 36% 13%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2 * s;
      ctx.stroke();
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // the hood's rim over the brow
      ctx.beginPath();
      ctx.arc(h.x, h.y, (HEAD + 4) * s, face > 0 ? Math.PI * 1.15 : Math.PI * 1.35, face > 0 ? Math.PI * 1.65 : Math.PI * 1.85);
      ctx.strokeStyle = "hsl(272 36% 13%)";
      ctx.lineWidth = 7 * s;
      ctx.stroke();
      ctx.strokeStyle = al(p.glow, 0.5);
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
      if (alive) {
        // one violet eye burning under the hood
        const ex = h.x + face * 5 * s, ey = h.y - 1 * s;
        ctx.globalCompositeOperation = "lighter";
        glowDot(ctx, ex, ey, 9 * s, p.glow, 0.75);
        ctx.beginPath();
        ctx.ellipse(ex, ey, 3 * s, 1.6 * s, 0, 0, TAU);
        ctx.fillStyle = "hsl(290 100% 92%)";
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        // smoke rising off the shoulders
        drift(6, t, 0.5, 31, (i, k, r1, r2) => {
          const x = r.shoulder.x + (r1 - 0.5) * 30 * s + Math.sin(t * 2 + i) * 6 * s, y = r.shoulder.y - k * 50 * s;
          ctx.beginPath();
          ctx.arc(x, y, (4 + r2 * 4 + k * 6) * s, 0, TAU);
          ctx.fillStyle = `hsl(272 40% 12% / ${0.4 * (1 - k)})`;
          ctx.fill();
        });
      }
      ctx.restore();
    },
  },

  lux: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const sh = r.shoulder, back = -face;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      // wings of light fanning from the back
      const pulse = 1 + Math.sin(t * 2.2) * 0.08;
      for (const [j, [ang, len]] of ([[-1.05, 46], [-0.65, 40], [-0.25, 32]] as const).entries()) {
        const a = back > 0 ? ang : -Math.PI - ang;
        const L = (alive ? len * pulse : len * 0.4) * s;
        const nx = -Math.sin(a), ny = Math.cos(a);
        ctx.beginPath();
        ctx.moveTo(sh.x + nx * 4 * s, sh.y + ny * 4 * s);
        ctx.lineTo(sh.x + Math.cos(a) * L, sh.y + Math.sin(a) * L);
        ctx.lineTo(sh.x - nx * 4 * s, sh.y - ny * 4 * s);
        ctx.closePath();
        const g = ctx.createLinearGradient(sh.x, sh.y, sh.x + Math.cos(a) * L, sh.y + Math.sin(a) * L);
        g.addColorStop(0, al(p.glow, 0.85 - j * 0.12));
        g.addColorStop(1, al(p.a, 0));
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // a halo above the head
      const hy = h.y - (HEAD + 9 + Math.sin(t * 2) * 1.5) * s;
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, h.x, hy, 16 * s, p.glow, alive ? 0.45 : 0.15);
      ctx.beginPath();
      ctx.ellipse(h.x, hy, 11 * s, 3.4 * s, -face * 0.12, 0, TAU);
      ctx.strokeStyle = al(p.glow, alive ? 1 : 0.4);
      ctx.lineWidth = 2.6 * s;
      ctx.stroke();
      if (alive) {
        // motes of light twinkling round the body
        drift(6, t, 0.45, 37, (i, k, r1, r2) => {
          const a = r1 * TAU + t * 0.6;
          const x = r.hip.x + Math.cos(a) * (26 + r2 * 16) * s, y = r.neck.y + Math.sin(a) * 34 * s - k * 12 * s;
          star4(ctx, x, y, (3 + r2 * 3) * s * Math.sin(k * Math.PI), al(p.glow, 0.95));
        });
      }
      ctx.restore();
    },
  },

  gravi: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      ctx.save();
      // the floor bending under the feet
      const fy = Math.max(r.fF.y, r.fB.y) + 2 * s;
      for (let j = 0; j < 3; j++) {
        const k = ((t * 0.6 + j / 3) % 1);
        ctx.beginPath();
        ctx.ellipse(r.hip.x, fy, (40 - k * 30) * s, (8 - k * 6) * s, 0, 0, TAU);
        ctx.strokeStyle = al(p.glow, 0.4 * k);
        ctx.lineWidth = 1.6 * s;
        ctx.stroke();
      }
      gravMoons(ctx, r, s, t, alive, p, false);
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      ctx.save();
      // a heavy belt
      ctx.beginPath();
      ctx.ellipse(r.hip.x, r.hip.y - 4 * s, 9 * s, 4 * s, 0, 0, TAU);
      ctx.fillStyle = "hsl(240 30% 20%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      glowDot(ctx, r.hip.x + face * 2 * s, r.hip.y - 4 * s, 6 * s, p.glow, 0.8);
      gravMoons(ctx, r, s, t, alive, p, true);
      ctx.restore();
    },
  },

  tele: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face;
      const cx = r.neck.x + back * 20 * s, cy = r.neck.y - 4 * s;
      ctx.save();
      // a small portal hovering behind the shoulders
      const open = alive ? 1 : 0.4;
      ctx.translate(cx, cy + Math.sin(t * 2) * 2 * s);
      ctx.beginPath();
      ctx.ellipse(0, 0, 8 * s * open, 16 * s * open, 0, 0, TAU);
      ctx.fillStyle = "hsl(290 60% 10%)";
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, (8 - j * 2.2) * s * open, (16 - j * 4.5) * s * open, 0, t * (3 + j) , t * (3 + j) + 4);
        ctx.strokeStyle = al(j % 2 ? p.a : p.glow, 0.9 - j * 0.2);
        ctx.lineWidth = 2 * s;
        ctx.stroke();
      }
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // visor across the eyes
      const x0 = h.x - face * 4 * s, x1 = h.x + face * (HEAD + 2) * s;
      ctx.beginPath();
      ctx.roundRect(Math.min(x0, x1), h.y - 5.5 * s, Math.abs(x1 - x0), 8 * s, 3 * s);
      ctx.fillStyle = "hsl(290 40% 14%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      if (alive) {
        const scan = (Math.sin(t * 3) + 1) / 2;
        ctx.fillStyle = al(p.glow, 0.95);
        ctx.fillRect(Math.min(x0, x1) + 2 * s, h.y - 2.5 * s, Math.abs(x1 - x0) - 4 * s, 2 * s);
        glowDot(ctx, x0 + (x1 - x0) * scan, h.y - 1.5 * s, 6 * s, p.glow, 0.8);
        // pixels flickering off the body as if it is never quite all here
        const seed = Math.floor(t * 8);
        for (let j = 0; j < 4; j++) {
          if (hh(seed + j * 9) < 0.5) continue;
          const x = r.hip.x + (hh(seed + j) - 0.5) * 50 * s, y = r.head.y + hh(seed + j + 3) * 70 * s;
          ctx.fillStyle = al(j % 2 ? p.a : p.glow, 0.7);
          ctx.fillRect(x, y, 3 * s, 3 * s);
        }
      }
      ctx.restore();
    },
  },

  vita: {
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // a vine winding up the near arm
      ctx.lineCap = "round";
      ctx.beginPath();
      const arm = [r.shoulder, r.eF, r.hF];
      for (let i = 0; i <= 12; i++) {
        const k = i / 12, seg0 = k < 0.5 ? 0 : 1, kk = k < 0.5 ? k * 2 : (k - 0.5) * 2;
        const q = mid(arm[seg0], arm[seg0 + 1], kk);
        const w = Math.sin(k * TAU * 2.5) * 3.5 * s;
        i ? ctx.lineTo(q.x + w, q.y - w * 0.5) : ctx.moveTo(q.x + w, q.y);
      }
      ctx.strokeStyle = "hsl(130 50% 26%)";
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      for (const k of [0.3, 0.7]) {
        const q = mid(r.eF, r.hF, k);
        leaf(ctx, q.x, q.y, -Math.PI / 2 + face * 0.8, 8 * s, 3.5 * s, p.glow, INK, 1.2 * s);
      }
      const q = mid(r.shoulder, r.eF, 0.5);
      leaf(ctx, q.x, q.y, -Math.PI / 2 - face * 0.7, 8 * s, 3.5 * s, p.a, INK, 1.2 * s);
      // a crown of leaves with one flower
      for (const off of [-1.1, -0.55, 0, 0.55, 1.1]) {
        const a = -Math.PI / 2 + off;
        leaf(ctx, h.x + Math.cos(a) * HEAD * 0.8 * s, h.y + Math.sin(a) * HEAD * 0.8 * s, a, 10 * s, 3.6 * s, off === 0 ? p.glow : p.a, INK, 1.4 * s);
      }
      const fx = h.x - face * HEAD * 0.75 * s, fy = h.y - HEAD * 0.7 * s;
      for (let j = 0; j < 5; j++) {
        const a = (j / 5) * TAU + t * 0.4;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * 3.6 * s, fy + Math.sin(a) * 3.6 * s, 3 * s, 0, TAU);
        ctx.fillStyle = "hsl(330 85% 78%)";
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1 * s;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(fx, fy, 2.4 * s, 0, TAU);
      ctx.fillStyle = "hsl(48 100% 62%)";
      ctx.fill();
      if (alive) {
        // petals and motes of life floating up
        ctx.globalCompositeOperation = "lighter";
        drift(6, t, 0.4, 41, (i, k, r1) => {
          const x = r.hip.x + (r1 - 0.5) * 60 * s + Math.sin(t * 1.8 + i) * 8 * s, y = r.fF.y - k * 100 * s;
          glowDot(ctx, x, y, 4 * s, i % 2 ? p.glow : "hsl(330 90% 80%)", 0.7 * Math.sin(k * Math.PI));
        });
      }
      ctx.restore();
    },
  },

  toxi: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face;
      const tx = mid(r.neck, r.hip, 0.3).x + back * 10 * s, ty = mid(r.neck, r.hip, 0.3).y;
      ctx.save();
      // a canister strapped to the back, a hose up to the mask
      ctx.beginPath();
      ctx.roundRect(tx - 6 * s, ty - 12 * s, 12 * s, 26 * s, 6 * s);
      ctx.fillStyle = "hsl(90 20% 28%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(tx - 3.5 * s, ty - 6 * s, 7 * s, 16 * s, 3.5 * s);
      ctx.fillStyle = al(p.glow, 0.85);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx, ty - 12 * s);
      ctx.quadraticCurveTo(tx + back * 2 * s, r.head.y + 4 * s, r.head.x + face * 6 * s, r.head.y + 7 * s);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4 * s;
      ctx.stroke();
      ctx.strokeStyle = "hsl(90 20% 36%)";
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      if (alive) {
        ctx.globalCompositeOperation = "lighter";
        drift(4, t, 0.8, 47, (i, k, r1) => {
          ctx.beginPath();
          ctx.arc(tx + (r1 - 0.5) * 8 * s, ty - 14 * s - k * 40 * s, (1.5 + k * 3) * s, 0, TAU);
          ctx.strokeStyle = al(p.glow, 0.8 * (1 - k));
          ctx.lineWidth = 1.2 * s;
          ctx.stroke();
        });
      }
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // gas mask: a snout with a round filter and a glass eye
      const mx = h.x + face * 7 * s, my = h.y + 4 * s;
      ctx.beginPath();
      ctx.ellipse(mx, my, 7 * s, 6 * s, 0, 0, TAU);
      ctx.fillStyle = "hsl(90 16% 30%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx + face * 5 * s, my + 2 * s, 4.5 * s, 0, TAU);
      ctx.fillStyle = "hsl(90 12% 22%)";
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = al(p.glow, 0.7);
      ctx.lineWidth = 1 * s;
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath();
        ctx.moveTo(mx + face * 5 * s + j * 2 * s, my - 1 * s);
        ctx.lineTo(mx + face * 5 * s + j * 2 * s, my + 5 * s);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(h.x + face * 5 * s, h.y - 2 * s, 4.2 * s, 0, TAU);
      ctx.fillStyle = al(p.glow, alive ? 0.9 : 0.3);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      if (alive) {
        // venom dripping from the fingers
        ctx.globalCompositeOperation = "lighter";
        drift(5, t, 0.8, 53, (i, k, r1) => {
          const o = i % 2 ? r.hF : r.hB;
          const y = o.y + 4 * s + k * k * 34 * s;
          ctx.beginPath();
          ctx.ellipse(o.x + (r1 - 0.5) * 8 * s, y, 2 * s, 3.2 * s, 0, 0, TAU);
          ctx.fillStyle = al(p.glow, 0.85 * (1 - k));
          ctx.fill();
        });
      }
      ctx.restore();
    },
  },

  chrono: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face;
      const cx = r.neck.x + back * 8 * s, cy = r.neck.y - 6 * s;
      ctx.save();
      // a clockwork cog behind the shoulders, its hands ticking round
      const R = 22 * s, rot = alive ? Math.floor(t * 2) * (TAU / 24) : 0;
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i < 24; i++) {
        const a = rot + (i / 24) * TAU, rr = i % 2 ? R : R + 4 * s;
        const a2 = rot + ((i + 1) / 24) * TAU;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        ctx.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr);
      }
      ctx.closePath();
      ctx.fillStyle = "hsl(38 60% 30%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R - 4 * s, 0, TAU);
      ctx.fillStyle = "hsl(42 60% 86%)";
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = INK;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ctx.lineWidth = (i % 3 ? 1 : 2) * s;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (R - 6 * s), Math.sin(a) * (R - 6 * s));
        ctx.lineTo(Math.cos(a) * (R - 9 * s), Math.sin(a) * (R - 9 * s));
        ctx.stroke();
      }
      const mA = (alive ? Math.floor(t * 2) / 2 : 0) * 1.2 - Math.PI / 2, hA = mA / 12 - 0.8;
      ctx.lineCap = "round";
      ctx.strokeStyle = p.a;
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(Math.cos(hA) * 9 * s, Math.sin(hA) * 9 * s);
      ctx.stroke();
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(Math.cos(mA) * 14 * s, Math.sin(mA) * 14 * s);
      ctx.stroke();
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // a monocle with a chain down to the collar
      const ex = h.x + face * 5 * s, ey = h.y - 1.5 * s;
      ctx.beginPath();
      ctx.arc(ex, ey, 5.6 * s, 0, TAU);
      ctx.strokeStyle = "hsl(42 90% 58%)";
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex - face * 1 * s, ey + 5.6 * s);
      ctx.quadraticCurveTo(ex - face * 4 * s, r.neck.y, r.neck.x, r.neck.y + 6 * s);
      ctx.strokeStyle = al("hsl(42 90% 58%)", 0.8);
      ctx.lineWidth = 1 * s;
      ctx.stroke();
      if (alive) {
        // afterimage ticks: faint copies of the hands, a beat behind
        ctx.globalCompositeOperation = "lighter";
        const lag = (t * 2) % 1;
        if (lag < 0.35) {
          for (const hp of [r.hF, r.hB]) {
            ctx.beginPath();
            ctx.arc(hp.x, hp.y, (6 + lag * 20) * s, 0, TAU);
            ctx.strokeStyle = al(p.glow, 0.6 * (1 - lag / 0.35));
            ctx.lineWidth = 1.4 * s;
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    },
  },

  magneto: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      ctx.save();
      ironBits(ctx, r, s, t, alive, false);
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // horseshoe helmet: red, open at the top, silver tips
      ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.arc(h.x, h.y, (HEAD + 2) * s, Math.PI * 0.82, Math.PI * 0.18 + TAU, false);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 8.5 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(h.x, h.y, (HEAD + 2) * s, Math.PI * 0.95, Math.PI * 0.05 + TAU, false);
      ctx.strokeStyle = p.a;
      ctx.lineWidth = 5.5 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(h.x, h.y, (HEAD + 2) * s, Math.PI * 0.82, Math.PI * 0.95);
      ctx.moveTo(h.x + Math.cos(Math.PI * 0.05) * (HEAD + 2) * s, h.y + Math.sin(Math.PI * 0.05) * (HEAD + 2) * s);
      ctx.arc(h.x, h.y, (HEAD + 2) * s, Math.PI * 0.05, Math.PI * 0.18);
      ctx.strokeStyle = "hsl(210 14% 84%)";
      ctx.stroke();
      // a steel shoulder plate
      ctx.beginPath();
      ctx.ellipse(r.shoulder.x, r.shoulder.y + 1 * s, 9 * s, 5 * s, -face * 0.3, Math.PI, TAU);
      ctx.closePath();
      ctx.fillStyle = "hsl(210 12% 70%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      if (alive) {
        // a field arcing between the helmet's two ends
        ctx.globalCompositeOperation = "lighter";
        const k = (Math.sin(t * 3) + 1) / 2;
        ctx.beginPath();
        ctx.ellipse(h.x, h.y + (HEAD + 2) * s, (HEAD + 6 + k * 4) * s, (8 + k * 4) * s, 0, 0.15, Math.PI - 0.15);
        ctx.strokeStyle = al(p.glow, 0.35);
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
      }
      ironBits(ctx, r, s, t, alive, true);
      ctx.restore();
    },
  },

  psy: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      ctx.save();
      psyStones(ctx, r, s, t, alive, p, false);
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // rings of thought widening off the head
      if (alive) {
        ctx.globalCompositeOperation = "lighter";
        for (let j = 0; j < 2; j++) {
          const k = (t * 0.6 + j * 0.5) % 1;
          ctx.beginPath();
          ctx.ellipse(h.x, h.y - 2 * s, (HEAD + 4 + k * 20) * s, (4 + k * 6) * s, 0, 0, TAU);
          ctx.strokeStyle = al(p.glow, 0.6 * (1 - k));
          ctx.lineWidth = 1.6 * s;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      }
      // the third eye on the brow
      const ex = h.x + face * 2 * s, ey = h.y - 7 * s;
      ctx.beginPath();
      ctx.moveTo(ex - 4.5 * s, ey);
      ctx.quadraticCurveTo(ex, ey - 4 * s, ex + 4.5 * s, ey);
      ctx.quadraticCurveTo(ex, ey + 4 * s, ex - 4.5 * s, ey);
      ctx.fillStyle = alive ? "hsl(320 100% 94%)" : "hsl(320 20% 40%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
      if (alive) {
        ctx.beginPath();
        ctx.arc(ex + face * 0.8 * s + Math.sin(t * 1.3) * 0.8 * s, ey, 1.7 * s, 0, TAU);
        ctx.fillStyle = p.a;
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        glowDot(ctx, ex, ey, 9 * s, p.glow, 0.5 + Math.sin(t * 4) * 0.15);
        ctx.globalCompositeOperation = "source-over";
      }
      psyStones(ctx, r, s, t, alive, p, true);
      ctx.restore();
    },
  },

  shift: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      ctx.save();
      // goo pooled round the feet, never still
      const fy = Math.max(r.fF.y, r.fB.y) + 1 * s;
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const a = Math.PI + (i / 16) * Math.PI;
        const rr = 22 * s * (1 + Math.sin(t * 3 + i * 1.7) * 0.15);
        const x = r.hip.x + Math.cos(a) * rr, y = fy + Math.sin(a) * rr * 0.22;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = al(p.a, 0.55);
      ctx.fill();
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head;
      ctx.save();
      // a mask that keeps changing shape: triangle, square, five sides, round, and back
      const cyc = alive ? t * 0.5 : 0;
      const sides = 3 + ((Math.sin(cyc * TAU) + 1) / 2) * 5;
      const mx = h.x + face * 4.5 * s, my = h.y;
      ctx.beginPath();
      const n = 24;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * TAU - Math.PI / 2 + cyc;
        const k = Math.cos(Math.PI / sides) / Math.cos(((a + Math.PI / 2 - cyc) % (TAU / sides)) - Math.PI / sides);
        const rr = 7.5 * s * Math.min(1.25, k);
        const x = mx + Math.cos(a) * rr, y = my + Math.sin(a) * rr;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createLinearGradient(mx - 8 * s, my - 8 * s, mx + 8 * s, my + 8 * s);
      g.addColorStop(0, `hsl(${(t * 60) % 360} 80% 80%)`);
      g.addColorStop(1, p.glow);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      // eye holes
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(mx + face * 1.6 * s, my - 1.5 * s, 1.6 * s, 2.4 * s, 0, 0, TAU);
      ctx.fill();
      if (alive) {
        // goo dripping from the hands and chin
        drift(5, t, 0.7, 59, (i, k, r1) => {
          const o = i === 4 ? { x: mx, y: my + 7 * s } : i % 2 ? r.hF : r.hB;
          const stretch = Math.min(1, k * 3);
          const y = o.y + 3 * s + (k > 0.33 ? (k - 0.33) * 60 * s : 0);
          ctx.beginPath();
          ctx.ellipse(o.x + (r1 - 0.5) * 6 * s, y + stretch * 3 * s, 2.2 * s, (2 + stretch * 2) * s, 0, 0, TAU);
          ctx.fillStyle = al(p.a, 0.9 * (1 - k));
          ctx.fill();
        });
      }
      ctx.restore();
    },
  },

  nova: {
    front: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      // small stars drifting round her
      drift(5, t, 0.35, 61, (i, k, r1, r2) => {
        const a = r1 * TAU + t * 0.5 * (i % 2 ? 1 : -1);
        const x = r.hip.x + Math.cos(a) * (28 + r2 * 14) * s, y = r.neck.y + Math.sin(a) * 30 * s;
        star4(ctx, x, y, (2.5 + r2 * 3) * s * Math.sin(k * Math.PI), al(i % 2 ? p.glow : "hsl(318 100% 82%)", 0.95));
      });
      ctx.restore();
    },
  },
};

function gravMoons(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, p: RosterPaint, near: boolean) {
  const h = r.head;
  for (let j = 0; j < 2; j++) {
    const a = (alive ? t * (1.6 + j * 0.5) : 0) + j * Math.PI;
    const front = Math.sin(a) > 0;
    if (front !== near) continue;
    const x = h.x + Math.cos(a) * (24 + j * 6) * s, y = h.y - 4 * s + Math.sin(a) * 7 * s - j * 4 * s;
    const R = (j ? 3.6 : 5) * s;
    glowDot(ctx, x, y, R * 2.6, p.glow, 0.4);
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.fillStyle = j ? p.glow : "hsl(240 30% 30%)";
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
  }
  if (near) {
    ctx.beginPath();
    ctx.ellipse(h.x, h.y - 6 * s, 27 * s, 8 * s, 0, 0, Math.PI);
    ctx.strokeStyle = al(p.glow, 0.25);
    ctx.lineWidth = 1 * s;
    ctx.stroke();
  }
}

function ironBits(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, near: boolean) {
  if (!alive) return;
  for (const [hi, hp] of [r.hF, r.hB].entries()) {
    for (let j = 0; j < 3; j++) {
      const a = t * (3 + hi) + (j * TAU) / 3;
      if ((Math.sin(a) > 0) !== near) continue;
      const x = hp.x + Math.cos(a) * 12 * s, y = hp.y + Math.sin(a) * 4 * s;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a * 2);
      ctx.fillStyle = "hsl(210 10% 62%)";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.rect(-2.2 * s, -1.4 * s, 4.4 * s, 2.8 * s);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

function psyStones(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, p: RosterPaint, near: boolean) {
  for (let j = 0; j < 3; j++) {
    const a = (alive ? t * 0.9 : 0) + (j * TAU) / 3;
    if ((Math.sin(a) > 0) !== near) continue;
    const x = r.hip.x + Math.cos(a) * 34 * s;
    const y = alive ? r.neck.y + 6 * s + Math.sin(a) * 8 * s + Math.sin(t * 2.2 + j) * 5 * s : Math.max(r.fF.y, r.fB.y) - 2 * s;
    if (alive) glowDot(ctx, x, y, 9 * s, p.glow, 0.45);
    rock(ctx, x, y, (3.5 + j) * s, 70 + j, t * 0.5 * (alive ? 1 : 0));
    ctx.fillStyle = "hsl(300 10% 46%)";
    ctx.fill();
    ctx.strokeStyle = alive ? p.glow : INK;
    ctx.lineWidth = 1.4 * s;
    ctx.stroke();
  }
}

/** Draw a starting fighter's look in one layer. */
export function drawRosterLook(ctx: CanvasRenderingContext2D, id: Power, layer: "back" | "front", r: BossRig, s: number, face: number, t: number, alive: boolean, vx: number, p: RosterPaint) {
  const fn = LOOKS[id]?.[layer];
  if (!fn) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  fn(ctx, r, s, face, t, alive, vx, p);
  ctx.restore();
}

// ---------- the power gathering in the hand ----------
type ChargeFn = (ctx: CanvasRenderingContext2D, h: Pt, s: number, t: number, k: number, a: string, b: string, face: number) => void;

const CHARGES: Partial<Record<Power, ChargeFn>> = {
  pyro: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 22 * s * k, a, 0.8);
    for (let j = 0; j < 4; j++) flame(ctx, h.x + (j - 1.5) * 3 * s, h.y, -Math.PI / 2 + (j - 1.5) * 0.35, (14 + j * 3) * s * k, 4 * s * k, t, j, al(j % 2 ? b : a, 0.85));
    drift(6, t, 2, 71, (i, kk, r1) => glowDot(ctx, h.x + (r1 - 0.5) * 20 * s, h.y - kk * 34 * s * k, 2.6 * s, b, (1 - kk) * k));
  },
  cryo: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 18 * s * k, b, 0.7);
    for (let j = 0; j < 6; j++) {
      const ang = t * 1.5 + (j * TAU) / 6;
      crystal(ctx, h.x + Math.cos(ang) * 3 * s, h.y + Math.sin(ang) * 3 * s, ang, 14 * s * k, 3 * s * k, al(b, 0.85), al(a, 0.9), 1 * s);
    }
    ctx.beginPath();
    ctx.arc(h.x, h.y, 20 * s * (1.3 - k * 0.3), 0, TAU);
    ctx.strokeStyle = al(b, 0.5 * k);
    ctx.lineWidth = 1.4 * s;
    ctx.stroke();
  },
  electro: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 20 * s * k, b, 0.9);
    const seed = Math.floor(t * 24);
    ctx.lineWidth = 1.8 * s;
    for (let j = 0; j < 5; j++) {
      const ang = hh(seed + j) * TAU, L = (16 + hh(seed + j + 5) * 18) * s * k;
      ctx.strokeStyle = al(j % 2 ? a : b, 0.95);
      zig(ctx, h, { x: h.x + Math.cos(ang) * L, y: h.y + Math.sin(ang) * L }, 4, 4 * s, seed * 7 + j);
      ctx.stroke();
    }
  },
  terra: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 16 * s * k, b, 0.5);
    ctx.globalCompositeOperation = "source-over";
    for (let j = 0; j < 4; j++) {
      const ang = t * 4 + (j * TAU) / 4, R = (26 - k * 14) * s;
      rock(ctx, h.x + Math.cos(ang) * R, h.y + Math.sin(ang) * R * 0.6, (3 + j % 2) * s, 80 + j, ang);
      ctx.fillStyle = "hsl(28 34% 40%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
    }
  },
  aero: (ctx, h, s, t, k, a, b) => {
    for (let j = 0; j < 3; j++) {
      const R = (8 + j * 6) * s * k, a0 = -t * (10 - j * 2) + j * 2;
      ctx.beginPath();
      ctx.arc(h.x, h.y, R, a0, a0 + 3.6);
      ctx.strokeStyle = al(j % 2 ? a : b, 0.85 - j * 0.15);
      ctx.lineWidth = (2.6 - j * 0.5) * s;
      ctx.stroke();
    }
  },
  hydro: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 12 * s * k, b, 0.6);
    ctx.beginPath();
    ctx.ellipse(h.x, h.y, 15 * s * k, 6 * s * k, t * 2, 0, TAU);
    ctx.strokeStyle = al(a, 0.8);
    ctx.lineWidth = 3 * s;
    ctx.stroke();
    for (let j = 0; j < 5; j++) {
      const ang = t * 5 + (j * TAU) / 5;
      glowDot(ctx, h.x + Math.cos(ang) * 15 * s * k, h.y + Math.sin(ang) * 15 * s * k, 3.4 * s, b, 0.9);
    }
  },
  umbra: (ctx, h, s, t, k, a, b) => {
    ctx.globalCompositeOperation = "source-over";
    for (let j = 0; j < 5; j++) {
      const ang = (j * TAU) / 5 + Math.sin(t * 3 + j) * 0.4, L = 20 * s * k;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.quadraticCurveTo(h.x + Math.cos(ang + 0.6) * L * 0.6, h.y + Math.sin(ang + 0.6) * L * 0.6, h.x + Math.cos(ang) * L, h.y + Math.sin(ang) * L);
      ctx.strokeStyle = "hsl(272 40% 12% / 0.85)";
      ctx.lineWidth = 3.4 * s;
      ctx.stroke();
      ctx.strokeStyle = al(b, 0.6);
      ctx.lineWidth = 1 * s;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(h.x, h.y, 8 * s * k, 0, TAU);
    ctx.fillStyle = "hsl(272 50% 8%)";
    ctx.fill();
    ctx.strokeStyle = al(b, 0.9);
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
  },
  lux: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 26 * s * k, b, 0.85);
    ctx.lineCap = "round";
    for (let j = 0; j < 8; j++) {
      const ang = t * 1.2 + (j * TAU) / 8, L = (j % 2 ? 16 : 26) * s * k;
      ctx.beginPath();
      ctx.moveTo(h.x + Math.cos(ang) * 5 * s, h.y + Math.sin(ang) * 5 * s);
      ctx.lineTo(h.x + Math.cos(ang) * L, h.y + Math.sin(ang) * L);
      ctx.strokeStyle = al(j % 2 ? a : b, 0.9);
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();
    }
  },
  gravi: (ctx, h, s, t, k, a, b) => {
    for (let j = 0; j < 3; j++) {
      const kk = (t * 1.6 + j / 3) % 1;
      ctx.beginPath();
      ctx.arc(h.x, h.y, (28 * (1 - kk) + 4) * s * k, 0, TAU);
      ctx.strokeStyle = al(b, 0.7 * kk);
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc(h.x, h.y, 6 * s * k, 0, TAU);
    ctx.fillStyle = "hsl(245 50% 8%)";
    ctx.fill();
    ctx.strokeStyle = al(b, 0.95);
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
  },
  tele: (ctx, h, s, t, k, a, b) => {
    for (let j = 0; j < 2; j++) {
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 16 * s * k, 6 * s * k, t * (j ? -3 : 3) + j * 1.5, 0, TAU);
      ctx.strokeStyle = al(j ? a : b, 0.9);
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    glowDot(ctx, h.x, h.y, 10 * s * k, b, 0.9);
  },
  vita: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 18 * s * k, b, 0.6);
    ctx.globalCompositeOperation = "source-over";
    for (let j = 0; j < 5; j++) {
      const ang = t * 2.5 + (j * TAU) / 5;
      leaf(ctx, h.x, h.y, ang, 14 * s * k, 4 * s * k, al(j % 2 ? a : b, 0.9), al(INK, 0.7), 0.8 * s);
    }
  },
  toxi: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 16 * s * k, b, 0.7);
    drift(6, t, 1.6, 89, (i, kk, r1, r2) => {
      ctx.beginPath();
      ctx.arc(h.x + (r1 - 0.5) * 20 * s, h.y - kk * 26 * s, (2 + r2 * 3) * s * k * (1 + kk * 0.5), 0, TAU);
      ctx.strokeStyle = al(i % 2 ? a : b, 0.9 * (1 - kk));
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
    });
  },
  chrono: (ctx, h, s, t, k, a, b) => {
    const R = 16 * s * k;
    ctx.beginPath();
    ctx.arc(h.x, h.y, R, 0, TAU);
    ctx.strokeStyle = al(b, 0.9);
    ctx.lineWidth = 1.8 * s;
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * TAU;
      ctx.beginPath();
      ctx.moveTo(h.x + Math.cos(ang) * R, h.y + Math.sin(ang) * R);
      ctx.lineTo(h.x + Math.cos(ang) * R * 0.8, h.y + Math.sin(ang) * R * 0.8);
      ctx.stroke();
    }
    const ang = t * 9;
    ctx.beginPath();
    ctx.moveTo(h.x, h.y);
    ctx.lineTo(h.x + Math.cos(ang) * R * 0.9, h.y + Math.sin(ang) * R * 0.9);
    ctx.strokeStyle = al(a, 0.95);
    ctx.lineWidth = 2 * s;
    ctx.stroke();
    glowDot(ctx, h.x, h.y, 8 * s * k, b, 0.7);
  },
  magneto: (ctx, h, s, t, k, a, b) => {
    for (let j = 1; j <= 3; j++) {
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, 6 * j * s * k, 9 * j * s * k * 0.6, 0, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.ellipse(h.x, h.y, 6 * j * s * k, 9 * j * s * k * 0.6, 0, Math.PI * 0.55, Math.PI * 1.45);
      ctx.strokeStyle = al(j % 2 ? b : a, 0.75 - j * 0.12);
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
    }
    glowDot(ctx, h.x, h.y, 10 * s * k, b, 0.8);
  },
  psy: (ctx, h, s, t, k, a, b) => {
    for (let j = 0; j < 3; j++) {
      const kk = (t * 2 + j / 3) % 1;
      ctx.beginPath();
      ctx.arc(h.x, h.y, (4 + kk * 24) * s * k, 0, TAU);
      ctx.strokeStyle = al(j % 2 ? a : b, 0.8 * (1 - kk));
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    glowDot(ctx, h.x, h.y, 12 * s * k, b, 0.8);
  },
  shift: (ctx, h, s, t, k, a, b) => {
    ctx.beginPath();
    for (let i = 0; i <= 14; i++) {
      const ang = (i / 14) * TAU, rr = 12 * s * k * (1 + Math.sin(t * 9 + i * 2.1) * 0.3);
      const x = h.x + Math.cos(ang) * rr, y = h.y + Math.sin(ang) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = al(`hsl(${(t * 200) % 360} 90% 70%)`, 0.6);
    ctx.fill();
    ctx.strokeStyle = al(b, 0.9);
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
  },
  nova: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 22 * s * k, a, 0.8);
    star4(ctx, h.x, h.y, 16 * s * k * (1 + Math.sin(t * 12) * 0.1), al(b, 0.95));
    for (let j = 0; j < 4; j++) {
      const ang = t * 4 + (j * TAU) / 4;
      star4(ctx, h.x + Math.cos(ang) * 20 * s * k, h.y + Math.sin(ang) * 20 * s * k, 4 * s, al(b, 0.9));
    }
  },
};

/**
 * The power gathering in the hand: k runs 0..1 through the wind-up and stays up through the strike.
 * `release` (0..1) is a ring thrown off the hand as the move leaves it. Returns false when the power has no own charge.
 */
export function drawCharge(ctx: CanvasRenderingContext2D, power: Power, h: Pt, s: number, t: number, k: number, a: string, b: string, face: number, release: number): boolean {
  const fn = CHARGES[power];
  if (!fn) return false;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  fn(ctx, h, s, t, clamp(k, 0.05, 1), a, b, face);
  if (release > 0 && release < 1) {
    ctx.globalCompositeOperation = "lighter";
    mark(ctx, power, h.x, h.y, 34 * s, release, a, b, face, 0.4);
  }
  ctx.restore();
  return true;
}

// ---------- each element's mark: thrown off the hand as a move leaves it, left on whoever it hits ----------
function mark(ctx: CanvasRenderingContext2D, id: Power, x: number, y: number, R: number, k: number, a: string, b: string, face: number, seed: number) {
  const e = easeOut(k), fade = 1 - k, rr = R * (0.35 + e * 0.65), sc = R / 40;
  ctx.lineWidth = 3 * sc * fade + 0.5;
  ctx.strokeStyle = al(b, fade);
  switch (id) {
    case "pyro":
      // tongues of flame bursting outward
      glowDot(ctx, x, y, rr, a, 0.6 * fade);
      for (let i = 0; i < 6; i++) flame(ctx, x, y, (i / 6) * TAU + seed, rr * 0.9, 4 * sc * fade + 0.5, k * 2, i, al(i % 2 ? a : b, 0.85 * fade));
      break;
    case "cryo":
      // a snowflake of ice shards opening out
      for (let i = 0; i < 6; i++) crystal(ctx, x, y, (i / 6) * TAU + Math.PI / 6, rr, 3.5 * sc, al(b, 0.75 * fade), al(a, fade), 1 * sc);
      break;
    case "electro":
      // forked bolts jumping out from the point
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * TAU + hh(seed + i) * 0.6;
        zig(ctx, { x, y }, { x: x + Math.cos(ang) * rr * 1.1, y: y + Math.sin(ang) * rr * 1.1 }, 4, 5 * sc, seed * 10 + i + Math.floor(k * 12));
        ctx.stroke();
      }
      glowDot(ctx, x, y, rr * 0.5, b, 0.7 * fade);
      break;
    case "terra":
      // chips of stone flung off
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + hh(seed + i), d = rr * (0.6 + hh(seed + i * 2) * 0.5);
        rock(ctx, x + Math.cos(ang) * d, y + Math.sin(ang) * d + e * e * 10 * sc, 4.5 * sc * (0.6 + fade * 0.4), seed + i, k * 4);
        ctx.fillStyle = al(a, fade);
        ctx.fill();
        ctx.stroke();
      }
      break;
    case "aero":
      // three gusts curling round the point
      for (let i = 0; i < 3; i++) {
        const a0 = (i / 3) * TAU + e * 2.4 * face;
        ctx.beginPath();
        ctx.arc(x, y, rr * (0.6 + i * 0.2), a0, a0 + 1.6);
        ctx.stroke();
      }
      break;
    case "hydro":
      // a splash: a ring and drops thrown up and out
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * 0.4, 0, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 7; i++) {
        const ang = -Math.PI / 2 + (i - 3) * 0.4;
        const d = rr * (0.8 + hh(seed + i) * 0.4);
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d + e * e * 14 * sc, 2.4 * sc * fade + 0.4, 0, TAU);
        ctx.fillStyle = al(b, fade);
        ctx.fill();
      }
      break;
    case "umbra":
      // two shadow slashes crossing and an eye closing between them
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x - rr * 0.8, y + sgn * rr * 0.8);
        ctx.quadraticCurveTo(x, y + sgn * rr * 0.2, x + rr * 0.8, y - sgn * rr * 0.8);
        ctx.stroke();
      }
      glowDot(ctx, x, y, 6 * sc * fade + 0.5, "hsl(276 100% 75%)", fade);
      break;
    case "lux":
      // a bright star and rays
      star4(ctx, x, y, rr, al(b, 0.9 * fade));
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * TAU + Math.PI / 8;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * rr * 0.5, y + Math.sin(ang) * rr * 0.5);
        ctx.lineTo(x + Math.cos(ang) * rr * 1.2, y + Math.sin(ang) * rr * 1.2);
        ctx.stroke();
      }
      break;
    case "gravi": {
      // a ring falling in on a dark point
      const ri = R * (1 - e * 0.85);
      ctx.beginPath();
      ctx.arc(x, y, ri, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, ri * 0.55, e * 4, e * 4 + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 4 * sc, 0, TAU);
      ctx.fillStyle = `hsl(260 40% 8% / ${fade})`;
      ctx.fill();
      break;
    }
    case "tele":
      // two portal frames turning against each other
      for (const [sgn, sz] of [[1, 1], [-1, 0.6]] as const) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(sgn * e * 2 + Math.PI / 4);
        ctx.strokeRect(-rr * 0.6 * sz, -rr * 0.6 * sz, rr * 1.2 * sz, rr * 1.2 * sz);
        ctx.restore();
      }
      break;
    case "vita":
      // leaves scattering in a ring
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + e;
        leaf(ctx, x + Math.cos(ang) * rr * 0.4, y + Math.sin(ang) * rr * 0.4, ang, 12 * sc, 4 * sc, al(a, 0.85 * fade), al(b, fade), 1 * sc);
      }
      break;
    case "toxi":
      // bubbles of poison rising and popping
      for (let i = 0; i < 7; i++) {
        const ang = hh(seed + i) * TAU, d = rr * hh(seed + i * 5) * 0.9;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d - e * 16 * sc, (2 + hh(seed + i * 3) * 4) * sc * (0.5 + e * 0.5), 0, TAU);
        ctx.fillStyle = al(a, 0.4 * fade);
        ctx.fill();
        ctx.stroke();
      }
      break;
    case "chrono": {
      // a clock face with its hand sweeping round
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang) * rr * 0.82, y + Math.sin(ang) * rr * 0.82);
        ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
        ctx.stroke();
      }
      const hand = -Math.PI / 2 + e * TAU;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(hand) * rr * 0.75, y + Math.sin(hand) * rr * 0.75);
      ctx.stroke();
      break;
    }
    case "magneto":
      // red and silver poles snapping apart
      for (const [sgn, c] of [[-1, "hsl(0 90% 62%)"], [1, "hsl(210 25% 88%)"]] as const) {
        ctx.beginPath();
        ctx.arc(x + sgn * rr * 0.35, y, rr * 0.55, sgn < 0 ? Math.PI / 2 : -Math.PI / 2, sgn < 0 ? Math.PI * 1.5 : Math.PI / 2);
        ctx.strokeStyle = al(c, fade);
        ctx.stroke();
      }
      break;
    case "psy":
      // ripples of thought going out
      for (let i = 0; i < 3; i++) {
        const kk = clamp(e - i * 0.15, 0, 1);
        ctx.beginPath();
        ctx.arc(x, y, R * (0.25 + kk * 0.85), 0, TAU);
        ctx.strokeStyle = al(i === 1 ? a : b, fade * (1 - i * 0.2));
        ctx.stroke();
      }
      break;
    case "shift": {
      // a shape that keeps changing how many sides it has
      const n = 3 + Math.floor(k * 5);
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const ang = (i / n) * TAU + e * 2;
        const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = `hsl(${(k * 360 + seed * 100) % 360} 90% 72% / ${fade})`;
      ctx.stroke();
      break;
    }
    case "nova":
      // a star and four small ones flung out from it
      star4(ctx, x, y, rr * 0.9, al(b, 0.9 * fade));
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * TAU + Math.PI / 4;
        star4(ctx, x + Math.cos(ang) * rr * 1.1, y + Math.sin(ang) * rr * 1.1, 5 * sc, al(a, fade));
      }
      break;
    default:
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, TAU);
      ctx.stroke();
  }
}

let moveOwner: Map<string, { id: Power; a: string; b: string }> | null = null;
function ownerOf(moveId: string) {
  if (!moveOwner) {
    moveOwner = new Map();
    for (const f of FIGHTERS) if (ROSTER_LOOK.has(f.id)) for (const m of f.moves) moveOwner.set(m.id, { id: f.id, a: f.color, b: f.glow });
  }
  return moveOwner.get(moveId);
}

/** On a hit by one of the 17 starting fighters' moves, its element's mark on top of the move's usual hit effect. */
export function drawRosterImpact(ctx: CanvasRenderingContext2D, fx: Fx) {
  if (!fx.hit) return;
  const o = ownerOf(fx.id);
  if (!o) return;
  const k = clamp(1 - fx.life / fx.max, 0, 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  mark(ctx, o.id, fx.x, fx.y, 44 * fx.size, k, fx.tint?.a ?? o.a, fx.tint?.b ?? o.b, fx.dir, fx.seed);
  ctx.restore();
}

// ---------- entrances: a floor sigil before the landing and a flourish of the element on it ----------
/** One layer of an arrival; `hit` is the moment the fighter's own entrance lands. */
type ArrivalFn = (d: IntroDraw, hit: number) => void;
type Arrival = { back?: ArrivalFn; front?: ArrivalFn };

/** A point on a circle laid flat on the floor. */
const fp = (x: number, y: number, r: number, a: number): Pt => ({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.26 });

function floorRing(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, w: number, a0 = 0, a1 = TAU) {
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.26, 0, a0, a1);
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.stroke();
}

/** How strongly the sigil shows: drawing in before the hit, flaring on it, fading after. */
const sigilK = (u: number, hit: number) => (u < hit ? easeOut(seg(u, 0, hit)) : 1 - seg(u, hit + 0.12, 0.95));
const flare = (u: number, hit: number) => clamp(1 - Math.abs(u - hit) / 0.1, 0, 1);

/** Spokes from the centre of a floor circle. */
function spokes(ctx: CanvasRenderingContext2D, x: number, y: number, r0: number, r1: number, n: number, rot: number, c: string, w: number, draw = 1) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU;
    const p0 = fp(x, y, r0, a), p1 = fp(x, y, r0 + (r1 - r0) * draw, a);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
}

const ARRIVAL: Partial<Record<Power, Arrival>> = {
  pyro: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, 70 * s * k, hsla(20, 100, 58, 0.8 * k), 3 * s);
      // a ring of flames running round the sigil
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + t * 1.5, q = fp(x, ground, 70 * s, a);
        if (i / 12 > k + 0.01) continue;
        flame(ctx, q.x, q.y, -Math.PI / 2, (12 + flare(u, hit) * 26) * s * k, 4 * s, t, i, hsla(28 + (i % 3) * 8, 100, 58, 0.7 * k));
      }
      // scorched floor after the landing
      if (u > hit) {
        const sk = 1 - seg(u, hit + 0.25, 1);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.ellipse(x, ground + 2, 48 * s, 9 * s, 0, 0, TAU);
        ctx.fillStyle = `hsl(14 40% 10% / ${0.45 * sk})`;
        ctx.fill();
      }
    },
  },
  cryo: {
    back: ({ ctx, x, ground, s, u }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a snowflake drawn on the floor, its arms branching
      ctx.globalCompositeOperation = "lighter";
      const R = 66 * s;
      spokes(ctx, x, ground, 0, R, 6, 0, hsla(195, 90, 88, 0.85 * k), 2.4 * s, k);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        for (const kk of [0.45, 0.72]) {
          if (kk > k) continue;
          const q = fp(x, ground, R * kk, a);
          for (const side of [-1, 1]) {
            const e = fp(q.x, q.y, 14 * s, a + side * 0.8);
            ctx.beginPath();
            ctx.moveTo(q.x, q.y);
            ctx.lineTo(e.x, e.y);
            ctx.stroke();
          }
        }
      }
      // frost cracks racing outward on the landing
      if (u > hit) {
        const c = easeOut(seg(u, hit, hit + 0.2)) * (1 - seg(u, hit + 0.3, 1));
        ctx.strokeStyle = hsla(190, 100, 95, 0.9 * c);
        ctx.lineWidth = 1.8 * s;
        for (let i = 0; i < 7; i++) {
          const a = hh(i) * TAU, q = fp(x, ground, 130 * s * c + 20 * s, a);
          zig(ctx, { x, y: ground }, q, 4, 6 * s, i * 5);
          ctx.stroke();
        }
      }
    },
  },
  electro: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      // a circuit sigil: a ring, a square inside it, traces running out
      floorRing(ctx, x, ground, 60 * s * k, hsla(52, 100, 70, 0.85 * k), 2.4 * s);
      floorRing(ctx, x, ground, 38 * s * k, hsla(55, 100, 85, 0.6 * k), 1.4 * s);
      spokes(ctx, x, ground, 38 * s, 84 * s, 8, Math.PI / 8, hsla(50, 100, 66, 0.7 * k), 1.6 * s, k);
      const pulse = (t * 3) % 1;
      for (let i = 0; i < 8; i++) glowDot(ctx, fp(x, ground, (38 + pulse * 46) * s, Math.PI / 8 + (i / 8) * TAU).x, fp(x, ground, (38 + pulse * 46) * s, Math.PI / 8 + (i / 8) * TAU).y, 4 * s, "hsl(55 100% 80%)", k * (1 - pulse));
    },
    front: ({ ctx, x, ground, s, u, t }, hit) => {
      // a forked bolt from the sky on the landing
      const k = clamp(1 - Math.abs(u - hit) / 0.08, 0, 1);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      const seed = Math.floor(t * 30);
      for (const [w, c] of [[9, hsla(50, 100, 60, 0.5 * k)], [3, hsla(58, 100, 92, k)]] as const) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w * s;
        zig(ctx, { x: x + 30 * s, y: 0 }, { x, y: ground - 10 * s }, 9, 22 * s, seed);
        ctx.stroke();
        zig(ctx, { x: x + 18 * s, y: ground * 0.45 }, { x: x - 60 * s, y: ground - 40 * s }, 5, 12 * s, seed + 9);
        ctx.stroke();
      }
    },
  },
  terra: {
    back: ({ ctx, x, ground, s, u }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // the floor splitting into slabs, the slabs lifting on the landing
      ctx.strokeStyle = `hsl(30 40% 18% / ${0.9 * k})`;
      ctx.lineWidth = 2.6 * s;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.3, q = fp(x, ground, 90 * s * k, a);
        zig(ctx, { x, y: ground }, q, 4, 6 * s, i * 3);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, 40 * s * k, hsla(36, 80, 60, 0.4 * k), 2 * s);
    },
    front: ({ ctx, x, ground, s, u, t }, hit) => {
      if (u < hit) return;
      const k = seg(u, hit, hit + 0.12) * (1 - seg(u, hit + 0.3, 0.95));
      if (k <= 0) return;
      for (let i = 0; i < 5; i++) {
        const side = i % 2 ? 1 : -1, d = (40 + i * 16) * s * side;
        const lift = Math.sin(seg(u, hit, hit + 0.4) * Math.PI) * (14 + i * 4) * s;
        ctx.beginPath();
        ctx.moveTo(x + d - 12 * s, ground + 2 * s);
        ctx.lineTo(x + d - 8 * s, ground - lift - 8 * s);
        ctx.lineTo(x + d + 6 * s, ground - lift - 12 * s);
        ctx.lineTo(x + d + 12 * s, ground + 2 * s);
        ctx.closePath();
        ctx.fillStyle = `hsl(28 34% ${36 + i * 2}% / ${k})`;
        ctx.fill();
        ctx.strokeStyle = `hsl(250 32% 14% / ${k})`;
        ctx.lineWidth = 2 * s;
        ctx.stroke();
      }
    },
  },
  aero: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      // a spiral on the floor, turning
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const kk = i / 60, q = fp(x, ground, 80 * s * kk * k, kk * TAU * 2.2 + t * 4);
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
      }
      ctx.strokeStyle = hsla(170, 80, 85, 0.75 * k);
      ctx.lineWidth = 2.2 * s;
      ctx.stroke();
    },
    front: ({ ctx, x, ground, s, u, t }, hit) => {
      if (u < hit - 0.1) return;
      const k = seg(u, hit - 0.1, hit + 0.05) * (1 - seg(u, hit + 0.25, 0.95));
      if (k <= 0) return;
      // rings of wind climbing round the body, a little tornado
      ctx.globalCompositeOperation = "lighter";
      for (let j = 0; j < 5; j++) {
        const y = ground - ((t * 1.5 + j / 5) % 1) * 140 * s;
        const R = (24 + (ground - y) * 0.25) * s;
        ctx.beginPath();
        ctx.ellipse(x, y, R, R * 0.22, 0, t * 8 + j, t * 8 + j + 4.2);
        ctx.strokeStyle = hsla(170, 80, 90, 0.6 * k);
        ctx.lineWidth = 2 * s;
        ctx.stroke();
      }
    },
  },
  hydro: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      // ripples spreading over the floor
      for (let j = 0; j < 4; j++) {
        const kk = (t * 0.9 + j / 4) % 1;
        floorRing(ctx, x, ground, (20 + kk * 90) * s, hsla(200, 100, 75, 0.7 * k * (1 - kk)), 2 * s);
      }
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      if (u < hit) return;
      const k = seg(u, hit, hit + 0.35);
      if (k >= 1) return;
      // a crown of water thrown up by the landing
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI + (i / 11) * Math.PI;
        const vx = Math.cos(a) * 160 * s, vy = -(180 + hh(i) * 120) * s;
        const tt = k * 0.6;
        const px = x + vx * tt, py = ground + vy * tt + 0.5 * 900 * s * tt * tt;
        if (py > ground) continue;
        glowDot(ctx, px, py, 5 * s, "hsl(196 100% 80%)", 1 - k);
      }
    },
  },
  umbra: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a pool of shadow spreading, hands of dark reaching out of it
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const a = (i / 20) * TAU, q = fp(x, ground, 80 * s * k * (1 + Math.sin(t * 3 + i * 1.3) * 0.08), a);
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
      }
      ctx.closePath();
      ctx.fillStyle = `hsl(272 45% 8% / ${0.8 * k})`;
      ctx.fill();
      ctx.strokeStyle = hsla(280, 70, 70, 0.5 * k);
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const q = fp(x, ground, (30 + hh(i) * 40) * s * k, hh(i + 3) * TAU);
        const hgt = (30 + hh(i + 7) * 40) * s * k * (u < hit ? 1 : 1 - seg(u, hit, hit + 0.3));
        if (hgt <= 1) continue;
        ctx.beginPath();
        ctx.moveTo(q.x - 4 * s, q.y);
        ctx.quadraticCurveTo(q.x + Math.sin(t * 4 + i) * 12 * s, q.y - hgt * 0.6, q.x + Math.sin(t * 3 + i) * 6 * s, q.y - hgt);
        ctx.quadraticCurveTo(q.x + 4 * s, q.y - hgt * 0.5, q.x + 4 * s, q.y);
        ctx.fillStyle = `hsl(272 45% 8% / ${0.9 * k})`;
        ctx.fill();
      }
    },
  },
  lux: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, 56 * s * k, hsla(50, 100, 80, 0.9 * k), 2.6 * s);
      spokes(ctx, x, ground, 62 * s, 96 * s, 16, t * 0.5, hsla(50, 100, 86, 0.6 * k), 2 * s, k);
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      // a beam of light from the sky that the fighter lands in
      const k = seg(u, hit - 0.2, hit) * (1 - seg(u, hit, hit + 0.35));
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      const w = 34 * s * (0.4 + k * 0.6);
      const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
      g.addColorStop(0, "hsl(50 100% 80% / 0)");
      g.addColorStop(0.5, `hsl(52 100% 92% / ${0.75 * k})`);
      g.addColorStop(1, "hsl(50 100% 80% / 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - w, 0, w * 2, ground);
    },
  },
  gravi: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      if (u > 0.98) return;
      ctx.globalCompositeOperation = "lighter";
      if (u < hit) {
        // rings collapsing inward, pulling the fighter down
        for (let j = 0; j < 4; j++) {
          const kk = (t * 1.4 + j / 4) % 1;
          floorRing(ctx, x, ground, (110 - kk * 100) * s, hsla(250, 90, 80, 0.7 * kk), 2.2 * s);
        }
      } else {
        // a crater dent and a ring flung out
        const k = seg(u, hit, hit + 0.4);
        floorRing(ctx, x, ground, (30 + easeOut(k) * 140) * s, hsla(250, 90, 80, 0.8 * (1 - k)), 3 * s);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.ellipse(x, ground + 2, 54 * s, 10 * s, 0, 0, TAU);
        ctx.fillStyle = `hsl(245 40% 10% / ${0.5 * (1 - seg(u, hit + 0.3, 1))})`;
        ctx.fill();
      }
    },
  },
  tele: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a portal ring on the floor and its twin above, closing on each other
      ctx.globalCompositeOperation = "lighter";
      const top = ground - 150 * s * (1 - seg(u, 0, hit));
      for (const y of [ground, top]) {
        ctx.beginPath();
        ctx.ellipse(x, y, 46 * s * k, 12 * s * k, 0, 0, TAU);
        ctx.strokeStyle = hsla(305, 100, 80, 0.9 * k);
        ctx.lineWidth = 3 * s;
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, y, 34 * s * k, 8 * s * k, 0, t * 6, t * 6 + 4);
        ctx.strokeStyle = hsla(312, 90, 65, 0.8 * k);
        ctx.lineWidth = 2 * s;
        ctx.stroke();
      }
    },
  },
  vita: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a flower unfolding on the floor
      const open = easeOut(seg(u, 0, hit + 0.1));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + t * 0.3;
        const q = fp(x, ground, 30 * s * open, a), e = fp(x, ground, 72 * s * open, a);
        ctx.beginPath();
        ctx.moveTo(x, ground);
        ctx.quadraticCurveTo(q.x + Math.cos(a + 1.2) * 18 * s, q.y, e.x, e.y);
        ctx.quadraticCurveTo(q.x + Math.cos(a - 1.2) * 18 * s, q.y, x, ground);
        ctx.fillStyle = i % 2 ? `hsl(330 80% 76% / ${0.6 * k})` : `hsl(120 55% 55% / ${0.6 * k})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, x, ground, 22 * s * k, "hsl(80 100% 80%)", 0.7 * k);
    },
  },
  toxi: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a bubbling puddle of venom
      ctx.beginPath();
      ctx.ellipse(x, ground + 1, 66 * s * k, 13 * s * k, 0, 0, TAU);
      ctx.fillStyle = `hsl(86 70% 30% / ${0.7 * k})`;
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      drift(9, t, 1.4, 97, (i, kk, r1, r2) => {
        const q = fp(x, ground, r1 * 58 * s * k, r2 * TAU);
        ctx.beginPath();
        ctx.arc(q.x, q.y - kk * 10 * s, (2 + kk * 5) * s, Math.PI, TAU);
        ctx.strokeStyle = hsla(80, 100, 70, 0.8 * k * (1 - kk));
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
      });
    },
  },
  chrono: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a clock face on the floor, its hand sweeping fast and stopping dead on the landing
      ctx.globalCompositeOperation = "lighter";
      const R = 70 * s * k;
      floorRing(ctx, x, ground, R, hsla(42, 100, 70, 0.85 * k), 2.4 * s);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU, p0 = fp(x, ground, R * 0.82, a), p1 = fp(x, ground, R, a);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = hsla(42, 100, 76, 0.8 * k);
        ctx.lineWidth = (i % 3 ? 1.2 : 2.4) * s;
        ctx.stroke();
      }
      const sweep = u < hit ? u * 40 : hit * 40;
      const e = fp(x, ground, R * 0.9, sweep - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(x, ground);
      ctx.lineTo(e.x, e.y);
      ctx.strokeStyle = hsla(45, 100, 85, 0.95 * k);
      ctx.lineWidth = 2.6 * s;
      ctx.stroke();
    },
  },
  magneto: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // two poles on the floor and the field arcing between them over the fighter
      ctx.globalCompositeOperation = "lighter";
      for (const [side, c] of [[-1, hsla(0, 90, 60, 0.9 * k)], [1, hsla(210, 30, 90, 0.9 * k)]] as const) glowDot(ctx, x + side * 70 * s, ground, 14 * s, c, 1);
      for (let j = 1; j <= 4; j++) {
        const hgt = (30 + j * 30) * s * k;
        ctx.beginPath();
        ctx.ellipse(x, ground, 70 * s, hgt, 0, Math.PI, TAU);
        ctx.strokeStyle = hsla(210, 60, 85, (0.55 - j * 0.1) * k);
        ctx.lineWidth = 1.6 * s;
        ctx.setLineDash([6 * s, 6 * s]);
        ctx.lineDashOffset = -t * 60;
        ctx.stroke();
      }
      ctx.setLineDash([]);
    },
  },
  psy: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      for (let j = 0; j < 3; j++) {
        const kk = (t * 1.2 + j / 3) % 1;
        floorRing(ctx, x, ground, (20 + kk * 80) * s, hsla(320, 100, 80, 0.7 * k * (1 - kk)), 2 * s);
      }
    },
    front: ({ ctx, x, y, ground, s, u }, hit) => {
      // an eye opening above where the head will be, then closing as the fighter arrives
      const k = Math.sin(seg(u, hit - 0.25, hit + 0.25) * Math.PI);
      if (k <= 0.01) return;
      const ex = x, ey = ground - 150 * s;
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, ex, ey, 40 * s * k, "hsl(320 100% 75%)", 0.6);
      ctx.beginPath();
      ctx.moveTo(ex - 26 * s, ey);
      ctx.quadraticCurveTo(ex, ey - 18 * s * k, ex + 26 * s, ey);
      ctx.quadraticCurveTo(ex, ey + 18 * s * k, ex - 26 * s, ey);
      ctx.strokeStyle = `hsl(320 100% 88% / ${k})`;
      ctx.lineWidth = 2.4 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex, ey, 6 * s * k, 0, TAU);
      ctx.fillStyle = `hsl(330 90% 70% / ${k})`;
      ctx.fill();
    },
  },
  shift: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a puddle that keeps changing shape, rainbow at the edge
      ctx.beginPath();
      const sides = 3 + ((Math.sin(t * 3) + 1) / 2) * 4;
      for (let i = 0; i <= 30; i++) {
        const a = (i / 30) * TAU;
        const kk = Math.cos(Math.PI / sides) / Math.cos((a % (TAU / sides)) - Math.PI / sides);
        const q = fp(x, ground, 64 * s * k * Math.min(1.3, kk), a + t);
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
      }
      ctx.closePath();
      ctx.fillStyle = `hsl(186 70% 40% / ${0.5 * k})`;
      ctx.fill();
      ctx.strokeStyle = `hsl(${(t * 200) % 360} 90% 75% / ${0.9 * k})`;
      ctx.lineWidth = 2.4 * s;
      ctx.stroke();
    },
  },
  nova: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a constellation drawing itself into a star on the floor
      ctx.globalCompositeOperation = "lighter";
      const pts: Pt[] = [];
      for (let i = 0; i < 5; i++) pts.push(fp(x, ground, 72 * s, -Math.PI / 2 + (i * 2 * TAU) / 5));
      ctx.beginPath();
      for (let i = 0; i <= 5; i++) {
        if (i / 5 > k + 0.01) break;
        const q = pts[i % 5];
        i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
      }
      ctx.strokeStyle = hsla(318, 100, 82, 0.85 * k);
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();
      for (const q of pts) star4(ctx, q.x, q.y, (6 + Math.sin(t * 8) * 1.5) * s * k, hsla(300, 100, 92, k));
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      if (u < hit) return;
      const k = seg(u, hit, hit + 0.3);
      if (k >= 1) return;
      ctx.globalCompositeOperation = "lighter";
      star4(ctx, x, ground - 60 * s, 120 * s * easeOut(k), `hsl(318 100% 86% / ${0.8 * (1 - k)})`);
    },
  },
};

/** The extra arrival layer for a starting fighter, or nothing. */
export function arrivalOf(id: Power): Arrival | undefined {
  return ARRIVAL[id];
}

// Shared with the quest fighters' looks (quest-looks.ts), so both draw their elements the same way.
export { glowDot, flame, crystal, zig, rock, leaf, star4, drift, floorRing, sigilK, flare, spokes, fp, hh, al, hsla, clamp, seg, easeOut, mid };
export type { Arrival };
