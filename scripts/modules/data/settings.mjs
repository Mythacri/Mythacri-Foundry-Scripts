import {MODULE} from "../constants.mjs";

/** Data model for identifiers settings. */
class IdentifiersSettingsModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      packs: IdentifiersSettingsModelMixin(["craftingResources", "craftingRecipes"], "packs"),
      folders: IdentifiersSettingsModelMixin(["partyActors"], Folder),
      paths: new foundry.data.fields.SchemaField({
        soundboard: new foundry.data.fields.StringField()
      })
    };
  }
}

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
          }, configurable: true,
        });
      }
    }
  };
  return new foundry.data.fields.EmbeddedDataField(cls);
}

/** Settings menu form for identifiers. */
class IdentifiersSettingsMenu extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/settings-identifiers.hbs",
      width: 500,
      title: "MYTHACRI.SettingsIdentifiers",
      id: "mythacri-scripts-settings-identifiers"
    });
  }

  /** @override */
  async _updateObject(event, formData) {
    return game.settings.set(MODULE.ID, "identifiers", foundry.utils.expandObject(formData));
  }

  /** @override */
  async getData() {
    const packs = this._getPackOptions();
    const folders = this._getFolderOptions();
    const model = game.settings.get(MODULE.ID, "identifiers");
    return {
      model: model,
      source: model?.toObject() ?? {},
      options: {packs, folders}
    };
  }

  /**
   * Get options for item compendium packs.
   * @returns {object}
   */
  _getPackOptions() {
    return game.packs.reduce((acc, pack) => {
      if (pack.metadata.type !== "Item") return acc;
      acc[pack.metadata.id] = pack.metadata.label;
      return acc;
    }, {});
  }

  /**
   * Get options for actor folders.
   * @returns {object}
   */
  _getFolderOptions() {
    return game.folders.reduce((acc, folder) => {
      if (folder.type !== "Actor") return acc;
      acc[folder.id] = folder.name;
      return acc;
    }, {});
  }
}

/** Utility export class for settings. */
export class Settings {
  /** Initialize. */
  static init() {
    Settings._registerMenus();
    Settings._register();
  }

  /** Register settings. */
  static _register() {
    game.settings.register(MODULE.ID, "identifiers", {
      config: false,
      type: IdentifiersSettingsModel,
      default: {},
      scope: "world"
    });
  }

  /** Register settings menus. */
  static _registerMenus() {
    game.settings.registerMenu(MODULE.ID, "identifiers", {
      name: "MYTHACRI.SettingsIdentifiers",
      hint: "MYTHACRI.SettingsIdentifiersHint",
      label: "MYTHACRI.SettingsIdentifiersLabel",
      icon: "fa-solid fa-id-card",
      type: IdentifiersSettingsMenu,
      restricted: true
    });
  }
}
