import {MODULE} from "../constants.mjs";
import {Crafting} from "../data/crafting.mjs";

/**
 * Main crafting application class to handle all types of crafting.
 */
export class CraftingApplication extends Application {
  /**
   * @constructor
   * @param {Actor5e} actor           The crafting actor.
   * @param {string} type             The type of crafting.
   * @param {object} [options={}]     Rendering options.
   */
  constructor(actor, type, options = {}) {
    super(options);
    this.actor = actor;
    this.type = type;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/crafting-application.hbs",
      classes: [MODULE.ID, "crafting"],
      tabs: [{navSelector: "nav", contentSelector: ".content"}],
      width: 500,
      scrollY: [".tab.available", ".tab.unavailable"]
    });
  }

  /** @override */
  get id() {
    return `${this.type}-crafting-${this.actor.uuid.replaceAll(".", "-")}`;
  }

  /** @override */
  get title() {
    return game.i18n.localize(`MYTHACRI.CraftingSection${this.type.capitalize()}`) + ` (${this.actor.name})`;
  }

  /** @override */
  async getData() {
    const icon = {
      cooking: "drumstick-bite",
      rune: "gem",
      monster: "hand-fist",
      spirit: "fire-flame-simple"
    }[this.type];
    const recipes = await this.getAvailableRecipes();
    const context = await Promise.all(recipes.map(async (item) => {
      const components = item.system.getComponents();
      const labels = Object.entries(components).map(([id, qty]) => {
        const items = this.getPossibleResources(id, qty);
        const max = items.length ? Math.max(...items.map(item => item.system.quantity)) : 0;
        return {
          cssClass: (max < qty) ? "missing" : "",
          label: `${Crafting.getLabel(id)} (${max}/${qty})`
        };
      });

      const qty = item.system.crafting.target.quantity || 1;
      const target = await item.system.getTarget();
      const targetLink = await TextEditor.enrichHTML(target.link, {async: true});

      return {
        recipe: item,
        canCreate: this.canCreateRecipe(item),
        target: targetLink,
        isStack: qty > 1,
        stack: qty,
        isBasic: item.system.crafting.basic,
        labels: labels,
        components: components,
        icon: icon
      };
    }));

    const [unavailable, available] = context.partition(c => c.canCreate);
    return {unavailable, available};
  }

  /** @override */
  setPosition(pos = {}) {
    if (!pos.height) pos.height = "auto";
    return super.setPosition(pos);
  }

  /**
   * Retrieve all recipes that are of this type and that this actor has learned (or are basic).
   * @returns {Promise<Item5e[]>}
   */
  async getAvailableRecipes() {
    const pack = game.settings.get(MODULE.ID, "identifiers").packs.craftingRecipes;
    if (!pack) throw new Error("There is no valid crafting recipes compendium in the settings.");

    const documents = await pack.getDocuments({type: "mythacri-scripts.recipe", system: {type: {value: this.type}}});
    return documents.filter(item => {
      const hasT = item.system.hasTarget;
      if (!hasT) {
        console.warn(`Recipe item '${item.name}' has no valid target.`);
        return false;
      }
      const hasC = item.system.hasComponents;
      if (!hasC) {
        console.warn(`Recipe item '${item.name}' has no valid components.`);
        return false;
      }
      return item.system.knowsRecipe(this.actor);
    });
  }

  /**
   * Does the actor have the needed components for this recipe?
   * @param {Item5e} item     The recipe.
   * @returns {boolean}
   */
  canCreateRecipe(item) {
    const components = item.system.getComponents();
    const resources = this.actor.items.reduce((acc, item) => {
      const validFor = Object.keys(components).find(id => Crafting.validResourceForComponent(item, id));
      if (validFor) acc[validFor] = Math.max(acc[validFor] ?? 0, item.system.quantity);
      return acc;
    }, {});
    for (const key in components) {
      const needed = components[key];
      const has = resources[key] ?? 0;
      if (needed > has) return false;
    }
    return true;
  }

  /**
   * Get a list of resource items that can be used as a component.
   * @param {Actor5e} actor         The actor holding the resources.
   * @param {string} id             The resource identifier.
   * @param {number} [value=1]      The required minimum quantity.
   * @returns {Item5e[]}            The items that can be used for this.
   */
  static getPossibleResources(actor, id, value = 1) {
    return actor.items.filter(item => {
      return Crafting.validResourceForComponent(item, id) && (item.system.quantity >= value);
    });
  }

  /**
   * Get a list of resource items that can be used as a component.
   * @param {string} id             The resource identifier.
   * @param {number} [value=1]      The required minimum quantity.
   * @returns {Item5e[]}            The items that can be used for this.
   */
  getPossibleResources(id, value = 1) {
    return this.constructor.getPossibleResources(this.actor, id, value);
  }

  /** @override */
  async render(...args) {
    this.actor.apps[`crafting-${this.type}`] = this;
    return super.render(...args);
  }

  /** @override */
  async close(...args) {
    delete this.actor.apps[`crafting-${this.type}`];
    return super.close(...args);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll(".create").forEach(n => n.addEventListener("click", this._onCreate.bind(this)));
  }

  /* ------------------------------------ */
  /*                                      */
  /*            Event Handlers            */
  /*                                      */
  /* ------------------------------------ */

  /**
   * Handle clicking a 'create' button.
   * @param {PointerEvent} event
   */
  async _onCreate(event) {
    const recipe = await fromUuid(event.currentTarget.dataset.uuid);
    const canCreate = this.canCreateRecipe(recipe);
    return !canCreate ? this.render() : new CraftingHandler(this.actor, recipe).render(true);
  }
}

/**
 * Subapplication to handle crafting of a single recipe.
 */
class CraftingHandler extends Application {
  /**
   * @constructor
   * @param {Actor5e} actor           The actor crafting.
   * @param {Item5e} recipe           The recipe item.
   * @param {object} [options={}]     Rendering options.
   */
  constructor(actor, recipe, options = {}) {
    super(options);
    this.actor = actor;
    this.recipe = recipe;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/crafting-handler.hbs",
      classes: [MODULE.ID, "crafting-handler"],
      width: "auto"
    });
  }

  /** @override */
  get title() {
    return game.i18n.format("MYTHACRI.CraftingHandlerTitle", {name: this.recipe.name});
  }

  /** @override */
  get id() {
    return `crafting-handler-${this.recipe.id}-${this.actor.uuid.replaceAll(".", "-")}`;
  }

  /** @override */
  async getData() {
    this.assigned ??= {};
    const target = await this.recipe.system.getTarget();
    const components = this.recipe.system.getComponents();
    const context = Object.entries(components).map(([key, qty]) => {
      const resources = CraftingApplication.getPossibleResources(this.actor, key);
      if (resources.length === 1) this.assigned[key] = resources[0];
      return {
        identifier: key,
        quantity: qty,
        icon: this.assigned[key]?.img || "icons/svg/item-bag.svg",
        resources: resources.map(r => ({resource: r, active: this.assigned[key] === r})),
        assigned: this.assigned[key] ?? null,
        label: Crafting.getLabel(key)
      };
    });

    return {
      target: target,
      context: context,
      assigned: this.assigned,
      noCreate: !Object.keys(components).every(key => this.assigned[key] instanceof Item)
    };
  }

  /** @override */
  setPosition(pos = {}) {
    if (!pos.height) pos.height = "auto";
    return super.setPosition(pos);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll(".component").forEach(n => n.addEventListener("click", this._onClickComponent.bind(this)));
    html[0].querySelectorAll(".craft").forEach(n => n.addEventListener("click", this._onClickCraft.bind(this)));
  }

  /* ------------------------------------ */
  /*                                      */
  /*            Event Handlers            */
  /*                                      */
  /* ------------------------------------ */

  /**
   * Set an item to be the assigned resource for this component.
   * @param {PointerEvent} event      The initiating click event.
   */
  _onClickComponent(event) {
    const {identifier, itemId} = event.currentTarget.dataset;
    this.assigned[identifier] = this.actor.items.get(itemId);
    this.render();
  }

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
    const itemData = game.items.fromCompendium(target);
    foundry.utils.setProperty(itemData.flags, `${MODULE.ID}.recipeUuid`, this.recipe.uuid);
    const qty = this.recipe.system.crafting.target.quantity || 1;

    // Stack consumable items either in one stack or onto an existing stack.
    if (target.type === "consumable") {
      foundry.utils.setProperty(itemData.flags, `${MODULE.ID}.sourceId`, target.uuid);
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
}
