<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- tsconfig keeps `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` and `exactOptionalPropertyTypes` off: the imported game code was written without them.
- Progress saves are reached only through `/api/progress-code` with the service-role client; the table has no browser access, and codes are stored as SHA-256 hashes only.
- AI calls (`/api/hangout`, `/api/own-power`) use `@lovable.dev/ai-gateway` `generateMessage`; regenerate `src/generated/ai-gateway` with `bunx ai-gateway generate --model <slug>` when a model changes.
- The developer code is checked server-side in `src/lib/dev-code.server.ts`; never import it from browser code.
- Combat numbers for guarding, parries, counters and combo chains live in `src/lib/combat-rules.ts` (pure, tested in `src/test/combat-rules.test.ts`); the engine imports them rather than inlining values.
- Player control goes through the engine's `playerInput` / `pressPlayer` and `Game.control`; the arena screen only maps keys, so fight logic stays in `arena-engine.ts`.
- The unlock-everything code is the `DEV_UNLOCK_ALL_CODE` secret, read in `/api/dev-mode` and passed to `devCodeKind`; never put it in source, so it stays out of the repo and browser files.
