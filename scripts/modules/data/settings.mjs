import MODULE from "../constants.mjs";

Hooks.once("init", _registerSettings);

/* -------------------------------------------------- */

/** Data model for identifiers settings. */
class IdentifiersSettingsModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    return {
      packs: new foundry.data.fields.SchemaField({
        craftingRecipes: new foundry.data.fields.StringField({
          label: "MYTHACRI.SettingsPacksCraftingRecipes",
          hint: "MYTHACRI.SettingsPacksCraftingRecipesHint",
        }),
        craftingResources: new foundry.data.fields.StringField({
          label: "MYTHACRI.SettingsPacksCraftingResources",
          hint: "MYTHACRI.SettingsPacksCraftingResourcesHint",
        }),
      }),
    };
  }
}

/* -------------------------------------------------- */

/** Settings menu form for identifiers. */
class IdentifiersSettingsMenu extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2,
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: { width: 500, height: "auto" },
    window: { title: "MYTHACRI.SettingsIdentifiers" },
    id: "mythacri-scripts-settings-identifiers",
    tag: "form",
    form: {
      handler: IdentifiersSettingsMenu.#onSubmit,
      closeOnSubmit: true,
    },
  };

  /* -------------------------------------------------- */

  /** @override */
  static PARTS = {
    form: {
      template: "modules/mythacri-scripts/templates/settings-identifiers.hbs",
    },
  };

  /* -------------------------------------------------- */

  /** @override */
  static async #onSubmit(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);
    game.settings.set(MODULE.ID, "identifiers", data);
  }

  /* -------------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const model = game.settings.get(MODULE.ID, "identifiers") ?? new IdentifiersSettingsModel();

    const makeField = path => {
      const value = foundry.utils.getProperty(model._source, path);
      const field = model.schema.getField(path);
      return { value, field };
    };

    const context = {};

    const choices = {};
    for (const pack of game.packs) {
      if (pack.metadata.type !== "Item") continue;
      choices[pack.metadata.id] = pack.metadata.label;
    }

    context.fields = [
      { ...makeField("packs.craftingRecipes"), choices },
      { ...makeField("packs.craftingResources"), choices },
    ];

    return context;
  }
}

/* -------------------------------------------------- */

/**
 * Render the identifier settings menu.
 * @returns {Promise<IdentifiersSettingsMenu>}
 */
async function create() {
  return new IdentifiersSettingsMenu().render({ force: true });
}

/* -------------------------------------------------- */

/** Register settings. */
function _registerSettings() {
  game.settings.register(MODULE.ID, "identifiers", {
    config: false,
    type: IdentifiersSettingsModel,
    default: null,
    scope: "world",
  });
  /** The current number of random encounter dice. */
  game.settings.register(MODULE.ID, "encounter-dice", {
    config: false,
    type: Number,
    default: 1,
    scope: "world",
  });

  /** Register settings menus. */
  game.settings.registerMenu(MODULE.ID, "identifiers", {
    name: "MYTHACRI.SettingsIdentifiers",
    hint: "MYTHACRI.SettingsIdentifiersHint",
    label: "MYTHACRI.SettingsIdentifiersLabel",
    icon: "fa-solid fa-id-card",
    type: IdentifiersSettingsMenu,
    restricted: true,
  });
}

/* -------------------------------------------------- */

export default {
  create,
};
