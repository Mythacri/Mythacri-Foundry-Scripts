import {MODULE} from "../constants.mjs";

/**
 * Application for managing runes on an item.
 */
export class RunesConfig extends Application {
  /**
   * @constructor
   * @param {Item5e} item             The item with bonuses.
   * @param {object} [options={}]     Rendering options.
   */
  constructor(item, options={}) {
    super(options);
    this.item = item;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/runes-config.hbs",
      classes: [MODULE.ID, "runes-config"],
      width: 400
    });
  }

  /** @override */
  get id() {
    return `runes-config-${this.item.uuid.replaceAll(".", "-")}`;
  }

  /** @override */
  get title() {
    return `${game.i18n.localize("MYTHACRI.CraftingRunesConfig")}: ${this.item.name}`;
  }

  /** @override */
  async getData() {
    const context = {};
    context.bonuses = await Promise.all(babonus.getCollection(this.item).reduce((acc, bonus) => {
      const isRune = bonus.flags[MODULE.ID]?.isRune;
      if (isRune) acc.push(this._prepareBonus(bonus));
      return acc;
    }, []));
    context.value = context.bonuses.filter(bonus => bonus.enabled).length;
    context.max = this.item.flags[MODULE.ID].runes.max;
    this.atMax = context.atMax = context.value >= context.max;
    return context;
  }

  /**
   * Prepare a bonus for rendering.
   * @param {Babonus} bonus
   * @returns {Promise<object>}
   */
  async _prepareBonus(bonus) {
    const text = await TextEditor.enrichHTML(bonus.description, {async: true});
    return {bonus: bonus, text: text, enabled: bonus.enabled, name: bonus.name};
  }

  /** @override */
  setPosition(pos = {}) {
    if (!pos.height) pos.height = "auto";
    return super.setPosition(pos);
  }

  /** @override */
  async render(...args) {
    this.item.apps["runes-config"] = this;
    return super.render(...args);
  }

  /** @override */
  async close(...args) {
    delete this.item.apps["runes-config"];
    return super.close(...args);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("[data-action=toggle]").forEach(n => {
      n.addEventListener("click", this._onClickToggle.bind(this));
    });
  }

  /* ------------------------------------ */
  /*                                      */
  /*            Event Handlers            */
  /*                                      */
  /* ------------------------------------ */

  /**
   * Handle clicking a 'toggle' button.
   * @param {PointerEvent} event
   */
  async _onClickToggle(event) {
    const id = event.currentTarget.closest("[data-bonus-id]").dataset.bonusId;
    return babonus.toggleBonus(this.item, id);
  }
}
