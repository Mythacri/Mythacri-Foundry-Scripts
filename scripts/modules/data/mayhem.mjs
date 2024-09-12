import MODULE from "../constants.mjs";

Hooks.on("dnd5e.preUseActivity", _preUseActivity);
Hooks.on("renderActivityUsageDialog", _renderActivityUsageDialog);
Hooks.on("dnd5e.preActivityConsumption", _preActivityConsumption);
Hooks.on("dnd5e.postActivityConsumption", _postActivityConsumption);

/* -------------------------------------------------- */

/**
 * Add a 'consume.mayhem' option to ability use dialogs.
 * @param {Activity} activity     The activity being used.
 * @param {object} config         Configuration data for the activity usage being prepared.
 * @param {object} dialog         Configuration data for the dialog to be shown.
 */
function _preUseActivity(activity, config, dialog) {
  if (!game.user.isGM) return;
  if (activity.activation.type === "mayhem") {
    foundry.utils.mergeObject(config, {
      "consume.mayhem": true,
      hasConsumption: true
    });
    dialog.configure = true;
  }
}

/* -------------------------------------------------- */

/**
 * Inject elements into the AbilityUseDialog.
 * @param {AbilityUseDialog} dialog     The rendered application.
 * @param {HTMLElement} html            The rendered element.
 */
function _renderActivityUsageDialog(dialog, html) {
  if (!("mayhem" in (dialog.options.config?.consume ?? {}))) return;
  const section = html.querySelector("[data-application-part=consumption]");
  const checked = dialog.config.consume;

  const group = `
  <div class="form-group">
    <label>${game.i18n.localize("MYTHACRI.MAYHEM.Consume")}</label>
    <div class="form-fields">
      <dnd5e-checkbox name="consume.mayhem" ${checked.mayhem ? "checked" : ""}>
    </div>
  </div>`;

  if (section.querySelector("fieldset")) {
    section.querySelector("fieldset").insertAdjacentHTML("beforeend", group);
  } else {
    const fieldset = document.createElement("FIELDSET");
    fieldset.insertAdjacentHTML("beforeend", `<legend>${game.i18n.localize("DND5E.USAGE.SECTION.Consumption")}</legend>`);
    fieldset.insertAdjacentHTML("beforeend", group);
    section.insertAdjacentElement("beforeend", fieldset);
  }
}

/* -------------------------------------------------- */

/**
 * Abort usage of the activity if the user cannot consume the required number of mayhem points.
 * @param {Activity} activity     The activity being used.
 * @param {object} config         Configuration data for the activity usage being prepared.
 * @param {object} dialog         Configuration data for the dialog to be shown.
 */
function _preActivityConsumption(activity, config, dialog) {
  if (!config.consume?.mayhem) return;
  const cost = activity.activation.cost || 1;
  const mayhem = Mayhem.create();
  if (!mayhem.canDeduct(cost)) {
    ui.notifications.warn("MYTHACRI.MAYHEM.Warning.Deduct", {localize: true});
    return false;
  }
}

/**
 * Deduct the mayhem points from the user.
 * @param {Activity} activity     The activity being used.
 * @param {object} config         Configuration data for the activity usage being prepared.
 * @param {object} dialog         Configuration data for the dialog to be shown.
 * @param {object[]} updates      The updates that were performed.
 */
function _postActivityConsumption(activity, config, dialog, updates) {
  if (!config.consume?.mayhem) return;
  const cost = activity.activation.cost || 1;
  deduct(cost);
}

/** Data model for the internal mayhem data. */
class Mayhem extends foundry.abstract.DataModel {
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
   * Get whether the value being tested can be added to the user.
   * @param {number} value      The value to test.
   * @returns {boolean}
   */
  canAdd(value) {
    if (Number.isNumeric(value)) value = Number(value);
    else return false;
    return value > 0;
  }
}

/* -------------------------------------------------- */

/**
 * Add mayhem points to yourself.
 * @param {number} [value=1]          The amount of points to add.
 * @returns {Promise<User|null>}      The updated User, or null if the value was invalid.
 */
async function add(value = 1) {
  const mayhem = Mayhem.create();
  const canAdd = mayhem.canAdd(value);
  if (!canAdd) {
    ui.notifications.warn("MYTHACRI.MayhemCannotAdd", {localize: true});
    return null;
  }
  mayhem.updateSource({points: mayhem.points + value});
  return mayhem.parent.setFlag(MODULE.ID, "mayhem", mayhem.toObject());
}

/* -------------------------------------------------- */

/**
 * Deduct mayhem points from yourself.
 * @param {number} [value=1]          The amount of points to deduct.
 * @returns {Promise<User|null>}      The updated User, or null if the value was invalid.
 */
async function deduct(value = 1) {
  const mayhem = Mayhem.create();
  const canDeduct = mayhem.canDeduct(value);
  if (!canDeduct) {
    ui.notifications.warn("MYTHACRI.MayhemCannotDeduct", {localize: true});
    return null;
  }
  mayhem.updateSource({points: mayhem.points - value});
  return mayhem.parent.setFlag(MODULE.ID, "mayhem", mayhem.toObject());
}

/* -------------------------------------------------- */

/**
 * Render an instance of the mayhem ui for manually changing the points.
 * @returns {Promise<MayhemUI>}     A rendered MayhemUI application.
 */
async function create() {
  const mayhem = Mayhem.create();
  return new MayhemUI(mayhem).render({force: true});
}

/* -------------------------------------------------- */

/** Utility application for displaying and managing mayhem points manually. */
class MayhemUI extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: [MODULE.ID, "mayhem", "standard-form"],
    position: {width: 400, height: "auto"},
    actions: {
      add: MayhemUI.#add,
      deduct: MayhemUI.#deduct
    }
  };

  /* -------------------------------------------------- */

  /** @override */
  static PARTS = {
    form: {
      template: "modules/mythacri-scripts/templates/mayhem.hbs"
    }
  };

  /* -------------------------------------------------- */

  /** @override */
  get title() {
    return game.i18n.format("MYTHACRI.MAYHEM.Title", {name: game.user.name});
  }

  /* -------------------------------------------------- */

  /** @override */
  async _prepareContext() {
    const mayhem = Mayhem.create();
    return {
      mayhem: mayhem,
      user: game.user,
      disableDown: !mayhem.points
    };
  }

  /* -------------------------------------------------- */

  /**
   * Increase mayhem points.
   * @this {MayhemUI}
   * @param {PointerEvent} event      Triggering click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static async #add(event, target) {
    await add(1);
    this.render();
  }

  /* -------------------------------------------------- */

  /**
   * Decrease mayhem points.
   * @this {MayhemUI}
   * @param {PointerEvent} event      Triggering click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static async #deduct(event, target) {
    await deduct(1);
    this.render();
  }
}

/* -------------------------------------------------- */

export default {
  add,
  create,
  deduct
};
