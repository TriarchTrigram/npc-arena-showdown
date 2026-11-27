import { describe, expect, it } from "vitest";

import { BOSSES } from "@/lib/bosses";
import { devCodeKind } from "@/lib/dev-code.server";
import { everyDevUnlock } from "@/lib/dev-unlocks";
import { NEWGEN_IDS, QUEST_IDS } from "@/lib/fighters";
import { BOOKS } from "@/lib/story";

describe("unlock-everything code", () => {
  it("unlocks every quest fighter, new-generation fighter, boss, book and Zenith", () => {
    const u = everyDevUnlock();
    expect(u.fighters).toEqual(expect.arrayContaining([...QUEST_IDS, ...NEWGEN_IDS]));
    expect(u.bosses).toEqual(expect.arrayContaining(Object.keys(BOSSES)));
    expect(u.books).toHaveLength(BOOKS.length);
    expect(u.zenith).toBe(true);
  });

  it("is told apart from a wrong code, and matches nothing while unset", () => {
    expect(devCodeKind("123123", "123123")).toBe("all");
    expect(devCodeKind(" 123123 ", "123123")).toBe("all");
    expect(devCodeKind("123124", "123123")).toBeNull();
    expect(devCodeKind("", undefined)).toBeNull();
    expect(devCodeKind("", "")).toBeNull();
  });
});
