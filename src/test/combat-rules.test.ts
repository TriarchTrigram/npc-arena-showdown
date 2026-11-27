import { describe, expect, it } from "vitest";

import { COMBO_CAP, GUARD_BREAK_DMG, GUARD_DAMAGE, comboBonus, guardOutcome } from "@/lib/combat-rules";

describe("combat rules", () => {
  it("lets only part of a blocked blow through", () => {
    expect(GUARD_DAMAGE).toBeGreaterThan(0);
    expect(GUARD_DAMAGE).toBeLessThan(0.5);
  });

  it("parries any blow inside the parry window", () => {
    expect(guardOutcome(GUARD_BREAK_DMG * 3, true)).toBe("parry");
  });

  it("breaks a late guard with a heavy blow and blocks a light one", () => {
    expect(guardOutcome(GUARD_BREAK_DMG, false)).toBe("break");
    expect(guardOutcome(GUARD_BREAK_DMG - 1, false)).toBe("block");
  });

  it("adds damage for each hit in a chain, up to the cap", () => {
    expect(comboBonus(0)).toBe(1);
    expect(comboBonus(2)).toBeGreaterThan(comboBonus(1));
    expect(comboBonus(100)).toBeCloseTo(1 + COMBO_CAP);
  });
});
