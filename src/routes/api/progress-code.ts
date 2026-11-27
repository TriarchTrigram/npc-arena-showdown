import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  CODE_LENGTH,
  MAX_SAVE_CHARS,
  SAVE_KEYS,
  normalizeCode,
  type ProgressSave,
} from "@/lib/progress-code";
import type { Json } from "@/integrations/supabase/types";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[(bytes[i] ?? 0) % ALPHABET.length] ?? "A";
  }
  return out;
}

async function hashCode(code: string): Promise<string> {
  const data = new TextEncoder().encode(`progress-code:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const Save = z
  .record(z.string(), z.string().max(MAX_SAVE_CHARS))
  .transform((raw) => {
    const save: ProgressSave = {};
    for (const key of SAVE_KEYS) {
      const v = raw[key];
      if (typeof v !== "string") continue;
      try {
        JSON.parse(v);
        save[key] = v;
      } catch {
        // skip malformed entries
      }
    }
    return save;
  });

const Code = z
  .string()
  .max(40)
  .transform(normalizeCode)
  .pipe(z.string().length(CODE_LENGTH));

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), code: Code.optional(), save: Save }),
  z.object({ action: z.literal("load"), code: Code }),
]);

const refuse = (reason: string) =>
  Response.json({ ok: false, reason }, { status: reason === "failed" ? 500 : 400 });

export const Route = createFileRoute("/api/progress-code")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof Body>;
        try {
          const parsed = Body.safeParse(await request.json());
          if (!parsed.success) return refuse("wrong");
          body = parsed.data;
        } catch {
          return refuse("wrong");
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        try {
          if (body.action === "load") {
            const codeHash = await hashCode(body.code);
            const { data, error } = await supabaseAdmin
              .from("progress_saves")
              .select("save")
              .eq("code_hash", codeHash)
              .maybeSingle();
            if (error || !data) return refuse("wrong");
            const save = Save.safeParse(data.save);
            return Response.json({
              ok: true,
              code: body.code,
              save: save.success ? save.data : {},
            });
          }

          const now = new Date().toISOString();
          if (body.code) {
            const codeHash = await hashCode(body.code);
            const { data, error } = await supabaseAdmin
              .from("progress_saves")
              .update({ save: body.save as unknown as Json, updated_at: now })
              .eq("code_hash", codeHash)
              .select("id")
              .maybeSingle();
            if (error || !data) return refuse("wrong");
            return Response.json({ ok: true, code: body.code });
          }

          const newCode = generateCode(CODE_LENGTH);
          const codeHash = await hashCode(newCode);
          const { error } = await supabaseAdmin.from("progress_saves").insert({
            code_hash: codeHash,
            save: body.save as unknown as Json,
            created_at: now,
            updated_at: now,
          });
          if (error) {
            console.error("progress code insert failed", error);
            return refuse("failed");
          }
          return Response.json({ ok: true, code: newCode });
        } catch (error) {
          console.error("progress code failed", body.action, error);
          return refuse("failed");
        }
      },
    },
  },
});