import MODULE from "../constants.mjs";

const {HandlebarsApplicationMixin, ApplicationV2} = foundry.applications.api;

const targets = new Map();

/**
 * Prepare relevant data from items in the compendium for faster processing.
 */
Hooks.once("ready", async function() {
  const key = game.settings.get(MODULE.ID, "identifiers")?.packs.craftingRecipes;
  const pack = game.packs.get(key);

  if (!pack) return;

  const index = await pack.getIndex({
    fields: [
      "system.crafting.basic",
      "system.crafting.components",
      "system.crafting.target",
      "system.description.value",
      "system.type.value",
    ],
  });

  for (const idx of index) {
    const uuid = idx.system?.crafting?.target?.uuid;
    if (!uuid) continue;
    const target = fromUuidSync(uuid);
    targets.set(target.uuid, target);
  }
});

/**
 * Main crafting application class to handle all types of crafting.
 */
export default class CraftingApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: [MODULE.ID, "crafting", "dnd5e2"],
    position: {
      width: 800,
      height: 700,
    },
    window: {
      resizable: true,
      icon: "",
    },
    actions: {
      create: CraftingApplication.#onCreate,
      show: CraftingApplication.#onShow,
    },
    type: null, // Crafting type.
    actor: null, // Crafting actor.
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    recipes: {
      template: "modules/mythacri-scripts/templates/parts/crafting-app-recipes.hbs",
      scrollable: [""],
    },
    selected: {
      template: "modules/mythacri-scripts/templates/parts/crafting-app-selected.hbs",
      scrollable: [""],
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const appOptions = super._initializeApplicationOptions(options);
    appOptions.uniqueId = `${options.type}-crafting-${options.actor.uuid.replaceAll(".", "-")}`;
    appOptions.classes.push(options.type);
    return appOptions;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  get title() {
    const title = game.i18n.localize(`MYTHACRI.CRAFTING.${this.options.type.toUpperCase()}.Title`);
    return `${title}: ${this.options.actor.name}`;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = {};
    const recipes = this.getAvailableRecipes();
    context.recipes = recipes.map(idx => {
      const components = mythacri.dataModels.item.RecipeData.getComponents(idx.system.crafting.components);
      const labels = Object.entries(components).map(([id, qty]) => {
        const items = this.getPossibleResources(id);
        const max = items.length ? Math.max(...items.map(item => item.system.quantity)) : 0;
        return {
          cssClass: (max < qty) ? "missing" : "",
          label: `${mythacri.crafting.getLabel(id)} (${max}/${qty})`,
        };
      });

      const qty = idx.system.crafting.target.quantity || 1;
      const trg = targets.get(idx.system.crafting.target.uuid);
      const css = ["recipe"];
      if (this.canCreateRecipe(idx)) css.push("available");
      else css.push("unavailable");

      return {
        recipe: idx,
        cssClass: css.join(" "),
        isStack: qty > 1,
        stack: qty,
        isBasic: idx.system.crafting.basic,
        labels: labels,
        components: components,
        target: trg,
        tooltip: `
        <section class='loading' data-uuid='${trg.uuid}'>
          <i class='fas fa-spinner fa-spin-pulse'></i>
        </section>`,
        tooltipClass: "dnd5e2 dnd5e-tooltip item-tooltip",
      };
    });

    context.title = `MYTHACRI.CRAFTING.${this.options.type.toUpperCase()}.Title`;
    context.availableOnly = !!this._availableOnly;
    context.type = this.options.type;

    if (this._recipe) {
      const uuid = this._recipe.system.crafting.target.uuid;
      const item = targets.get(uuid);
      context.recipe = {
        text: (await item.toEmbed({inline: true})).outerHTML,
        labels: this._getRecipeLabels(this._recipe),
        icon: this.options.window.icon,
        uuid: this._recipe.uuid,
        item: item,
        tooltip: `
        <section class='loading' data-uuid='${uuid}'>
          <i class='fas fa-spinner fa-spin-pulse'></i>
        </section>`,
        tooltipClass: "dnd5e2 dnd5e-tooltip item-tooltip",
      };
    }
    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Get the labels to display for the required components.
   * @param {Item5e} item     A recipe item.
   * @returns {string}
   */
  _getRecipeLabels(item) {
    const components = item.system.getComponents();
    const labels = Object.entries(components).map(([id, qty]) => {
      const items = this.getPossibleResources(id);
      const max = items.length ? Math.max(...items.map(item => item.system.quantity)) : 0;
      const label = `${mythacri.crafting.getLabel(id)} (${max}/${qty})`;
      const cssClass = max < qty ? "missing" : "";
      return {label, cssClass};
    });
    return labels;
  }

  /* -------------------------------------------------- */

  /**
   * Retrieve all recipes that are of this type and that this actor has learned (or are basic).
   * @returns {object[]}      Compendium index entries.
   */
  getAvailableRecipes() {
    const pack = game.packs.get(game.settings.get(MODULE.ID, "identifiers")?.packs.craftingRecipes);
    if (!pack) throw new Error("There is no valid crafting recipes compendium in the settings.");

    const rd = mythacri.dataModels.item.RecipeData;
    const index = [];

    for (const idx of pack.index) {
      if (idx.type !== "mythacri-scripts.recipe") continue;
      if (idx.system.type.value !== this.options.type) continue;

      const isc = idx.system.crafting;
      const ist = idx.system.type;

      if (!rd.hasTarget(isc.target.uuid)) {
        console.warn(`Recipe item '${idx.name}' has no valid target.`);
        continue;
      }

      if (!rd.hasComponents(isc.components)) {
        console.warn(`Recipe item '${idx.name}' has no valid components.`);
        continue;
      }

      if (rd.knowsRecipe(this.options.actor, idx._id, ist.value, isc.basic)) {
        index.push(idx);
      }
    }

    index.sort((a, b) => a.name.localeCompare(b.name));
    return index;
  }

  /* -------------------------------------------------- */

  /**
   * Does the actor have the needed components for this recipe?
   * @param {object} idx     The recipe retrieved from compendium index.
   * @returns {boolean}
   */
  canCreateRecipe(idx) {
    const components = mythacri.dataModels.item.RecipeData.getComponents(idx.system.crafting.components);
    const resources = this.options.actor.items.reduce((acc, item) => {
      const validFor = Object.keys(components).find(id => mythacri.crafting.validResourceForComponent(item, id));
      if (validFor) acc[validFor] = Math.max(acc[validFor] ?? 0, item.system.quantity);
      return acc;
    }, {});

    for (const [k, v] of Object.entries(components)) {
      const has = resources[k] ?? 0;
      if (v > has) return false;
    }
    return true;
  }

  /* -------------------------------------------------- */

  /**
   * Get a list of resource items that can be used as a component.
   * @param {Actor5e} actor         The actor holding the resources.
   * @param {string} id             The resource identifier.
   * @param {number} [value=1]      The required minimum quantity.
   * @returns {Item5e[]}            The items that can be used for this.
   */
  static getPossibleResources(actor, id, value = 1) {
    return actor.items.filter(item => {
      return mythacri.crafting.validResourceForComponent(item, id) && (item.system.quantity >= value);
    });
  }

  /* -------------------------------------------------- */

  /**
   * Get a list of resource items that can be used as a component.
   * @param {string} id             The resource identifier.
   * @param {number} [value=1]      The required minimum quantity.
   * @returns {Item5e[]}            The items that can be used for this.
   */
  getPossibleResources(id, value = 1) {
    return this.constructor.getPossibleResources(this.options.actor, id, value);
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  render(...args) {
    this.options.actor.apps[this.id] = this;
    return super.render(...args);
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  close(...args) {
    delete this.options.actor.apps[this.id];
    return super.close(...args);
  }

  /* -------------------------------------------------- */
  /*   Event handlers                                   */
  /* -------------------------------------------------- */

  /**
   * Handle clicking a 'create' button.
   * @this {CraftingApplication}
   * @param {PointerEvent} event      Initiating click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static async #onCreate(event, target) {
    const recipe = await fromUuid(target.dataset.uuid);
    const canCreate = this.canCreateRecipe(recipe);
    if (!canCreate) {
      ui.notifications.warn("MYTHACRI.CRAFTING.Warning.MissingComponents", {localize: true});
      return null;
    }
    new CraftingHandler(this.options.actor, this.options.type, recipe).render(true);
  }

  /**
   * Get the details of a recipe and provide it in the selected area.
   * @this {CraftingApplication}
   * @param {PointerEvent} event      The initiating click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static async #onShow(event, target) {
    const uuid = target.dataset.uuid;
    const item = await fromUuid(uuid);
    this._recipe = item;
    this.render({parts: ["selected"]});
  }
}

/* -------------------------------------------------- */

/**
 * Subapplication to handle crafting of a single recipe.
 */
class CraftingHandler extends dnd5e.applications.DialogMixin(Application) {
  /**
   * @constructor
   * @param {Actor5e} actor           The actor crafting.
   * @param {string} type             The type of crafting (monster, spirit, cooking, rune).
   * @param {Item5e} recipe           The recipe item.
   * @param {object} [options={}]     Rendering options.
   */
  constructor(actor, type, recipe, options = {}) {
    super(options);
    this.actor = actor;
    this.type = type;
    this.recipe = recipe;
  }

  /* -------------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/crafting-handler.hbs",
      classes: [MODULE.ID, "crafting-handler", "dnd5e2", "dialog"],
      width: "auto",
    });
  }

  /* -------------------------------------------------- */

  /** @override */
  get title() {
    return game.i18n.format("MYTHACRI.CRAFTING.HANDLER.Title", {name: this.recipe.name});
  }

  /* -------------------------------------------------- */

  /** @override */
  get id() {
    return `crafting-handler-${this.recipe.id}-${this.actor.uuid.replaceAll(".", "-")}`;
  }

  /* -------------------------------------------------- */

  /**
   * The assigned components, a record of component identifiers and items.
   * @type {Record<string, Item5e>}
   */
  assigned = null;

  /* -------------------------------------------------- */

  /** @override */
  async getData() {
    this.assigned ??= {};
    const target = this.target ??= await this.recipe.system.getTarget();
    const components = this.recipe.system.getComponents();
    const context = Object.entries(components).map(([key, qty]) => {
      const resources = CraftingApplication.getPossibleResources(this.actor, key);
      return {
        identifier: key,
        quantity: qty,
        icon: this.assigned[key]?.img || "icons/svg/circle.svg",
        resources: resources.map(r => ({
          resource: r,
          active: this.assigned[key] === r,
          tooltipCss: "dnd5e2 dnd5e-tooltip item-tooltip",
          tooltipHint: `
          <section class='loading' data-uuid='${r.uuid}'>
            <i class='fas fa-spinner fa-spin-pulse'></i>
          </section>`,
        })),
        assigned: this.assigned[key] ?? null,
        label: mythacri.crafting.getLabel(key),
      };
    });

    return {
      target: target,
      targetHint: `
      <section class='loading' data-uuid='${target.uuid}'>
        <i class='fas fa-spinner fa-spin-pulse'></i>
      </section>`,
      targetCss: "dnd5e2 dnd5e-tooltip item-tooltip",
      context: context,
      assigned: this.assigned,
      noCreate: !Object.keys(components).every(key => this.assigned[key] instanceof Item),
    };
  }

  /* -------------------------------------------------- */

  /** @override */
  setPosition(pos = {}) {
    if (!pos.height) pos.height = "auto";
    return super.setPosition(pos);
  }

  /* -------------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    const columns = Array.from(html[0].querySelectorAll(".column"));
    const minWidth = columns.reduce((acc, col) => Math.max(acc, col.clientWidth), 142);
    html[0].querySelector(".components").style.minWidth = `${minWidth * columns.length}px`;
    html[0].querySelectorAll("[data-item-id]").forEach(n => {
      n.addEventListener("click", this._onClickComponent.bind(this));
    });
    html[0].querySelectorAll(".craft").forEach(n => n.addEventListener("click", this._onClickCraft.bind(this)));
  }

  /* -------------------------------------------------- */
  /*   Event handlers                                   */
  /* -------------------------------------------------- */

  /**
   * Set an item to be the assigned resource for this component.
   * @param {PointerEvent} event      The initiating click event.
   */
  _onClickComponent(event) {
    const {identifier, itemId} = event.currentTarget.dataset;
    const item = this.actor.items.get(itemId);

    // Unassigning a component.
    if (this.assigned[identifier] === item) {
      this.assigned[identifier] = null;
      this.render();
    }

    // Assigning a component that is assigned elsewhere.
    else if (Object.values(this.assigned).includes(item)) {
      ui.notifications.warn("You cannot assign the same component twice!");
    }

    // Assigning an unassigned component.
    else {
      this.assigned[identifier] = item;
      this.render();
    }
  }

  /* -------------------------------------------------- */

  /**
   * Finalize the crafting process using assigned resources.
   * @param {PointerEvent} event        The initiating click event.
   * @returns {Promise<void>}
   */
  async _onClickCraft(event) {
    this.close();
    const resources = this.assigned;
    const target = await this.recipe.system.getTarget();
    const components = this.recipe.system.getComponents();
    const deleteIds = [];
    const updates = Object.entries(components).reduce((acc, [identifier, qty]) => {
      const item = resources[identifier];
      const iq = item.system.quantity;
      const nq = Math.max(0, iq - qty);
      if (nq > 0) acc.push({_id: item.id, "system.quantity": nq});
      else deleteIds.push(item.id);
      return acc;
    }, []);
    const toCreate = [];
    const spiritGrade = this._getSpiritGrade(resources);
    const itemData = this._createItemData(this.type, target, spiritGrade);

    // Determine how many of the item to make.
    const qty = (this.type === "spirit") ? 1 : (this.recipe.system.crafting.target.quantity || 1);

    // Stack consumable items either in one stack or onto an existing stack.
    if ((target.type === "consumable") && (this.type !== "spirit")) {
      const existingItem = this.actor.items.find(item => item.flags[MODULE.ID]?.sourceId === target.uuid);
      if (existingItem) {
        updates.push({_id: existingItem.id, "system.quantity": existingItem.system.quantity + qty});
      } else {
        itemData.system.quantity = qty;
        toCreate.push(itemData);
      }
    } else {
      for (let i = 0; i < qty; i++) toCreate.push(itemData);
    }
    if (deleteIds.length) await this.actor.deleteEmbeddedDocuments("Item", deleteIds);
    if (toCreate.length) await this.actor.createEmbeddedDocuments("Item", toCreate);
    if (updates.length) await this.actor.updateEmbeddedDocuments("Item", updates);
  }

  /* -------------------------------------------------- */

  /**
   * Generate item data. Handles the edge case for spiritbinding, which creates an intermediary item.
   * @param {string} type           The crafting type (monster, spirit, cooking, rune).
   * @param {Item5e} target         The target item of crafting.
   * @param {number|null} grade     The spirit grade.
   * @returns {object}              Item data.
   */
  _createItemData(type, target, grade) {
    const data = (type !== "spirit") ? game.items.fromCompendium(target) : {
      name: game.i18n.format("MYTHACRI.CRAFTING.SPIRIT.Name", {name: target.name, grade: grade.ordinalString()}),
      type: "consumable",
      img: target.img,
      flags: {},
      system: {
        description: {
          value: `
          <p><strong>${game.i18n.localize("MYTHACRI.ResourceEssenceGrade")}:</strong> ${grade}</p>
          <fieldset><legend>${target.name}</legend>${target.system.description.value}</fieldset>`,
        },
        quantity: 1,
        weight: {value: 0},
        rarity: {
          1: "common",
          2: "uncommon",
          3: "rare",
          4: "veryRare",
          5: "legendary",
          6: "artifact",
        }[grade] ?? "",
        activation: {type: "none"},
        duration: {units: "perm"},
        target: {value: 1, type: "willing"},
        range: {units: "touch"},
        uses: {value: 1, max: "1", per: "charges", autoDestroy: true},
        type: {value: "spirit"},
      },
    };
    foundry.utils.mergeObject(data.flags, {
      [`${MODULE.ID}.recipeUuid`]: this.recipe.uuid,
      [`${MODULE.ID}.sourceId`]: target.uuid,
      [`${MODULE.ID}.spiritGrade`]: grade,
    });
    return data;
  }

  /* -------------------------------------------------- */

  /**
   * Get the highest grade from all essences used in the creation of this item.
   * @param {object} resources      The assigned resources being used, an object of identifiers and items.
   * @returns {number|null}         The highest grade of all essences assigned, otherwise null.
   */
  _getSpiritGrade(resources) {
    const items = Object.values(resources);
    let grade = null;
    for (const item of items) {
      const ir = item.flags[MODULE.ID].resource;
      if ((ir.type === "essence") && (ir.subtype in CONFIG.DND5E.creatureTypes)) {
        const ig = ir.grade || 1;
        if (ig > grade) grade = ig;
      }
    }
    return grade;
  }
}
