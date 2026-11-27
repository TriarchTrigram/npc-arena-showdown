// Hang out: chat with a fighter in character. Q&A mode is a plain chat; Chill mode puts a YouTube video on beside the
// chat and the fighter reacts to it. Who you can pick follows your progress: the original fighters always, quest
// fighters once earned, Story bosses once beaten, Zenith once it joined. The chat itself is api.hangout.tsx.
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Text, useString } from "@/lib/strings";
import type { StringKey } from "@/lib/strings";
import { VideoEmbed } from "@/components/video-embed";
import { PiChatsCircleBold, PiPaperPlaneRightBold, PiPopcornBold, PiYoutubeLogoBold, PiXBold } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageContainer, PageHeader, Panel, PanelBody } from "@/components/design";
import { FighterDot } from "@/components/fighter-dot";
import { FighterPortrait } from "@/components/quest-scenes";
import { Markdown } from "@/components/markdown";
import { ProgressCodeSheet } from "@/components/progress-code-sheet";
import { DevModeSheet } from "@/components/dev-mode-sheet";
import { cn } from "@/lib/utils";
import { FIGHTERS, QUESTERS, ZENITH_ROSTER_ID, bossRosterId, type FighterDef } from "@/lib/fighters";
import { BOSSES, type BossId } from "@/lib/bosses";
import { ZENITH } from "@/lib/zenith";
import { allCleared, bossesBeaten, loadProgress } from "@/lib/story";
import { useDevMode } from "@/lib/dev-mode";
import { useDevUnlocks } from "@/lib/dev-unlocks";
import { useQuests, useUnlocked, zenithJoined } from "@/lib/quests";


type Mode = "ask" | "chill";
type Line = { id: string; role: "user" | "fighter"; text: string };
type Pick = { id: string; def: FighterDef };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
/** The video id in a pasted YouTube link (watch, youtu.be, shorts, embed or live), or null. */
function youtubeId(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim().startsWith("http") ? link.trim() : `https://${link.trim()}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  if (host === "youtu.be") id = parts[0] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parts[0] === "watch") id = url.searchParams.get("v");
    else if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") id = parts[1] ?? null;
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

const newId = () => crypto.randomUUID();

const ASK_IDEAS: StringKey[] = ["hangout.ideas.ask1", "hangout.ideas.ask2", "hangout.ideas.ask3", "hangout.ideas.ask4"];
const CHILL_IDEAS: StringKey[] = ["hangout.ideas.chill1", "hangout.ideas.chill2", "hangout.ideas.chill3"];

function TopBar() {
  const navLabel = useString("roster.navLabel");
  return (
    <nav aria-label={navLabel} className="mb-6 flex flex-wrap items-center justify-end gap-1 sm:gap-2 max-sm:[&>:not(:first-child)]:px-1.5">
      <Text id="common.appName" className="mr-auto font-display text-lg" />
      <Button asChild variant="ghost" size="sm"><Link to="/"><Text id="common.arena" /></Link></Button>
      <Button asChild variant="ghost" size="sm"><Link to="/roster"><Text id="common.fighters" /></Link></Button>
      <Button asChild variant="ghost" size="sm"><Link to="/quests"><Text id="common.quests" /></Link></Button>
      <Button asChild variant="secondary" size="sm"><Link to="/hangout" aria-current="page"><Text id="common.hangout" /></Link></Button>
      <ProgressCodeSheet />
      <DevModeSheet />
    </nav>
  );
}

/** Everyone you can hang out with right now, in roster order. */
function usePicks(): { groups: { key: StringKey; picks: Pick[] }[]; locked: boolean } {
  const unlocked = useUnlocked();
  const dev = useDevMode().on;
  const devUnlocks = useDevUnlocks();
  const zenithIn = zenithJoined(useQuests(), dev || devUnlocks.zenith);
  const [beaten, setBeaten] = useState<BossId[]>([]);
  useEffect(
    () => setBeaten(bossesBeaten(dev ? allCleared() : loadProgress().cleared, dev ? [] : devUnlocks.bosses)),
    [dev, devUnlocks.bosses],
  );
  return useMemo(() => {
    const questers = QUESTERS.filter((q) => unlocked.includes(q.id)).map((d) => ({ id: d.id as string, def: d }));
    const bosses: Pick[] = (Object.keys(BOSSES) as BossId[]).filter((b) => beaten.includes(b)).map((b) => ({ id: bossRosterId(b), def: BOSSES[b] }));
    if (zenithIn) bosses.push({ id: ZENITH_ROSTER_ID, def: ZENITH });
    const groups: { key: StringKey; picks: Pick[] }[] = [{ key: "hangout.pick.fighters", picks: FIGHTERS.map((d) => ({ id: d.id as string, def: d })) }];
    if (questers.length) groups.push({ key: "hangout.pick.quest", picks: questers });
    if (bosses.length) groups.push({ key: "hangout.pick.bosses", picks: bosses });
    return { groups, locked: questers.length < QUESTERS.length || bosses.length < Object.keys(BOSSES).length + 1 };
  }, [unlocked, beaten, zenithIn]);
}

export const Route = createFileRoute("/hangout")({
  head: () => ({
    meta: [
      { title: "Hang out | NPC Arena" },
      { name: "description", content: "Chat with NPC Arena fighters in character or watch YouTube videos together." },
      { property: "og:title", content: "Hang out | NPC Arena" },
      { property: "og:description", content: "Chat with NPC Arena fighters in character or watch YouTube videos together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Hangout,
});

function Hangout() {
  const { groups, locked } = usePicks();
  const [pickId, setPickId] = useState<string>("pyro");
  const pick = groups.flatMap((g) => g.picks).find((p) => p.id === pickId) ?? groups[0].picks[0];
  const [mode, setMode] = useState<Mode>("ask");
  const [lines, setLines] = useState<Line[]>([]);
  const [video, setVideo] = useState<{ id: string; title: string | null } | null>(null);
  const [link, setLink] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const askPlaceholder = useString("hangout.input.placeholder");
  const linkPlaceholder = useString("hangout.video.placeholder");
  const sendLabel = useString("hangout.input.send");
  const closeVideoLabel = useString("hangout.video.close");

  // A new fighter or a new mode starts a fresh chat.
  useEffect(() => {
    setLines([]);
    setError(null);
  }, [pick.id, mode]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, busy]);

  async function talk(next: Line[], opts: { react: boolean; videoId: string | null }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/hangout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fighter: pick.id,
          mode,
          video: mode === "chill" ? opts.videoId : null,
          react: opts.react,
          messages: next.slice(-24).map((l) => ({ role: l.role, text: l.text.slice(0, 600) })),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; reply: string; video: { title: string; channel: string } | null }
        | { ok: false; error: string }
        | null;
      if (!data || !data.ok) {
        setError(data && !data.ok ? data.error : null);
        if (!data) setError("");
        return false;
      }
      if (data.video && opts.videoId) setVideo({ id: opts.videoId, title: data.video.title });
      setLines((ls) => [...ls, { id: newId(), role: "fighter", text: data.reply }]);
      return true;
    } catch {
      setError("");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function send(text: string) {
    const t = text.trim().slice(0, 600);
    if (!t || busy) return;
    const next = [...lines, { id: newId(), role: "user" as const, text: t }];
    setLines(next);
    setDraft("");
    const ok = await talk(next, { react: false, videoId: video?.id ?? null });
    // A failed send keeps the words in the box so nothing typed is lost.
    if (!ok) {
      setLines(lines);
      setDraft(t);
    }
  }

  async function putOn(e: FormEvent) {
    e.preventDefault();
    const id = youtubeId(link);
    if (!id) {
      setLinkError(true);
      return;
    }
    setLinkError(false);
    setVideo({ id, title: null });
    setLink("");
    await talk(lines, { react: true, videoId: id });
  }

  const ideas = mode === "ask" ? ASK_IDEAS : CHILL_IDEAS;

  return (
    <PageContainer>
      <TopBar />
      <PageHeader eyebrow={<Text id="hangout.eyebrow" />} title={<Text id="hangout.title" />} subtitle={<Text id="hangout.subtitle" />} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Who to hang out with */}
        <Panel className="self-start">
          <PanelBody className="flex flex-col gap-6">
            {groups.map((g) => (
              <div key={g.key}>
                <Text id={g.key} as="h2" className="mb-3 text-xs font-extrabold uppercase tracking-[0.1em] text-muted-foreground" />
                <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1.5 lg:flex-wrap lg:overflow-visible">
                  {g.picks.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setPickId(p.id)}
                        aria-pressed={p.id === pick.id}
                        className={cn(
                          "flex min-h-10 items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-[background-color,border-color,transform] duration-150 active:translate-y-px",
                          p.id === pick.id
                            ? "border-border-strong bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card text-foreground hover:border-border-strong hover:bg-surface-hover",
                        )}
                      >
                        <FighterDot def={p.def} />
                        <span className="whitespace-nowrap">{p.def.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {locked && <Text id="hangout.pick.more" as="p" className="text-sm text-muted-foreground" />}
          </PanelBody>
        </Panel>

        {/* The hangout itself */}
        <Panel data-hangout-chat className="flex min-h-[36rem] flex-col">
          <div className="flex flex-col gap-4 border-b-2 border-border-subtle p-4 sm:flex-row sm:items-center sm:p-6">
            <div className="w-28 shrink-0 overflow-hidden rounded-lg border-2 border-border-strong bg-[hsl(250_32%_10%)]">
              <FighterPortrait def={pick.def} locked={false} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl leading-[1.2] text-foreground">{pick.def.name}</h2>
              <p className="text-sm text-foreground-secondary">{pick.def.power}</p>
            </div>
            <div role="tablist" className="flex gap-2">
              <Button role="tab" aria-selected={mode === "ask"} variant={mode === "ask" ? "default" : "outline"} size="sm" onClick={() => setMode("ask")}>
                <PiChatsCircleBold className="size-5" aria-hidden />
                <Text id="hangout.mode.ask" />
              </Button>
              <Button role="tab" aria-selected={mode === "chill"} variant={mode === "chill" ? "default" : "outline"} size="sm" onClick={() => setMode("chill")}>
                <PiPopcornBold className="size-5" aria-hidden />
                <Text id="hangout.mode.chill" />
              </Button>
            </div>
          </div>

          {mode === "chill" && (
            <div className="border-b-2 border-border-subtle p-4 sm:p-6" data-hangout-video>
              {video ? (
                <div className="flex flex-col gap-3">
                  <VideoEmbed key={video.id} url={`https://www.youtube.com/watch?v=${video.id}`} className="overflow-hidden rounded-lg border-2 border-border-strong" />
                  <div className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-foreground">{video.title ?? ""}</p>
                    <Button variant="ghost" size="sm" onClick={() => setVideo(null)} aria-label={closeVideoLabel}>
                      <PiXBold className="size-5" aria-hidden />
                      <Text id="hangout.video.change" />
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={putOn} className="flex flex-col gap-2">
                  <label htmlFor="hangout-link" className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <PiYoutubeLogoBold className="size-5" aria-hidden />
                    <Text id="hangout.video.label" vars={{ name: pick.def.name }} />
                  </label>
                  <div className="flex gap-2">
                    <Input id="hangout-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder={linkPlaceholder} inputMode="url" className="min-w-0 flex-1" />
                    <Button type="submit" disabled={busy || !link.trim()}>
                      <Text id="hangout.video.put" />
                    </Button>
                  </div>
                  {linkError && <p role="alert" className="text-sm text-error"><Text id="hangout.video.bad" /></p>}
                  <Text id="hangout.video.note" as="p" className="text-sm text-muted-foreground" />
                </form>
              )}
            </div>
          )}

          <div ref={logRef} className="flex max-h-[32rem] flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            {lines.length === 0 && !busy ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
                <Text id={mode === "ask" ? "hangout.empty.ask" : "hangout.empty.chill"} vars={{ name: pick.def.name }} as="p" className="max-w-prose text-foreground-secondary" />
                <ul className="flex flex-wrap justify-center gap-2">
                  {ideas.map((k) => (
                    <li key={k}>
                      <IdeaChip id={k} onPick={send} disabled={busy} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              lines.map((l) =>
                l.role === "user" ? (
                  <p key={l.id} className="max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-br-sm border-2 border-border-strong bg-primary px-4 py-2 text-primary-foreground">
                    {l.text}
                  </p>
                ) : (
                  <div key={l.id} className="flex max-w-[90%] items-start gap-2 self-start">
                    <FighterDot def={pick.def} className="mt-3 size-4" />
                    <div className="rounded-2xl rounded-bl-sm border-2 border-border bg-background-secondary px-4 py-2 text-foreground">
                      <span className="block text-xs font-extrabold uppercase tracking-[0.1em] text-muted-foreground">{pick.def.name}</span>
                      <Markdown className="text-base text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">{l.text}</Markdown>
                    </div>
                  </div>
                ),
              )
            )}
            {busy && (
              <div className="flex items-center gap-2 self-start text-sm text-muted-foreground">
                <FighterDot def={pick.def} />
                <Text id="hangout.thinking" vars={{ name: pick.def.name }} />
              </div>
            )}
          </div>

          {error !== null && (
            <p role="alert" className="mx-4 mb-2 rounded-md border-2 border-error bg-error/10 px-3 py-2 text-sm text-foreground sm:mx-6">
              {error || <Text id="hangout.error" />}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
            className="flex gap-2 border-t-2 border-border-subtle p-4 sm:p-6"
          >
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={askPlaceholder} maxLength={600} className="min-w-0 flex-1" aria-label={askPlaceholder} />
            <Button type="submit" disabled={busy || !draft.trim()} aria-label={sendLabel}>
              <PiPaperPlaneRightBold className="size-5" aria-hidden />
              <span className="max-sm:sr-only"><Text id="hangout.input.send" /></span>
            </Button>
          </form>
        </Panel>
      </div>
    </PageContainer>
  );
}

function IdeaChip({ id, onPick, disabled }: { id: StringKey; onPick: (text: string) => void; disabled: boolean }) {
  const text = useString(id);
  return (
    <Button variant="outline" size="sm" disabled={disabled} onClick={() => onPick(text)}>
      {text}
    </Button>
  );
}

