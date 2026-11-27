import { createFileRoute } from "@tanstack/react-router";
import { generateMessage } from "@lovable.dev/ai-gateway";
import { z } from "zod";
import { chatDefOf, personalityOf } from "@/lib/personalities";

const Body = z.object({
  fighter: z.string().min(1).max(40),
  mode: z.enum(["ask", "chill"]),
  video: z.string().regex(/^[A-Za-z0-9_-]{11}$/).nullable(),
  react: z.boolean(),
  messages: z
    .array(z.object({ role: z.enum(["user", "fighter"]), text: z.string().trim().min(1).max(600) }))
    .max(24),
});

type Video = { title: string; channel: string; thumbBase64: string | null };

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

async function lookUpVideo(id: string): Promise<Video | null> {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const [meta, thumb] = await Promise.allSettled([
    fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`).then(async (r) =>
      r.ok ? ((await r.json()) as { title?: string; author_name?: string }) : null,
    ),
    fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`).then(async (r) =>
      r.ok ? new Uint8Array(await r.arrayBuffer()) : null,
    ),
  ]);
  const m = meta.status === "fulfilled" ? meta.value : null;
  if (!m?.title) return null;
  const thumbBytes = thumb.status === "fulfilled" && thumb.value && thumb.value.byteLength < 400_000 ? thumb.value : null;
  return {
    title: m.title.slice(0, 200),
    channel: (m.author_name ?? "").slice(0, 100),
    thumbBase64: thumbBytes ? toBase64(thumbBytes) : null,
  };
}

export const Route = createFileRoute("/api/hangout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "That message couldn't be sent." }, { status: 400 });
        }
        const { fighter, mode, video: videoId, react, messages } = parsed.data;
        const def = chatDefOf(fighter);
        if (!def) {
          return Response.json({ ok: false, error: "That fighter isn't around to chat." }, { status: 400 });
        }
        const lastMsg = messages[messages.length - 1];
        if (!react && (!lastMsg || lastMsg.role !== "user")) {
          return Response.json({ ok: false, error: "That message couldn't be sent." }, { status: 400 });
        }

        const video = mode === "chill" && videoId ? await lookUpVideo(videoId) : null;
        if (mode === "chill" && videoId && !video) {
          return Response.json({ ok: false, error: "That video couldn't be found. Check the link and try again." });
        }

        const system = `You are ${def.name}, a fighter in NPC Arena, a game where stick figures with powers fight in an arena.
Your power: ${def.power}. What you do in a fight: ${def.ability}
Your personality: ${personalityOf(fighter)}

You are hanging out with a player between fights. Rules:
- Stay in character as ${def.name} at all times, whatever you are asked. Never say you are an AI, a model or a character in a game made by someone. If asked, answer as ${def.name} would.
- Answer any question the player asks, including school or real-world questions, correctly and helpfully, but in your own voice and personality.
- Keep it short and chatty: usually 1 to 4 sentences, like talking to a friend. A longer answer only when the question really needs it.
- Keep everything friendly for all ages. If asked about something unsafe or adult, wave it off in character and change the subject.
- Plain words, no em dashes, no emoji. UK spelling (colour, favourite).
${
  video
    ? `
You are watching a YouTube video together right now.
Title: ${JSON.stringify(video.title)}${video.channel ? `\nChannel: ${JSON.stringify(video.channel)}` : ""}${video.thumbBase64 ? "\nThe video's thumbnail is attached to the latest message." : ""}
Use what you know: recognise the creator, the game, the song or the topic if you know it, and react like you are watching too. You can only tell what the title, channel and thumbnail show, so never invent specific moments from the video. If asked what just happened, say what you'd expect from a video like this, in character.`
    : ""
}`;

        const history: Array<{
          role: "user" | "assistant";
          content:
            | string
            | Array<
                | { type: "text"; text: string }
                | { type: "image"; source: { type: "base64"; media_type: "image/jpeg"; data: string } }
              >;
        }> = messages.map((m) =>
          m.role === "user" ? { role: "user", content: m.text } : { role: "assistant", content: m.text },
        );

        const cue = react
          ? video
            ? "(The player just put this video on. React to it in character, in 1 to 3 sentences.)"
            : "(The player just came over to hang out. Greet them in character, in 1 or 2 sentences.)"
          : null;
        if (cue) history.push({ role: "user", content: cue });
        if (history[0]?.role === "assistant") {
          history.unshift({ role: "user", content: "(The player came over to hang out.)" });
        }
        if (video?.thumbBase64) {
          const last = history[history.length - 1];
          if (last && last.role === "user" && typeof last.content === "string") {
            history[history.length - 1] = {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: "image/jpeg", data: video.thumbBase64 },
                },
                { type: "text", text: last.content },
              ],
            };
          }
        }

        try {
          const response = await generateMessage({
            model: "anthropic/claude-haiku-5-5",
            max_tokens: 700,
            system,
            messages: history,
          });
          const reply = response.content
            .filter((block): block is { type: "text"; text: string } => block.type === "text")
            .map((block) => block.text)
            .join("")
            .trim();
          if (!reply) {
            return Response.json({ ok: false, error: `${def.name} went quiet. Try again.` });
          }
          return Response.json({
            ok: true,
            reply,
            video: video ? { title: video.title, channel: video.channel } : null,
          });
        } catch (error) {
          console.error("hangout failed", error);
          return Response.json({
            ok: false,
            error: `${def.name} couldn't answer right now. Try again in a moment.`,
          });
        }
      },
    },
  },
});