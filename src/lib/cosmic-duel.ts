import type { Form } from "./forms";

export type CosmicArenaId =
  | "galaxy"
  | "multiverse"
  | "void"
  | "supervoid"
  | "nonexistence"
  | "lightdark"
  | "reality"
  | "sun"
  | "blackhole"
  | "eternity";

export type CosmicArena = { id: CosmicArenaId; name: string; sub: string; accent: string };

export const COSMIC_ARENAS: CosmicArena[] = [
  { id: "galaxy", name: "THE GALAXY", sub: "Spiral Core • 100,000 Light-Years", accent: "hsl(268 95% 74%)" },
  { id: "multiverse", name: "THE MULTIVERSE", sub: "Infinite Fractured Timelines", accent: "hsl(192 100% 68%)" },
  { id: "void", name: "THE VOID", sub: "Beyond All Matter", accent: "hsl(265 60% 56%)" },
  { id: "supervoid", name: "THE SUPERVOID", sub: "1.8 Billion Light-Years of Emptiness", accent: "hsl(228 70% 60%)" },
  { id: "nonexistence", name: "NONEXISTENCE", sub: "Where Being Ends", accent: "hsl(0 0% 92%)" },
  { id: "lightdark", name: "REALM OF LIGHT & DARK", sub: "The Primordial Divide", accent: "hsl(46 100% 68%)" },
  { id: "reality", name: "CONCEPT OF REALITY", sub: "Pure Axiom & Sacred Geometry", accent: "hsl(168 100% 62%)" },
  { id: "sun", name: "INSIDE THE SUN", sub: "15,000,000°K Fusion Core", accent: "hsl(34 100% 62%)" },
  { id: "blackhole", name: "EVENT HORIZON", sub: "Singularity Collapse", accent: "hsl(24 100% 64%)" },
  { id: "eternity", name: "EDGE OF ETERNITY", sub: "Outside of Time", accent: "hsl(356 100% 66%)" },
];

export const ZENITH_UNBOUND: Form = {
  power: "lux",
  kind: "phase",
  step: 5,
  title: "ZENITH UNBOUND",
  label: "Limit Breaker",
  blurb: "Zenith shatters its own seal and ascends beyond the sky itself.",
  body: "hsl(48 100% 96%)",
  glow: "hsl(46 100% 68%)",
  a: "hsl(46 100% 72%)",
  b: "hsl(0 0% 100%)",
  at: 1,
  dmg: 1.85,
  kb: 1.45,
  cd: 0.48,
  speed: 1.55,
  act: 1.4,
  dodge: 0.22,
  guard: 0.72,
  drain: 0.1,
  moves: [],
};

export const CARNAEL_APEX: Form = {
  power: "umbra",
  kind: "phase",
  step: 5,
  title: "CARNAEL APEX",
  label: "Limit Breaker",
  blurb: "Carnael tears open its final seal, burning with the red harvest of every star.",
  body: "hsl(352 60% 6%)",
  glow: "hsl(356 100% 58%)",
  a: "hsl(356 100% 54%)",
  b: "hsl(16 100% 74%)",
  dark: "hsl(350 80% 4%)",
  at: 1,
  dmg: 1.85,
  kb: 1.45,
  cd: 0.48,
  speed: 1.55,
  act: 1.4,
  dodge: 0.22,
  guard: 0.72,
  drain: 0.16,
  moves: [],
};

export const COSMIC_PHASES: Record<"zenith" | "carnael", Form[]> = {
  zenith: [
    ZENITH_UNBOUND,
    {
      ...ZENITH_UNBOUND,
      step: 6,
      at: 0.7,
      title: "ASTRAL SOVEREIGN",
      label: "Phase 6",
      body: "hsl(52 100% 98%)",
      glow: "hsl(44 100% 72%)",
      a: "hsl(48 100% 76%)",
      b: "hsl(195 100% 92%)",
      dmg: 2.05,
      kb: 1.55,
      cd: 0.44,
      speed: 1.65,
      act: 1.48,
      dodge: 0.25,
      guard: 0.68,
      drain: 0.12,
    },
    {
      ...ZENITH_UNBOUND,
      step: 7,
      at: 0.4,
      title: "OMNIPRESENT DAWN",
      label: "Phase 7",
      body: "hsl(0 0% 100%)",
      glow: "hsl(50 100% 80%)",
      a: "hsl(196 100% 78%)",
      b: "hsl(48 100% 92%)",
      dmg: 2.3,
      kb: 1.68,
      cd: 0.38,
      speed: 1.78,
      act: 1.58,
      dodge: 0.28,
      guard: 0.64,
      drain: 0.15,
    },
    {
      ...ZENITH_UNBOUND,
      step: 8,
      at: 0.18,
      title: "BEYOND REALITY",
      label: "Phase 8",
      body: "hsl(0 0% 100%)",
      glow: "hsl(0 0% 100%)",
      a: "hsl(46 100% 84%)",
      b: "hsl(280 100% 90%)",
      dmg: 2.6,
      kb: 1.8,
      cd: 0.34,
      speed: 1.9,
      act: 1.7,
      dodge: 0.32,
      guard: 0.58,
      drain: 0.18,
    },
  ],
  carnael: [
    CARNAEL_APEX,
    {
      ...CARNAEL_APEX,
      step: 6,
      at: 0.7,
      title: "CRIMSON SINGULARITY",
      label: "Phase 6",
      body: "hsl(354 70% 5%)",
      glow: "hsl(356 100% 62%)",
      a: "hsl(356 100% 56%)",
      b: "hsl(24 100% 78%)",
      dmg: 2.05,
      kb: 1.55,
      cd: 0.44,
      speed: 1.65,
      act: 1.48,
      dodge: 0.25,
      guard: 0.68,
      drain: 0.18,
    },
    {
      ...CARNAEL_APEX,
      step: 7,
      at: 0.4,
      title: "ETERNAL OBLIVION",
      label: "Phase 7",
      body: "hsl(350 85% 4%)",
      glow: "hsl(2 100% 66%)",
      a: "hsl(352 100% 52%)",
      b: "hsl(0 0% 100%)",
      dmg: 2.3,
      kb: 1.68,
      cd: 0.38,
      speed: 1.78,
      act: 1.58,
      dodge: 0.28,
      guard: 0.64,
      drain: 0.22,
    },
    {
      ...CARNAEL_APEX,
      step: 8,
      at: 0.18,
      title: "THE FINAL ECLIPSE",
      label: "Phase 8",
      body: "hsl(0 0% 2%)",
      glow: "hsl(356 100% 70%)",
      a: "hsl(356 100% 60%)",
      b: "hsl(42 100% 88%)",
      dmg: 2.6,
      kb: 1.8,
      cd: 0.34,
      speed: 1.9,
      act: 1.7,
      dodge: 0.32,
      guard: 0.58,
      drain: 0.26,
    },
  ],
};

export type CosmicDuelState = {
  phase: "cutscene" | "fighting";
  cutT: number;
  cutMax: number;
  transformed: boolean;
  arenaIdx: number;
  arenaT: number;
  nextShift: number;
  warpT: number;
  bannerT: number;
};

export function createCosmicDuel(): CosmicDuelState {
  return {
    phase: "cutscene",
    cutT: 0,
    cutMax: 4.2,
    transformed: false,
    arenaIdx: 0,
    arenaT: 0,
    nextShift: 4.5,
    warpT: 0,
    bannerT: 0,
  };
}

function drawSpeedLines(ctx: CanvasRenderingContext2D, t: number, W: number, H: number, intensity: number, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const count = Math.floor(22 + intensity * 36);
  for (let i = 0; i < count; i++) {
    const seed = (i * 9301 + 49297) % 233280;
    const y = (seed / 233280) * H;
    const speed = 1400 + (i % 7) * 420;
    const len = 90 + (i % 5) * 65 + intensity * 180;
    const x = ((t * speed + seed) % (W + len * 2)) - len;
    ctx.strokeStyle = color;
    ctx.globalAlpha = (0.14 + (i % 4) * 0.06) * Math.min(1, 0.55 + intensity);
    ctx.lineWidth = 1 + (i % 3) * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCosmicArena(
  ctx: CanvasRenderingContext2D,
  state: CosmicDuelState,
  t: number,
  W: number,
  H: number,
  GROUND: number,
) {
  const arena = COSMIC_ARENAS[state.arenaIdx] ?? COSMIC_ARENAS[0];
  ctx.save();

  switch (arena.id) {
    case "galaxy": {
      const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 20, W * 0.5, H * 0.42, W * 0.72);
      g.addColorStop(0, "hsl(46 95% 86%)");
      g.addColorStop(0.22, "hsl(282 78% 42%)");
      g.addColorStop(0.55, "hsl(245 65% 14%)");
      g.addColorStop(1, "hsl(240 50% 4%)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W * 0.5, H * 0.42);
      ctx.rotate(t * 0.25);
      for (let arm = 0; arm < 4; arm++) {
        ctx.rotate(Math.PI / 2);
        ctx.strokeStyle = arm % 2 === 0 ? "hsl(290 90% 72% / 0.28)" : "hsl(200 95% 72% / 0.24)";
        ctx.lineWidth = 26;
        ctx.beginPath();
        for (let a = 0; a < 3.4; a += 0.15) {
          const r = a * 120;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r * 0.55;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case "multiverse": {
      ctx.fillStyle = "hsl(248 45% 7%)";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 8; i++) {
        const px = ((i * 197 + 90 + Math.sin(t * 0.8 + i) * 30) % W);
        const py = 90 + (i % 3) * 140 + Math.cos(t * 0.9 + i) * 18;
        const r = 56 + (i % 3) * 28;
        const hue = (i * 52 + t * 25) % 360;
        const rg = ctx.createRadialGradient(px, py, 6, px, py, r);
        rg.addColorStop(0, `hsl(${hue} 100% 80% / 0.85)`);
        rg.addColorStop(0.6, `hsl(${(hue + 40) % 360} 85% 45% / 0.35)`);
        rg.addColorStop(1, "transparent");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "void": {
      ctx.fillStyle = "hsl(260 35% 3%)";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "hsl(272 80% 56% / 0.35)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const x0 = (i * 210 + 80) % W;
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0 + Math.sin(t * 2 + i) * 45, H * 0.5);
        ctx.lineTo(x0 - Math.cos(t * 1.7 + i) * 35, H);
        ctx.stroke();
      }
      break;
    }
    case "supervoid": {
      const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 40, W * 0.5, H * 0.45, W * 0.7);
      g.addColorStop(0, "hsl(235 45% 2%)");
      g.addColorStop(0.75, "hsl(232 45% 6%)");
      g.addColorStop(1, "hsl(225 65% 20%)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "hsl(220 80% 66% / 0.16)";
      for (let i = 1; i <= 5; i++) {
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.45, i * 95 + ((t * 40) % 95), 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case "nonexistence": {
      ctx.fillStyle = "hsl(0 0% 96%)";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "hsl(0 0% 8% / 0.22)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        const y = ((i * 64 + t * 90) % H);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.fillStyle = "hsl(0 0% 4% / 0.85)";
      for (let i = 0; i < 6; i++) {
        const rx = ((i * 230 + Math.floor(t * 14) * 37) % W);
        const ry = ((i * 113) % (H - 80));
        ctx.fillRect(rx, ry, 70 + (i % 3) * 40, 6 + (i % 2) * 8);
      }
      break;
    }
    case "lightdark": {
      ctx.fillStyle = "hsl(46 95% 88%)";
      ctx.fillRect(0, 0, W * 0.5, H);
      ctx.fillStyle = "hsl(352 55% 6%)";
      ctx.fillRect(W * 0.5, 0, W * 0.5, H);
      const seam = ctx.createLinearGradient(W * 0.5 - 60, 0, W * 0.5 + 60, 0);
      seam.addColorStop(0, "transparent");
      seam.addColorStop(0.5, "hsl(18 100% 62% / 0.85)");
      seam.addColorStop(1, "transparent");
      ctx.fillStyle = seam;
      ctx.fillRect(W * 0.5 - 60, 0, 120, H);
      break;
    }
    case "reality": {
      ctx.fillStyle = "hsl(210 55% 8%)";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "hsl(168 100% 62% / 0.25)";
      ctx.lineWidth = 1.2;
      const step = 64;
      const off = (t * 60) % step;
      for (let x = -step; x < W + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x + off, 0);
        ctx.lineTo(x + off, H);
        ctx.stroke();
      }
      for (let y = -step; y < H + step; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y + off);
        ctx.lineTo(W, y + off);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(W * 0.5, H * 0.44);
      ctx.rotate(t * 0.5);
      ctx.strokeStyle = "hsl(48 100% 72% / 0.45)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-110, -110, 220, 220);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-110, -110, 220, 220);
      ctx.restore();
      break;
    }
    case "sun": {
      const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 30, W * 0.5, H * 0.5, W * 0.72);
      g.addColorStop(0, "hsl(54 100% 94%)");
      g.addColorStop(0.4, "hsl(36 100% 58%)");
      g.addColorStop(0.85, "hsl(14 100% 42%)");
      g.addColorStop(1, "hsl(4 90% 24%)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "hsl(52 100% 88% / 0.4)";
      ctx.lineWidth = 8;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.55, 110 + i * 75, t * 0.6 + i, t * 0.6 + i + 1.4);
        ctx.stroke();
      }
      break;
    }
    case "blackhole": {
      ctx.fillStyle = "hsl(240 35% 3%)";
      ctx.fillRect(0, 0, W, H);
      const cx = W * 0.5;
      const cy = H * 0.43;
      const halo = ctx.createRadialGradient(cx, cy, 70, cx, cy, 290);
      halo.addColorStop(0, "hsl(34 100% 78% / 0.95)");
      halo.addColorStop(0.35, "hsl(18 100% 54% / 0.6)");
      halo.addColorStop(1, "transparent");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 310, 72, 0.08 * Math.sin(t), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "hsl(0 0% 0%)";
      ctx.beginPath();
      ctx.arc(cx, cy, 86, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "hsl(40 100% 82% / 0.9)";
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }
    case "eternity": {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "hsl(352 65% 10%)");
      g.addColorStop(0.5, "hsl(276 55% 14%)");
      g.addColorStop(1, "hsl(42 80% 18%)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W * 0.5, H * 0.42);
      ctx.strokeStyle = "hsl(46 100% 74% / 0.4)";
      ctx.lineWidth = 3;
      for (let i = 1; i <= 3; i++) {
        ctx.save();
        ctx.rotate(t * (i % 2 === 0 ? 0.4 : -0.35));
        ctx.beginPath();
        ctx.arc(0, 0, 85 * i, 0, Math.PI * 1.6);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      break;
    }
  }

  // Energy floor plane so fighters have a crisp ground reference in every cosmic arena
  const floorGrad = ctx.createLinearGradient(0, GROUND, 0, H);
  floorGrad.addColorStop(0, arena.id === "nonexistence" ? "hsl(0 0% 10% / 0.22)" : "hsl(0 0% 100% / 0.16)");
  floorGrad.addColorStop(1, "hsl(0 0% 0% / 0.65)");
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.strokeStyle = arena.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  ctx.lineTo(W, GROUND);
  ctx.stroke();

  // Persistent lightspeed streaks + warp burst on arena transition
  drawSpeedLines(ctx, t, W, H, state.warpT > 0 ? 1.4 : 0.45, arena.id === "nonexistence" ? "hsl(0 0% 10%)" : "hsl(0 0% 100%)");
  ctx.restore();
}

export function drawCosmicCutscene(
  ctx: CanvasRenderingContext2D,
  state: CosmicDuelState,
  t: number,
  W: number,
  H: number,
  zenithX: number,
  carnaelX: number,
  GROUND: number,
) {
  const k = Math.min(1, state.cutT / state.cutMax);
  ctx.save();
  ctx.fillStyle = `hsl(250 45% 4% / ${0.62 + 0.25 * Math.sin(k * Math.PI)})`;
  ctx.fillRect(0, 0, W, H);

  // Energy pillars rising from both fighters
  const drawPillar = (x: number, colA: string, colB: string) => {
    const w = 44 + 80 * Math.min(1, k * 2.2) + Math.sin(t * 28) * 10;
    const pg = ctx.createLinearGradient(x - w, 0, x + w, 0);
    pg.addColorStop(0, "transparent");
    pg.addColorStop(0.5, colA);
    pg.addColorStop(1, "transparent");
    ctx.fillStyle = pg;
    ctx.fillRect(x - w, 0, w * 2, GROUND + 20);
    ctx.strokeStyle = colB;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, GROUND - 55, 36 + ((t * 260) % 160), 0, Math.PI * 2);
    ctx.stroke();
  };
  drawPillar(zenithX, "hsl(46 100% 72% / 0.55)", "hsl(48 100% 90% / 0.8)");
  drawPillar(carnaelX, "hsl(356 100% 52% / 0.55)", "hsl(12 100% 72% / 0.8)");

  if (k > 0.62) {
    drawSpeedLines(ctx, t, W, H, (k - 0.62) * 4, "hsl(0 0% 100%)");
  }

  // Letterbox bars
  const barH = 56;
  ctx.fillStyle = "hsl(0 0% 2%)";
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);

  // Cinematic title text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let title = "LIMITS SHATTERED";
  let sub = "ZENITH & CARNAEL BREAK BEYOND ALL BOUNDS";
  let col = "hsl(46 100% 76%)";
  if (state.cutT >= 2.8) {
    title = "LIGHTSPEED CLASH";
    sub = "SHATTERING REALITY ACROSS THE COSMOS";
    col = "hsl(0 0% 100%)";
  } else if (state.cutT >= 1.4) {
    title = "ZENITH UNBOUND  ×  CARNAEL APEX";
    sub = "TRANSCENDENT FORMS AWAKENED";
    col = "hsl(16 100% 72%)";
  }
  ctx.font = "900 34px Fredoka, sans-serif";
  ctx.fillStyle = "hsl(0 0% 0% / 0.7)";
  ctx.fillText(title, W / 2 + 2, H * 0.24 + 2);
  ctx.fillStyle = col;
  ctx.fillText(title, W / 2, H * 0.24);
  ctx.font = "700 15px Nunito, sans-serif";
  ctx.fillStyle = "hsl(0 0% 96% / 0.9)";
  ctx.fillText(sub, W / 2, H * 0.24 + 32);
  ctx.restore();
}

export function drawCosmicHud(ctx: CanvasRenderingContext2D, state: CosmicDuelState, W: number, H: number) {
  const arena = COSMIC_ARENAS[state.arenaIdx] ?? COSMIC_ARENAS[0];
  ctx.save();
  if (state.warpT > 0) {
    ctx.fillStyle = `hsl(0 0% 100% / ${Math.min(0.85, state.warpT * 1.4)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.bannerT > 0) {
    const alpha = Math.min(1, state.bannerT * 1.6);
    ctx.globalAlpha = alpha;
    const bw = 360;
    const bh = 46;
    const bx = (W - bw) / 2;
    const by = 66;
    ctx.fillStyle = "hsl(240 30% 6% / 0.78)";
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = arena.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.textAlign = "center";
    ctx.font = "900 17px Fredoka, sans-serif";
    ctx.fillStyle = arena.accent;
    ctx.fillText(arena.name, W / 2, by + 19);
    ctx.font = "700 11px Nunito, sans-serif";
    ctx.fillStyle = "hsl(0 0% 92% / 0.85)";
    ctx.fillText(arena.sub, W / 2, by + 36);
  }
  ctx.restore();
}