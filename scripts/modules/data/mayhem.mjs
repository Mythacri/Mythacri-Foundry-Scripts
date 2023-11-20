import {MODULE} from "../constants.mjs";

export class Mayhem extends foundry.abstract.DataModel {
  /** Initialize dnd5e hooks. */
  static init() {
    Hooks.on("dnd5e.preUseItem", Mayhem.#preUseItem);
    Hooks.on("renderAbilityUseDialog", Mayhem.#renderAbilityUseDialog);
    Hooks.on("dnd5e.preItemUsageConsumption", Mayhem.#preItemUsageConsumption);
    Hooks.on("dnd5e.useItem", Mayhem.#useItem);
  }

  /* --------------------------------- */
  /*         ITEM USAGE HOOKS          */
  /* --------------------------------- */

  /**
   * Add a 'consumeMayhem' option to ability use dialogs.
   * @param {Item5e} item         Item being used.
   * @param {object} config       Configuration data for the item usage being prepared.
   * @param {object} options      Additional options used for configuring item usage.
   */
  static #preUseItem(item, config, options) {
    if (!game.user.isGM) return;
    const isMayhem = item.system.activation.type === "mayhem";
    if (isMayhem) config.consumeMayhem = true;
  }

  /**
   * Inject elements into the AbilityUseDialog.
   * @param {AbilityUseDialog} dialog     The rendered application.
   * @param {HTMLElement} html            The rendered element.
   */
  static #renderAbilityUseDialog(dialog, [html]) {
    const item = dialog.item;
    const isMayhem = item.system.activation.type === "mayhem";
    if (!game.user.isGM || !isMayhem) return;
    const notes = html.querySelector(".notes");
    const cost = item.system.activation.cost || 1;
    const mayhem = Mayhem.create();
    if (!mayhem.canDeduct(cost)) {
      const div = document.createElement("DIV");
      div.innerHTML = `
      <p class="notification warning">
        ${game.i18n.localize("MYTHACRI.MayhemCannotDeduct")}
      </p>`;
      notes.after(div.firstElementChild);
    }

    const div = document.createElement("DIV");
    div.innerHTML = `
    <div class="form-group">
      <label class="checkbox">
        <input type="checkbox" name="consumeMayhem" checked>
        ${game.i18n.localize("MYTHACRI.MayhemConsume")}
      </label>
    </div>`;
    html.querySelector("#ability-use-form").appendChild(div.firstElementChild);

    dialog.setPosition({height: "auto"});
  }

  /**
   * Cancel the usage of the item and consumption if the user is consuming mayhem points they do not have.
   * @param {Item5e} item         Item being used.
   * @param {object} config       Configuration data for the item usage being prepared.
   * @param {object} options      Additional options used for configuring item usage.
   */
  static #preItemUsageConsumption(item, config, options) {
    if (!config.consumeMayhem || !(item.system.activation.type === "mayhem")) return;
    const cost = item.system.activation.cost || 1;
    const mayhem = Mayhem.create();
    if (!mayhem.canDeduct(cost)) {
      ui.notifications.warn("MYTHACRI.MayhemCannotDeduct", {localize: true});
      return false;
    }
  }

  /**
   * Deduct the mayhem points from the user if the usage of the item was successful.
   * @param {Item5e} item         Item being used.
   * @param {object} config       Configuration data for the item usage being prepared.
   * @param {object} options      Additional options used for configuring item usage.
   */
  static #useItem(item, config, options) {
    if (!config.consumeMayhem || !(item.system.activation.type === "mayhem")) return;
    const cost = item.system.activation.cost || 1;
    return Mayhem.deduct(cost);
  }

  /* --------------------------------- */
  /*             DATA MODEL            */
  /* --------------------------------- */

  /** @override */
  static defineSchema() {
    return {
      points: new foundry.data.fields.NumberField({integer: true, min: 0, initial: 0})
    };
  }

  /**
   * Create a new instance of this data model.
   * @param {User} [user=null]      The user storing the mayhem points, defaults to `game.user`.
   * @returns {Mayhem}
   */
  static create(user = null) {
    if (!game.user.isGM) {
      ui.notifications.warn("MYTHACRI.MayhemUserNotAllowed", {localize: true});
      return null;
    }
    user = user ?? game.user;
    const data = user.flags[MODULE.ID]?.mayhem ?? {};
    return new Mayhem(data, {parent: user});
  }

  /**
   * Deduct mayhem points from yourself.
   * @param {number} [value=1]      The amount of points to deduct.
   * @returns {Promise<User>}       The user after having their points updated.
   */
  static async deduct(value = 1) {
    const mayhem = Mayhem.create();
    const canDeduct = mayhem.canDeduct(value);
    if (!canDeduct) {
      ui.notifications.warn("MYTHACRI.MayhemCannotDeduct", {localize: true});
      return null;
    }
    mayhem.updateSource({points: mayhem.points - value});
    return mayhem.parent.setFlag(MODULE.ID, "mayhem", mayhem.toObject());
  }

  /**
   * Get whether the value being tested can be deducted from the user.
   * @param {number} value      The value to test.
   * @returns {boolean}
   */
  canDeduct(value) {
    if (Number.isNumeric(value)) value = Number(value);
    else return false;
    return (value <= this.points);
  }

  /**
   * Add mayhem points to yourself.
   * @param {number} [value=1]      The amount of points to add.
   * @returns {Promise<User>}       The user after having their points updated.
   */
  static async add(value = 1) {
    const mayhem = Mayhem.create();
    const canAdd = mayhem.canAdd(value);
    if (!canAdd) {
      ui.notifications.warn("MYTHACRI.MayhemCannotAdd", {localize: true});
      return null;
    }
    mayhem.updateSource({points: mayhem.points + value});
    return mayhem.parent.setFlag(MODULE.ID, "mayhem", mayhem.toObject());
  }

  /**
   * Get whether the value being tested can be added to the user.
   * @param {number} value      The value to test.
   * @returns {boolean}
   */
  canAdd(value) {
    if (Number.isNumeric(value)) value = Number(value);
    else return false;
    return value > 0;
  }

  /**
   * Render an instance of the mayhem ui for manually changing the points.
   * @returns {MayhemUI}      A rendered MayhemUI application.
   */
  static async render() {
    const mayhem = Mayhem.create();
    return new MayhemUI(mayhem).render(true);
  }
}

/** Utility application for displaying and managing mayhem points manually. */
class MayhemUI extends Application {
  /**
   * @constructor
   * @param {Mayhem} mayhem     An instance of a mayhem data model.
   */
  constructor(mayhem) {
    super();
    this.mayhem = mayhem;
    this.user = mayhem.parent;
    this.clone = mayhem.parent.clone({}, {keepId: true});
    this.mayhemClone = Mayhem.create(this.clone);
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/mayhem-ui.hbs",
      classes: [MODULE.ID, "mayhem-ui"]
    });
  }

  /** @override */
  get title() {
    return game.i18n.format("MYTHACRI.MayhemTitle", {name: this.user.name});
  }

  /** @override */
  get id() {
    return `mayhem-ui-${this.user.uuid.replaceAll(".", "-")}`;
  }

  /** @override */
  async getData() {
    return {
      mayhem: this.mayhem,
      mayhemClone: this.mayhemClone,
      user: this.user,
      clone: this.clone,
      disableDown: this.mayhemClone.points === 0,
      diff: (this.mayhemClone.points - this.mayhem.points).signedString()
    };
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("[data-action]").forEach(n => {
      const action = n.dataset.action;
      switch (action) {
        case "increase": n.addEventListener("click", this._increase.bind(this)); break;
        case "decrease": n.addEventListener("click", this._decrease.bind(this)); break;
        case "adjust": {
          n.addEventListener("change", this._adjust.bind(this));
          n.addEventListener("focus", e => e.currentTarget.select());
          break;
        }
        case "submit": n.addEventListener("click", this._submit.bind(this)); break;
      }
    });
  }

  /** Handle hitting the 'increase' button. */
  _increase() {
    this.mayhemClone.updateSource({points: this.mayhemClone.points + 1});
    this.render();
  }

  /** Handle hitting the 'decrease' button. */
  _decrease() {
    this.mayhemClone.updateSource({points: this.mayhemClone.points - 1});
    this.render();
  }

  /**
   * Handle manual input in the number field.
   * @param {ChangeEvent} event      The initiating change event.
   */
  _adjust(event) {
    const value = Number(event.currentTarget.value || this.mayhem.points);
    this.mayhemClone.updateSource({points: value});
    this.render();
  }

  /**
   * Handle hitting the 'submit' button.
   * @returns {Promise<User>}     The updated user with new mayhem point value.
   */
  async _submit() {
    this.close();
    const data = this.mayhemClone.toObject();
    ui.notifications.info(game.i18n.format("MYTHACRI.MayhemUpdated", {points: data.points}));
    return this.user.setFlag(MODULE.ID, "mayhem", data);
  }
}
