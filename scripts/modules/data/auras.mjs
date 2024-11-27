import MODULE from "../constants.mjs";

/**
 * @typedef {object} AuraData
 * @property {boolean} enabled
 * @property {number} radius
 * @property {string} color
 */

/* -------------------------------------------------- */

class MythacriAura {
  /**
   * @constructor
   * @param {TokenDocument5e} token
   * @param {AuraData} data
   */
  constructor(token, data) {
    this.#token = token;
    this.#data = data;

    const auras = MythacriAura.auras;
    const old = auras.get(this.name);
    if (old) old.destroy();
    auras.set(this.name, this);
  }

  /* -------------------------------------------------- */

  /**
   * Token aura data.
   * @type {AuraData}
   */
  #data;

  /* -------------------------------------------------- */

  /**
   * The collection of auras being kept track of.
   * @type {Map<string, MythacriAura>}
   */
  static auras = new Map();

  /* -------------------------------------------------- */

  /**
   * The name of this aura.
   * @type {string}
   */
  get name() {
    return this.#token.uuid;
  }

  /* -------------------------------------------------- */

  /**
   * The origin of the aura.
   * @type {TokenDocument5e}
   */
  #token = null;

  /* -------------------------------------------------- */

  /**
   * The origin of the aura.
   * @type {TokenDocument5e}
   */
  get token() {
    return this.#token;
  }

  /* -------------------------------------------------- */

  /**
   * The drawn pixi graphics.
   * @type {PIXI.Graphics|null}
   */
  #element = null;

  /* -------------------------------------------------- */

  /**
   * The container element for the aura.
   * @type {PIXI.Container}
   */
  #container = null;

  /* -------------------------------------------------- */

  /**
   * The type of wall restrictions that apply to this bonus.
   * @type {Set<string>}
   */
  get restrictions() {
    return new Set(["move"]);
  }

  /* -------------------------------------------------- */

  /**
   * The radius of this aura, in grid measurement units.
   * @type {number}
   */
  get radius() {
    return Math.max(0, this.#data.radius || 0);
  }

  /* -------------------------------------------------- */

  /**
   * This aura's color.
   * @type {Color}
   */
  get color() {
    return Color.from(this.#data.color || "#FFFFFF");
  }

  /* -------------------------------------------------- */

  /**
   * Can this aura be drawn?
   * @type {boolean}
   */
  get isDrawable() {
    return this.isTokenVisible && this.#data.enabled && (this.radius > 0);
  }

  /* -------------------------------------------------- */

  /**
   * Is this token visible?
   * @type {boolean}
   */
  get isTokenVisible() {
    return this.#token.object.visible && !this.#token.isSecret;
  }

  /* -------------------------------------------------- */

  /**
   * Refresh the drawn state of the container and the contained aura.
   */
  refresh() {
    // Create element.
    this.create();

    // Create container if missing.
    this.draw();

    // Color the element.
    this.#element.tint = this.color;
    this.#element.alpha = this.isDrawable ? (this.#token.hidden ? 0.25 : 1) : 0;

    // Add element to container.
    this.#container.addChild(this.#element);
  }

  /* -------------------------------------------------- */

  /**
   * Create the inner pixi element and assign it.
   * @returns {PIXI.Graphics|null}
   */
  create() {
    let radius = this.radius;
    radius += canvas.grid.distance * Math.max(this.#token.width, this.#token.height) * 0.5;

    const center = this.#token.object.center;
    const points = canvas.grid.getCircle(center, radius);

    let sweep = new PIXI.Polygon(points);
    for (const type of this.restrictions) {
      sweep = ClockwiseSweepPolygon.create(center, {
        includeDarkness: type === "sight",
        type: type,
        debug: false,
        useThreshold: type !== "move",
        boundaryShapes: [sweep]
      });
    }

    if (this.#element) this.#element.destroy();

    const g = new PIXI.Graphics();
    g.lineStyle({width: 3, color: this.color, alpha: 0.75});
    g.beginFill(0xFFFFFF, 0.03).drawPolygon(sweep).endFill();

    this.#element = g;

    return g;
  }

  /* -------------------------------------------------- */

  /**
   * Create and assign a container if one is missing,
   * add the aura element to it, and add the container to the grid.
   */
  draw() {
    if (this.#container) return;
    const container = new PIXI.Container();
    canvas.interface.grid.addChild(container);
    this.#container = container;
  }

  /* -------------------------------------------------- */

  /**
   * Destroy the aura and its container.
   */
  destroy() {
    this.#container?.destroy();
    MythacriAura.auras.delete(this.name);
  }
}

/* -------------------------------------------------- */

Hooks.on("renderTokenConfig", _onRenderTokenConfig);
Hooks.on("refreshToken", refreshAuraOnTokenRefresh);
Hooks.on("deleteToken", deleteAuraOnTokenDelete);
Hooks.on("canvasTearDown", (canvas) => MythacriAura.auras.clear());
Hooks.on("canvasReady", createAurasOnCanvasReady);
Hooks.on("updateToken", createAurasOnTokenUpdate);
Hooks.on("createToken", makeAura);

/* -------------------------------------------------- */

/**
 * Create or refresh an aura.
 * @param {TokenDocument5e} token
 */
function makeAura(token) {
  const aura = token.flags[MODULE.ID]?.aura ?? {};
  if (!aura.radius || !(aura.radius > 0)) return;
  new MythacriAura(token, aura).refresh();
}

/* -------------------------------------------------- */

/**
 * Refresh an aura when a token is refreshed.
 * @param {Token5e} token
 */
function refreshAuraOnTokenRefresh(token) {
  const aura = MythacriAura.auras.get(token.document.uuid);
  if (aura) aura.refresh();
}

/* -------------------------------------------------- */

/**
 * Delete an aura when a token is deleted.
 * @param {TokenDocument5e} token
 */
function deleteAuraOnTokenDelete(token) {
  const aura = MythacriAura.auras.get(token.uuid);
  if (aura) aura.destroy();
}

/* -------------------------------------------------- */

/**
 * Create auras when the canvas is ready.
 * @param {Canvas} canvas
 */
function createAurasOnCanvasReady(canvas) {
  for (const token of canvas.tokens.placeables) {
    if (token.document) makeAura(token.document);
  }
}

/* -------------------------------------------------- */

/**
 * Create or update aura when a token is updated.
 * @param {TokenDocument5e} token
 * @param {object} data
 */
function createAurasOnTokenUpdate(token, data) {
  const flags = data.flags?.[MODULE.ID] ?? {};
  if ("aura" in flags) makeAura(token);
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

  const enabled = new foundry.data.fields.BooleanField({
    label: "MYTHACRI.AURA.enabled.label",
    hint: "MYTHACRI.AURA.enabled.hint",
    name: "flags.mythacri-scripts.aura.enabled"
  });

  const color = new foundry.data.fields.ColorField({
    label: "MYTHACRI.AURA.color.label",
    hint: "MYTHACRI.AURA.color.hint",
    name: "flags.mythacri-scripts.aura.color"
  });

  const radius = new foundry.data.fields.NumberField({
    min: 0,
    max: 30,
    initial: 0,
    integer: true,
    nullable: false,
    label: "MYTHACRI.AURA.radius.label",
    hint: "MYTHACRI.AURA.radius.hint",
    name: "flags.mythacri-scripts.aura.radius"
  });

  const form = [enabled, color, radius].map(field => field.toFormGroup({localize: true}, {
    name: field.options.name,
    value: foundry.utils.getProperty(config.token, field.options.name)
  }).outerHTML).join("");

  const content = `<div class="tab" data-tab="auras">${form}</div>`;
  html.querySelector("footer").insertAdjacentHTML("beforebegin", content);

  config.setPosition({width: 580, height: "auto"});
}

/* -------------------------------------------------- */

export default {};
