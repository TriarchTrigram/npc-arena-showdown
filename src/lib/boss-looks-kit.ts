// Shared pieces for the Story bosses' second layer (boss-looks.ts): the shape of one boss's entry and small drawing helpers.
import type { BossRig } from "./boss-designs";
import { glowDot, crystal, zig, leaf, star4, drift, floorRing, spokes, fp, hh, al, hsla, clamp, seg, easeOut, mid, flame, rock } from "./roster-looks";

export type Pt = { x: number; y: number };
export const TAU = Math.PI * 2;
export const HEAD = 11;
export const INK = "hsl(250 32% 14%)";

/** What the boss wears on top of its design, behind ("back") or over ("front") the body, plus what drifts off it at rest. */
export type LookFn = (ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, vx: number) => void;
/** Its power gathering in the hand as a move winds up: k runs 0..1. */
export type ChargeFn = (ctx: CanvasRenderingContext2D, h: Pt, s: number, t: number, k: number, face: number) => void;
/** Its own mark, thrown off the hand as a move leaves it and left on whoever the move hits: k runs 0..1 and it fades out. */
export type MarkFn = (ctx: CanvasRenderingContext2D, x: number, y: number, R: number, k: number, face: number, seed: number) => void;
/** A sign laid on the floor before the entrance lands: k is how far it has drawn (and fades it after). */
export type SignFn = (ctx: CanvasRenderingContext2D, x: number, g: number, s: number, k: number, t: number) => void;
/** A flourish of the power as the entrance lands: e runs 0..1 over the moments after. */
export type BurstFn = (ctx: CanvasRenderingContext2D, x: number, g: number, s: number, e: number, t: number) => void;
export type BossLook = { back?: LookFn; front?: LookFn; charge: ChargeFn; mark: MarkFn; sign: SignFn; burst: BurstFn };

export function poly(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n: number, rot: number, sy = 1) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * sy;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, w: number, sy = 1, a0 = 0, a1 = TAU) {
  if (r <= 0) return;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * sy, 0, a0, a1);
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.stroke();
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) {
  if (r <= 0) return;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/** A spiral of `arms` arms from the centre out to radius R, turned by rot; sy flattens it onto the floor. */
export function spiral(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, arms: number, rot: number, c: string, w: number, sy = 1, turns = 1.2) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  for (let a = 0; a < arms; a++) {
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const k = i / 24, ang = rot + (a / arms) * TAU + k * turns * TAU, rr = R * k;
      const px = x + Math.cos(ang) * rr, py = y + Math.sin(ang) * rr * sy;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
}

/** Points flung outward from (x, y): each called with its angle, distance 0..1 and index. */
export function fling(n: number, seed: number, fn: (ang: number, r1: number, i: number) => void) {
  for (let i = 0; i < n; i++) fn((i / n) * TAU + hh(seed + i) * 0.7, 0.6 + hh(seed + i * 3.3) * 0.4, i);
}

/** A tiny moth or bird: two flapping wing strokes. */
export function wings(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, flap: number, c: string, lw: number) {
  const up = Math.sin(flap) * w * 0.7;
  ctx.strokeStyle = c;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x - w, y - up);
  ctx.quadraticCurveTo(x - w * 0.4, y - w * 0.2, x, y);
  ctx.quadraticCurveTo(x + w * 0.4, y - w * 0.2, x + w, y - up);
  ctx.stroke();
}

/** A hexagon cell, pointy side up. */
export function hex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sy = 1) {
  poly(ctx, x, y, r, 6, Math.PI / 6, sy);
}

/** A four-arm snowflake. */
export function flake(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, c: string, w: number) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = rot + (i / 6) * TAU, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r;
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    const bx = x + Math.cos(a) * r * 0.6, by = y + Math.sin(a) * r * 0.6;
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a + 0.7) * r * 0.3, by + Math.sin(a + 0.7) * r * 0.3);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a - 0.7) * r * 0.3, by + Math.sin(a - 0.7) * r * 0.3);
  }
  ctx.stroke();
}

export { glowDot, crystal, zig, leaf, star4, drift, floorRing, spokes, fp, hh, al, hsla, clamp, seg, easeOut, mid, flame, rock };
