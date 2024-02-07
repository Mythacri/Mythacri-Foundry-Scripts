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
      return (type.value === "class") && (type.subtype === "witchHex") && item.requiresConcentration;
    }));
  }

  /**
   * Replace the first die of a pugilist weapon with a higher face if applicable.
   */
  static pugilist() {
    Hooks.on("dnd5e.preRollDamage", (item, config) => {
      const isPugilist = item && ("pugilist" in (item.actor.classes ?? {})) && this._isPugilistWeapon(item);
      if (!isPugilist) return;
      const parts = config.rollConfigs[0].parts;
      const rgx = /^[0-9]*d([0-9]+)/d;
      const match = rgx.exec(parts[0]);
      if (!match) return;
      const [start, end] = match.indices[1];
      const faces = parseInt(parts[0].slice(start, end));
      const pugilist = item.actor.system.scale?.pugilist?.fisticuffs?.faces ?? 0;
      if (pugilist < faces) return;
      const left = parts[0].slice(0, start);
      const right = parts[0].slice(end);
      const part = `${left}${pugilist}${right}`;
      parts[0] = part;
    });
  }

  /**
   * Is this item a valid pugilist weapon?
   * @param {Item5e} item     An item that rolls damage.
   * @returns {boolean}       Whether it is a valid pugilist weapon.
   */
  static _isPugilistWeapon(item) {
    if ((item.type !== "weapon") || item.system.properties.has("two")) return false;

    const isSimpleM = item.system.type.value === "simpleM";
    const isWhip = (item.system.type.value === "martialM") && (item.system.type.baseItem === "whip");
    const isImprovised = item.system.type.value === "improv";
    return isSimpleM || isWhip || isImprovised;
  }
}
