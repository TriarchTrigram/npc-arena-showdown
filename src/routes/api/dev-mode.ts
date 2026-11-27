import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { isDevCode } from "@/lib/dev-code.server";

const Body = z.object({ code: z.string().max(20) });

export const Route = createFileRoute("/api/dev-mode")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = Body.safeParse(await request.json());
          if (!parsed.success || !isDevCode(parsed.data.code)) {
            return Response.json({ ok: false, reason: "wrong" }, { status: 400 });
          }
          return Response.json({ ok: true });
        } catch {
          return Response.json({ ok: false, reason: "wrong" }, { status: 400 });
        }
      },
    },
  },
});