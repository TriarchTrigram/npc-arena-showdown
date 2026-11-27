// The fourth generation (FOURTH_IDS in fighters.ts), freed from the secret boss Zenith's crown: their body designs,
// Wisp and Boreal from its outer seal, Gleam, Loom, Hive and Oxide from its heart,
// drawn by the engine through drawQuestDesign (quest-designs.ts), and every one of their moves' looks, each drawn
// from its own design (designLook), in their colours or their Surge Mode's.
import type { BossRig } from "./boss-designs";
import type { Power } from "./fighters";
import type { QuestAct, QuestPaint } from "./quest-designs";
import { designLook, type OwnDraw, type PShape } from "./move-looks";

type Pt = { x: number; y: number };
const TAU = Math.PI * 2;
const HEAD = 11;
const al = (c: string, a: number) => c.replace(")", ` / ${Math.max(0, Math.min(1, a))})`);

function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, al(c, a));
  g.addColorStop(1, al(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}
const mid = (a: Pt, b: Pt, k = 0.5): Pt => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

// ---------- Wisp: a hood and a face scarf of smoke, a long smoky tail off the shoulders, embers in the palms ----------
function wispBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  const smoke = p.nightmare ? "hsl(220 10% 10%)" : "hsl(210 8% 40%)";
  // the smoke tail streaming back off the shoulders, thicker while a move is under way
  const n = act ? 9 : 7;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const x = r.neck.x - face * (8 + k * 60) * s + Math.sin(t * 2.4 + i) * 4 * s;
    const y = r.neck.y + 4 * s - k * 14 * s + Math.sin(t * 3 + i * 0.8) * 5 * s;
    const rr = (9 + k * 10) * s;
    ctx.fillStyle = al(smoke, (alive ? 0.5 : 0.25) * (1 - k * 0.8));
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function wispFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const h = r.head;
  const hood = p.nightmare ? "hsl(220 12% 8%)" : "hsl(210 10% 28%)";
  // the hood: a soft peak drawn over the back of the head
  ctx.fillStyle = hood;
  ctx.beginPath();
  ctx.moveTo(h.x + face * 9 * s, h.y - 6 * s);
  ctx.quadraticCurveTo(h.x, h.y - 18 * s, h.x - face * 14 * s, h.y - 10 * s + Math.sin(t * 2) * s);
  ctx.quadraticCurveTo(h.x - face * 16 * s, h.y + 4 * s, h.x - face * 9 * s, h.y + 9 * s);
  ctx.quadraticCurveTo(h.x - face * 2 * s, h.y + 2 * s, h.x + face * 9 * s, h.y - 6 * s);
  ctx.fill();
  // a scarf of smoke over the mouth
  ctx.fillStyle = al(p.nightmare ? "hsl(220 10% 16%)" : "hsl(210 8% 52%)", 0.95);
  ctx.beginPath();
  ctx.ellipse(h.x + face * 3 * s, h.y + 5 * s, 9 * s, 4.5 * s, 0, 0, TAU);
  ctx.fill();
  // eyes glowing through the gap
  if (alive) {
    ctx.globalCompositeOperation = "lighter";
    for (const dx of [2.5, 7]) glowDot(ctx, h.x + face * dx * s, h.y - 1.5 * s, 3 * s, p.glow, 0.95);
    // embers smouldering in both palms, smoke curling off them
    for (const hand of [r.hF, r.hB]) {
      glowDot(ctx, hand.x, hand.y, 5 * s, p.nightmare ? p.glow : "hsl(24 100% 58%)", 0.6 + Math.sin(t * 6) * 0.2);
    }
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3) % 1;
      ctx.fillStyle = al("hsl(210 8% 60%)", 0.4 * (1 - k));
      ctx.beginPath();
      ctx.arc(r.hF.x + Math.sin(t * 3 + i) * 3 * s, r.hF.y - k * 22 * s, (2 + k * 4) * s, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ---------- Boreal: an aurora shawl rippling behind the shoulders, a circlet of polar stars, lit hands ----------
function borealBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  if (alive) ctx.globalCompositeOperation = "lighter";
  const lift = act ? 1.3 : 1;
  // two ribbons of light hanging off the shoulders, each waving on its own
  for (let band = 0; band < 2; band++) {
    const c = band ? p.glow : p.a;
    ctx.fillStyle = al(c, alive ? 0.45 : 0.15);
    ctx.beginPath();
    const pts: Pt[] = [];
    for (let j = 0; j <= 8; j++) {
      const k = j / 8;
      pts.push({
        x: r.neck.x - face * (4 + k * 46 + band * 6) * s,
        y: r.neck.y + 2 * s + k * 34 * s * lift - band * 4 * s + Math.sin(t * 3 + j * 0.9 + band * 1.7) * 6 * s * k,
      });
    }
    pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y - 6 * s) : ctx.moveTo(q.x, q.y - 6 * s)));
    for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y + 6 * s);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function borealFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  ctx.lineCap = "round";
  const h = r.head;
  // a thin circlet with three small polar stars
  ctx.strokeStyle = p.nightmare ? "hsl(350 80% 60%)" : "hsl(170 40% 86%)";
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.ellipse(h.x, h.y - 6 * s, 11 * s, 3 * s, 0, Math.PI, TAU);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const sx = h.x + (i - 1) * 7 * s, sy = h.y - 9 * s - (i === 1 ? 3 : 0) * s;
    if (alive) {
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, sx, sy, 5 * s, i === 1 ? p.glow : p.a, 0.7 + Math.sin(t * 4 + i) * 0.2);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.fillStyle = "hsl(0 0% 100%)";
    ctx.beginPath();
    ctx.arc(sx, sy, 1.4 * s, 0, TAU);
    ctx.fill();
  }
  if (alive) {
    ctx.globalCompositeOperation = "lighter";
    for (const dx of [2.5, 7]) glowDot(ctx, h.x + face * dx * s, h.y + 0.5 * s, 2.6 * s, p.a, 0.9);
    // the hands lit like the sky: one green, one violet
    glowDot(ctx, r.hF.x, r.hF.y, 7 * s, p.a, 0.6);
    glowDot(ctx, r.hB.x, r.hB.y, 6 * s, p.glow, 0.5);
    // a few motes rising off the shawl
    const c = mid(r.neck, r.hip, 0.3);
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.6 + i / 3) % 1;
      glowDot(ctx, c.x - face * (20 + i * 10) * s, c.y - k * 40 * s, 2.4 * s, i % 2 ? p.glow : p.a, 1 - k);
    }
  }
  ctx.restore();
}

// ---------- Gleam: two mirror shards hovering behind the shoulders, a visor of glass, a glint that sweeps across ----------
function gleamBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  const spread = act ? 1.25 : 1;
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1;
    const cx = r.neck.x - face * 14 * s + side * 22 * s * spread;
    const cy = r.neck.y - 10 * s + Math.sin(t * 2 + i * 2) * 4 * s;
    const tilt = side * 0.25 + Math.sin(t * 1.5 + i) * 0.08;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.fillStyle = al(p.nightmare ? "hsl(200 30% 22%)" : "hsl(195 40% 86%)", alive ? 0.85 : 0.4);
    ctx.strokeStyle = alive ? "hsl(0 0% 100%)" : "hsl(200 10% 60%)";
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.moveTo(0, -24 * s);
    ctx.lineTo(9 * s, -6 * s);
    ctx.lineTo(5 * s, 22 * s);
    ctx.lineTo(-8 * s, 14 * s);
    ctx.lineTo(-7 * s, -10 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (alive) {
      // the glint sliding down the shard
      const k = (t * 0.9 + i * 0.5) % 1;
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, 0, -20 * s + k * 38 * s, 6 * s, p.glow, 0.7 * (1 - Math.abs(k - 0.5) * 2));
    }
    ctx.restore();
  }
  ctx.restore();
}

function gleamFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  const h = r.head;
  // a visor of glass across the eyes
  ctx.fillStyle = al(p.nightmare ? "hsl(320 80% 60%)" : "hsl(188 100% 76%)", alive ? 0.8 : 0.35);
  ctx.beginPath();
  ctx.moveTo(h.x - face * 6 * s, h.y - 5 * s);
  ctx.lineTo(h.x + face * 12 * s, h.y - 3 * s);
  ctx.lineTo(h.x + face * 10 * s, h.y + 3 * s);
  ctx.lineTo(h.x - face * 6 * s, h.y + 2 * s);
  ctx.closePath();
  ctx.fill();
  if (alive) {
    ctx.globalCompositeOperation = "lighter";
    const k = (t * 0.7) % 1;
    glowDot(ctx, h.x + face * (-6 + k * 18) * s, h.y - 1 * s, 4 * s, "hsl(0 0% 100%)", 0.9);
    // a small mirror held in each hand catches the light
    for (const hand of [r.hF, r.hB]) glowDot(ctx, hand.x, hand.y, 6 * s, p.glow, 0.5 + Math.sin(t * 5) * 0.15);
  }
  ctx.restore();
}

// ---------- Loom: a spool on the back with threads trailing to both hands, a needle through the hair ----------
function loomBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  const c = mid(r.neck, r.hip, 0.3);
  const sx = c.x - face * 12 * s, sy = c.y;
  // the spool, turning faster while a move is under way
  ctx.fillStyle = p.nightmare ? "hsl(350 40% 14%)" : "hsl(30 40% 34%)";
  ctx.fillRect(sx - 9 * s, sy - 14 * s, 18 * s, 4 * s);
  ctx.fillRect(sx - 9 * s, sy + 10 * s, 18 * s, 4 * s);
  ctx.fillStyle = p.a;
  ctx.fillRect(sx - 7 * s, sy - 10 * s, 14 * s, 20 * s);
  ctx.strokeStyle = al(p.glow, alive ? 0.9 : 0.3);
  ctx.lineWidth = 1 * s;
  const spin = t * (act ? 9 : 2);
  for (let i = 0; i < 5; i++) {
    const y = sy - 8 * s + (((i * 4 + spin * 3) % 18) + 18) % 18 * s;
    ctx.beginPath();
    ctx.moveTo(sx - 7 * s, y);
    ctx.lineTo(sx + 7 * s, y + 2 * s);
    ctx.stroke();
  }
  // threads off the spool to both hands, sagging and swaying
  ctx.lineWidth = 1.2 * s;
  for (const [hand, col] of [[r.hF, p.glow], [r.hB, p.a]] as const) {
    ctx.strokeStyle = al(col, alive ? 0.85 : 0.3);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo((sx + hand.x) / 2, Math.max(sy, hand.y) + 16 * s + Math.sin(t * 3) * 4 * s, hand.x, hand.y);
    ctx.stroke();
  }
  ctx.restore();
}

function loomFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  const h = r.head;
  // a long needle pushed through the hair, its eye catching the light
  ctx.strokeStyle = p.nightmare ? "hsl(42 100% 70%)" : "hsl(40 20% 86%)";
  ctx.lineWidth = 1.8 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(h.x - face * 16 * s, h.y - 14 * s);
  ctx.lineTo(h.x + face * 8 * s, h.y - 4 * s);
  ctx.stroke();
  if (alive) {
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x - face * 15 * s, h.y - 13.5 * s, 4 * s, p.glow, 0.8 + Math.sin(t * 4) * 0.15);
    for (const dx of [2.5, 7]) glowDot(ctx, h.x + face * dx * s, h.y, 2.4 * s, p.glow, 0.9);
  }
  ctx.restore();
}

// ---------- Hive: translucent wings that blur, a striped body, bees circling the head like a crown ----------
function hiveBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  const beat = Math.sin(t * (act ? 60 : 40)) * 0.18;
  for (let i = 0; i < 2; i++) {
    const up = i === 0;
    ctx.save();
    ctx.translate(r.neck.x - face * 4 * s, r.neck.y + 4 * s);
    ctx.rotate(-face * (up ? 0.9 : 0.4) + beat * (up ? 1 : -1));
    ctx.fillStyle = al(p.nightmare ? "hsl(30 20% 30%)" : "hsl(200 60% 92%)", alive ? 0.5 : 0.2);
    ctx.strokeStyle = al("hsl(30 30% 20%)", 0.6);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.ellipse(-face * 22 * s, 0, (up ? 24 : 17) * s, (up ? 9 : 7) * s, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  // stripes across the torso
  ctx.strokeStyle = p.nightmare ? "hsl(48 100% 56%)" : "hsl(30 40% 10%)";
  ctx.lineWidth = 3 * s;
  for (const k of [0.3, 0.55, 0.8]) {
    const q = mid(r.neck, r.hip, k);
    ctx.beginPath();
    ctx.moveTo(q.x - 7 * s, q.y);
    ctx.lineTo(q.x + 7 * s, q.y);
    ctx.stroke();
  }
  ctx.restore();
}

function hiveFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  const h = r.head;
  // two short antennae
  ctx.strokeStyle = "hsl(30 30% 12%)";
  ctx.lineWidth = 1.4 * s;
  ctx.lineCap = "round";
  for (const d of [0, 1]) {
    ctx.beginPath();
    ctx.moveTo(h.x + face * (d * 5 - 1) * s, h.y - 9 * s);
    ctx.quadraticCurveTo(h.x + face * (6 + d * 6) * s, h.y - 22 * s, h.x + face * (10 + d * 7) * s, h.y - 20 * s);
    ctx.stroke();
    ctx.fillStyle = p.glow;
    ctx.beginPath();
    ctx.arc(h.x + face * (10 + d * 7) * s, h.y - 20 * s, 1.8 * s, 0, TAU);
    ctx.fill();
  }
  if (alive) {
    // a few bees circling the head
    for (let i = 0; i < 4; i++) {
      const a = t * 3 + (i / 4) * TAU;
      const bx = h.x + Math.cos(a) * 20 * s, by = h.y - 4 * s + Math.sin(a) * 7 * s;
      ctx.fillStyle = i % 2 ? "hsl(44 100% 54%)" : "hsl(30 30% 12%)";
      ctx.beginPath();
      ctx.ellipse(bx, by, 2.6 * s, 1.8 * s, a, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "lighter";
    for (const dx of [2.5, 7]) glowDot(ctx, h.x + face * dx * s, h.y - 1 * s, 2.6 * s, p.glow, 0.9);
  }
  ctx.restore();
}

// ---------- Oxide: heavy rusted pauldrons, rivets, a green patina creeping up the arms, flakes falling off ----------
function oxideBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  // flakes dropping off the body, more while a move is under way
  const n = act ? 7 : 4;
  for (let i = 0; i < n; i++) {
    const k = (t * 0.5 + i / n) % 1;
    const x = r.neck.x + Math.sin(i * 2.1) * 12 * s + face * k * 6 * s;
    const y = r.neck.y + k * 80 * s;
    ctx.fillStyle = al(i % 2 ? "hsl(18 70% 36%)" : p.glow, (alive ? 0.8 : 0.3) * (1 - k));
    ctx.fillRect(x, y, 3 * s, 2 * s);
  }
  ctx.restore();
}

function oxideFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  // a rusted pauldron on each shoulder, edged in patina, studded with rivets
  for (const side of [-1, 1]) {
    const x = r.shoulder.x + side * 6 * s, y = r.shoulder.y;
    ctx.fillStyle = p.nightmare ? "hsl(168 40% 20%)" : "hsl(18 60% 32%)";
    ctx.strokeStyle = p.nightmare ? "hsl(20 70% 40%)" : "hsl(172 50% 46%)";
    ctx.lineWidth = 1.8 * s;
    ctx.beginPath();
    ctx.ellipse(x, y, 10 * s, 7 * s, side * 0.3, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "hsl(30 20% 70%)";
    for (const dx of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.arc(x + dx * s, y - 3 * s, 1.1 * s, 0, TAU);
      ctx.fill();
    }
  }
  if (alive) {
    ctx.globalCompositeOperation = "lighter";
    const h = r.head;
    for (const dx of [2.5, 7]) glowDot(ctx, h.x + face * dx * s, h.y, 2.6 * s, p.glow, 0.85);
    // patina glowing faintly in both fists
    for (const hand of [r.hF, r.hB]) glowDot(ctx, hand.x, hand.y, 6 * s, p.glow, 0.4 + Math.sin(t * 3) * 0.12);
  }
  ctx.restore();
}

type Back = typeof wispBack;
type Front = typeof wispFront;
const HEART_DESIGNS: Partial<Record<Power, [Back, Front]>> = {
  glass: [gleamBack, gleamFront],
  thread: [loomBack, loomFront],
  swarm: [hiveBack, hiveFront],
  rust: [oxideBack, oxideFront],
};

/** The fourth generation's body designs; true when `id` is one of them. */
export function drawFourthDesign(
  ctx: CanvasRenderingContext2D, id: Power, layer: "back" | "front", r: BossRig, s: number, face: number, t: number,
  alive: boolean, act: QuestAct | undefined, p: QuestPaint,
): boolean {
  if (id === "smoke") {
    layer === "back" ? wispBack(ctx, r, s, face, t, alive, act, p) : wispFront(ctx, r, s, face, t, alive, p);
    return true;
  }
  if (id === "aurora") {
    layer === "back" ? borealBack(ctx, r, s, face, t, alive, act, p) : borealFront(ctx, r, s, face, t, alive, p);
    return true;
  }
  const pair = HEART_DESIGNS[id];
  if (pair) {
    layer === "back" ? pair[0](ctx, r, s, face, t, alive, act, p) : pair[1](ctx, r, s, face, t, alive, p);
    return true;
  }
  return false;
}

// ---------- move looks ----------
type Row = [id: string, kind: string, a: string, b: string, p: PShape, d: Omit<OwnDraw, "kind">];
const WISP_A = "hsl(210 8% 44%)", WISP_B = "hsl(168 80% 64%)";
const SMOG_A = "hsl(220 10% 18%)", SMOG_B = "hsl(24 100% 60%)";
const BOREAL_A = "hsl(160 80% 50%)", BOREAL_B = "hsl(292 90% 74%)";
const STORM_A = "hsl(300 80% 56%)", STORM_B = "hsl(140 100% 70%)";
const GLEAM_A = "hsl(195 40% 86%)", GLEAM_B = "hsl(188 100% 70%)";
const SHATTER_A = "hsl(200 20% 86%)", SHATTER_B = "hsl(320 100% 76%)";
const LOOM_A = "hsl(350 80% 50%)", LOOM_B = "hsl(42 100% 64%)";
const TAPESTRY_A = "hsl(350 90% 56%)", TAPESTRY_B = "hsl(42 100% 70%)";
const HIVE_A = "hsl(44 100% 54%)", HIVE_B = "hsl(30 30% 14%)";
const QUEEN_A = "hsl(40 100% 52%)", QUEEN_B = "hsl(0 0% 8%)";
const OXIDE_A = "hsl(18 66% 38%)", OXIDE_B = "hsl(172 62% 52%)";
const CORRODE_A = "hsl(20 70% 40%)", CORRODE_B = "hsl(160 80% 56%)";
const ROWS: Row[] = [
  // Wisp
  ["smoke-jab", "melee", WISP_A, WISP_B, "smoke", { glyph: "orb", trail: "none", motion: "steady", burst: "scatter" }],
  ["cinder-hook", "melee", "hsl(24 90% 52%)", WISP_A, "ember", { glyph: "fang", trail: "none", motion: "steady", burst: "fountain" }],
  ["smoke-bomb", "projectile", WISP_A, WISP_B, "smoke", { glyph: "orb", trail: "dots", motion: "wobble", burst: "scatter" }],
  ["smokescreen", "zone", WISP_A, "hsl(210 8% 70%)", "smoke", { glyph: "spiral", trail: "none", motion: "spin", burst: "ring" }],
  ["vanish-step", "blink", WISP_A, WISP_B, "smoke", { glyph: "crescent", trail: "echo", motion: "steady", burst: "spiral" }],
  ["ash-tether", "pull", "hsl(210 6% 30%)", WISP_B, "dust", { glyph: "arrow", trail: "ribbon", motion: "wobble", burst: "spiral" }],
  ["chimney-blast", "eruption", WISP_A, "hsl(24 100% 60%)", "smoke", { glyph: "drop", trail: "none", motion: "pulse", burst: "fountain" }],
  ["exhale", "burst", "hsl(210 8% 56%)", WISP_B, "smoke", { glyph: "ring", trail: "none", motion: "pulse", burst: "ring" }],
  ["smog-cyclone", "zone", SMOG_A, SMOG_B, "smoke", { glyph: "spiral", trail: "none", motion: "spin", burst: "spiral" }],
  ["ember-cloud", "rain", SMOG_B, SMOG_A, "ember", { glyph: "drop", trail: "streak", motion: "wobble", burst: "scatter" }],
  ["phantom-rush", "dash", SMOG_A, SMOG_B, "smoke", { glyph: "crescent", trail: "echo", motion: "steady", burst: "crack" }],
  ["choking-cloud", "burst", SMOG_A, "hsl(90 60% 50%)", "smoke", { glyph: "eye", trail: "none", motion: "pulse", burst: "ring" }],
  ["soot-lance", "beam", SMOG_A, SMOG_B, "ember", { glyph: "arrow", trail: "ribbon", motion: "steady", burst: "crack" }],
  // Boreal
  ["veil-jab", "melee", BOREAL_A, BOREAL_B, "spark", { glyph: "feather", trail: "none", motion: "steady", burst: "scatter" }],
  ["curtain-ray", "beam", BOREAL_A, BOREAL_B, "spark", { glyph: "feather", trail: "ribbon", motion: "wobble", burst: "fountain" }],
  ["polar-shards", "projectile", "hsl(180 70% 70%)", BOREAL_B, "shard", { glyph: "diamond", trail: "sparkle", motion: "spin", burst: "crack" }],
  ["solar-wind", "rain", BOREAL_B, BOREAL_A, "star", { glyph: "star", trail: "streak", motion: "wobble", burst: "scatter" }],
  ["magnetic-halo", "zone", BOREAL_A, BOREAL_B, "ring", { glyph: "ring", trail: "none", motion: "spin", burst: "ring" }],
  ["polar-dash", "dash", BOREAL_A, "hsl(0 0% 100%)", "spark", { glyph: "arrow", trail: "echo", motion: "steady", burst: "scatter" }],
  ["aurora-flare", "burst", BOREAL_B, BOREAL_A, "star", { glyph: "flower", trail: "none", motion: "pulse", burst: "ring" }],
  ["polar-mend", "heal", BOREAL_A, "hsl(170 60% 88%)", "spark", { glyph: "heart", trail: "none", motion: "pulse", burst: "fountain" }],
  ["coronal-sky", "rain", STORM_A, STORM_B, "shard", { glyph: "star", trail: "sparkle", motion: "spin", burst: "crack" }],
  ["polar-vortex", "pull", STORM_A, STORM_B, "spark", { glyph: "spiral", trail: "ribbon", motion: "spin", burst: "spiral" }],
  ["northern-step", "blink", STORM_B, STORM_A, "star", { glyph: "feather", trail: "echo", motion: "steady", burst: "fountain" }],
  ["magnetosphere", "burst", STORM_A, STORM_B, "ring", { glyph: "hex", trail: "none", motion: "pulse", burst: "ring" }],
  ["ion-spire", "eruption", STORM_B, STORM_A, "spark", { glyph: "diamond", trail: "none", motion: "pulse", burst: "fountain" }],
];
ROWS.push(
  // Gleam
  ["shard-jab", "melee", GLEAM_A, GLEAM_B, "shard", { glyph: "diamond", trail: "none", motion: "steady", burst: "crack" }],
  ["glass-heel", "melee", GLEAM_B, GLEAM_A, "shard", { glyph: "crescent", trail: "echo", motion: "steady", burst: "crack" }],
  ["mirror-disc", "projectile", GLEAM_A, GLEAM_B, "spark", { glyph: "ring", trail: "echo", motion: "spin", burst: "scatter" }],
  ["glare", "beam", "hsl(0 0% 100%)", GLEAM_B, "spark", { glyph: "eye", trail: "ribbon", motion: "steady", burst: "ring" }],
  ["hall-of-mirrors", "zone", GLEAM_A, GLEAM_B, "shard", { glyph: "hex", trail: "none", motion: "pulse", burst: "ring" }],
  ["reflection-step", "blink", GLEAM_B, GLEAM_A, "spark", { glyph: "diamond", trail: "echo", motion: "steady", burst: "spiral" }],
  ["reflect", "mimic", GLEAM_A, "hsl(0 0% 100%)", "spark", { glyph: "cross", trail: "none", motion: "pulse", burst: "ring" }],
  ["shatter", "burst", GLEAM_A, GLEAM_B, "shard", { glyph: "star", trail: "none", motion: "pulse", burst: "crack" }],
  ["glass-storm", "rain", SHATTER_A, SHATTER_B, "shard", { glyph: "diamond", trail: "streak", motion: "spin", burst: "crack" }],
  ["funhouse-pull", "pull", SHATTER_B, SHATTER_A, "spark", { glyph: "spiral", trail: "ribbon", motion: "wobble", burst: "spiral" }],
  ["splinter-rush", "dash", SHATTER_A, SHATTER_B, "shard", { glyph: "arrow", trail: "echo", motion: "steady", burst: "crack" }],
  ["mirror-spires", "eruption", SHATTER_A, SHATTER_B, "shard", { glyph: "diamond", trail: "none", motion: "pulse", burst: "fountain" }],
  ["thousand-faces", "burst", SHATTER_B, SHATTER_A, "star", { glyph: "eye", trail: "none", motion: "pulse", burst: "ring" }],
  // Loom
  ["needle-jab", "melee", LOOM_B, LOOM_A, "spark", { glyph: "arrow", trail: "none", motion: "steady", burst: "scatter" }],
  ["spool-shot", "projectile", LOOM_A, LOOM_B, "spark", { glyph: "spiral", trail: "ribbon", motion: "spin", burst: "scatter" }],
  ["snare-line", "pull", LOOM_B, LOOM_A, "spark", { glyph: "fang", trail: "ribbon", motion: "steady", burst: "spiral" }],
  ["cradle-web", "zone", LOOM_A, LOOM_B, "ring", { glyph: "hex", trail: "none", motion: "spin", burst: "ring" }],
  ["warp-and-weft", "eruption", LOOM_A, LOOM_B, "spark", { glyph: "cross", trail: "none", motion: "pulse", burst: "fountain" }],
  ["running-stitch", "dash", LOOM_B, LOOM_A, "spark", { glyph: "arrow", trail: "dots", motion: "steady", burst: "scatter" }],
  ["unravel", "burst", LOOM_A, LOOM_B, "spark", { glyph: "spiral", trail: "none", motion: "spin", burst: "spiral" }],
  ["gold-stitch", "heal", LOOM_B, "hsl(0 0% 100%)", "star", { glyph: "heart", trail: "none", motion: "pulse", burst: "fountain" }],
  ["needle-rain", "rain", TAPESTRY_A, TAPESTRY_B, "spark", { glyph: "arrow", trail: "streak", motion: "steady", burst: "scatter" }],
  ["golden-thread", "beam", TAPESTRY_B, TAPESTRY_A, "star", { glyph: "feather", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["eye-of-the-needle", "blink", TAPESTRY_B, TAPESTRY_A, "spark", { glyph: "eye", trail: "echo", motion: "steady", burst: "fountain" }],
  ["spiders-parlour", "zone", TAPESTRY_A, TAPESTRY_B, "ring", { glyph: "spiral", trail: "none", motion: "spin", burst: "spiral" }],
  ["the-final-knot", "burst", TAPESTRY_A, TAPESTRY_B, "star", { glyph: "cross", trail: "none", motion: "pulse", burst: "ring" }],
  // Hive
  ["sting", "melee", HIVE_A, HIVE_B, "dust", { glyph: "fang", trail: "none", motion: "steady", burst: "scatter" }],
  ["mandible-kick", "melee", HIVE_B, HIVE_A, "dust", { glyph: "crescent", trail: "none", motion: "steady", burst: "crack" }],
  ["stinger-volley", "projectile", HIVE_A, HIVE_B, "dust", { glyph: "arrow", trail: "dots", motion: "wobble", burst: "scatter" }],
  ["bee-cloud", "zone", HIVE_A, HIVE_B, "dust", { glyph: "hex", trail: "none", motion: "wobble", burst: "scatter" }],
  ["beeline", "dash", HIVE_A, HIVE_B, "dust", { glyph: "arrow", trail: "streak", motion: "steady", burst: "scatter" }],
  ["swarm-drop", "rain", HIVE_A, HIVE_B, "dust", { glyph: "drop", trail: "dots", motion: "wobble", burst: "scatter" }],
  ["royal-jelly", "heal", HIVE_A, "hsl(48 100% 86%)", "drop", { glyph: "hex", trail: "none", motion: "pulse", burst: "fountain" }],
  ["buzz-burst", "burst", HIVE_A, HIVE_B, "dust", { glyph: "ring", trail: "none", motion: "pulse", burst: "ring" }],
  ["hive-call", "pull", QUEEN_A, QUEEN_B, "dust", { glyph: "spiral", trail: "dots", motion: "wobble", burst: "spiral" }],
  ["golden-sting", "beam", QUEEN_A, "hsl(0 0% 100%)", "spark", { glyph: "fang", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["comb-burst", "eruption", QUEEN_A, QUEEN_B, "drop", { glyph: "hex", trail: "none", motion: "pulse", burst: "fountain" }],
  ["swarm-step", "blink", QUEEN_A, QUEEN_B, "dust", { glyph: "crescent", trail: "echo", motion: "steady", burst: "scatter" }],
  ["hornet-storm", "rain", QUEEN_A, QUEEN_B, "dust", { glyph: "fang", trail: "streak", motion: "wobble", burst: "scatter" }],
  // Oxide
  ["corroded-fist", "melee", OXIDE_A, OXIDE_B, "chunk", { glyph: "cube", trail: "none", motion: "steady", burst: "crack" }],
  ["flake-shot", "projectile", OXIDE_A, OXIDE_B, "chunk", { glyph: "cube", trail: "dots", motion: "spin", burst: "scatter" }],
  ["rust-tide", "zone", OXIDE_A, OXIDE_B, "dust", { glyph: "drop", trail: "none", motion: "wobble", burst: "ring" }],
  ["verdigris-ray", "beam", OXIDE_B, OXIDE_A, "spark", { glyph: "diamond", trail: "ribbon", motion: "steady", burst: "crack" }],
  ["iron-rot", "eruption", OXIDE_A, OXIDE_B, "chunk", { glyph: "hex", trail: "none", motion: "pulse", burst: "fountain" }],
  ["scrap-rain", "rain", OXIDE_A, "hsl(30 20% 60%)", "chunk", { glyph: "cube", trail: "streak", motion: "spin", burst: "scatter" }],
  ["patina", "heal", OXIDE_B, "hsl(160 60% 86%)", "spark", { glyph: "heart", trail: "none", motion: "pulse", burst: "fountain" }],
  ["collapse", "burst", OXIDE_A, OXIDE_B, "chunk", { glyph: "cube", trail: "none", motion: "pulse", burst: "crack" }],
  ["scrapheap-charge", "dash", CORRODE_A, CORRODE_B, "chunk", { glyph: "cube", trail: "echo", motion: "steady", burst: "crack" }],
  ["magnet-rot", "pull", CORRODE_B, CORRODE_A, "dust", { glyph: "spiral", trail: "ribbon", motion: "wobble", burst: "spiral" }],
  ["crumble-step", "blink", CORRODE_A, CORRODE_B, "dust", { glyph: "crescent", trail: "echo", motion: "steady", burst: "scatter" }],
  ["acid-pool", "zone", CORRODE_B, CORRODE_A, "drop", { glyph: "drop", trail: "none", motion: "pulse", burst: "ring" }],
  ["oxidise", "burst", CORRODE_B, CORRODE_A, "dust", { glyph: "flower", trail: "none", motion: "pulse", burst: "ring" }],
);
for (const [id, kind, a, b, p, d] of ROWS) designLook(id, a, b, p, { kind, ...d });
