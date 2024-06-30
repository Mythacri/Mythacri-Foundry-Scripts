export class CombatEnhancement {
  /** Initialize module. */
  static init() {
    CombatEnhancement.pugilist();
    CombatEnhancement.animatePause();
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

  /**
   * Bounce the pause image when the game is paused.
   */
  static animatePause() {
    Hooks.on("renderPause", function(pause, [html], {paused}) {
      if (!paused) return;
      const frames = [
        {transform: "translateY(-200px) scale(1.5)"},
        {transform: "translateY(0px) scale(1)"},
        {transform: "translateY(-25px) scale(1)"},
        {transform: "translateY(0px) scale(1)"}
      ];
      const options = {duration: 2000, iterations: 1, easing: "cubic-bezier(0.8, 2, 0, 1)"};
      html.animate(frames, options);
    });
  }
}
