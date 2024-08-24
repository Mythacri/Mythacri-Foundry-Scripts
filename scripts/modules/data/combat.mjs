export class CombatEnhancement {
  /** Initialize module. */
  static init() {
    CombatEnhancement.pugilist();
    CombatEnhancement.animatePause();
    CombatEnhancement.feralRegression();
  }

  /* -------------------------------------------------- */

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

  /* -------------------------------------------------- */

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

  /* -------------------------------------------------- */

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

  /* -------------------------------------------------- */

  /**
   * Add a Feral Regression meter to character sheets.
   */
  static feralRegression() {
    Hooks.on("renderActorSheet5eCharacter2", (sheet, [html]) => {
      const enabled = sheet.document.getFlag("dnd5e", "feralRegression");
      if (!enabled) return;

      let value = sheet.document.getFlag("mythacri-scripts", "feralRegression");
      if (!value) value = 0;

      const negative = value < 0 ? Math.abs(value) : 0;
      const negPct = Math.round(negative / 5 * 100) + "%";
      const positive = value > 0 ? value : 0;
      const posPct = Math.round(positive / 5 * 100) + "%";

      const css = "meter feral-regression progress";
      const attributes = Object.entries({
        role: "meter",
        "aria-valuemin": "0",
        "aria-valuemax": "5"
      }).map(([k, v]) => `${k}="${v}"`).join(" ");

      const template = `
      <div class="meter-group feral-regression">
        <div class="label roboto-condensed-upper">
          <span>${game.i18n.localize("MYTHACRI.FlagsFeralRegression")}</span>
        </div>
        <div class="meters">
          <div class="${css} negative" ${attributes} aria-valuenow="${negative}" style="--bar-percentage: ${negPct}">
            <div class="label">${negative ? "&minus;" + negative : ""}</div>
          </div>
          <div class="${css} positive" ${attributes} aria-valuenow="${positive}" style="--bar-percentage: ${posPct}">
            <div class="label">${positive ? "&plus;" + positive : ""}</div>
          </div>
        </div>
      </div>`;

      const div = document.createElement("DIV");
      div.innerHTML = template;

      div.querySelectorAll(".meters > .meter").forEach(element => element.addEventListener("click", event => {
        const t = event.currentTarget;
        const delta = t.classList.contains("positive") ? 1 : -1;
        return sheet.document.setFlag("mythacri-scripts", "feralRegression", Math.clamp(value + delta, -5, 5));
      }));

      html.querySelector(".meter-group").parentElement.insertAdjacentElement("beforeend", div.firstElementChild);
    });
  }
}
