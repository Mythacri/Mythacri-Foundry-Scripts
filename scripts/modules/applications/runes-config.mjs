import MODULE from "../constants.mjs";

/**
 * Application for managing runes on an item.
 */
export default class RunesConfig extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.DocumentSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: [MODULE.ID, "runes-config"],
    position: {width: 400, height: "auto"},
    id: "runes-config-{id}",
    sheetConfig: false,
    actions: {
      toggle: RunesConfig.#toggle
    }
  };

  /* -------------------------------------------------- */

  /** @override */
  static PARTS = {
    form: {
      template: "modules/mythacri-scripts/templates/runes-config.hbs"
    }
  };

  /* -------------------------------------------------- */

  /** @override */
  get title() {
    return `${game.i18n.localize("MYTHACRI.CraftingRunesConfig")}: ${this.document.name}`;
  }

  /* -------------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = {};

    const prepareBonus = async(bonus) => {
      const text = await TextEditor.enrichHTML(bonus.description, {async: true});
      return {bonus: bonus, text: text, enabled: bonus.enabled, name: bonus.name};
    };

    context.bonuses = await Promise.all(babonus.getCollection(this.document).reduce((acc, bonus) => {
      const isRune = bonus.flags[MODULE.ID]?.isRune;
      if (isRune) acc.push(prepareBonus(bonus));
      return acc;
    }, []));

    context.value = context.bonuses.filter(bonus => bonus.enabled).length;
    context.max = this.document.flags[MODULE.ID].runes.max;
    context.atMax = context.value >= context.max;

    return context;
  }

  /* -------------------------------------------------- */
  /*   Event handlers                                   */
  /* -------------------------------------------------- */

  /**
   * Handle clicking a 'toggle' button.
   * @param {PointerEvent} event      Triggering click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static #toggle(event, target) {
    const id = target.closest("[data-bonus-id]").dataset.bonusId;
    const bonus = babonus.getCollection(this.document).get(id);
    bonus.toggle();
  }
}
