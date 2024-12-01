import MODULE from "../constants.mjs";

/**
 * Application for managing runes on an item.
 */
export default class RunesConfig extends dnd5e.applications.api.ApplicationV2Mixin(
  foundry.applications.api.DocumentSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: [MODULE.ID, "runes-config", "dnd5e2"],
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
    return game.i18n.localize("MYTHACRI.CRAFTING.RUNE.Configure");
  }

  /* -------------------------------------------------- */

  /** @override */
  get subtitle() {
    return this.document.name;
  }

  /* -------------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = {};

    const prepareBonus = async (bonus) => {
      const text = await TextEditor.enrichHTML(bonus.description);
      return {bonus: bonus, text: text};
    };

    const isRune = effect => {
      if (effect.type !== "enchantment") return false;
      return effect.changes.some(c => c.key === `flags.${MODULE.ID}.runes.value`);
    };

    context.bonuses = [];
    for (const effect of this.document.effects) {
      if (!isRune(effect)) continue;
      context.bonuses.push(await prepareBonus(effect));
    }

    const runes = {...this.document.flags[MODULE.ID].runes};
    runes.value ??= 0;

    context.runes = runes;
    context.item = this.document;
    context.atMax = runes.value >= runes.max;
    context.overCapacity = runes.value > runes.max;
    context.belowCapacity = (context.bonuses.length >= runes.max) && !context.atMax;

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
    const bonus = this.document.effects.get(id);
    bonus.update({disabled: !bonus.disabled});
  }
}
