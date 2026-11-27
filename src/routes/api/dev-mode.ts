import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { devCodeKind } from "@/lib/dev-code.server";

const Body = z.object({ code: z.string().max(20) });

export const Route = createFileRoute("/api/dev-mode")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = Body.safeParse(await request.json());
          const kind = parsed.success ? devCodeKind(parsed.data.code, process.env["DEV_UNLOCK_ALL_CODE"]) : null;
          if (!kind) return Response.json({ ok: false, reason: "wrong" }, { status: 400 });
          return Response.json({ ok: true, all: kind === "all" });
        } catch {
          return Response.json({ ok: false, reason: "wrong" }, { status: 400 });
        }
      },
    },
  },
});