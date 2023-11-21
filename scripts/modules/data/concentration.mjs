/**
 * Extend the functionality of the 'Concentration Notifier' module for witch hexes.
 */
export class Concentration {
  /** Initialize module. */
  static init() {
    if (!game.modules.get("concentrationnotifier")?.active) {
      console.warn("Concentration Notifier is needed to track extra types of concentration.");
      return;
    }

    Hooks.once("setup", () => CN.extendModule("hex-concentration", function itemRequiresConcentration(item) {
      if (item.type !== "feat") return false;
      const type = item.system.type;
      const units = item.system.duration?.units in CONFIG.DND5E.scalarTimePeriods;
      const flags = !!item.flags.concentrationnotifier?.data.requiresConcentration;
      return units && flags && (type.value === "class") && (type.subtype === "witchHex");
    }));
  }
}
