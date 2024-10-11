import MODULE from "../constants.mjs";

Hooks.once("setup", _setupAuras);
Hooks.on("renderTokenConfig", _onRenderTokenConfig);

/* -------------------------------------------------- */

/**
 * General aura setup.
 */
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

  /* -------------------------------------------------- */

  class MythacriAura extends babonus.abstract.applications.TokenAura {
    constructor(token, auraData) {
      const data = {
        aura: {range: auraData.distance},
        uuid: `${token.uuid}-aura`
      };
      super(token, data);
    }

    /* -------------------------------------------------- */

    /** @override */
    static auras = {};

    /* -------------------------------------------------- */

    /**
     * Helper to retrieve 'bonus' data under different name.
     * @type {object}
     */
    get data() {
      return this.bonus;
    }

    /* -------------------------------------------------- */

    /** @override */
    get auras() {
      return MythacriAura.auras;
    }

    /** @override */
    get name() {
      return `mythacri-aura-${this.token.uuid}`;
    }

    /* -------------------------------------------------- */

    /** @override */
    get showAuras() {
      return true;
    }
    set showAuras(bool) {}

    /* -------------------------------------------------- */

    /** @override */
    get restrictions() {
      return new Set(["move"]);
    }

    /* -------------------------------------------------- */

    /** @override */
    get radius() {
      return this.token.flags[MODULE.ID]?.aura?.distance || 0;
    }

    /* -------------------------------------------------- */

    /** @override */
    get isDrawable() {
      return this.radius > 0;
    }

    /* -------------------------------------------------- */

    /** @override */
    get white() {
      return Color.from(this.token.flags[MODULE.ID].aura.color);
    }

    /* -------------------------------------------------- */

    /** @override */
    refresh(...T) {
      super.refresh(...T);
      if (!this.isDrawable) this.destroy();
    }
  }

  /* -------------------------------------------------- */

  Hooks.on("refreshToken", function(token) {
    for (const aura of Object.values(MythacriAura.auras)) {
      if ((aura.token === token.document)) aura.refresh();
    }
  });

  /* -------------------------------------------------- */

  Hooks.on("deleteToken", function(tokenDoc) {
    for (const aura of Object.values(MythacriAura.auras)) {
      if (aura.token === tokenDoc) aura.destroy({fadeOut: false});
    }
  });

  /* -------------------------------------------------- */

  Hooks.on("canvasTearDown", (canvas) => MythacriAura.auras = {});

  /* -------------------------------------------------- */

  Hooks.on("canvasReady", canvas => {
    for (const token of canvas.tokens.placeables) {
      if (token.document) makeAura(token.document);
    }
  });

  /* -------------------------------------------------- */

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
  html.querySelector("nav.sheet-tabs.tabs[data-group=main]").insertAdjacentHTML("beforeend", `
  <a class="item" data-tab="auras">
    <i class="fa-solid fa-dot-circle"></i>
    ${game.i18n.localize("MYTHACRI.AURA.Auras")}
  </a>`);

  const color = new foundry.data.fields.ColorField({
    label: "MYTHACRI.AURA.color.label",
    hint: "MYTHACRI.AURA.color.hint",
    name: "flags.mythacri-scripts.aura.color"
  });

  const distance = new foundry.data.fields.NumberField({
    min: 0,
    max: 30,
    initial: 0,
    integer: true,
    nullable: false,
    label: "MYTHACRI.AURA.distance.label",
    hint: "MYTHACRI.AURA.distance.hint",
    name: "flags.mythacri-scripts.aura.distance"
  });

  const form = [color, distance].map(field => field.toFormGroup({localize: true}, {
    name: field.options.name,
    value: foundry.utils.getProperty(config.token, field.options.name)
  }).outerHTML).join("");

  const content = `<div class="tab" data-tab="auras">${form}</div>`;
  html.querySelector("footer").insertAdjacentHTML("beforebegin", content);

  config.setPosition({width: 580, height: "auto"});
}

/* -------------------------------------------------- */

export default {};
