// The developer code lives only on the server, so it never ships in the game's browser files.
const DEV_CODE = "335533";

function same(typed: string, code: string): boolean {
  const a = new TextEncoder().encode(typed.trim());
  const b = new TextEncoder().encode(code);
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a[i] ?? 0) ^ b[i];
  return diff === 0;
}

/** Whether `typed` is the developer code, compared without an early exit. */
export function isDevCode(typed: string): boolean {
  return same(typed, DEV_CODE);
}

/**
 * What a typed code opens: "dev" for developer mode, "all" for the unlock-everything code, or null.
 * The unlock-everything code is the DEV_UNLOCK_ALL_CODE secret, passed in by the route; while it is unset nothing matches it.
 */
export function devCodeKind(typed: string, unlockAllCode: string | undefined): "dev" | "all" | null {
  const all = (unlockAllCode ?? "").trim();
  const isAll = all.length > 0 && same(typed, all);
  const isDev = isDevCode(typed);
  return isDev ? "dev" : isAll ? "all" : null;
}
