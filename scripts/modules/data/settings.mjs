import {MODULE} from "../constants.mjs";

Hooks.once("init", _registerSettings);

/** Data model for identifiers settings. */
class IdentifiersSettingsModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    return {
      packs: IdentifiersSettingsModelMixin(["craftingResources", "craftingRecipes"], "packs"),
      folders: IdentifiersSettingsModelMixin(["partyActors"], Folder),
      party: new foundry.data.fields.ForeignDocumentField(Actor),
      paths: new foundry.data.fields.SchemaField({
        soundboard: new foundry.data.fields.StringField()
      })
    };
  }
}

/* -------------------------------------------------- */

/**
 * Create a data model for nesting within the `SettingsModel`.
 * @param {string[]} properties         The data properties, each becoming `ForeignDocumentField` or `StringField`.
 * @param {DataModel|string} model      A subclass of `DataModel`, or a 'directory string' such as "packs".
 * @returns {EmbeddedDataField}
 */
function IdentifiersSettingsModelMixin(properties, model) {
  const isSub = foundry.utils.isSubclass(model, foundry.abstract.DataModel);
  const cls = class IdentifiersSettingsModelNested extends foundry.abstract.DataModel {
    /** @override */
    _initialize(...args) {
      super._initialize(...args);
      this.prepareDerivedData();
    }

    /** @override */
    static defineSchema() {
      const schema = {};
      if (isSub) for (const key of properties) schema[key] = new foundry.data.fields.ForeignDocumentField(model);
      else for (const key of properties) schema[key] = new foundry.data.fields.StringField();
      return schema;
    }

    /** @override */
    prepareDerivedData() {
      // Only prepare data if `model` is not a subclass of `DataModel`.
      if (isSub) return;
      for (const key of properties) {
        Object.defineProperty(this, key, {
          get() {
            return game[model].get(this._source[key]) || null;
          }, configurable: true
        });
      }
    }
  };
  return new foundry.data.fields.EmbeddedDataField(cls);
}

/* -------------------------------------------------- */

/** Settings menu form for identifiers. */
class IdentifiersSettingsMenu extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    position: {width: 500, height: "auto"},
    window: {title: "MYTHACRI.SettingsIdentifiers"},
    id: "mythacri-scripts-settings-identifiers",
    tag: "form",
    form: {
      handler: IdentifiersSettingsMenu.#onSubmit,
      closeOnSubmit: true
    }
  };

  /* -------------------------------------------------- */

  /** @override */
  static PARTS = {
    form: {
      template: "modules/mythacri-scripts/templates/settings-identifiers.hbs"
    }
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
    const context = {options: {packs: {}, folders: {}}};

    for (const pack of game.packs) {
      if (pack.metadata.type !== "Item") continue;
      context.options.packs[pack.metadata.id] = pack.metadata.label;
    }

    for (const folder of game.actors.folders) {
      context.options.folders[folder.id] = folder.name;
    }

    const model = game.settings.get(MODULE.ID, "identifiers");
    context.model = model;
    context.source = model?.toObject?.() ?? {};

    return context;
  }
}

/* -------------------------------------------------- */

/**
 * Render the identifier settings menu.
 * @returns {Promise<IdentifiersSettingsMenu>}
 */
async function create() {
  return new IdentifiersSettingsMenu().render(true);
}

/* -------------------------------------------------- */

/** Register settings. */
function _registerSettings() {
  game.settings.register(MODULE.ID, "identifiers", {
    config: false,
    type: IdentifiersSettingsModel,
    default: IdentifiersSettingsModel.schema.initial(),
    scope: "world"
  });

  /** Remember where the soundboard was last dragged. */
  game.settings.register(MODULE.ID, "soundboard-position", {
    config: false,
    type: Object,
    default: {},
    scope: "client"
  });

  /** Remember whether the soundboard was visible. */
  game.settings.register(MODULE.ID, "soundboard-visibility", {
    config: false,
    type: Boolean,
    default: false,
    scope: "client"
  });

  /** The current number of random encounter dice. */
  game.settings.register(MODULE.ID, "encounter-dice", {
    config: false,
    type: Number,
    default: 1,
    scope: "world"
  });

  /** Register settings menus. */
  game.settings.registerMenu(MODULE.ID, "identifiers", {
    name: "MYTHACRI.SettingsIdentifiers",
    hint: "MYTHACRI.SettingsIdentifiersHint",
    label: "MYTHACRI.SettingsIdentifiersLabel",
    icon: "fa-solid fa-id-card",
    type: IdentifiersSettingsMenu,
    restricted: true
  });
}

/* -------------------------------------------------- */

export default {
  create
};
