import {MODULE} from "../constants.mjs";
import {Crafting} from "../data/crafting.mjs";
import {ResourcePopulatorModel} from "../data/models/resource-populator.mjs";

export class ResourcePopulator extends FormApplication {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = "modules/mythacri-scripts/templates/resource-populator.hbs";
    options.classes.push("resource-populator", "mythacri-scripts");
    return options;
  }

  /** @override */
  get title() {
    return game.i18n.format("MYTHACRI.ResourcePopulatorTitle", {name: this.actor.name});
  }

  /** @constructor */
  constructor(actor, options = {}) {
    if (!["character", "npc"].includes(actor.type)) throw new Error(`'${actor?.name}' is not a character or npc!`);
    super(actor, options);
    this.actor = actor;
    this.types = ResourcePopulator.splitRaces(actor).filter(k => k in CONFIG.DND5E.creatureTypes);

    const data = Object.entries(Crafting.subsubtypes).reduce((acc, [key, {label, uncommon}]) => {
      const un = this.types.every(type => uncommon.includes(type));
      return un ? foundry.utils.mergeObject(acc, {[`types.${key}.active`]: false}) : acc;
    }, {});

    this.model = new ResourcePopulatorModel(data);
  }

  /**
   * Gather an object of uncommon options for this creature type.
   * @returns {object}
   */
  get uncommonOptions() {
    const options = {};
    const {types, schema} = this.model;
    for (const k in types) {
      if (!types[k].active) options[k] = schema.getField(`types.${k}`).label;
    }
    return options;
  }

  /** @override */
  getData() {
    const options = this.uncommonOptions;
    let focus = this._autofocus;
    if (focus?.name) {
      const name = focus.name;
      const [, key] = name.split(".");
      focus = key;
    } else if (focus?.classList.contains("type-select")) {
      focus = "select";
    }
    return {
      types: Object.entries(this.model.toObject().types).reduce((acc, [key, data]) => {
        if (data.active) acc.push({
          ...data,
          key: key,
          label: this.model.schema.getField(`types.${key}`).label,
          autofocus: focus === key
        });
        return acc;
      }, []).sort((a, b) => a.label.localeCompare(b.label)),
      options: options,
      hasOptions: !!Object.keys(options).length,
      focusOptions: focus === "select"
    };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("INPUT, SELECT").forEach(n => {
      n.addEventListener("focus", (event) => this._autofocus = event.currentTarget);
    });
    html[0].querySelector("[autofocus]")?.focus();
  }

  /** @override */
  async _onChangeInput(event) {
    const target = event.currentTarget;
    let data;
    if (target.classList.contains("type-select")) {
      data = {
        [`types.${target.value}.active`]: true,
        [`types.${target.value}.formula`]: ""
      };
    } else data = this._getSubmitData();
    this.model.updateSource(data);
    this.render();
  }

  /** @override */
  setPosition(pos = {}) {
    pos.height = "auto";
    return super.setPosition(pos);
  }

  /** @override */
  async _updateObject(event, formData) {
    this.model.updateSource(formData);
    const data = this.model.toObject().types;
    for (const k in data) {
      if (!data[k].active) delete data[k];
      else {
        const valid = Roll.validate(data[k].formula || "1d2");
        data[k].formula = valid ? (data[k].formula || "1d2") : "1d2";
      }
    }
    const pack = game.settings.get(MODULE.ID, "identifiers").packs.craftingResources;
    const items = await pack.getDocuments({
      type: "loot",
      flags: {
        [MODULE.ID]: {
          resource: {type: "monster", subtype: this.types[0], subsubtype__in: Object.keys(data)}
        }
      }
    });
    const list = Object.entries(data).reduce((acc, [key, {formula}]) => {
      const item = items.find(item => item.flags[MODULE.ID].resource.subsubtype === key);
      if (!item) throw new Error(`No item with monster part type '${key}' exists!`);
      return acc.concat([{uuid: item.uuid, quantity: formula}])
    }, []);
    return this.actor.setFlag("simple-loot-list", "loot-list", list);
  }

  /**
   * Utility function to split racial values.
   * @param {Actor5e} actor     The actor.
   * @returns {string[]}        The different 'races' to compare against.
   */
  static splitRaces(actor) {
    let races = [];
    const type = actor.system.details?.type;
    if (type) {
      races = this._split(type.subtype);
      if (type.value === "custom") races.push(...this._split(type.custom));
      else races.push(type.value);
    }
    return races;
  }

  /**
   * Utility function to split a string by '/'.
   * @param {string} str      The string to split.
   * @returns {string[]}      The array of strings.
   */
  static _split(str) {
    return str?.split("/").reduce((acc, e) => {
      const trim = e.trim().toLowerCase();
      if (trim.length) acc.push(trim);
      return acc;
    }, []) ?? [];
  }

  /**
   * Factory method to create an instance of this application for several actors.
   * @param {Actor5e|Actor5e[]} [actors]      An actor or array of actors.
   * @returns {void}
   */
  static create(actors = []) {
    if (!game.modules.get("simple-loot-list")?.active) {
      throw new Error(`The module 'simple-loot-list' is not active!`);
    }
    actors = (actors instanceof Actor) ? [actors] : actors;
    actors = actors.filter(a => ["character", "npc"].includes(a.type));
    if (!actors.length) {
      ui.notifications.warn("MYTHACRI.ResourcePopulatorNoActors", {localize: true});
      return;
    }
    for (const actor of actors) new this(actor).render(true);
  }
}
