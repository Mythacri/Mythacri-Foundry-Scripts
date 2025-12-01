import MODULE from "../constants.mjs";

/**
 * Item sheet for recipe-type items.
 */
export default class RecipeSheet extends dnd5e.applications.item.ItemSheet5e {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["recipe"],
    actions: {
      removeCraftingTarget: RecipeSheet.#removeCraftingTarget,
      addCraftingComponent: RecipeSheet.#addCraftingComponent,
      removeCraftingComponent: RecipeSheet.#removeCraftingComponent,
      renderCraftingActor: RecipeSheet.#renderCraftingActor,
      unlearnCraftingRecipe: RecipeSheet.#unlearnCraftingRecipe,
      learnCraftingRecipe: RecipeSheet.#learnCraftingRecipe,
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.recipeTypes = mythacri.crafting.TYPES.recipeTypes;
    context.recipeTarget = await this._validTargetItemLink();
    context.invalidTarget = !!this.document.system.crafting.target.uuid && !context.recipeTarget;
    context.recipeStatus = context.recipeTypes[this.document.system.type.value] || "";
    context.descriptionHTML = await CONFIG.ux.TextEditor.enrichHTML(this.document.system.description.value, {
      rollData: this.document.getRollData(), relativeTo: this.document,
    });
    context.components = this.document.system.toObject().crafting.components.map((c, idx) => {
      return {
        idx: idx,
        quantity: c.quantity,
        identifier: c.identifier,
        valid: !c.identifier || mythacri.crafting.validIdentifier(c.identifier),
        quantityField: this.document.system.schema.getField("crafting.components.element.quantity"),
        identifierField: this.document.system.schema.getField("crafting.components.element.identifier"),
        namePrefix: `system.crafting.components.${idx}.`,
      };
    });

    context.systemFields = this.document.system.schema.fields;
    const isBasic = this.document.system.crafting.basic;
    if (!isBasic) {
      const {learned = [], learners = [], unavailable = []} = this.getLearners();
      context.learned = learned;
      context.learners = learners;
      context.unlearned = unavailable;
    }
    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Return an enriched content link if a target item is valid, otherwise null.
   * @returns {Promise<null|string>}
   */
  async _validTargetItemLink() {
    const target = await this.document.system.getTarget();
    return target?.toAnchor().outerHTML ?? null;
  }

  /* -------------------------------------------------- */

  /** @override */
  async _onDropItem(event, data) {
    const isTarget = !!event.target.closest(".recipe-target");
    const isComponent = !!event.target.closest(".recipe-components");

    const item = await Item.implementation.fromDropData(data);
    if (!item) return;
    switch (true) {
      case isTarget:
        if (this.document.system.allowedTargetTypes.includes(item.type)) {
          this.document.update({"system.crafting.target.uuid": item.uuid});
        }
        break;
      case isComponent: {
        const id = mythacri.crafting.getIdentifier(item);
        if (!id) return;
        const components = this.document.system.toObject().crafting.components;
        components.push({quantity: null, identifier: id});
        this.document.update({"system.crafting.components": components});
        break;
      }
    }
  }

  /* -------------------------------------------------- */

  /**
   * @this RecipeSheet
   */
  static #removeCraftingComponent(event, target) {
    const idx = target.closest("[data-idx]").dataset.idx;
    const components = this.document.system.toObject().crafting.components;
    components.splice(idx, 1);
    this.document.update({"system.crafting.components": components});
  }

  /* -------------------------------------------------- */

  /**
   * @this RecipeSheet
   */
  static #addCraftingComponent() {
    const components = this.document.system.toObject().crafting.components;
    components.push({quantity: null, identifier: ""});
    this.document.update({"system.crafting.components": components});
  }

  /* -------------------------------------------------- */

  /**
   * @this RecipeSheet
   */
  static #removeCraftingTarget() {
    this.document.update({"system.crafting.target": {uuid: "", quantity: null}});
  }

  /* -------------------------------------------------- */

  /**
   * @this RecipeSheet
   */
  static async #learnCraftingRecipe(event, target) {
    const id = target.closest("[data-actor-id]").dataset.actorId;
    const actor = game.actors.get(id);
    const learned = new Set(actor.flags[MODULE.ID]?.recipes?.learned ?? []);
    learned.add(this.document.id);
    await actor.setFlag(MODULE.ID, "recipes.learned", Array.from(learned));
    this.render();
  }

  /* -------------------------------------------------- */

  /**
   * @this RecipeSheet
   */
  static async #unlearnCraftingRecipe(event, target) {
    const id = target.closest("[data-actor-id]").dataset.actorId;
    const actor = game.actors.get(id);
    const learned = new Set(actor.flags[MODULE.ID]?.recipes?.learned ?? []);
    learned.delete(this.document.id);
    await actor.setFlag(MODULE.ID, "recipes.learned", Array.from(learned));
    this.render();
  }

  /* -------------------------------------------------- */

  /**
   * @this RecipeSheet
   */
  static #renderCraftingActor(event, target) {
    const id = target.closest("[data-actor-id]").dataset.actorId;
    game.actors.get(id).sheet.render({force: true});
  }

  /* -------------------------------------------------- */

  /**
   * Find what actors know this recipe, can learn this recipe, and cannot learn this recipe.
   * @returns {{ learned?: Actor5e[], learners?: Actor5e[], unavailable?: Actor5e[] }}
   */
  getLearners() {
    const party = game.actors.party;
    if (!party) throw new Error("No primary party has been configured!");
    return Object.groupBy(
      party.system.members.map(m => m.actor),
      actor => {
        return this.document.system.knowsRecipe(actor)
          ? "learned"
          : this.document.system.canLearnRecipe(actor)
            ? "learners"
            : "unavailable";
      },
    );
  }
}
