// The numbers behind guarding, parries, counters and combo chains. Pure, so they can be tested without a canvas.

/** Share of a blow's damage that still gets through a raised guard. */
export const GUARD_DAMAGE = 0.35;
/** A blow at least this heavy smashes through a guard and leaves the defender dazed. */
export const GUARD_BREAK_DMG = 14;
/** Seconds a fighter stays dazed after its guard is broken. */
export const GUARD_BREAK_STUN = 0.7;
/** Seconds after raising a guard in which a blow is parried: no damage at all, and a counter opens up. */
export const PARRY_WINDOW = 0.16;
/** Seconds after a parry in which the next hit lands as a counter. */
export const COUNTER_WINDOW = 1.2;
/** How much harder a counter hits. */
export const COUNTER_BONUS = 1.5;
/** Seconds a combo chain stays alive between hits. */
export const COMBO_WINDOW = 1.6;
/** Extra damage per hit already in the chain, and the most a chain can add. */
export const COMBO_STEP = 0.08;
export const COMBO_CAP = 0.4;

/** Damage multiplier for a hit landing after `hitsBefore` hits in the same chain. */
export const comboBonus = (hitsBefore: number) => 1 + Math.min(COMBO_CAP, COMBO_STEP * Math.max(0, hitsBefore));

export type GuardOutcome = "parry" | "break" | "block";
/** What a raised guard does to a blow of `dmg`: a well-timed guard parries anything, a heavy blow breaks a late one, the rest is blocked. */
export function guardOutcome(dmg: number, inParryWindow: boolean): GuardOutcome {
  if (inParryWindow) return "parry";
  return dmg >= GUARD_BREAK_DMG ? "break" : "block";
}
