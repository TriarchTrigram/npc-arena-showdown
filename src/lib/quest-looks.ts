// The quest fighters' (Quest 1 to 13) second layer: drawn by the engine around their designs in quest-designs.ts.
// - drawQuestLook: what each one now wears on top of its design ("back" behind the body, "front" over it) and what
//   drifts off it at rest.
//   Parallax: a mantle of folded-space panes full of stars, a grid halo, his head seen twice a little out of step.
//   Hexizon: a ragged hood with a neon rim, a string of bone beads, pixels rising off him and a glitch now and then.
//   Halflife: a radiation trefoil turning behind him, a coolant tube down his back, a hazard-striped shoulder plate,
//   Geiger clicks flashing round him. Redline: speed lines that stretch as he runs, little gold wings on his heels,
//   static on his forearm. Liminal: a cloak that is a door onto the void, a gold key circling the head, small doors
//   blinking open round it. Overtone: an amp on his back cabled to the headphones, notes drifting off, belt lights
//   and a ring on the floor on every beat. Vellum: talisman strips at the hip, a folded paper collar, scraps drifting.
//   Facet: crystal pauldrons, a fan of split light, shards circling the waist and glints. Sirocco: a layered desert
//   cloak fraying into grains, a dust devil at his feet, gold bangles. Past Riftmaker: a broken halo of reality shards,
//   tears opening in the air, a rift glowing on the chest. Argent: a pool of mercury underfoot, chrome beads circling
//   the waist, liquid spikes off the shoulder. Crucible: coat tails, the four element signs circling him, a flask at
//   the belt and gold flakes falling. Nadir: a short cape of his father's night sky with a gold hem, and motes of
//   light that fall upward off him.
// - drawQuestCharge: the power gathering in the hand as a move winds up, and the fighter's own mark thrown off as it leaves.
// - drawQuestImpact: the same mark left on whoever a quest fighter's move hits.
// - questArrivalOf: an extra layer on each entrance (spawn-intros.ts): a sign on the floor before the landing and a
//   flourish of the power on it.
import { QUESTERS, type Power } from "./fighters";
import type { BossRig } from "./boss-designs";
import type { QuestPaint } from "./quest-designs";
import type { Fx } from "./move-looks";
import {
  glowDot, crystal, zig, leaf, star4, drift, floorRing, sigilK, flare, spokes, fp, hh, al, hsla, clamp, seg, easeOut, mid,
  type Arrival,
} from "./roster-looks";

type Pt = { x: number; y: number };
const TAU = Math.PI * 2;
const HEAD = 11;
const INK = "hsl(250 32% 14%)";
const GOLD = "hsl(44 95% 62%)";
const PAPER = "hsl(42 35% 92%)";

export const QUEST_LOOK = new Set<Power>(["spatio", "hexizon", "gamma", "velo", "portal", "sono", "paper", "crys", "sand", "pastrift", "merc", "alch", "nadir"]);

// ---------- helpers ----------
function poly(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n: number, rot: number, sy = 1) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * sy;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

/** A polygon laid flat on the floor, drawn only `draw` (0..1) of the way round. */
function flatPoly(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n: number, rot: number, draw: number) {
  ctx.beginPath();
  if (draw <= 0) return;
  const total = n * draw, p0 = fp(x, y, r, rot);
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i <= Math.ceil(total); i++) {
    const a0 = fp(x, y, r, rot + ((i - 1) / n) * TAU), a1 = fp(x, y, r, rot + (i / n) * TAU), k = Math.min(1, total - (i - 1));
    ctx.lineTo(a0.x + (a1.x - a0.x) * k, a0.y + (a1.y - a0.y) * k);
  }
}

/** The radiation sign: three blades between two radii. */
function trefoil(ctx: CanvasRenderingContext2D, x: number, y: number, r0: number, r1: number, rot: number, sy = 1) {
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const a0 = rot + (i / 3) * TAU - Math.PI / 6, a1 = a0 + Math.PI / 3;
    for (let j = 0; j <= 8; j++) {
      const a = a0 + ((a1 - a0) * j) / 8, px = x + Math.cos(a) * r1, py = y + Math.sin(a) * r1 * sy;
      j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    for (let j = 8; j >= 0; j--) {
      const a = a0 + ((a1 - a0) * j) / 8;
      ctx.lineTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * sy);
    }
    ctx.closePath();
  }
}

function wireCube(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, rot: number, c: string, lw: number) {
  const ox = Math.cos(rot * 0.7) * sz * 0.45, oy = -sz * 0.35;
  const sq = (cx: number, cy: number) => [0, 1, 2, 3].map((i) => ({ x: cx + Math.cos(rot + Math.PI / 4 + (i * Math.PI) / 2) * sz * 0.7, y: cy + Math.sin(rot + Math.PI / 4 + (i * Math.PI) / 2) * sz * 0.7 }));
  const f = sq(x - ox / 2, y - oy / 2), b = sq(x + ox / 2, y + oy / 2);
  ctx.strokeStyle = c;
  ctx.lineWidth = lw;
  ctx.beginPath();
  for (const ring of [f, b]) {
    ring.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
  }
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(f[i].x, f[i].y);
    ctx.lineTo(b[i].x, b[i].y);
  }
  ctx.stroke();
}

function note(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, c: string) {
  ctx.fillStyle = c;
  ctx.strokeStyle = c;
  ctx.lineWidth = sz * 0.22;
  ctx.beginPath();
  ctx.ellipse(x, y, sz * 0.42, sz * 0.3, -0.4, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + sz * 0.38, y);
  ctx.lineTo(x + sz * 0.38, y - sz * 1.3);
  ctx.quadraticCurveTo(x + sz * 0.95, y - sz * 1.0, x + sz * 0.8, y - sz * 0.55);
  ctx.stroke();
}

function chromeBead(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number, tint: string) {
  if (rad <= 0) return;
  const g = ctx.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.1, x, y, rad);
  g.addColorStop(0, "hsl(0 0% 100%)");
  g.addColorStop(0.5, "hsl(210 10% 74%)");
  g.addColorStop(1, "hsl(214 14% 38%)");
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = al(tint, 0.6);
  ctx.lineWidth = rad * 0.25;
  ctx.stroke();
}

/** A jagged tear in the air from (x, y - L) to (x, y + L), `w` wide at its middle. */
function riftLens(ctx: CanvasRenderingContext2D, x: number, y: number, L: number, w: number, seed: number, edge: string, inner: string, a: number, lw: number) {
  const n = 5;
  ctx.beginPath();
  ctx.moveTo(x, y - L);
  for (let i = 1; i < n; i++) {
    const k = i / n, ww = Math.sin(k * Math.PI) * w;
    ctx.lineTo(x + ww + (hh(seed + i) - 0.5) * w * 0.8, y - L + 2 * L * k);
  }
  ctx.lineTo(x, y + L);
  for (let i = n - 1; i > 0; i--) {
    const k = i / n, ww = Math.sin(k * Math.PI) * w;
    ctx.lineTo(x - ww + (hh(seed + i + 9) - 0.5) * w * 0.8, y - L + 2 * L * k);
  }
  ctx.closePath();
  ctx.fillStyle = al(inner, a);
  ctx.fill();
  ctx.strokeStyle = al(edge, a);
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** The four alchemical element signs: fire, water, air, earth. */
function elementGlyph(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, kind: number, c: string, lw: number) {
  const d = kind % 2 === 0 ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(x, y + d * R);
  ctx.lineTo(x + R * 0.87, y - d * R * 0.5);
  ctx.lineTo(x - R * 0.87, y - d * R * 0.5);
  ctx.closePath();
  if (kind >= 2) {
    ctx.moveTo(x - R * 0.75, y);
    ctx.lineTo(x + R * 0.75, y);
  }
  ctx.strokeStyle = c;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** Facet's shards circling the waist; the far half is drawn behind him. */
function facetShards(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, p: QuestPaint, near: boolean) {
  if (!alive) return;
  for (let i = 0; i < 3; i++) {
    const a = t * 1.1 + (i * TAU) / 3;
    if (Math.sin(a) > 0 !== near) continue;
    const x = r.hip.x + Math.cos(a) * 22 * s, y = r.hip.y + 2 * s + Math.sin(a) * 6 * s;
    crystal(ctx, x, y, -Math.PI / 2 + Math.sin(t * 2 + i) * 0.3, (near ? 11 : 9) * s, 2.6 * s, al(p.glow, near ? 0.85 : 0.55), p.a, 1 * s);
  }
}

function argentRing(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, p: QuestPaint, near: boolean) {
  if (!alive) return;
  for (let i = 0; i < 6; i++) {
    const a = t * 1.3 + (i * TAU) / 6;
    if (Math.sin(a) > 0 !== near) continue;
    const x = r.hip.x + Math.cos(a) * 22 * s, y = r.hip.y - 2 * s + Math.sin(a) * 6 * s + Math.sin(t * 3 + i) * 1.5 * s;
    chromeBead(ctx, x, y, (near ? 3 : 2.3) * s, p.glow);
  }
}

function alchSigils(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, p: QuestPaint, near: boolean) {
  if (!alive) return;
  const c = mid(r.neck, r.hip, 0.45);
  for (let i = 0; i < 4; i++) {
    const a = t * 0.7 + (i * TAU) / 4;
    if (Math.sin(a) > 0 !== near) continue;
    const x = c.x + Math.cos(a) * 32 * s, y = c.y + Math.sin(a) * 9 * s;
    elementGlyph(ctx, x, y, (near ? 5.5 : 4.5) * s, i, al(i === 0 ? p.glow : GOLD, near ? 0.95 : 0.55), 1.5 * s);
  }
}

// ---------- the looks ----------
type LookFn = (ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, vx: number, p: QuestPaint) => void;
type Look = { back?: LookFn; front?: LookFn };

const LOOKS: Partial<Record<Power, Look>> = {
  spatio: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, S = r.shoulder, sp = Math.min(1, Math.abs(vx) / 300);
      // a mantle of folded space: three angular panes hanging behind him, each a window full of stars
      for (let i = 2; i >= 0; i--) {
        const sw = Math.sin(t * 1.3 + i * 0.9) * 3 * s + back * sp * 14 * s;
        const t1 = { x: S.x + back * (2 + i * 3) * s, y: S.y + i * 2 * s };
        const t2 = { x: S.x + back * (8 + i * 4) * s, y: S.y + (1 + i * 3) * s };
        const b1 = { x: r.hip.x + back * (14 + i * 8) * s + sw, y: r.hip.y + (18 - i * 5) * s };
        const b2 = { x: r.hip.x + back * (4 + i * 6) * s + sw * 0.6, y: r.hip.y + (8 - i * 4) * s };
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.closePath();
        ctx.fillStyle = alive ? p.a : INK;
        ctx.fill();
        ctx.strokeStyle = alive ? al(p.glow, 0.85 - i * 0.2) : INK;
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
        if (!alive) continue;
        for (let j = 0; j < 3; j++) {
          const q = mid(mid(t1, b1, 0.2 + hh(i * 9 + j) * 0.7), mid(t2, b2, 0.2 + hh(i * 9 + j) * 0.7), hh(i * 5 + j + 2));
          star4(ctx, q.x, q.y, (1.6 + hh(j + i) * 1.4) * s, al(p.glow, 0.5 + 0.5 * Math.sin(t * 3 + j + i * 2)));
        }
      }
      if (!alive) return;
      // a halo of grid lines turning behind the head
      const h = r.head, cx = h.x + back * 3 * s, cy = h.y - 2 * s;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = al(p.glow, 0.45);
      ctx.lineWidth = 1.2 * s;
      for (const R of [17, 23]) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * s, 0, TAU);
        ctx.stroke();
      }
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = t * 0.4 + (i / 8) * TAU;
        ctx.moveTo(cx + Math.cos(a) * 17 * s, cy + Math.sin(a) * 17 * s);
        ctx.lineTo(cx + Math.cos(a) * 23 * s, cy + Math.sin(a) * 23 * s);
      }
      ctx.stroke();
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      const h = r.head, off = (2.5 + Math.sin(t * 1.7) * 1.5) * s;
      ctx.globalCompositeOperation = "lighter";
      // the parallax: his head seen twice, a little out of step
      ctx.lineWidth = 1.6 * s;
      ctx.strokeStyle = al(p.glow, 0.45);
      ctx.beginPath();
      ctx.arc(h.x - face * off, h.y - off * 0.4, HEAD * s, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = hsla(300, 100, 70, 0.32);
      ctx.beginPath();
      ctx.arc(h.x + face * off, h.y + off * 0.4, HEAD * s, 0, TAU);
      ctx.stroke();
      // panes of space drifting up off the shoulders
      drift(4, t, 0.3, 11, (i, k, r1, r2) => {
        const x = r.shoulder.x + (r1 - 0.5) * 30 * s - face * k * 16 * s, y = r.shoulder.y + r2 * 10 * s - k * 46 * s;
        const w = (4 + r2 * 4) * s;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * (0.6 + r2) + i);
        ctx.strokeStyle = al(p.glow, 0.7 * Math.sin(k * Math.PI));
        ctx.lineWidth = 1.2 * s;
        ctx.strokeRect(-w / 2, -w / 2, w, w);
        ctx.restore();
      });
    },
  },
  hexizon: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head, back = -face, sp = Math.min(1, Math.abs(vx) / 300);
      // a ragged hood: the head sits in it, its point falling behind
      const tipX = h.x + back * (17 + sp * 8) * s, tipY = h.y + (10 - sp * 4) * s + Math.sin(t * 3) * 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(h.x + face * 7 * s, h.y - 12.5 * s);
      ctx.quadraticCurveTo(h.x + back * 10 * s, h.y - 19 * s, tipX, tipY);
      ctx.lineTo(h.x + back * 11 * s, tipY + 3 * s);
      ctx.lineTo(h.x + back * 8 * s, tipY - 1 * s);
      ctx.lineTo(r.neck.x + back * 4 * s, r.neck.y + 3 * s);
      ctx.lineTo(r.neck.x + face * 5 * s, r.neck.y + 1 * s);
      ctx.quadraticCurveTo(h.x + face * 16 * s, h.y, h.x + face * 7 * s, h.y - 12.5 * s);
      ctx.closePath();
      ctx.fillStyle = alive ? p.a : INK;
      ctx.fill();
      ctx.strokeStyle = alive ? p.glow : INK;
      ctx.lineWidth = 1.6 * s;
      ctx.stroke();
      if (!alive) return;
      // pixels rising off him and blinking out
      ctx.globalCompositeOperation = "lighter";
      const q = 3 * s;
      drift(7, t, 0.45, 23, (i, k, r1, r2) => {
        if (Math.floor(k * 8 + r2 * 3) % 3 === 0) return;
        const x = Math.round((r.hip.x + (r1 - 0.5) * 44 * s) / q) * q, y = Math.round((r.hip.y + 10 * s - k * 72 * s) / q) * q;
        ctx.fillStyle = al(i % 3 ? p.glow : p.b, 0.85 * (1 - k));
        ctx.fillRect(x, y, q, q);
      });
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // a string of bone beads round the neck
      const n = r.neck;
      for (let i = 0; i < 5; i++) {
        const k = i / 4 - 0.5, x = n.x + k * 11 * s + face * s, y = n.y + 2 * s + (0.25 - k * k) * 10 * s;
        ctx.beginPath();
        ctx.ellipse(x, y, 2.2 * s, 1.6 * s, k, 0, TAU);
        ctx.fillStyle = alive ? "hsl(48 30% 88%)" : INK;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1 * s;
        ctx.stroke();
      }
      if (!alive) return;
      // now and then a glitch: the head slips sideways in slices
      if ((t * 0.73) % 1 < 0.07) {
        const seed = Math.floor(t * 40);
        ctx.globalCompositeOperation = "lighter";
        for (let j = 0; j < 3; j++) {
          const y = r.head.y - 10 * s + hh(seed + j) * 20 * s, dx = (hh(seed + j + 5) - 0.5) * 14 * s;
          ctx.fillStyle = j % 2 ? hsla(300, 100, 65, 0.5) : al(p.glow, 0.6);
          ctx.fillRect(r.head.x - 13 * s + dx, y, 26 * s, 2.5 * s);
        }
      }
    },
  },
  gamma: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, S = r.shoulder;
      if (alive) {
        // the radiation sign turning slowly behind his shoulders
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        trefoil(ctx, S.x + back * 5 * s, S.y + 2 * s, 6 * s, 27 * s, t * 0.5);
        ctx.fillStyle = al(p.glow, 0.16 + 0.06 * Math.sin(t * 2.6));
        ctx.fill();
        ctx.restore();
      }
      // a coolant tube from shoulder blade to hip, the glowing fluid running down it
      const a = { x: S.x + back * 7 * s, y: S.y + 1 * s }, b = { x: r.hip.x + back * 7 * s, y: r.hip.y - 1 * s };
      const c = { x: (a.x + b.x) / 2 + back * 9 * s, y: (a.y + b.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(c.x, c.y, b.x, b.y);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5 * s;
      ctx.stroke();
      ctx.strokeStyle = alive ? al(p.glow, 0.9) : "hsl(100 10% 30%)";
      ctx.lineWidth = 2.4 * s;
      ctx.setLineDash([3 * s, 4 * s]);
      ctx.lineDashOffset = -t * 30 * s;
      ctx.stroke();
      ctx.setLineDash([]);
      for (const q of [a, b]) {
        ctx.beginPath();
        ctx.arc(q.x, q.y, 3 * s, 0, TAU);
        ctx.fillStyle = "hsl(90 8% 34%)";
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
      }
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // a lead shoulder plate with hazard stripes
      const S = r.shoulder, x = S.x - face * 1 * s, y = S.y - 1 * s;
      const plate = () => {
        ctx.beginPath();
        ctx.ellipse(x, y, 9 * s, 6 * s, face * 0.25, Math.PI, TAU);
        ctx.closePath();
      };
      ctx.save();
      plate();
      ctx.fillStyle = alive ? "hsl(50 95% 52%)" : "hsl(50 10% 40%)";
      ctx.fill();
      ctx.clip();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.2 * s;
      ctx.beginPath();
      for (let i = -3; i <= 3; i++) {
        ctx.moveTo(x + i * 5 * s - 6 * s, y + 4 * s);
        ctx.lineTo(x + i * 5 * s + 4 * s, y - 8 * s);
      }
      ctx.stroke();
      ctx.restore();
      plate();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6 * s;
      ctx.stroke();
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      // Geiger clicks: tiny flashes popping round him
      const seed = Math.floor(t * 9), k = (t * 9) % 1;
      for (let i = 0; i < 2; i++) {
        const a = hh(seed * 3 + i) * TAU, R = (18 + hh(seed + i * 7) * 22) * s;
        star4(ctx, r.hip.x + Math.cos(a) * R, r.neck.y + 10 * s + Math.sin(a) * R, 5 * s * (1 - k), al(p.glow, 0.9 * (1 - k)));
      }
      // radiation shimmering up off the shoulders
      drift(4, t, 0.35, 31, (i, kk, r1) => glowDot(ctx, S.x + (r1 - 0.5) * 22 * s, S.y - kk * 40 * s, (3 + kk * 8) * s, p.glow, 0.25 * (1 - kk)));
    },
  },
  velo: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      const back = -face, sp = Math.min(1, Math.abs(vx) / 400);
      ctx.globalCompositeOperation = "lighter";
      // speed lines streaming off him: short at rest, long at a run
      const ys = [r.head.y, r.neck.y + 6 * s, r.hip.y - 6 * s, r.hip.y + 6 * s, (r.kF.y + r.kB.y) / 2];
      for (const [i, y] of ys.entries()) {
        const fl = 0.6 + 0.4 * Math.sin(t * 23 + i * 2.1);
        const L = (10 + sp * 70) * s * fl, x0 = r.hip.x + back * (8 + (i % 2) * 4) * s;
        ctx.strokeStyle = i % 2 ? al(p.glow, 0.55) : hsla(356, 90, 60, 0.5);
        ctx.lineWidth = (2.2 - i * 0.2) * s;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + back * L, y);
        ctx.stroke();
      }
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // a little gold wing on each heel
      const flap = Math.sin(t * 14) * 0.15;
      for (const f of [r.fB, r.fF]) {
        for (let j = 0; j < 3; j++) {
          const spread = 0.4 + j * 0.35 + flap;
          const ang = face < 0 ? -spread : Math.PI + spread;
          leaf(ctx, f.x - face * 2 * s, f.y - 3 * s, ang, (11 - j * 2.5) * s, 2.6 * s, alive ? (j ? "hsl(48 100% 86%)" : p.glow) : INK, INK, 1 * s);
        }
      }
      if (!alive) return;
      // static crackling along the front forearm
      const seed = Math.floor(t * 14);
      if (hh(seed) < 0.6) {
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = al(p.glow, 0.9);
        ctx.lineWidth = 1.4 * s;
        zig(ctx, r.eF, r.hF, 4, 3 * s, seed);
        ctx.stroke();
      }
    },
  },
  portal: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, S = r.shoulder, sp = Math.min(1, Math.abs(vx) / 300);
      const sw = Math.sin(t * 1.4) * 4 * s + back * sp * 16 * s;
      // a cloak that is a door onto the void
      const L = { x: S.x + back * 4 * s, y: S.y - 1 * s }, R = { x: S.x - back * 3 * s, y: S.y - 2 * s };
      const bl = { x: r.hip.x + back * (20 + sp * 10) * s + sw, y: (r.kB.y + r.fB.y) / 2 + 6 * s };
      const br = { x: r.hip.x + back * 4 * s + sw * 0.5, y: (r.kF.y + r.fF.y) / 2 + 4 * s };
      ctx.beginPath();
      ctx.moveTo(R.x, R.y);
      ctx.lineTo(L.x, L.y);
      ctx.quadraticCurveTo(L.x + back * 12 * s, (L.y + bl.y) / 2, bl.x, bl.y);
      ctx.quadraticCurveTo((bl.x + br.x) / 2, bl.y + 6 * s * Math.sin(t * 2), br.x, br.y);
      ctx.quadraticCurveTo(r.hip.x, r.hip.y, R.x, R.y);
      ctx.closePath();
      const grd = ctx.createLinearGradient(S.x, S.y, bl.x, bl.y);
      grd.addColorStop(0, alive ? p.a : INK);
      grd.addColorStop(1, alive ? "hsl(262 60% 6%)" : INK);
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.strokeStyle = alive ? al(p.glow, 0.85) : INK;
      ctx.lineWidth = 1.6 * s;
      ctx.stroke();
      if (!alive) return;
      // stars inside it
      ctx.save();
      ctx.clip();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 9; i++) {
        const q = mid(mid(L, bl, hh(i)), mid(R, br, hh(i)), hh(i + 3));
        const tw = 0.5 + 0.5 * Math.sin(t * 2.5 + i * 1.7);
        star4(ctx, q.x + Math.sin(t * 0.5 + i) * 2 * s, q.y, (1.5 + hh(i + 7) * 2.5) * s, i % 3 ? hsla(0, 0, 100, 0.8 * tw) : al(p.glow, 0.9 * tw));
      }
      ctx.restore();
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      // a small gold key circling the head
      const h = r.head, a = t * 1.6;
      ctx.save();
      ctx.translate(h.x + Math.cos(a) * 22 * s, h.y - 4 * s + Math.sin(a) * 7 * s);
      ctx.rotate(Math.sin(t * 2) * 0.4);
      ctx.strokeStyle = "hsl(45 95% 64%)";
      ctx.lineWidth = 1.8 * s;
      ctx.beginPath();
      ctx.arc(-4 * s, 0, 2.6 * s, 0, TAU);
      ctx.moveTo(-1.4 * s, 0);
      ctx.lineTo(6 * s, 0);
      ctx.moveTo(4 * s, 0);
      ctx.lineTo(4 * s, 2.6 * s);
      ctx.moveTo(6 * s, 0);
      ctx.lineTo(6 * s, 2 * s);
      ctx.stroke();
      ctx.restore();
      // little doors blinking open and shut around it
      drift(3, t, 0.28, 41, (i, k, r1, r2) => {
        const o = Math.sin(k * Math.PI);
        if (o < 0.05) return;
        const x = r.hip.x + (r1 - 0.5) * 80 * s, y = r.neck.y + (r2 - 0.3) * 50 * s;
        ctx.beginPath();
        ctx.ellipse(x, y, 3.5 * s * o, 8 * s * o, 0, 0, TAU);
        ctx.fillStyle = "hsl(262 60% 6% / 0.85)";
        ctx.fill();
        ctx.strokeStyle = al(p.glow, 0.9 * o);
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
      });
    },
  },
  sono: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, S = r.shoulder, beat = Math.pow(Math.max(0, Math.sin(t * 7.5)), 8);
      const px = S.x + back * 9 * s, py = S.y + 8 * s;
      // a cable from the headphones down to the amp on his back
      ctx.beginPath();
      ctx.moveTo(r.head.x + back * 9 * s, r.head.y + 4 * s);
      ctx.bezierCurveTo(r.head.x + back * 18 * s, r.head.y + 16 * s, px + back * 10 * s, py - 14 * s, px, py - 7 * s);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      // the amp: one speaker that thumps on the beat
      ctx.beginPath();
      ctx.roundRect(px - 7 * s, py - 9 * s, 14 * s, 18 * s, 3 * s);
      ctx.fillStyle = "hsl(220 12% 20%)";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py + 2 * s, (4.2 + beat * 1.2) * s, 0, TAU);
      ctx.fillStyle = "hsl(220 10% 10%)";
      ctx.fill();
      ctx.strokeStyle = alive ? al(p.glow, 0.8) : INK;
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
      if (!alive) return;
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, px, py - 6 * s, 2.5 * s, p.glow, 0.5 + beat * 0.5);
      // notes floating off behind him
      drift(4, t, 0.32, 51, (i, k, r1, r2) =>
        note(ctx, px + back * (6 + k * 34) * s + Math.sin(k * 8 + i) * 3 * s, py - 10 * s - k * 50 * s, (5 + r2 * 2) * s, al(i % 2 ? p.glow : p.b, 0.9 * Math.sin(k * Math.PI))),
      );
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // three lights on the belt stepping along with the beat
      const beats = (t * 7.5) / TAU, step = ((Math.floor(beats) % 3) + 3) % 3;
      for (let i = 0; i < 3; i++) {
        const x = r.hip.x + (i - 1) * 4.5 * s + face * s, y = r.hip.y - 2 * s, on = alive && i === step;
        ctx.beginPath();
        ctx.arc(x, y, 1.8 * s, 0, TAU);
        ctx.fillStyle = on ? p.glow : "hsl(220 10% 26%)";
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1 * s;
        ctx.stroke();
        if (on) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          glowDot(ctx, x, y, 6 * s, p.glow, 0.6);
          ctx.restore();
        }
      }
      if (!alive) return;
      // a ring rippling out along the floor on every beat
      const k = beats - Math.floor(beats), fy = Math.max(r.fF.y, r.fB.y) + 1 * s;
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, (r.fF.x + r.fB.x) / 2, fy, (10 + k * 34) * s, al(p.glow, 0.5 * (1 - k)), 1.8 * s);
    },
  },
  paper: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, sp = Math.min(1, Math.abs(vx) / 300);
      // talisman strips hanging from the hip and fluttering back
      for (let i = 0; i < 3; i++) {
        const x0 = r.hip.x + back * (2 + i * 4) * s, y0 = r.hip.y + 1 * s;
        const ang = Math.PI / 2 - back * (0.25 + i * 0.22 + sp * 0.7 + Math.sin(t * 2.4 + i * 1.3) * 0.12);
        const L = (18 - i * 3) * s, w = 3.4 * s;
        ctx.save();
        ctx.translate(x0, y0);
        ctx.rotate(ang - Math.PI / 2);
        ctx.fillStyle = alive ? p.a : INK;
        ctx.fillRect(-w / 2, 0, w, L);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1 * s;
        ctx.strokeRect(-w / 2, 0, w, L);
        ctx.fillStyle = alive ? p.glow : INK;
        ctx.fillRect(-w * 0.22, L * 0.3, w * 0.44, L * 0.4);
        ctx.restore();
      }
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // a folded paper collar standing up round the neck
      const n = r.neck;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y + 3 * s);
        ctx.lineTo(n.x + side * 9 * s, n.y - 4 * s);
        ctx.lineTo(n.x + side * 4 * s, n.y + 5 * s);
        ctx.closePath();
        ctx.fillStyle = alive ? (side === face ? p.a : "hsl(40 25% 76%)") : INK;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
      }
      if (!alive) return;
      // scraps of paper drifting down and back
      drift(4, t, 0.22, 61, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 40 * s - face * k * 30 * s, y = r.neck.y - 20 * s + k * 70 * s;
        ctx.save();
        ctx.translate(x + Math.sin(k * 9 + i) * 5 * s, y);
        ctx.rotate(k * 6 + i);
        ctx.scale(1, Math.cos(k * 7 + i));
        ctx.globalAlpha = Math.sin(k * Math.PI) * 0.9;
        ctx.fillStyle = p.a;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(-3 * s, -3 * s);
        ctx.lineTo(4 * s, -2 * s);
        ctx.lineTo(-1 * s, 4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    },
  },
  crys: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const S = r.shoulder, back = -face;
      if (alive) {
        // a slow fan of split light behind him
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.9);
        for (let i = 0; i < 6; i++) {
          const ang = back > 0 ? -0.7 + i * 0.22 : Math.PI + 0.7 - i * 0.22;
          ctx.strokeStyle = hsla(i * 55, 100, 70, 0.2 * pulse);
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.moveTo(S.x, S.y + 6 * s);
          ctx.lineTo(S.x + Math.cos(ang) * 62 * s, S.y + 6 * s + Math.sin(ang) * 62 * s);
          ctx.stroke();
        }
        ctx.restore();
      }
      facetShards(ctx, r, s, t, alive, p, false);
      // crystal pauldrons: a cluster on the shoulder
      const cl: [number, number, number][] = [[-3, -1.95, 13], [1, -1.5, 17], [5, -1.1, 11]];
      for (const [i, [off, ang, len]] of cl.entries()) {
        const a = face > 0 ? Math.PI - ang : ang;
        crystal(ctx, S.x - off * face * s, S.y - 1 * s, a, len * s, 3.4 * s, alive ? (i === 1 ? al(p.glow, 0.9) : al(p.a, 0.95)) : INK, INK, 1.2 * s);
      }
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      facetShards(ctx, r, s, t, alive, p, true);
      if (!alive) return;
      // a glint running over him now and then
      ctx.globalCompositeOperation = "lighter";
      const seed = Math.floor(t * 2.2), k = (t * 2.2) % 1;
      const pts = [r.head, r.shoulder, r.hF, r.hB, r.hip];
      const q = pts[Math.floor(hh(seed) * pts.length)];
      star4(ctx, q.x + (hh(seed + 1) - 0.5) * 10 * s, q.y + (hh(seed + 2) - 0.5) * 10 * s, 9 * s * Math.sin(k * Math.PI), hsla(0, 0, 100, 0.95));
    },
  },
  sand: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, S = r.shoulder, sp = Math.min(1, Math.abs(vx) / 300);
      const sw = Math.sin(t * 2) * 3 * s + back * sp * 14 * s;
      // a layered desert cloak, its edge fraying into grains
      for (let l = 0; l < 2; l++) {
        const tip = { x: r.hip.x + back * (16 + l * 8 + sp * 10) * s + sw, y: r.hip.y + (14 - l * 8) * s };
        ctx.beginPath();
        ctx.moveTo(S.x - back * 2 * s, S.y - 1 * s);
        ctx.quadraticCurveTo(S.x + back * (10 + l * 4) * s, S.y + 4 * s, tip.x, tip.y);
        ctx.quadraticCurveTo(r.hip.x + back * 4 * s, r.hip.y + 2 * s, r.hip.x, r.hip.y - 4 * s);
        ctx.closePath();
        ctx.fillStyle = alive ? (l ? "hsl(30 40% 44%)" : "hsl(36 46% 54%)") : INK;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
        if (alive) {
          drift(5, t, 0.9, 71 + l * 10, (i, k, r1) => {
            ctx.fillStyle = hsla(34, 50, 60, 0.9 * (1 - k));
            ctx.fillRect(tip.x + back * k * 26 * s, tip.y - k * 10 * s + (r1 - 0.5) * 12 * s, 1.8 * s, 1.8 * s);
          });
        }
      }
      if (!alive) return;
      // a small dust devil turning round his feet
      const fx = (r.fF.x + r.fB.x) / 2, fy = Math.max(r.fF.y, r.fB.y);
      ctx.strokeStyle = hsla(34, 45, 62, 0.45);
      ctx.lineWidth = 1.4 * s;
      for (let i = 0; i < 4; i++) {
        const R = (10 + i * 5) * s, a0 = t * (5 - i) + i;
        ctx.beginPath();
        ctx.ellipse(fx, fy - i * 6 * s, R, R * 0.26, 0, a0, a0 + 3.4);
        ctx.stroke();
      }
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // a gold bangle on each forearm
      for (const [e, h] of [[r.eB, r.hB], [r.eF, r.hF]] as const) {
        const q = mid(e, h, 0.68), ang = Math.atan2(h.y - e.y, h.x - e.x);
        ctx.beginPath();
        ctx.ellipse(q.x, q.y, 1.8 * s, 4.2 * s, ang, 0, TAU);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 3.4 * s;
        ctx.stroke();
        ctx.strokeStyle = alive ? "hsl(44 90% 58%)" : INK;
        ctx.lineWidth = 1.8 * s;
        ctx.stroke();
      }
      if (!alive) return;
      // grains streaming past him on the wind
      drift(10, t, 0.8, 81, (i, k, r1, r2) => {
        const x = r.hip.x + face * 26 * s - face * k * 70 * s, y = r.neck.y - 6 * s + r1 * 50 * s + Math.sin(k * 6 + i) * 3 * s;
        ctx.fillStyle = hsla(30 + r2 * 12, 55, 62, 0.8 * Math.sin(k * Math.PI));
        ctx.fillRect(x, y, 1.8 * s, 1.8 * s);
      });
    },
  },
  pastrift: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const h = r.head, cx = h.x - face * 3 * s, cy = h.y - 2 * s;
      // a broken halo: shards of torn reality turning behind the head
      for (let i = 0; i < 7; i++) {
        const a = t * 0.6 + (i / 7) * TAU, R = (20 + Math.sin(t * 3 + i) * 1.5) * s;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 6 * s, y + Math.sin(a) * 6 * s);
        ctx.lineTo(x + Math.cos(a + 1.6) * 3 * s, y + Math.sin(a + 1.6) * 3 * s);
        ctx.lineTo(x - Math.cos(a) * 3 * s, y - Math.sin(a) * 3 * s);
        ctx.lineTo(x + Math.cos(a - 1.6) * 2.4 * s, y + Math.sin(a - 1.6) * 2.4 * s);
        ctx.closePath();
        ctx.fillStyle = alive ? (i % 2 ? p.a : "hsl(270 60% 18%)") : INK;
        ctx.fill();
        ctx.strokeStyle = alive ? p.glow : INK;
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
      }
      if (!alive) return;
      // tears opening and closing in the air beside him, stars inside
      drift(2, t, 0.22, 91, (i, k, r1, r2) => {
        const o = Math.sin(k * Math.PI);
        if (o < 0.05) return;
        const x = r.hip.x + (i ? 1 : -1) * (28 + r1 * 14) * s, y = r.neck.y + (r2 - 0.4) * 40 * s;
        riftLens(ctx, x, y, 16 * s, 4.5 * s * o, i * 13, p.glow, "hsl(270 70% 6%)", o, 1.4 * s);
        star4(ctx, x, y + Math.sin(t * 3 + i) * 5 * s, 2.2 * s * o, al(p.glow, o));
      });
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      // a rift glowing down the chest, stars leaking out of it
      const a = mid(r.neck, r.hip, 0.2), b = mid(r.neck, r.hip, 0.75), m = mid(a, b);
      const pulse = 0.6 + 0.4 * Math.sin(t * 4);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = al(p.glow, 0.9 * pulse);
      ctx.lineWidth = 1.8 * s;
      zig(ctx, { x: a.x + face * 2 * s, y: a.y }, { x: b.x + face * 2 * s, y: b.y }, 4, 2.5 * s, 17);
      ctx.stroke();
      glowDot(ctx, m.x, m.y, 10 * s, p.glow, 0.3 * pulse);
      drift(3, t, 0.5, 97, (i, k, r1) => star4(ctx, m.x + face * (4 + k * 20) * s, m.y + (r1 - 0.5) * 16 * s - k * 8 * s, 3 * s * (1 - k), al(p.glow, 0.9 * (1 - k))));
    },
  },
  merc: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      // a pool of mercury under his feet, rippling
      const fx = (r.fF.x + r.fB.x) / 2, fy = Math.max(r.fF.y, r.fB.y) + 1 * s;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 22 * s, 4.5 * s, 0, 0, TAU);
      const g = ctx.createLinearGradient(fx, fy - 4 * s, fx, fy + 4 * s);
      g.addColorStop(0, "hsl(210 10% 86%)");
      g.addColorStop(1, "hsl(214 12% 40%)");
      ctx.fillStyle = alive ? g : INK;
      ctx.fill();
      if (alive) {
        const k = (((t * 0.8) % 1) + 1) % 1;
        ctx.strokeStyle = hsla(0, 0, 100, 0.6 * (1 - k));
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 22 * s * k, 4.5 * s * k, 0, 0, TAU);
        ctx.stroke();
      }
      argentRing(ctx, r, s, t, alive, p, false);
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // liquid spikes rising off the shoulder, never quite the same length twice
      const S = r.shoulder;
      for (let i = 0; i < 3; i++) {
        const ang = -Math.PI / 2 - face * (0.5 + i * 0.35), len = (8 + i * 2 + Math.sin(t * 2.2 + i * 1.9) * 3) * s;
        const bx = S.x - face * (i * 3 - 2) * s, by = S.y - 1 * s, nx = -Math.sin(ang), ny = Math.cos(ang), w = 2.6 * s;
        ctx.beginPath();
        ctx.moveTo(bx + nx * w, by + ny * w);
        ctx.quadraticCurveTo(bx + Math.cos(ang) * len * 0.5 + nx * w * 0.4, by + Math.sin(ang) * len * 0.5 + ny * w * 0.4, bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
        ctx.quadraticCurveTo(bx + Math.cos(ang) * len * 0.5 - nx * w * 0.4, by + Math.sin(ang) * len * 0.5 - ny * w * 0.4, bx - nx * w, by - ny * w);
        ctx.closePath();
        ctx.fillStyle = alive ? "hsl(210 12% 82%)" : INK;
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1 * s;
        ctx.stroke();
      }
      argentRing(ctx, r, s, t, alive, p, true);
    },
  },
  alch: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, sp = Math.min(1, Math.abs(vx) / 300);
      // two coat tails trimmed in gold
      for (let i = 0; i < 2; i++) {
        const sw = Math.sin(t * 1.8 + i) * 2 * s + back * sp * 12 * s;
        const x0 = r.hip.x + back * (1 + i * 3) * s, y0 = r.hip.y - 4 * s;
        const tip = { x: x0 + back * (10 + i * 5) * s + sw, y: r.hip.y + (24 - i * 3) * s };
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 + back * 6 * s, (y0 + tip.y) / 2, tip.x, tip.y);
        ctx.lineTo(tip.x - back * 5 * s, tip.y - 3 * s);
        ctx.quadraticCurveTo(x0 - back * 1 * s, (y0 + tip.y) / 2, x0 - back * 3 * s, y0);
        ctx.closePath();
        ctx.fillStyle = alive ? "hsl(16 45% 22%)" : INK;
        ctx.fill();
        ctx.strokeStyle = alive ? p.a : INK;
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
      }
      alchSigils(ctx, r, s, t, alive, p, false);
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      // a little flask at the belt, red liquid sloshing in it
      const x = r.hip.x + face * 5 * s, y = r.hip.y + 5 * s;
      const bulb = () => {
        ctx.beginPath();
        ctx.arc(x, y, 3.6 * s, 0, TAU);
      };
      bulb();
      ctx.fillStyle = "hsl(200 30% 85% / 0.6)";
      ctx.fill();
      ctx.save();
      bulb();
      ctx.clip();
      ctx.fillStyle = alive ? p.glow : INK;
      ctx.fillRect(x - 4 * s, y + Math.sin(t * 3) * 0.8 * s - 0.5 * s, 8 * s, 6 * s);
      ctx.restore();
      bulb();
      ctx.moveTo(x - 1.2 * s, y - 3.4 * s);
      ctx.lineTo(x - 1.2 * s, y - 6 * s);
      ctx.lineTo(x + 1.2 * s, y - 6 * s);
      ctx.lineTo(x + 1.2 * s, y - 3.4 * s);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
      alchSigils(ctx, r, s, t, alive, p, true);
      if (!alive) return;
      // flakes of gold falling off him
      ctx.globalCompositeOperation = "lighter";
      drift(5, t, 0.3, 111, (i, k, r1) => {
        ctx.save();
        ctx.translate(r.shoulder.x + (r1 - 0.5) * 30 * s + Math.sin(k * 8 + i) * 3 * s, r.shoulder.y + k * 60 * s);
        ctx.rotate(k * 7 + i);
        ctx.fillStyle = hsla(44, 95, 62, 0.9 * Math.sin(k * Math.PI));
        ctx.fillRect(-1.4 * s, -1.4 * s, 2.8 * s, 2.8 * s);
        ctx.restore();
      });
    },
  },
  nadir: {
    back: (ctx, r, s, face, t, alive, vx, p) => {
      const back = -face, sp = Math.min(1, Math.abs(vx) / 300);
      // a short cape cut from his father's night sky, hemmed in gold
      const S = r.shoulder, sw = Math.sin(t * 1.2) * 2 * s + back * sp * 14 * s;
      const tipA = { x: S.x + back * 10 * s + sw, y: r.hip.y + 10 * s };
      const tipB = { x: S.x + back * 20 * s + sw * 1.3, y: r.hip.y + 4 * s };
      ctx.beginPath();
      ctx.moveTo(S.x - back * 2 * s, S.y - 1 * s);
      ctx.quadraticCurveTo(S.x + back * 6 * s, (S.y + tipA.y) / 2, tipA.x, tipA.y);
      ctx.lineTo(tipB.x, tipB.y);
      ctx.quadraticCurveTo(S.x + back * 12 * s, (S.y + tipB.y) / 2, S.x + back * 4 * s, S.y - 2 * s);
      ctx.closePath();
      ctx.fillStyle = alive ? (p.nightmare ? "hsl(250 30% 6%)" : "hsl(236 45% 14%)") : INK;
      ctx.fill();
      ctx.strokeStyle = alive ? (p.nightmare ? p.glow : GOLD) : INK;
      ctx.lineWidth = 1.3 * s;
      ctx.stroke();
      if (!alive) return;
      // a few stars inside the cape, twinkling
      for (let i = 0; i < 4; i++) {
        const k = 0.25 + i * 0.18, x = S.x + (tipA.x - S.x) * k + back * (3 + hh(i) * 6) * s, y = S.y + (tipA.y - S.y) * k;
        star4(ctx, x, y, (1.4 + Math.max(0, Math.sin(t * 2.4 + i * 1.7)) * 1.4) * s, "hsl(48 60% 92%)");
      }
    },
    front: (ctx, r, s, face, t, alive, vx, p) => {
      if (!alive) return;
      // motes of light falling up off him, the wrong way, like everything about his power
      ctx.globalCompositeOperation = "lighter";
      drift(6, t, 0.35, 313, (i, k, r1) => {
        const x = r.hip.x + (r1 - 0.5) * 28 * s + Math.sin(k * 6 + i) * 2 * s, y = r.fB.y - k * 80 * s;
        glowDot(ctx, x, y, 2.4 * s, p.nightmare ? p.glow : GOLD, 0.8 * Math.sin(k * Math.PI));
      });
    },
  },
};

/** Draw a quest fighter's new look in one layer. "back" goes under its design, "front" over it. */
export function drawQuestLook(ctx: CanvasRenderingContext2D, id: Power, layer: "back" | "front", r: BossRig, s: number, face: number, t: number, alive: boolean, vx: number, p: QuestPaint) {
  const fn = LOOKS[id]?.[layer];
  if (!fn) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  fn(ctx, r, s, face, t, alive, vx, p);
  ctx.restore();
}

// ---------- each fighter's mark: thrown off the hand as a move leaves it, left on whoever it hits ----------
function mark(ctx: CanvasRenderingContext2D, id: Power, x: number, y: number, R: number, k: number, a: string, b: string, face: number, seed: number) {
  const e = easeOut(k), fade = 1 - k, rr = R * (0.35 + e * 0.65), sc = R / 40;
  ctx.lineWidth = 3 * sc * fade + 0.5;
  switch (id) {
    case "spatio": {
      // a pane of space folding out, four small panes flung from its corners
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4 + e * 0.6);
      ctx.strokeStyle = al(b, fade);
      ctx.strokeRect(-rr * 0.7, -rr * 0.7, rr * 1.4, rr * 1.4);
      ctx.restore();
      for (let i = 0; i < 4; i++) {
        const ang = Math.PI / 4 + (i * Math.PI) / 2;
        ctx.save();
        ctx.translate(x + Math.cos(ang) * rr * 1.1, y + Math.sin(ang) * rr * 1.1);
        ctx.rotate(e * 4 + i);
        ctx.strokeStyle = al(b, fade);
        ctx.lineWidth = 1.4 * sc;
        ctx.strokeRect(-4 * sc, -4 * sc, 8 * sc, 8 * sc);
        ctx.restore();
      }
      break;
    }
    case "hexizon": {
      // a ring of pixels and a blocky plus
      const q = 4 * sc;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * TAU;
        ctx.fillStyle = al(i % 2 ? b : "hsl(300 100% 66%)", fade);
        ctx.fillRect(Math.round((x + Math.cos(ang) * rr) / q) * q - q / 2, Math.round((y + Math.sin(ang) * rr) / q) * q - q / 2, q, q);
      }
      const w = 6 * sc * fade;
      ctx.fillStyle = al(b, fade);
      ctx.fillRect(x - w * 2, y - w / 2, w * 4, w);
      ctx.fillRect(x - w / 2, y - w * 2, w, w * 4);
      break;
    }
    case "gamma": {
      trefoil(ctx, x, y, rr * 0.2, rr, seed + e * 1.5);
      ctx.fillStyle = al(b, 0.35 * fade);
      ctx.fill();
      ctx.strokeStyle = al(b, fade);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, rr * 1.15, 0, TAU);
      ctx.stroke();
      break;
    }
    case "velo": {
      // chevrons racing on ahead
      for (let i = 0; i < 3; i++) {
        const cx = x + face * (i * 10 + e * 30) * sc, w = (10 - i * 2) * sc;
        ctx.strokeStyle = al(i % 2 ? "hsl(356 90% 62%)" : b, fade);
        ctx.beginPath();
        ctx.moveTo(cx - face * w, y - w);
        ctx.lineTo(cx, y);
        ctx.lineTo(cx - face * w, y + w);
        ctx.stroke();
      }
      break;
    }
    case "portal": {
      ctx.strokeStyle = al(b, fade);
      ctx.beginPath();
      ctx.ellipse(x, y, rr * 0.45, rr, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = al(b, 0.6 * fade);
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * 0.3, e * 2, 0, TAU);
      ctx.stroke();
      break;
    }
    case "sono": {
      for (let i = 0; i < 3; i++) {
        const R2 = rr * (0.5 + i * 0.3), a0 = face > 0 ? -0.8 : Math.PI - 0.8;
        ctx.strokeStyle = al(b, fade * (1 - i * 0.25));
        ctx.beginPath();
        ctx.arc(x, y, R2, a0, a0 + 1.6);
        ctx.stroke();
      }
      ctx.strokeStyle = al(b, 0.3 * fade);
      ctx.beginPath();
      ctx.arc(x, y, rr * 1.2, 0, TAU);
      ctx.stroke();
      break;
    }
    case "paper": {
      // a red seal stamped, scraps of paper flung from it
      ctx.strokeStyle = hsla(352, 85, 55, fade);
      ctx.beginPath();
      ctx.arc(x, y, rr * 0.5, 0, TAU);
      ctx.stroke();
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha *= fade;
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + seed;
        ctx.save();
        ctx.translate(x + Math.cos(ang) * rr * 1.1, y + Math.sin(ang) * rr * 1.1);
        ctx.rotate(e * 6 + i);
        ctx.fillStyle = PAPER;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 0.8 * sc;
        ctx.beginPath();
        ctx.moveTo(-4 * sc, -3 * sc);
        ctx.lineTo(4 * sc, -2 * sc);
        ctx.lineTo(0, 4 * sc);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      break;
    }
    case "crys": {
      poly(ctx, x, y, rr * 0.7, 6, e);
      ctx.strokeStyle = al(b, fade);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + seed;
        crystal(ctx, x + Math.cos(ang) * rr * 0.8, y + Math.sin(ang) * rr * 0.8, ang, 10 * sc * fade + 1, 2.6 * sc, hsla(i * 60, 100, 75, 0.8 * fade), al(b, fade), 1 * sc);
      }
      break;
    }
    case "sand": {
      for (let i = 0; i < 18; i++) {
        const ang = hh(seed + i) * TAU, d = rr * (0.4 + hh(seed + i + 3) * 0.9);
        ctx.fillStyle = hsla(30 + hh(i) * 12, 60, 64, fade);
        ctx.fillRect(x + Math.cos(ang) * d, y + Math.sin(ang) * d * 0.7 + k * k * 10 * sc, 2.4 * sc, 2.4 * sc);
      }
      ctx.strokeStyle = hsla(34, 50, 62, 0.5 * fade);
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * 0.5, 0, 0, TAU);
      ctx.stroke();
      break;
    }
    case "pastrift": {
      ctx.strokeStyle = al(b, fade);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + seed;
        zig(ctx, { x: x + Math.cos(ang) * rr * 0.3, y: y + Math.sin(ang) * rr * 0.3 }, { x: x + Math.cos(ang) * rr, y: y + Math.sin(ang) * rr }, 3, 4 * sc, Math.floor(seed * 10) + i);
        ctx.stroke();
      }
      star4(ctx, x, y, 12 * sc * fade, al(a, fade));
      break;
    }
    case "merc": {
      // a crown of chrome droplets
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha *= fade;
      for (let i = 0; i < 8; i++) {
        const ang = -Math.PI / 2 + (i / 7 - 0.5) * 2.4;
        chromeBead(ctx, x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.8 + k * k * 20 * sc, 3 * sc * (1 - k * 0.4), b);
      }
      ctx.restore();
      ctx.strokeStyle = al(b, 0.7 * fade);
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * 0.3, 0, 0, TAU);
      ctx.stroke();
      break;
    }
    case "nadir": {
      // half a halo, lit, and the other half only dotted in
      ctx.strokeStyle = al(GOLD, fade);
      ctx.beginPath();
      ctx.arc(x, y, rr, -Math.PI + e * 1.2, e * 1.2);
      ctx.stroke();
      ctx.setLineDash([3 * sc, 5 * sc]);
      ctx.strokeStyle = al(b, 0.6 * fade);
      ctx.beginPath();
      ctx.arc(x, y, rr, e * 1.2, Math.PI + e * 1.2);
      ctx.stroke();
      ctx.setLineDash([]);
      glowDot(ctx, x, y, rr * 0.4, b, 0.6 * fade);
      break;
    }
    case "alch": {
      ctx.strokeStyle = hsla(44, 95, 62, fade);
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, TAU);
      ctx.stroke();
      poly(ctx, x, y, rr, 3, -Math.PI / 2 + e);
      ctx.stroke();
      poly(ctx, x, y, rr * 0.5, 4, Math.PI / 4 - e);
      ctx.strokeStyle = al(b, fade);
      ctx.stroke();
      break;
    }
  }
}

// ---------- the power gathering in the hand ----------
type ChargeFn = (ctx: CanvasRenderingContext2D, h: Pt, s: number, t: number, k: number, a: string, b: string, face: number) => void;

const CHARGES: Partial<Record<Power, ChargeFn>> = {
  spatio: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 18 * s * k, b, 0.6);
    // a pane of space folding itself into a cube, lines of perspective pulling in to it
    wireCube(ctx, h.x, h.y, 10 * s * k, t * 2.5, al(b, 0.95), 1.6 * s);
    ctx.strokeStyle = al(b, 0.5 * k);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * TAU + t * 0.5, R = (34 - k * 10) * s;
      ctx.moveTo(h.x + Math.cos(ang) * R, h.y + Math.sin(ang) * R);
      ctx.lineTo(h.x + Math.cos(ang) * R * 0.45, h.y + Math.sin(ang) * R * 0.45);
    }
    ctx.stroke();
  },
  hexizon: (ctx, h, s, t, k, a, b) => {
    const q = 3 * s;
    glowDot(ctx, h.x, h.y, 16 * s * k, b, 0.6);
    // pixels flying in and snapping into a block
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * TAU + hh(i) * 0.6, R = (6 + (1 - k) * 26 + hh(i + 3) * 6) * s;
      ctx.fillStyle = al(i % 3 ? b : "hsl(300 100% 66%)", 0.9);
      ctx.fillRect(Math.round((h.x + Math.cos(ang) * R) / q) * q - q / 2, Math.round((h.y + Math.sin(ang) * R) / q) * q - q / 2, q, q);
    }
    const w = 8 * s * k;
    ctx.fillStyle = al(b, 0.9);
    ctx.fillRect(h.x - w / 2, h.y - w / 2, w, w);
    const g = Math.floor(t * 20);
    if (g % 3 === 0) {
      ctx.fillStyle = hsla(300, 100, 65, 0.5 * k);
      ctx.fillRect(h.x - 14 * s, h.y - 1 * s + (hh(g) - 0.5) * 10 * s, 28 * s, 2 * s);
    }
  },
  gamma: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 20 * s * k, b, 0.8);
    glowDot(ctx, h.x, h.y, 5 * s * k, "hsl(60 100% 92%)", 1);
    // three electrons on their orbits round a hot nucleus
    for (let i = 0; i < 3; i++) {
      const rot = (i * Math.PI) / 3 + t * 0.8, R = 15 * s * k;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, R, R * 0.35, rot, 0, TAU);
      ctx.strokeStyle = al(b, 0.6);
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
      const e = t * 9 + i * 2, ex = Math.cos(e) * R, ey = Math.sin(e) * R * 0.35;
      glowDot(ctx, h.x + ex * Math.cos(rot) - ey * Math.sin(rot), h.y + ex * Math.sin(rot) + ey * Math.cos(rot), 4 * s, b, 1);
    }
  },
  velo: (ctx, h, s, t, k, a, b, face) => {
    glowDot(ctx, h.x, h.y, 16 * s * k, b, 0.7);
    // air spiralling into the fist, speed lines streaming back off it
    for (let j = 0; j < 2; j++) {
      const a0 = -t * 16 + j * Math.PI;
      ctx.beginPath();
      ctx.arc(h.x, h.y, (9 + j * 4) * s * k, a0, a0 + 2.4);
      ctx.strokeStyle = al(j ? "hsl(356 90% 62%)" : b, 0.85);
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    const seed = Math.floor(t * 20);
    for (let i = 0; i < 5; i++) {
      const y = h.y + (i - 2) * 4 * s, L = (14 + hh(i + seed) * 22) * s * k;
      ctx.strokeStyle = al(i % 2 ? "hsl(356 90% 62%)" : b, 0.7);
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.moveTo(h.x - face * 6 * s, y);
      ctx.lineTo(h.x - face * (6 * s + L), y);
      ctx.stroke();
    }
  },
  portal: (ctx, h, s, t, k, a, b, face) => {
    // a little door spinning open in the palm, sparks drawn into it
    const cx = h.x + face * 3 * s, rx = 5 * s * k, ry = 11 * s * k, rot = Math.sin(t * 3) * 0.3;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.ellipse(cx, h.y, rx, ry, rot, 0, TAU);
    ctx.fillStyle = "hsl(262 60% 6% / 0.9)";
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(cx, h.y, rx, ry, rot, 0, TAU);
    ctx.strokeStyle = al(b, 0.95);
    ctx.lineWidth = 2 * s;
    ctx.stroke();
    glowDot(ctx, cx, h.y, 18 * s * k, b, 0.45);
    drift(6, t, 2.2, 131, (i, kk, r1) => {
      const ang = r1 * TAU + kk * 3, R = (1 - kk) * 26 * s;
      glowDot(ctx, cx + Math.cos(ang) * R, h.y + Math.sin(ang) * R, 2.4 * s, b, kk * k);
    });
  },
  sono: (ctx, h, s, t, k, a, b, face) => {
    glowDot(ctx, h.x, h.y, 14 * s * k, b, 0.6);
    // rings of sound closing in on the fist, a waveform across it
    for (let j = 0; j < 3; j++) {
      const kk = (t * 2.5 + j / 3) % 1, a0 = face > 0 ? -0.9 : Math.PI - 0.9;
      ctx.beginPath();
      ctx.arc(h.x, h.y, (26 * (1 - kk) + 4) * s, a0, a0 + 1.8);
      ctx.strokeStyle = al(b, 0.8 * kk * k);
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const x = h.x - 12 * s + i * 2 * s, y = h.y + Math.sin(i * 1.3 + t * 30) * 5 * s * k * Math.sin((i / 12) * Math.PI);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = hsla(0, 0, 100, 0.85);
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
  },
  paper: (ctx, h, s, t, k, a, b) => {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    // strips of paper winding in and folding into a four-point star
    for (let i = 0; i < 4; i++) {
      const ang = t * 5 + (i * TAU) / 4, R = (8 + (1 - k) * 20) * s;
      ctx.save();
      ctx.translate(h.x + Math.cos(ang) * R, h.y + Math.sin(ang) * R);
      ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = PAPER;
      ctx.fillRect(-1.5 * s, -5 * s, 3 * s, 10 * s);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 0.8 * s;
      ctx.strokeRect(-1.5 * s, -5 * s, 3 * s, 10 * s);
      ctx.restore();
    }
    ctx.translate(h.x, h.y);
    ctx.rotate(t * 6);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * TAU, rr = (i % 2 ? 2.6 : 9) * s * k;
      i ? ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr) : ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    }
    ctx.closePath();
    ctx.fillStyle = PAPER;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1 * s;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 2 * s * k, 0, TAU);
    ctx.fillStyle = b;
    ctx.fill();
    ctx.restore();
  },
  crys: (ctx, h, s, t, k, a, b) => {
    glowDot(ctx, h.x, h.y, 18 * s * k, b, 0.6);
    // a cut gem growing in the hand, splitting the light round it
    const R = 9 * s * k;
    ctx.lineWidth = 1.4 * s;
    for (let i = 0; i < 6; i++) {
      const ang = t * 0.8 + (i / 6) * TAU;
      ctx.strokeStyle = hsla(i * 60, 100, 70, 0.45 * k);
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(h.x + Math.cos(ang) * R * 3.2, h.y + Math.sin(ang) * R * 3.2);
      ctx.stroke();
    }
    poly(ctx, h.x, h.y, R, 6, t * 1.5);
    ctx.fillStyle = al(b, 0.5);
    ctx.fill();
    ctx.strokeStyle = al(b, 1);
    ctx.lineWidth = 1.6 * s;
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i += 2) {
      const ang = t * 1.5 + (i / 6) * TAU;
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(h.x + Math.cos(ang) * R, h.y + Math.sin(ang) * R);
    }
    ctx.strokeStyle = hsla(0, 0, 100, 0.8);
    ctx.lineWidth = 1 * s;
    ctx.stroke();
  },
  sand: (ctx, h, s, t, k, a, b) => {
    // a small whirlwind of sand turning over the hand
    ctx.lineWidth = 1.6 * s;
    ctx.strokeStyle = hsla(34, 60, 64, 0.75);
    for (let i = 0; i < 5; i++) {
      const R = (4 + i * 3) * s * k, a0 = t * (9 - i) + i;
      ctx.beginPath();
      ctx.ellipse(h.x, h.y - i * 3.5 * s * k, R, R * 0.3, 0, a0, a0 + 4);
      ctx.stroke();
    }
    drift(10, t, 1.6, 151, (i, kk, r1) => {
      const ang = r1 * TAU + kk * 8, R = (6 + kk * 14) * s * k;
      ctx.fillStyle = i % 3 ? hsla(36, 60, 66, 0.9 * (1 - kk)) : al(b, 0.9 * (1 - kk));
      ctx.fillRect(h.x + Math.cos(ang) * R, h.y - kk * 16 * s + Math.sin(ang) * R * 0.3, 1.8 * s, 1.8 * s);
    });
    glowDot(ctx, h.x, h.y, 12 * s * k, b, 0.4);
  },
  pastrift: (ctx, h, s, t, k, a, b) => {
    // reality tearing open in the palm, stars spilling out
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    riftLens(ctx, h.x, h.y, 14 * s * k, 5 * s * k, Math.floor(t * 12), b, "hsl(270 70% 6%)", 1, 1.6 * s);
    ctx.restore();
    glowDot(ctx, h.x, h.y, 20 * s * k, a, 0.4);
    drift(5, t, 1.4, 161, (i, kk, r1) => star4(ctx, h.x + (r1 - 0.5) * 24 * s * kk, h.y + (hh(i + 2) - 0.5) * 30 * s * kk, 3.4 * s * (1 - kk), al(b, k * (1 - kk))));
  },
  merc: (ctx, h, s, t, k, a, b) => {
    // a blob of liquid chrome that cannot settle on one shape
    const R = 7 * s * k;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const ang = (i / 24) * TAU, sp = Math.pow(Math.max(0, Math.sin(ang * 4 + t * 6)), 6);
      const rr = R * (1 + 0.25 * Math.sin(ang * 3 + t * 5)) + sp * 7 * s * k;
      const x = h.x + Math.cos(ang) * rr, y = h.y + Math.sin(ang) * rr;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(h.x - R * 0.4, h.y - R * 0.4, 0, h.x, h.y, R * 1.8 + 0.1);
    g.addColorStop(0, "hsl(0 0% 100%)");
    g.addColorStop(0.5, "hsl(210 10% 76%)");
    g.addColorStop(1, "hsl(214 14% 36%)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = al(b, 0.8);
    ctx.lineWidth = 1.2 * s;
    ctx.stroke();
    ctx.restore();
    glowDot(ctx, h.x, h.y, 16 * s * k, b, 0.35);
  },
  alch: (ctx, h, s, t, k, a, b) => {
    // a transmutation circle drawing itself round the hand
    const R = 14 * s * k;
    ctx.lineWidth = 1.4 * s;
    ctx.strokeStyle = al(GOLD, 0.9);
    ctx.beginPath();
    ctx.arc(h.x, h.y, R, 0, TAU);
    ctx.stroke();
    poly(ctx, h.x, h.y, R * 0.72, 3, t * 2 - Math.PI / 2);
    ctx.stroke();
    poly(ctx, h.x, h.y, R * 0.72, 3, -t * 2 + Math.PI / 2);
    ctx.strokeStyle = al(b, 0.8);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const ang = -t + (i / 8) * TAU;
      glowDot(ctx, h.x + Math.cos(ang) * R * 1.18, h.y + Math.sin(ang) * R * 1.18, 2.2 * s, GOLD, 0.9);
    }
    glowDot(ctx, h.x, h.y, 10 * s * k, b, 0.7);
  },
  nadir: (ctx, h, s, t, k, a, b) => {
    // something gathers in his hand, but it never settles on one shape: the sides keep changing as it grows
    const R = 13 * s * k, sides = 3 + (Math.floor(t * 7) % 5);
    glowDot(ctx, h.x, h.y, 18 * s * k, a, 0.4);
    poly(ctx, h.x, h.y, R, sides, t * 3);
    ctx.strokeStyle = al(GOLD, 0.9);
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(h.x, h.y, R * 1.35, -t * 2, -t * 2 + Math.PI);
    ctx.strokeStyle = al(b, 0.8);
    ctx.stroke();
    glowDot(ctx, h.x, h.y, 7 * s * k, "hsl(48 60% 94%)", 0.9);
  },
};

/**
 * A quest fighter's power gathering in the hand: k runs 0..1 through the wind-up and stays up through the strike.
 * `release` (0..1) throws the fighter's own mark off the hand as the move leaves it. Returns false for anyone else.
 */
export function drawQuestCharge(ctx: CanvasRenderingContext2D, power: Power, h: Pt, s: number, t: number, k: number, a: string, b: string, face: number, release: number): boolean {
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

// ---------- the mark left where a quest fighter's move lands ----------
let moveOwner: Map<string, { id: Power; a: string; b: string }> | null = null;
function ownerOf(moveId: string) {
  if (!moveOwner) {
    moveOwner = new Map();
    for (const q of QUESTERS) if (QUEST_LOOK.has(q.id)) for (const m of q.moves) moveOwner.set(m.id, { id: q.id, a: q.color, b: q.glow });
  }
  return moveOwner.get(moveId);
}

/** On a hit by one of the 13 quest fighters' moves, its own mark on top of the move's usual hit effect. */
export function drawQuestImpact(ctx: CanvasRenderingContext2D, fx: Fx) {
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

// ---------- entrances: a sign on the floor before the landing and a flourish of the power on it ----------
const ARRIVAL: Partial<Record<Power, Arrival>> = {
  spatio: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a grid of space laid on the floor, its rings sliding in to where he will stand
      ctx.globalCompositeOperation = "lighter";
      const R = 80 * s;
      for (let i = 0; i < 4; i++) {
        const q = 1 - ((t * 0.7 + i / 4) % 1);
        floorRing(ctx, x, ground, R * q * k, hsla(188, 100, 70, 0.7 * k * (1 - q * 0.6)), 1.6 * s);
      }
      spokes(ctx, x, ground, 0, R * k, 12, t * 0.2, hsla(188, 100, 70, 0.45 * k), 1.2 * s, k);
      floorRing(ctx, x, ground, R * k, hsla(234, 80, 70, 0.8 * k), 2.4 * s);
    },
    front: ({ ctx, x, ground, s, u, t }, hit) => {
      const f = flare(u, hit);
      if (f <= 0) return;
      ctx.globalCompositeOperation = "lighter";
      // the pane of space he stepped through slicing shut, small panes thrown off it
      const w = 26 * s * f, h = 200 * s;
      const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
      g.addColorStop(0, hsla(188, 100, 70, 0));
      g.addColorStop(0.5, hsla(188, 100, 85, 0.8 * f));
      g.addColorStop(1, hsla(188, 100, 70, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - w, ground - h, w * 2, h);
      ctx.strokeStyle = hsla(188, 100, 75, 0.9 * f);
      ctx.lineWidth = 1.6 * s;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.3, R = (20 + (1 - f) * 70) * s;
        ctx.save();
        ctx.translate(x + Math.cos(a) * R, ground - 50 * s + Math.sin(a) * R * 0.7);
        ctx.rotate(a + t * 4);
        ctx.strokeRect(-5 * s, -5 * s, 10 * s, 10 * s);
        ctx.restore();
      }
    },
  },
  hexizon: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a loading ring on the floor filling up block by block
      ctx.globalCompositeOperation = "lighter";
      const n = 16, lit = u < hit ? Math.floor(seg(u, 0, hit) * n) : n, blink = Math.floor(t * 8) % 2;
      for (let i = 0; i < n; i++) {
        const q = fp(x, ground, 66 * s, (i / n) * TAU - Math.PI / 2);
        ctx.fillStyle = hsla(128, 100, 58, (i < lit ? 0.9 : 0.2) * k * (u > hit && blink ? 0.6 : 1));
        ctx.fillRect(q.x - 3.5 * s, q.y - 2 * s, 7 * s, 4 * s);
      }
      const q = 3 * s;
      drift(10, t, 0.8, 201, (i, kk, r1) => {
        ctx.fillStyle = hsla(i % 3 ? 128 : 300, 100, 60, 0.8 * k * (1 - kk));
        ctx.fillRect(Math.round((x + (r1 - 0.5) * 120 * s) / q) * q, Math.round((ground - kk * 120 * s) / q) * q, q, q);
      });
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      const f = flare(u, hit);
      if (f <= 0) return;
      // an 8-bit burst: a plus of blocks thrown out from the landing
      ctx.globalCompositeOperation = "lighter";
      const q = 6 * s, cy = ground - 40 * s;
      for (let i = 1; i <= 6; i++) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const d = i * q * (1 + (1 - f) * 1.5);
          ctx.fillStyle = hsla(i % 2 ? 128 : 300, 100, 62, f * (1 - i / 8));
          ctx.fillRect(x + dx * d - q / 2, cy + dy * d - q / 2, q, q);
        }
      }
    },
  },
  gamma: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // the radiation sign glowing up through the floor
      ctx.globalCompositeOperation = "lighter";
      trefoil(ctx, x, ground, 12 * s, 70 * s * k, t * 0.8, 0.26);
      ctx.fillStyle = hsla(78, 100, 56, 0.35 * k);
      ctx.fill();
      ctx.strokeStyle = hsla(78, 100, 66, 0.8 * k);
      ctx.lineWidth = 1.6 * s;
      ctx.stroke();
      floorRing(ctx, x, ground, 78 * s * k, hsla(78, 100, 60, 0.7 * k), 2.4 * s);
      ctx.beginPath();
      ctx.ellipse(x, ground, 7 * s, 2 * s, 0, 0, TAU);
      ctx.fillStyle = hsla(78, 100, 70, 0.9 * k);
      ctx.fill();
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      if (u < hit) return;
      const kk = seg(u, hit, hit + 0.45);
      if (kk >= 1) return;
      // a ring of green light rolling out and steam venting off the floor
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, (20 + easeOut(kk) * 120) * s, hsla(78, 100, 62, 0.9 * (1 - kk)), 4 * s * (1 - kk) + 0.5);
      for (let i = 0; i < 5; i++) glowDot(ctx, x + (i - 2) * 26 * s, ground - kk * (50 + hh(i) * 40) * s, (8 + kk * 18) * s, "hsl(90 30% 80%)", 0.35 * (1 - kk));
    },
  },
  velo: {
    back: ({ ctx, x, ground, s, u, t, face }, hit) => {
      // two burning skid marks from where he came in at speed, sparks kicked up along them
      const k = u < hit ? easeOut(seg(u, 0, hit)) : 1, fade = 1 - seg(u, hit + 0.2, 1);
      if (fade <= 0) return;
      const from = -face, L = 220 * s * k;
      ctx.globalCompositeOperation = "lighter";
      for (const dy of [-3, 4]) {
        const g = ctx.createLinearGradient(x + from * L, 0, x, 0);
        g.addColorStop(0, hsla(356, 80, 45, 0));
        g.addColorStop(1, hsla(20, 100, 55, 0.8 * fade));
        ctx.strokeStyle = g;
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.moveTo(x + from * L, ground + dy * s);
        ctx.lineTo(x + from * 6 * s, ground + dy * s);
        ctx.stroke();
      }
      drift(8, t, 2.2, 221, (i, kk, r1) => glowDot(ctx, x + from * r1 * L, ground - kk * 30 * s, 2.6 * s, "hsl(44 100% 62%)", (1 - kk) * fade * k));
    },
    front: ({ ctx, x, ground, s, u, face }, hit) => {
      const f = flare(u, hit);
      if (f <= 0) return;
      // the sound barrier breaking: a cone of rings behind him
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 2.4 * s;
      for (let i = 0; i < 3; i++) {
        const cx = x - face * (20 + i * 26 + (1 - f) * 30) * s;
        ctx.strokeStyle = hsla(44, 100, 70, f * (0.9 - i * 0.25));
        ctx.beginPath();
        ctx.ellipse(cx, ground - 45 * s, (8 + i * 3) * s, (30 + i * 14) * s, 0, 0, TAU);
        ctx.stroke();
      }
    },
  },
  portal: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a door opening in the floor under him, the void swirling inside it
      const R = 64 * s * k;
      ctx.beginPath();
      ctx.ellipse(x, ground, R, R * 0.26, 0, 0, TAU);
      ctx.fillStyle = hsla(262, 60, 6, 0.85 * k);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, R, hsla(318, 100, 66, 0.9 * k), 3 * s);
      floorRing(ctx, x, ground, R * 1.15, hsla(318, 100, 76, 0.4 * k), 1.4 * s);
      for (let i = 0; i < 3; i++) {
        const a0 = t * 3 + i * 2.1;
        floorRing(ctx, x, ground, R * (0.35 + i * 0.2), hsla(300, 100, 72, 0.6 * k), 1.4 * s, a0, a0 + 2.2);
      }
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      const f = flare(u, hit);
      if (f <= 0) return;
      // the outline of a door standing over him for a moment
      ctx.globalCompositeOperation = "lighter";
      const w = 36 * s, h = 110 * s * (0.6 + f * 0.4);
      ctx.beginPath();
      ctx.moveTo(x - w, ground);
      ctx.lineTo(x - w, ground - h + w);
      ctx.arc(x, ground - h + w, w, Math.PI, 0);
      ctx.lineTo(x + w, ground);
      ctx.strokeStyle = hsla(318, 100, 72, 0.9 * f);
      ctx.lineWidth = 3 * s;
      ctx.stroke();
    },
  },
  sono: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // equaliser bars standing in a ring on the floor, jumping to the beat, leaping on the drop
      ctx.globalCompositeOperation = "lighter";
      const beat = Math.pow(Math.max(0, Math.sin(t * 7.5)), 6), fl = flare(u, hit), seed = Math.floor(t * 8);
      for (let i = 0; i < 18; i++) {
        const q = fp(x, ground, 72 * s, (i / 18) * TAU);
        const hgt = (6 + (hh(i + seed) * 16 + beat * 14) * k + fl * 40) * s;
        ctx.fillStyle = hsla(36 - (hgt / s) * 0.4, 100, 58, 0.75 * k);
        ctx.fillRect(q.x - 2.5 * s, q.y - hgt, 5 * s, hgt);
      }
      floorRing(ctx, x, ground, 72 * s, hsla(36, 100, 58, 0.5 * k), 1.4 * s);
    },
    front: ({ ctx, x, ground, s, u, t }, hit) => {
      if (u < hit) return;
      const kk = seg(u, hit, hit + 0.35);
      if (kk >= 1) return;
      // the drop: a waveform rolling out along the floor both ways
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = hsla(36, 100, 64, 0.9 * (1 - kk));
      ctx.lineWidth = 2.4 * s;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        for (let i = 0; i <= 30; i++) {
          const d = i * 8 * s, amp = 18 * s * (1 - kk) * Math.exp(-Math.abs(d - kk * 240 * s) / (40 * s));
          const px = x + dir * d, py = ground - 20 * s + Math.sin(i * 1.4 - t * 30) * amp;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
    },
  },
  paper: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // an ink circle brushed on the floor in one stroke, talismans standing round it that fly up on the landing
      const dp = u < hit ? easeOut(seg(u, 0, hit)) : 1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(x, ground, 70 * s, 70 * s * 0.26, 0, -1.2, -1.2 + TAU * 0.9 * dp);
      ctx.strokeStyle = hsla(352, 70, 38, 0.85 * k);
      ctx.lineWidth = 6 * s;
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        if (i / 8 > dp) continue;
        const a = (i / 8) * TAU + 0.2, q = fp(x, ground, 70 * s, a);
        const up = u > hit ? seg(u, hit, hit + 0.5) : 0, lift = easeOut(up) * (90 + hh(i) * 60) * s;
        ctx.save();
        ctx.translate(q.x, q.y - 10 * s - lift);
        ctx.rotate(Math.sin(t * 3 + i) * 0.15 + up * 6 * (hh(i + 3) - 0.5));
        ctx.globalAlpha = k;
        ctx.fillStyle = PAPER;
        ctx.fillRect(-3.5 * s, -10 * s, 7 * s, 20 * s);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1 * s;
        ctx.strokeRect(-3.5 * s, -10 * s, 7 * s, 20 * s);
        ctx.fillStyle = "hsl(352 85% 50%)";
        ctx.fillRect(-1.5 * s, -6 * s, 3 * s, 10 * s);
        ctx.restore();
      }
    },
  },
  crys: {
    back: ({ ctx, x, ground, s, u }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // crystals growing out of the floor in a ring
      const grow = u < hit ? easeOut(seg(u, 0, hit)) : 1 - seg(u, hit, hit + 0.15);
      ctx.globalAlpha = k;
      for (let i = 0; i < 10; i++) {
        const q = fp(x, ground, (58 + hh(i) * 16) * s, (i / 10) * TAU + 0.3), len = (14 + hh(i + 4) * 22) * s * grow;
        if (len <= 0.5) continue;
        crystal(ctx, q.x, q.y, -Math.PI / 2 + (hh(i + 8) - 0.5) * 0.6, len, 4 * s, hsla(172, 80, 70, 0.75), hsla(286, 50, 40, 0.9), 1.2 * s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, 66 * s * k, hsla(172, 100, 70, 0.5 * k), 1.6 * s);
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      if (u < hit) return;
      const kk = seg(u, hit, hit + 0.4);
      if (kk >= 1) return;
      // the ring of crystals shattering into glints
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU, R = (60 + easeOut(kk) * 60) * s;
        star4(ctx, x + Math.cos(a) * R, ground - 20 * s - Math.abs(Math.sin(a)) * 20 * s - easeOut(kk) * 40 * s * hh(i), 6 * s * (1 - kk), hsla(i * 26, 100, 80, 1 - kk));
      }
    },
  },
  sand: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // dune ripples drawn across the floor
      ctx.strokeStyle = hsla(34, 45, 50, 0.55 * k);
      ctx.lineWidth = 1.6 * s;
      for (let i = 0; i < 5; i++) {
        const R = (24 + i * 14) * s * k;
        ctx.beginPath();
        for (let j = 0; j <= 24; j++) {
          const a = (j / 24) * TAU, rr = R + Math.sin(a * 6 + i + t * 2) * 2 * s;
          const px = x + Math.cos(a) * rr, py = ground + Math.sin(a) * rr * 0.26;
          j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
      // a dust devil turning where he will stand, gone as he lands
      if (u < hit + 0.1) {
        const d = u < hit ? seg(u, 0, hit) : 1 - seg(u, hit, hit + 0.1);
        ctx.lineWidth = 2 * s;
        ctx.strokeStyle = hsla(34, 55, 62, 0.55 * d);
        for (let i = 0; i < 8; i++) {
          const R = (8 + i * 7) * s * d, a0 = t * (9 - i * 0.6) + i;
          ctx.beginPath();
          ctx.ellipse(x, ground - i * 16 * s * d, R, R * 0.28, 0, a0, a0 + 4);
          ctx.stroke();
        }
      }
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      if (u < hit) return;
      const kk = seg(u, hit, hit + 0.4);
      if (kk >= 1) return;
      // a sheet of sand thrown out on the landing
      for (let i = 0; i < 30; i++) {
        const a = Math.PI + (i / 29) * Math.PI, sp = (80 + hh(i) * 100) * s * easeOut(kk);
        ctx.fillStyle = hsla(32 + hh(i + 3) * 10, 55, 60, 1 - kk);
        ctx.fillRect(x + Math.cos(a) * sp, ground - 6 * s + Math.sin(a) * sp * 0.5 + kk * kk * 40 * s, 2.4 * s, 2.4 * s);
      }
    },
  },
  pastrift: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // the floor warping: rings that will not stay round, stars falling upward out of them
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.8 * s;
      for (let i = 0; i < 4; i++) {
        const R = (20 + i * 18) * s * k;
        ctx.beginPath();
        for (let j = 0; j <= 30; j++) {
          const a = (j / 30) * TAU, rr = R * (1 + 0.12 * Math.sin(a * 5 + t * 4 + i * 1.7));
          const px = x + Math.cos(a) * rr, py = ground + Math.sin(a) * rr * 0.26;
          j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.strokeStyle = i % 2 ? hsla(40, 100, 58, 0.6 * k) : hsla(298, 76, 62, 0.7 * k);
        ctx.stroke();
      }
      drift(8, t, 0.7, 241, (i, kk, r1) => star4(ctx, x + (r1 - 0.5) * 130 * s, ground - kk * 110 * s, 4 * s * (1 - kk), hsla(i % 2 ? 40 : 298, 100, 70, k * (1 - kk))));
    },
    front: ({ ctx, x, ground, s, u, t }, hit) => {
      const f = flare(u, hit);
      if (f <= 0) return;
      // reality snapping back: a jagged star of light round him
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = hsla(40, 100, 66, f);
      ctx.lineWidth = 2.4 * s;
      const seed = Math.floor(t * 20), cy = ground - 45 * s, R = (30 + (1 - f) * 60) * s;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.2;
        zig(ctx, { x: x + Math.cos(a) * R * 0.4, y: cy + Math.sin(a) * R * 0.4 }, { x: x + Math.cos(a) * R * 1.3, y: cy + Math.sin(a) * R * 1.3 }, 3, 5 * s, seed + i);
        ctx.stroke();
      }
    },
  },
  merc: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a puddle of chrome spreading, rings running across it
      const R = 64 * s * k;
      ctx.beginPath();
      ctx.ellipse(x, ground + 1 * s, R, R * 0.24, 0, 0, TAU);
      const g = ctx.createLinearGradient(x, ground - R * 0.24, x, ground + R * 0.24 + 1);
      g.addColorStop(0, hsla(210, 10, 88, 0.9 * k));
      g.addColorStop(1, hsla(214, 14, 36, 0.9 * k));
      ctx.fillStyle = g;
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        const q = (t * 0.9 + i / 3) % 1;
        floorRing(ctx, x, ground + 1 * s, R * q, hsla(0, 0, 100, 0.5 * k * (1 - q)), 1.2 * s);
      }
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground + 1 * s, R, hsla(196, 100, 72, 0.5 * k), 1.4 * s);
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      if (u < hit) return;
      const kk = seg(u, hit, hit + 0.45);
      if (kk >= 1) return;
      // a crown of chrome splashing up on the landing
      ctx.globalAlpha = 1 - kk;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU, R = (30 + easeOut(kk) * 40) * s, up = Math.sin(kk * Math.PI) * (30 + hh(i) * 20) * s;
        chromeBead(ctx, x + Math.cos(a) * R, ground + Math.sin(a) * R * 0.24 - up, 3.2 * s * (1 - kk * 0.5), "hsl(196 100% 72%)");
      }
      ctx.globalAlpha = 1;
    },
  },
  alch: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // a transmutation circle drawn stroke by stroke: the circle, a triangle, a square, then the element signs
      const dp = u < hit ? seg(u, 0, hit) : 1, R = 72 * s;
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, R, hsla(44, 95, 62, 0.85 * k), 2.4 * s, -Math.PI / 2, -Math.PI / 2 + TAU * seg(dp, 0, 0.35));
      floorRing(ctx, x, ground, R * 0.82, hsla(44, 95, 62, 0.6 * k), 1.4 * s, Math.PI / 2, Math.PI / 2 + TAU * seg(dp, 0.1, 0.45));
      flatPoly(ctx, x, ground, R * 0.82, 3, -Math.PI / 2 + t * 0.3, seg(dp, 0.35, 0.65));
      ctx.strokeStyle = hsla(14, 100, 62, 0.85 * k);
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      flatPoly(ctx, x, ground, R * 0.58, 4, Math.PI / 4 - t * 0.3, seg(dp, 0.6, 0.9));
      ctx.strokeStyle = hsla(44, 95, 62, 0.8 * k);
      ctx.stroke();
      const signs = seg(dp, 0.85, 1) * 4;
      for (let i = 0; i < 4; i++) {
        if (signs <= i) continue;
        const q = fp(x, ground, R * 1.15, (i / 4) * TAU + t * 0.3);
        elementGlyph(ctx, q.x, q.y - 6 * s, 6 * s, i, hsla(44, 95, 66, 0.9 * k), 1.4 * s);
      }
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      const f = flare(u, hit);
      if (f <= 0) return;
      // a column of gold light rising off the finished circle
      ctx.globalCompositeOperation = "lighter";
      const w = 70 * s * (0.6 + f * 0.4), h = 260 * s;
      const g = ctx.createLinearGradient(0, ground, 0, ground - h);
      g.addColorStop(0, hsla(44, 100, 70, 0.6 * f));
      g.addColorStop(1, hsla(44, 100, 70, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - w, ground - h, w * 2, h);
    },
  },
  nadir: {
    back: ({ ctx, x, ground, s, u, t }, hit) => {
      const k = sigilK(u, hit);
      if (k <= 0) return;
      // half a halo laid on the floor, lit, the other half only a dotted trace
      const R = 66 * s;
      ctx.globalCompositeOperation = "lighter";
      floorRing(ctx, x, ground, R, hsla(46, 92, 72, 0.85 * k), 2.6 * s, t * 0.4, t * 0.4 + Math.PI);
      ctx.setLineDash([3 * s, 6 * s]);
      floorRing(ctx, x, ground, R, hsla(48, 45, 90, 0.4 * k), 1.2 * s, t * 0.4 + Math.PI, t * 0.4 + TAU);
      ctx.setLineDash([]);
    },
    front: ({ ctx, x, ground, s, u }, hit) => {
      const f = flare(u, hit);
      if (f <= 0) return;
      // a flash where the two lights met
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, x, ground - 60 * s, 70 * s * (0.6 + f * 0.4), "hsl(46 92% 76%)", 0.55 * f);
    },
  },
};

/** The extra arrival layer for one of the 13 quest fighters, or nothing. */
export function questArrivalOf(id: Power): Arrival | undefined {
  return ARRIVAL[id];
}
