const { HandlebarsApplicationMixin, Application } = foundry.applications.api;

/**
 * Item sheet for recipe-type items.
 */
export default class RecipeSheet extends HandlebarsApplicationMixin(Application) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["mythacri", "recipe"],
    position: {
      width: 600,
      height: "auto",
    },
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    details: {
      template: "modules/mythacri-scripts/templates/sheets/item/recipe/details.hbs",
    },
  };

  /* -------------------------------------------------- */

  /** @override */
  get template() {
    return "modules/mythacri-scripts/templates/recipe-sheet.hbs";
  }

  /* -------------------------------------------------- */

  /** @override */
  async getData(options = {}) {
    const data = await super.getData(options);
    data.recipeTypes = mythacri.crafting.TYPES.recipeTypes;
    data.recipeTarget = await this._validTargetItemLink();
    data.invalidTarget = !!this.document.system.crafting.target.uuid && !data.recipeTarget;
    data.recipeStatus = data.recipeTypes[this.document.system.type.value] || "";
    data.descriptionHTML = await TextEditor.enrichHTML(this.document.system.description.value, { async: true });
    data.components = data.system.crafting.components.map((c, idx) => {
      return {
        idx: idx,
        qty: c.quantity,
        value: c.identifier,
        valid: !c.identifier || mythacri.crafting.validIdentifier(c.identifier),
      };
    });

    const isBasic = this.document.system.crafting.basic;
    if (!isBasic) {
      const [learned, learners, unlearned] = this.getLearners();
      data.learned = learned;
      data.learners = learners;
      data.unlearned = unlearned;
    }
    return data;
  }

  /* -------------------------------------------------- */

  /** @override */
  setPosition(pos = {}) {
    if (!pos.height && (this._tabs[0].active !== "description")) pos.height = "auto";
    return super.setPosition(pos);
  }

  /* -------------------------------------------------- */

  /**
   * Return an enriched content link if a target item is valid, otherwise null.
   * @returns {Promise<null|string>}
   */
  async _validTargetItemLink() {
    const target = await this.document.system.getTarget();
    return target ? TextEditor.enrichHTML(target.link, { async: true }) : null;
  }

  /* -------------------------------------------------- */

  /** @override */
  async _onDrop(event) {
    const target = event.currentTarget.dataset.action;
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Item") return;
    if (target === "drop-target") return this._onDropTarget(data);
    else if (target === "drop-component") return this._onDropComponent(data);
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping an item onto the component item area.
   * @param {object} data
   * @returns {Promise<Item5e|void>}
   */
  async _onDropComponent(data) {
    const item = await fromUuid(data.uuid);
    const id = mythacri.crafting.getIdentifier(item);
    if (!id) return;
    const components = foundry.utils.deepClone(this.document.system.crafting.components);
    components.push({ quantity: null, identifier: id });
    return this.document.update({ "system.crafting.components": components });
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping an item onto the target item area.
   * @param {object} data                 The drop data.
   * @returns {Promise<Item5e|void>}      The updated item.
   */
  async _onDropTarget(data) {
    const item = await fromUuid(data.uuid);
    if (!this.document.system.allowedTargetTypes.includes(item.type)) return;
    return this.document.update({ "system.crafting.target.uuid": item.uuid });
  }

  /* -------------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("[data-action]").forEach(n => {
      const action = n.dataset.action;
      if (action === "delete-component") n.addEventListener("click", this._onDeleteComponent.bind(this));
      else if (action === "add-component") n.addEventListener("click", this._onAddComponent.bind(this));
      else if (action === "clear-target") n.addEventListener("click", this._onClearTarget.bind(this));
      else if (action === "learn-recipe") n.addEventListener("click", this._learnRecipe.bind(this));
      else if (action === "unlearn-recipe") n.addEventListener("click", this._unlearnRecipe.bind(this));
      else if (action === "render-actor") n.addEventListener("click", this._renderActor.bind(this));
      else if (action === "refresh") n.addEventListener("click", this.render.bind(this));
    });
    html[0].querySelectorAll("[type=text], [type=number]").forEach(n => {
      n.addEventListener("focus", event => event.currentTarget.select());
    });
  }

  /* -------------------------------------------------- */

  /**
   * Handle deleting a component.
   * @param {PointerEvent} event
   * @returns {Promise<Item5e>}
   */
  async _onDeleteComponent(event) {
    const idx = event.currentTarget.closest("[data-idx]").dataset.idx;
    const components = foundry.utils.deepClone(this.document.system.crafting.components);
    components.splice(idx, 1);
    return this.document.update({ "system.crafting.components": components });
  }

  /* -------------------------------------------------- */

  /**
   * Handle adding a component.
   * @param {PointerEvent} event
   * @returns {Promise<Item5e>}
   */
  async _onAddComponent(event) {
    const components = foundry.utils.deepClone(this.document.system.crafting.components);
    components.push({ quantity: null, identifier: "" });
    return this.document.update({ "system.crafting.components": components });
  }

  /* -------------------------------------------------- */

  /**
   * Handle clearing the target.
   * @param {PointerEvent} event
   * @returns {Promise<Item5e>}
   */
  async _onClearTarget(event) {
    return this.document.update({ "system.crafting.target": { uuid: "", quantity: null } });
  }

  /* -------------------------------------------------- */

  /**
   * Handle learning a recipe.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Promise<Actor5e>}
   */
  async _learnRecipe(event) {
    const id = event.currentTarget.closest("[data-actor-id]").dataset.actorId;
    const actor = game.actors.get(id);
    const learned = new Set(actor.flags[mythacri.id]?.recipes?.learned ?? []);
    learned.add(this.document.id);
    await actor.setFlag(mythacri.id, "recipes.learned", Array.from(learned));
    this.render();
    return actor;
  }

  /* -------------------------------------------------- */

  /**
   * Handle unlearning a recipe.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Promise<Actor5e>}
   */
  async _unlearnRecipe(event) {
    const id = event.currentTarget.closest("[data-actor-id]").dataset.actorId;
    const actor = game.actors.get(id);
    const learned = new Set(actor.flags[mythacri.id]?.recipes?.learned ?? []);
    learned.delete(this.document.id);
    await actor.setFlag(mythacri.id, "recipes.learned", Array.from(learned));
    this.render();
    return actor;
  }

  /* -------------------------------------------------- */

  /**
   * Render an actor's sheet when clicked.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {ActorSheet5e}          The rendered actor sheet.
   */
  _renderActor(event) {
    const id = event.currentTarget.closest("[data-actor-id]").dataset.actorId;
    return game.actors.get(id).sheet.render(true);
  }

  /* -------------------------------------------------- */

  /**
   * Find what actors know this recipe, can learn this recipe, and cannot learn this recipe.
   * @returns {Actor5e[][]}     Array of arrays of learned, learners, and unavailable.
   */
  getLearners() {
    const party = game.settings.get("dnd5e", "primaryParty")?.actor;
    if (!party) throw new Error("No primary party has been configured!");
    const members = party.system.members.map(m => m.actor) ?? [];
    const parts = [[], [], []];
    for (const actor of members) {
      if (!actor) continue;
      if (this.document.system.knowsRecipe(actor)) parts[0].push(actor);
      else if (this.document.system.canLearnRecipe(actor)) parts[1].push(actor);
      else parts[2].push(actor);
    }
    return parts;
  }
}
