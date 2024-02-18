import {MODULE} from "../constants.mjs";
import {Crafting} from "../data/crafting.mjs";
import {RecipeData} from "../data/models/recipe-item.mjs";

/**
 * Main crafting application class to handle all types of crafting.
 */
export class CraftingApplication extends Application {
  /**
   * @constructor
   * @param {Actor5e} actor           The crafting actor.
   * @param {string} type             The type of crafting (monster, spirit, rune, cooking).
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
      width: 800,
      scrollY: [".recipes"],
      resizable: true,
      height: 700
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

  /**
   * Get the icon specific to this type of crafting.
   * @type {string}
   */
  get icon() {
    return {
      cooking: "drumstick-bite",
      rune: "gem",
      monster: "hand-fist",
      spirit: "fire-flame-simple"
    }[this.type];
  }

  /** @override */
  async getData() {
    const context = {};
    context.recipes = await this.getAvailableRecipes();
    context.recipes = context.recipes.map(idx => {
      const components = RecipeData.getComponents(idx.system.crafting.components);
      const labels = Object.entries(components).map(([id, qty]) => {
        const items = this.getPossibleResources(id);
        const max = items.length ? Math.max(...items.map(item => item.system.quantity)) : 0;
        return {
          cssClass: (max < qty) ? "missing" : "",
          label: `${Crafting.getLabel(id)} (${max}/${qty})`
        };
      });

      const qty = idx.system.crafting.target.quantity || 1;
      const trg = fromUuidSync(idx.system.crafting.target.uuid);
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
        tooltipClass: "dnd5e2 dnd5e-tooltip item-tooltip"
      };
    });

    context.title = `MYTHACRI.CraftingSection${this.type.capitalize()}`;
    context.availableOnly = !!this._availableOnly;
    context.type = this.type;

    if (this._recipe) {
      context.recipe = {
        text: await TextEditor.enrichHTML(this._recipe.system.description.value, {async: true}),
        labels: this._getRecipeLabels(this._recipe),
        icon: this.icon,
        uuid: this._recipe.uuid,
        item: fromUuidSync(this._recipe.system.crafting.target.uuid)
      };
    }
    return context;
  }

  /**
   * Get the labels to display for the required components.
   * @param {Item5e} item     A recipe item.
   * @returns {string}
   */
  _getRecipeLabels(item) {
    const components = item.system.getComponents();
    const labels = Object.entries(components).reduce((acc, [id, qty]) => {
      const items = this.getPossibleResources(id);
      const max = items.length ? Math.max(...items.map(item => item.system.quantity)) : 0;
      return acc + `
      <div class="component ${(max < qty) ? "missing" : ""}">
        ${Crafting.getLabel(id)} (${max}/${qty})
      </div>`;
    }, "");
    return labels;
  }

  /**
   * Get the details of a recipe and provide it in the selected area.
   * @param {Event} event     The initiating click event.
   * @returns {Promise<void>}
   */
  async _showDetails(event) {
    const uuid = event.currentTarget.closest("[data-uuid]").dataset.uuid;
    const item = await fromUuid(uuid);
    const area = this.element[0].querySelector(".selected");
    const templateData = {
      labels: this._getRecipeLabels(item),
      uuid: uuid,
      icon: this.icon,
      text: await TextEditor.enrichHTML(item.system.description.value, {async: true}),
      item: await fromUuid(item.system.crafting.target.uuid)
    };
    const template = "modules/mythacri-scripts/templates/parts/crafting-selected.hbs";
    area.childNodes.forEach(n => n.remove());
    area.innerHTML = await renderTemplate(template, {recipe: templateData});
    this._recipe = item;
    area.querySelector(".create").addEventListener("click", this._onCreate.bind(this));
  }

  /**
   * Retrieve all recipes that are of this type and that this actor has learned (or are basic).
   * @returns {Promise<object[]>}     Compendium index entries.
   */
  async getAvailableRecipes() {
    const pack = game.settings.get(MODULE.ID, "identifiers").packs.craftingRecipes;
    if (!pack) throw new Error("There is no valid crafting recipes compendium in the settings.");

    return (await pack.getIndex({
      fields: [
        "system.type.value",
        "system.crafting.basic",
        "system.crafting.target",
        "system.crafting.components",
        "system.description.value"
      ]
    })).filter(idx => {
      const isType = (idx.type === "mythacri-scripts.recipe") && (idx.system.type.value === this.type);
      if (!isType) return false;
      const hasT = RecipeData.hasTarget(idx.system.crafting.target.uuid);
      if (!hasT) {
        console.warn(`Recipe item '${idx.name}' has no valid target.`);
        return false;
      }
      const hasC = RecipeData.hasComponents(idx.system.crafting.components);
      if (!hasC) {
        console.warn(`Recipe item '${idx.name}' has no valid components.`);
        return false;
      }
      return RecipeData.knowsRecipe(this.actor, idx._id, idx.system.type.value, idx.system.crafting.basic);
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Does the actor have the needed components for this recipe?
   * @param {object} idx     The recipe retrieved from compendium index.
   * @returns {boolean}
   */
  canCreateRecipe(idx) {
    const components = RecipeData.getComponents(idx.system.crafting.components);
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
  render(...args) {
    this.actor.apps[`crafting-${this.type}`] = this;
    return super.render(...args);
  }

  /** @override */
  close(...args) {
    delete this.actor.apps[`crafting-${this.type}`];
    return super.close(...args);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll(".create").forEach(n => {
      n.addEventListener("click", this._onCreate.bind(this));
    });
    html[0].querySelectorAll("[data-action=show]").forEach(n => {
      n.addEventListener("click", this._showDetails.bind(this));
    });
    html[0].querySelector("#available").addEventListener("change", (event) => {
      this._availableOnly = event.currentTarget.checked;
    });
  }

  /* ------------------------------------ */
  /*                                      */
  /*            Event Handlers            */
  /*                                      */
  /* ------------------------------------ */

  /**
   * Handle clicking a 'create' button.
   * @param {PointerEvent} event
   * @returns {Promise<CraftingHandler|null>}
   */
  async _onCreate(event) {
    const recipe = await fromUuid(event.currentTarget.dataset.uuid);
    const canCreate = this.canCreateRecipe(recipe);
    if (!canCreate) {
      ui.notifications.warn("MYTHACRI.CraftingMissingComponents", {localize: true});
      return null;
    }
    return new CraftingHandler(this.actor, this.type, recipe).render(true);
  }

  /**
   * Slide a description up or down.
   * @param {PointerEvent} event
   */
  _toggleDescription(event) {
    event.currentTarget.closest(".recipe").classList.toggle("expanded");
  }
}

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

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/crafting-handler.hbs",
      classes: [MODULE.ID, "crafting-handler", "dnd5e2", "dialog"],
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
          </section>`
        })),
        assigned: this.assigned[key] ?? null,
        label: Crafting.getLabel(key)
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
    const columns = Array.from(html[0].querySelectorAll(".column"));
    const minWidth = columns.reduce((acc, col) => Math.max(acc, col.clientWidth), 142);
    html[0].querySelector(".components").style.minWidth = `${minWidth * columns.length}px`;
    html[0].querySelectorAll("[data-item-id]").forEach(n => {
      n.addEventListener("click", this._onClickComponent.bind(this));
    });
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
    const item = this.actor.items.get(itemId);
    this.assigned[identifier] = (this.assigned[identifier] === item) ? null : item;
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

  /**
   * Generate item data. Handles the edge case for spiritbinding, which creates an intermediary item.
   * @param {string} type           The crafting type (monster, spirit, cooking, rune).
   * @param {Item5e} target         The target item of crafting.
   * @param {number|null} grade     The spirit grade.
   * @returns {object}              Item data.
   */
  _createItemData(type, target, grade) {
    const data = (type !== "spirit") ? game.items.fromCompendium(target) : {
      name: game.i18n.format("MYTHACRI.CraftingSpiritBinding", {name: target.name, grade: grade.ordinalString()}),
      type: "consumable",
      img: target.img,
      flags: {},
      system: {
        description: {
          value: `
          <p><strong>${game.i18n.localize("MYTHACRI.ResourceEssenceGrade")}:</strong> ${grade}</p>
          <fieldset><legend>${target.name}</legend>${target.system.description.value}</fieldset>`
        },
        quantity: 1,
        weight: 0,
        rarity: {
          1: "common",
          2: "uncommon",
          3: "rare",
          4: "veryRare",
          5: "legendary",
          6: "artifact"
        }[grade] ?? "",
        activation: {type: "none"},
        duration: {units: "perm"},
        target: {value: 1, type: "willing"},
        range: {units: "touch"},
        uses: {value: 1, max: "1", per: "charges", autoDestroy: true},
        type: {value: "spirit"}
      }
    };
    foundry.utils.mergeObject(data.flags, {
      [`${MODULE.ID}.recipeUuid`]: this.recipe.uuid,
      [`${MODULE.ID}.sourceId`]: target.uuid,
      [`${MODULE.ID}.spiritGrade`]: grade
    });
    return data;
  }

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
