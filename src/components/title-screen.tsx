import { useEffect, useRef, useState, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { PiArrowRightBold, PiBookOpenTextBold, PiCrownSimpleBold, PiFlagBannerBold, PiMapTrifoldBold, PiShieldChevronBold, PiSwordBold, PiTreeStructureBold, PiTrophyBold, PiUsersThreeBold } from "react-icons/pi";
import { Text } from "@/lib/strings";
import type { StringKey } from "@/lib/strings";
import { cn } from "@/lib/utils";
import { DEF_BY_ID, FIGHTERS, type FighterDef } from "@/lib/fighters";
import { BOSSES } from "@/lib/bosses";
import { W, H, newDemo, newGame, step, drawScene, buildBackdrop, type Game } from "@/lib/arena-engine";

/** The arena's modes, plus Free World, which opens its own screen. */
export type TitleMode = "story" | "duel" | "ffa" | "teams" | "tournament" | "teamTournament" | "juggernaut" | "free" | "legacy";
type Mode = TitleMode;

const MODE_ORDER: Mode[] = ["story", "duel", "ffa", "teams", "tournament", "teamTournament", "juggernaut", "free", "legacy"];
const MODE_NAME_KEYS: Record<Mode, StringKey> = {
  story: "arena.mode.story",
  duel: "arena.mode.duel",
  ffa: "arena.mode.ffa",
  teams: "arena.mode.teams",
  tournament: "arena.mode.tournament",
  teamTournament: "arena.mode.teamTournament",
  juggernaut: "arena.mode.juggernaut",
  free: "free.modeName",
  legacy: "arena.mode.legacy",
};
const MODE_DESC_KEYS: Record<Mode, StringKey> = {
  story: "title.modes.story",
  duel: "title.modes.duel",
  ffa: "title.modes.ffa",
  teams: "title.modes.teams",
  tournament: "title.modes.tournament",
  teamTournament: "title.modes.teamTournament",
  juggernaut: "title.modes.juggernaut",
  free: "title.modes.free",
  legacy: "title.modes.legacy",
};
const MODE_ICONS: Record<Mode, IconType> = {
  story: PiBookOpenTextBold,
  duel: PiSwordBold,
  ffa: PiShieldChevronBold,
  teams: PiUsersThreeBold,
  tournament: PiTreeStructureBold,
  teamTournament: PiTrophyBold,
  juggernaut: PiCrownSimpleBold,
  free: PiMapTrifoldBold,
  legacy: PiFlagBannerBold,
};
/** Each mode card's accent, taken from a fighter whose power suits it. */
const MODE_TINT: Record<Mode, FighterDef["id"]> = {
  story: "psy",
  duel: "pyro",
  ffa: "electro",
  teams: "hydro",
  tournament: "lux",
  teamTournament: "terra",
  juggernaut: "umbra",
  free: "flora",
  legacy: "magneto",
};

/** Who fights behind the title next: Pyro against Hydro first, then random match-ups, now and then a Story boss. */
function nextPair(round: number): FighterDef[] {
  if (round === 0) return [DEF_BY_ID.pyro, DEF_BY_ID.hydro];
  const a = FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)];
  if (round % 3 === 2) {
    const bosses = Object.values(BOSSES);
    return [a, bosses[Math.floor(Math.random() * bosses.length)]];
  }
  let b = a;
  while (b === a) b = FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)];
  return [a, b];
}

/** A real, silent fight running behind the title: entrances, combat and the K.O., then the next match-up. */
function AttractFight({ onPair }: { onPair: (pair: FighterDef[]) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pairRef = useRef(onPair);
  pairRef.current = onPair;
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const backdrop = buildBackdrop();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let round = 0;
    const start = (): Game => {
      const pair = nextPair(round++);
      pairRef.current(pair);
      return still ? newGame(pair, true) : newDemo(pair);
    };
    let g = start();
    if (still) {
      drawScene(ctx, g, backdrop);
      return;
    }
    let raf = 0;
    let last = performance.now();
    let doneAt = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        step(g, dt);
        g.sfx.length = 0;
        if (g.over) {
          doneAt += dt;
          if (doneAt > 1.2) { g = start(); doneAt = 0; }
        }
        drawScene(ctx, g, backdrop);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={W} height={H} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-bottom" />;
}

/** Classic yin-yang swirl, recoloured to the two elements instead of black and white. */
function ElementYinYang({ redColor, blueColor, className }: { redColor: string; blueColor: string; className?: string }) {
  return (
    <svg viewBox="-52 -52 104 104" className={className} role="img" aria-label="Pyro and Hydro's powers in balance">
      <circle r="50" fill={blueColor} />
      <path d="M0,-50 A50,50 0 0 1 0,50 A25,25 0 0 1 0,0 A25,25 0 0 0 0,-50 Z" fill={redColor} />
      <circle cx="0" cy="-25" r="8" fill={blueColor} />
      <circle cx="0" cy="25" r="8" fill={redColor} />
      <circle r="50" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
    </svg>
  );
}

/** A ring of ticks around the emblem, one per way to fight, turning the other way to the swirl inside. */
function EmblemRing({ className }: { className?: string }) {
  return (
    <svg viewBox="-60 -60 120 120" className={className} aria-hidden="true">
      <circle r="56" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="3 6" />
      {MODE_ORDER.map((m, i) => {
        const a = (i / MODE_ORDER.length) * Math.PI * 2;
        return (
          <rect
            key={m}
            x={Math.cos(a) * 56 - 3}
            y={Math.sin(a) * 56 - 3}
            width="6"
            height="6"
            transform={`rotate(45 ${Math.cos(a) * 56} ${Math.sin(a) * 56})`}
            fill={DEF_BY_ID[MODE_TINT[m]].color}
          />
        );
      })}
    </svg>
  );
}

/** Embers and droplets drifting up each side of the title, in the colours of whoever is fighting. */
const SPARKS: { x: number; delay: number; dur: number; size: number; drift: string; side: 0 | 1 }[] = [
  { x: 4, delay: 0, dur: 6.2, size: 6, drift: "1.5rem", side: 0 },
  { x: 11, delay: 2.1, dur: 7.4, size: 4, drift: "-1rem", side: 0 },
  { x: 17, delay: 3.8, dur: 5.6, size: 5, drift: "2rem", side: 0 },
  { x: 24, delay: 1.2, dur: 8.1, size: 3, drift: "0.5rem", side: 0 },
  { x: 30, delay: 4.6, dur: 6.8, size: 4, drift: "-1.5rem", side: 0 },
  { x: 8, delay: 5.3, dur: 7, size: 3, drift: "1rem", side: 0 },
  { x: 70, delay: 0.8, dur: 6.6, size: 4, drift: "-1.5rem", side: 1 },
  { x: 77, delay: 3.1, dur: 7.8, size: 6, drift: "1rem", side: 1 },
  { x: 83, delay: 1.9, dur: 5.8, size: 3, drift: "-0.5rem", side: 1 },
  { x: 89, delay: 4.2, dur: 7.2, size: 5, drift: "-2rem", side: 1 },
  { x: 95, delay: 2.6, dur: 6.4, size: 4, drift: "1.5rem", side: 1 },
  { x: 92, delay: 5.6, dur: 8.4, size: 3, drift: "-1rem", side: 1 },
];

const INK = "hsl(250 32% 10%)";
const INK_DEEP = "hsl(250 32% 6%)";
const GOLD = "hsl(45 95% 62%)";
const fade = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

/** One side of the "now fighting" banner: the fighter's name over their power, on a slanted plate in their colour. */
function NamePlate({ def, side }: { def?: FighterDef; side: "left" | "right" }) {
  if (!def) return null;
  return (
    <span
      className={cn(
        "flex min-w-0 -skew-x-12 flex-col border-b-2 bg-[hsl(250_32%_8%/0.82)] px-3 py-1 backdrop-blur-sm",
        side === "left" ? "items-end rounded-l-md text-right" : "items-start rounded-r-md text-left",
      )}
      style={{ borderColor: def.color, boxShadow: `inset 0 0 18px ${fade(def.color, 30)}` }}
    >
      <span className="skew-x-12 truncate font-display text-base leading-[1.2] sm:text-lg" style={{ color: def.glow }}>{def.name}</span>
      <span className="hidden skew-x-12 truncate text-xs font-semibold uppercase tracking-[0.1em] text-white/60 sm:block">{def.power}</span>
    </span>
  );
}

export function TitleScreen({ onPick, music }: { onPick: (mode: Mode) => void; music?: ReactNode }) {
  const pyro = DEF_BY_ID.pyro;
  const hydro = DEF_BY_ID.hydro;
  const [pair, setPair] = useState<FighterDef[]>([pyro, hydro]);
  const left = pair[0] ?? pyro;
  const right = pair[1] ?? hydro;
  return (
    <div className="relative overflow-hidden rounded-2xl border-4 border-border text-white shadow-[0_8px_0_hsl(250_32%_6%/0.25)]" style={{ backgroundColor: INK }} data-title-screen>
      {/* gold corner brackets around the whole screen */}
      {(["left-2 top-2 border-l-2 border-t-2 rounded-tl-lg", "right-2 top-2 border-r-2 border-t-2 rounded-tr-lg", "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg", "bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg"] as const).map((c) => (
        <span key={c} aria-hidden="true" className={cn("pointer-events-none absolute z-20 h-6 w-6", c)} style={{ borderColor: GOLD }} />
      ))}

      {/* the live fight, framed like a broadcast and dimmed toward the bottom so the menu reads */}
      <div className="relative flex min-h-[32rem] w-full flex-col justify-end sm:aspect-[16/8] sm:min-h-0" data-title-hero>
        <AttractFight onPair={setPair} />
        <div aria-hidden="true" className="title-scanlines absolute inset-0 opacity-60" />
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-[background-image] duration-300"
          style={{
            backgroundImage: `radial-gradient(ellipse 45% 70% at 0% 55%, ${fade(left.color, 32)}, transparent 70%), radial-gradient(ellipse 45% 70% at 100% 55%, ${fade(right.color, 32)}, transparent 70%), radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, hsl(250 32% 6% / 0.55) 100%)`,
          }}
        />
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to bottom, hsl(250 32% 10% / 0.1) 38%, hsl(250 32% 10% / 0.55) 72%, ${INK})` }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 overflow-hidden">
          {SPARKS.map((s, i) => {
            const c = s.side === 0 ? left.glow : right.glow;
            return (
              <span
                key={i}
                className="title-ember absolute bottom-0 rounded-full"
                style={{
                  left: `${s.x}%`,
                  width: s.size,
                  height: s.side === 0 ? s.size : s.size * 1.4,
                  backgroundColor: c,
                  boxShadow: `0 0 ${s.size * 2}px ${c}`,
                  ["--delay" as string]: `${s.delay}s`,
                  ["--dur" as string]: `${s.dur}s`,
                  ["--drift" as string]: s.drift,
                }}
              />
            );
          })}
        </div>

        {music && <div className="absolute right-4 top-4 z-10 rounded-full bg-card/90 px-2 py-1 text-foreground shadow-sm">{music}</div>}

        {/* Now fighting: a versus banner with both fighters' names and powers */}
        <div className="absolute left-4 top-[4.25rem] z-10 flex max-w-[calc(100%-2rem)] flex-col items-start gap-1.5 sm:top-4" data-title-versus>
          <p className="flex items-center gap-2 rounded-full bg-[hsl(250_32%_8%/0.75)] px-3 py-1 text-xs text-white/90">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(0_85%_60%)] motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(0_85%_60%)]" />
            </span>
            <Text id="title.nowFighting" as="span" className="font-semibold uppercase tracking-[0.12em]" />
          </p>
          <p className="flex min-w-0 items-center">
            <NamePlate def={left} side="left" />
            <span
              className="relative z-10 -mx-1.5 flex h-9 w-9 shrink-0 rotate-45 items-center justify-center rounded-md border-2 shadow-[0_3px_0_hsl(250_32%_6%)]"
              style={{ borderColor: GOLD, backgroundImage: `linear-gradient(135deg, ${left.color}, ${right.color})` }}
            >
              <Text id="title.versus" as="span" className="-rotate-45 font-display text-sm uppercase text-white drop-shadow-[0_1px_0_hsl(250_32%_6%)]" />
            </span>
            <NamePlate def={right} side="right" />
          </p>
        </div>

        {/* the title itself */}
        <div className="relative flex flex-col items-center gap-3 px-6 pb-6 pt-28 text-center sm:pb-10 sm:pt-16">
          <div className="relative flex h-20 w-20 items-center justify-center sm:h-28 sm:w-28">
            <div aria-hidden="true" className="title-pulse absolute inset-0 rounded-full blur-xl" style={{ backgroundImage: `radial-gradient(circle, ${fade(pyro.color, 55)}, ${fade(hydro.color, 35)} 55%, transparent 72%)` }} />
            <EmblemRing className="absolute inset-0 h-full w-full motion-safe:animate-[spin_40s_linear_infinite_reverse]" />
            <ElementYinYang redColor={pyro.color} blueColor={hydro.color} className="relative h-14 w-14 drop-shadow-lg motion-safe:animate-[spin_18s_linear_infinite] sm:h-20 sm:w-20" />
          </div>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-0.5 w-8 rounded-full sm:w-20" style={{ backgroundImage: `linear-gradient(90deg, transparent, ${pyro.color})` }} />
            <Text id="title.eyebrow" as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85" />
            <span aria-hidden="true" className="h-0.5 w-8 rounded-full sm:w-20" style={{ backgroundImage: `linear-gradient(90deg, ${hydro.color}, transparent)` }} />
          </div>
          <h1
            className="title-sheen text-balance bg-clip-text font-display text-6xl leading-[1.1] tracking-[-0.03em] text-transparent [filter:drop-shadow(0_5px_0_hsl(250_32%_6%))_drop-shadow(0_0_30px_rgb(0_0_0/0.45))] sm:text-8xl"
            style={{
              backgroundImage: `linear-gradient(105deg, transparent 42%, rgb(255 255 255 / 0.85) 50%, transparent 58%), linear-gradient(90deg, ${pyro.glow}, ${pyro.color} 35%, ${hydro.color} 65%, ${hydro.glow})`,
            }}
          >
            <Text id="common.appName" />
          </h1>
          <Text id="title.tagline" as="p" className="max-w-prose text-base text-white/85 sm:text-lg" />
        </div>
      </div>

      {/* the mode select, on an arena floor lit by both fighters */}
      <div className="relative">
        <div aria-hidden="true" className="title-floor pointer-events-none absolute inset-x-[-25%] top-0 h-72" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: `radial-gradient(ellipse 50% 40% at 15% 0%, ${fade(left.color, 16)}, transparent 70%), radial-gradient(ellipse 50% 40% at 85% 0%, ${fade(right.color, 16)}, transparent 70%)` }}
        />
        <div className="relative flex flex-col items-center gap-6 px-4 pb-8 pt-2 sm:px-8 sm:pb-10">
          <div className="flex w-full max-w-5xl items-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent to-white/25" />
            <span aria-hidden="true" className="h-2 w-2 rotate-45" style={{ backgroundColor: GOLD }} />
            <Text id="title.cta" as="p" className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80" />
            <span aria-hidden="true" className="h-2 w-2 rotate-45" style={{ backgroundColor: GOLD }} />
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-white/25" />
          </div>
          <div className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" data-title-modes>
            {MODE_ORDER.map((m, i) => {
              const Icon = MODE_ICONS[m];
              const tint = DEF_BY_ID[MODE_TINT[m]];
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onPick(m)}
                  style={{ ["--tint" as string]: tint.color, ["--tint-glow" as string]: tint.glow }}
                  className={cn(
                    "group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border-2 border-white/10 bg-[hsl(250_30%_14%/0.92)] p-4 text-left shadow-[0_4px_0_hsl(250_32%_6%)]",
                    "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out",
                    "hover:-translate-y-0.5 hover:border-[var(--tint)] hover:bg-[hsl(250_30%_17%)] hover:shadow-[0_6px_0_hsl(250_32%_6%),0_0_26px_color-mix(in_srgb,var(--tint)_35%,transparent)]",
                    "active:translate-y-0.5 active:shadow-[0_2px_0_hsl(250_32%_6%)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tint-glow)]",
                    // the ninth mode, Legacy, takes a whole row of its own under the other eight
                    m === "legacy" && "sm:col-span-2 lg:col-span-4",
                  )}
                >
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--tint)]" />
                  <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--tint)] opacity-20 blur-2xl transition-opacity duration-200 group-hover:opacity-40" />
                  <span className="relative flex items-center justify-between">
                    <span className="ml-1 mt-1 flex h-9 w-9 rotate-45 items-center justify-center rounded-md bg-[var(--tint)] shadow-[0_0_18px_var(--tint)]">
                      <Icon className="h-5 w-5 -rotate-45 text-white drop-shadow-[0_1px_0_hsl(250_32%_6%/0.6)]" aria-hidden="true" />
                    </span>
                    <span aria-hidden="true" className="font-display text-sm tabular-nums text-white/45">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="relative flex flex-1 flex-col gap-1">
                    <Text id={MODE_NAME_KEYS[m]} as="span" className="font-display text-xl text-white" />
                    <Text id={MODE_DESC_KEYS[m]} as="span" className="text-sm text-white/70" />
                  </span>
                  <span aria-hidden="true" className="relative flex items-center gap-2 text-white/50 transition-colors duration-200 group-hover:text-[var(--tint-glow)]">
                    <span className="h-px flex-1 bg-current opacity-40" />
                    <PiArrowRightBold className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* the roster scrolling past along the bottom */}
        <div aria-hidden="true" className="relative overflow-hidden border-t border-white/10 bg-[hsl(250_32%_6%/0.6)] py-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="title-marquee flex w-max">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex shrink-0">
                {FIGHTERS.map((f) => (
                  <span key={f.id} className="flex items-center gap-2 px-5 whitespace-nowrap">
                    <span className="h-2 w-2 rotate-45" style={{ backgroundColor: f.color, boxShadow: `0 0 8px ${f.glow}` }} />
                    <span className="font-display text-sm" style={{ color: f.glow }}>{f.name}</span>
                    <span className="text-xs uppercase tracking-[0.1em] text-white/50">{f.power}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
