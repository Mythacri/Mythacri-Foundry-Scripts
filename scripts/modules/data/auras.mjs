import MODULE from "../constants.mjs";

Hooks.once("setup", _setupAuras);
Hooks.on("renderTokenConfig", _onRenderTokenConfig);

/* -------------------------------------------------- */

function _setupAuras() {
  if (!game.modules.get("babonus")?.active) return;
  /**
   * @param {TokenDocument5e} origin
   */
  const makeAura = (token) => {
    const aura = token.flags[MODULE.ID]?.aura ?? {};
    if (!aura.distance || !(aura.distance > 0)) return;
    new MythacriAura(token, aura).initialize();
  };

  class MythacriAura extends babonus.abstract.applications.TokenAura {
    constructor(token, auraData) {
      const data = {
        aura: {range: auraData.distance},
        uuid: `${token.uuid}-aura`
      };
      super(token, data);
    }

    /** @override */
    static auras = {};

    /**
     * Helper to retrieve 'bonus' data under different name.
     * @type {object}
     */
    get data() {
      return this.bonus;
    }

    /** @override */
    get auras() {
      return MythacriAura.auras;
    }

    /** @override */
    get name() {
      return `mythacri-aura-${this.token.uuid}`;
    }

    /** @override */
    get showAuras() {
      return true;
    }
    set showAuras(bool) {}

    /** @override */
    get restrictions() {
      return new Set(["move"]);
    }

    /** @override */
    get radius() {
      return this.token.flags[MODULE.ID]?.aura?.distance || 0;
    }

    /** @override */
    get isDrawable() {
      return this.radius > 0;
    }

    /** @override */
    get white() {
      return Color.from(this.token.flags[MODULE.ID].aura.color);
    }

    /** @override */
    refresh(...T) {
      super.refresh(...T);

      if (!this.isDrawable) this.destroy();
    }
  }

  Hooks.on("refreshToken", function(token) {
    for (const aura of Object.values(MythacriAura.auras)) {
      if ((aura.token === token.document)) aura.refresh();
    }
  });

  Hooks.on("deleteToken", function(tokenDoc) {
    for (const aura of Object.values(MythacriAura.auras)) {
      if (aura.token === tokenDoc) aura.destroy({fadeOut: false});
    }
  });

  Hooks.on("canvasTearDown", (canvas) => MythacriAura.auras = {});

  Hooks.on("canvasReady", canvas => {
    for (const token of canvas.tokens.placeables) {
      if (token.document) makeAura(token.document);
    }
  });

  Hooks.on("updateToken", (token, data) => {
    const flags = data.flags?.[MODULE.ID] ?? {};
    if ("aura" in flags) makeAura(token);
  });
}

/* -------------------------------------------------- */

/**
 * Inject new tab and form on Token config.
 * @param {TokenConfig5e} config      The token config.
 * @param {HTMLElement} html          The element of the config.
 */
function _onRenderTokenConfig(config, [html]) {
  const aura = config.token.flags[MODULE.ID]?.aura ?? {};
  const div = document.createElement("DIV");

  // Expand the width
  config.position.width = 540;
  config.setPosition(config.position);

  const nav = html.querySelector("nav.sheet-tabs.tabs[data-group=main]");
  div.innerHTML = `
  <a class="item" data-tab="auras">
    <i class="fa-solid fa-dot-circle"></i>
    ${game.i18n.localize("MYTHACRI.Auras")}
  </a>`;
  nav.appendChild(div.firstElementChild);

  const color = new foundry.data.fields.ColorField({
    label: "MYTHACRI.AuraColor",
    hint: "MYTHACRI.AuraColorHint"
  });

  const distance = new foundry.data.fields.NumberField({
    min: 0,
    max: 30,
    initial: 0,
    step: 1,
    label: "MYTHACRI.AuraDistance",
    hint: "MYTHACRI.AuraDistanceHint"
  });

  const template = `
  {{formGroup color value=colorValue localize=true name=colorName}}
  {{formGroup distance value=distanceValue localize=true name=distanceName}}`;

  const data = {
    color: color,
    distance: distance,
    colorValue: aura.color ? aura.color : "",
    distanceValue: Number.isInteger(aura.distance) ? aura.distance : 0,
    colorName: "flags.mythacri-scripts.aura.color",
    distanceName: "flags.mythacri-scripts.aura.distance"
  };

  div.innerHTML = `<div class="tab" data-tab="auras">${Handlebars.compile(template)(data)}</div>`;
  html.querySelector("footer").before(div.firstElementChild);
}

/* -------------------------------------------------- */

export default {};
