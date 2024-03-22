import {MODULE} from "../constants.mjs";

export class Auras {
  /** Initialize module. */
  static init() {
    Hooks.on("renderTokenConfig", Auras.onRenderTokenConfig);
    Hooks.on("updateToken", Auras.onUpdateToken);
    Hooks.on("refreshWall", Auras.refreshAll);
    Hooks.on("deleteWall", Auras.refreshAll);
    Hooks.on("sightRefresh", Auras.refreshAll);
    Hooks.on("drawGridLayer", Auras.onDrawGridLayer);
    Hooks.on("destroyToken", Auras.onDestroyToken);
    Hooks.on("refreshToken", Auras.drawAura);
  }

  /**
   * Bound method to draw token aura.
   * @this {Token5e}
   */
  static _drawAura() {
    if (this.tokenAuras?.removeChildren) this.tokenAuras.removeChildren().forEach(c => c.destroy());
    if (!this.visible || !this.renderable) return;

    const aura = this.document.flags[MODULE.ID]?.aura ?? {};
    if (!aura.distance || !(aura.distance > 0)) return;

    this.tokenAuras ??= canvas.grid.tokenAuras.addChild(new PIXI.Container());
    const shape = Auras._createAura.call(this, aura);
    this.tokenAuras.addChild(shape);
    this.tokenAuras.position.set(...Object.values(this.center));
  }

  /**
   * Create aura PIXI element.
   * @this {Token5e}
   * @param {object} aura     The aura configuration.
   * @param {number} aura.distance      The range, in grid units.
   * @param {string} aura.color         The color of the aura.
   * @param {number} aura.alpha         The aura opacity.
   * @returns {PIXI}
   */
  static _createAura({distance, color, alpha}) {
    const shape = new PIXI.Graphics();
    const radius = distance * canvas.dimensions.distancePixels + this.h / 2;
    color = Color.from(color);
    const {x, y} = this.center;

    const m = CONFIG.Canvas.polygonBackends.move.create({x, y}, {
      type: "move",
      hasLimitedRadius: true,
      radius: radius
    });
    shape.beginFill(color, alpha).drawShape(m).endFill();
    shape.pivot.set(x, y);
    return shape;
  }

  /**
   * Utility method to bind the token object.
   * @param {Token5e} token   The token whose aura will be redrawn.
   */
  static drawAura(token) {
    if (!token) return;
    return Auras._drawAura.call(token);
  }

  /**
   * Inject new tab and form on Token config.
   * @param {TokenConfig5e} config      The token config.
   * @param {HTMLElement} html          The element of the config.
   */
  static onRenderTokenConfig(config, [html]) {
    const aura = config.token.flags[MODULE.ID]?.aura ?? {};
    const div = document.createElement("DIV");

    // Expand the width
    config.position.width = 540;
    config.setPosition(config.position);

    const nav = html.querySelector('nav.sheet-tabs.tabs[data-group="main"]');
    div.innerHTML = `
    <a class="item" data-tab="auras">
      <i class="fa-solid fa-dot-circle"></i>
      ${game.i18n.localize("MYTHACRI.Auras")}
    </a>`;
    nav.appendChild(div.firstElementChild);

    const color = aura.color ? `value="${aura.color}"` : "";
    const alpha = Number.isNumeric(aura.alpha) ? `value="${Math.clamped(aura.alpha, 0, 1)}"` : "";
    const distance = Number.isNumeric(aura.distance) && aura.distance > 0 ? `value="${aura.distance}"` : "";

    const auraConfig = `
    <div class="form-group">
      <label>${game.i18n.localize("MYTHACRI.AuraColor")}</label>
      <div class="form-fields">
        <input class="color" type="text" ${color} name="flags.${MODULE.ID}.aura.color">
        <input type="color" ${color} data-edit="flags.${MODULE.ID}.aura.color">
      </div>
    </div>
    <div class="form-group">
      <label>
        ${game.i18n.localize("MYTHACRI.AuraOpacity")}
        <span class="units">(0 &mdash; 1)</span>
      </label>
      <div class="form-fields">
        <input type="number" ${alpha} step="any" min="0" max="1" name="flags.${MODULE.ID}.aura.alpha">
      </div>
    </div>
    <div class="form-group">
      <label>
        ${game.i18n.localize("SCENES.GridDistance")}
        <span class="units">(${game.i18n.localize('GridUnits')})</span>
      </label>
      <div class="form-fields">
        <input type="number" ${distance} step="any" name="flags.${MODULE.ID}.aura.distance" min="0">
      </div>
    </div>`;

    div.innerHTML = `<div class="tab" data-tab="auras">${auraConfig}</div>`;
    div.querySelectorAll("INPUT[type=color][data-edit]").forEach(n => {
      n.addEventListener("change", config._onChangeInput.bind(config));
    })
    html.querySelector("footer").before(div.firstElementChild);
  }

  /**
   * Redraw the aura when the token document is updated.
   * @param {TokenDocument5e} token     The updated token document.
   * @param {object} data               The update data.
   */
  static onUpdateToken(token, data) {
    const flags = data.flags?.[MODULE.ID] ?? {};
    const isRedraw = ["hidden", "width", "height"].some(k => k in data);
    if (("aura" in flags) || isRedraw) Auras.drawAura(token.object);
  }

  /**
   * Immediately refresh auras when a wall is changed, such as a new wall created, or a door opened.
   */
  static refreshAll() {
    for (const token of canvas.tokens.placeables) Auras.drawAura.call(token);
  }

  /**
   * Initialize container for token auras on the grid layer.
   * @param {GridLayer} layer     The grid layer.
   */
  static onDrawGridLayer(layer) {
    layer.tokenAuras = layer.addChildAt(new PIXI.Container(), layer.getChildIndex(layer.borders));
  }

  /**
   * Remove an aura from the canvas when its token is removed.
   * @param {Token5e} token     The token that was destroyed.
   */
  static onDestroyToken(token) {
    token.tokenAuras?.destroy();
  }
}
