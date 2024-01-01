export class CombatEnhancement {
  /** Initialize module. */
  static init() {
    CombatEnhancement.concentration();
    CombatEnhancement.pugilist();
  }

  /**
   * Extend the functionality of the 'Concentration Notifier' module for witch hexes.
   */
  static concentration() {
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

  /**
   * Replace the first die of a pugilist weapon with a higher face if applicable.
   */
  static pugilist() {
    Hooks.on("dnd5e.preRollDamage", (item, config) => {
      const isPugilist = item && ("pugilist" in (item.actor.classes ?? {})) && this._isPugilistWeapon(item);
      if (!isPugilist) return;
      const [formula] = config.parts ?? [];
      if (!formula) return;
      const rgx = /^[0-9]*d([0-9]+)/d;
      const match = rgx.exec(formula);
      if (!match) return;
      const [start, end] = match.indices[1];
      const faces = parseInt(formula.slice(start, end));
      const pugilist = item.actor.system.scale?.pugilist?.fisticuffs?.faces ?? 0;
      if (pugilist < faces) return;
      const left = formula.slice(0, start);
      const right = formula.slice(end);
      const part = `${left}${pugilist}${right}`;
      config.parts[0] = part;
    });
  }

  /**
   * Is this item a valid pugilist weapon?
   * @param {Item5e} item     An item that rolls damage.
   * @returns {boolean}       Whether it is a valid pugilist weapon.
   */
  static _isPugilistWeapon(item) {
    const isWeapon = item.type === "weapon";
    if (!isWeapon || item.system.properties.two) return false;

    const isSimpleM = item.system.weaponType === "simpleM";
    const isWhip = (item.system.weaponType === "martialM") && (item.system.baseItem === "whip");
    const isImprovised = item.system.weaponType === "improv";
    return isSimpleM || isWhip || isImprovised;
  }
}
