import {MODULE} from "../constants.mjs";
import {Crafting} from "../data/crafting/base-crafting.mjs";

export class RecipeSheet extends dnd5e.applications.item.ItemSheet5e {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "item", "recipe"],
      width: 400,
      dragDrop: [
        {dropSelector: "[data-action='drop-target']"},
        {dropSelector: "[data-action='drop-component']"}
      ]
    });
  }

  /** @override */
  get template() {
    return "modules/mythacri-scripts/templates/recipe-sheet.hbs";
  }

  /** @override */
  async getData(options = {}) {
    const data = await super.getData(options);
    data.recipeTypes = Crafting.recipeTypes;
    data.recipeTarget = await this._validTargetItemLink();
    data.recipeStatus = data.recipeTypes[this.document.system.type.value] || "";

    const isBasic = this.document.system.crafting.basic;
    if (!isBasic) {
      data.learned = this.getLearned();
      data.learners = this.getLearners();
    }
    return data;
  }

  /**
   * Return an enriched content link if a target item is valid, otherwise null.
   * @returns {Promise<null|string>}
   */
  async _validTargetItemLink() {
    const target = await this.document.system.getTarget();
    return target ? TextEditor.enrichHTML(target.link, {async: true}) : null;
  }

  /** @override */
  async _onDrop(event) {
    const target = event.currentTarget.dataset.action;
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Item") return;
    if (target === "drop-target") return this._onDropTarget(data);
    else if (target === "drop-component") return this._onDropComponent(data);
  }

  /**
   * Handle dropping an item onto the component item area.
   * @param {object} data
   * @returns {Promise<Item5e|void>}
   */
  async _onDropComponent(data) {
    const item = await fromUuid(data.uuid);
    const id = Crafting.getIdentifier(item);
    if (!id) return;
    const components = foundry.utils.deepClone(this.document.system.crafting.components);
    components.push({quantity: null, identifier: id});
    return this.document.update({"system.crafting.components": components});
  }

  /**
   * Handle dropping an item onto the target item area.
   * @param {object} data                 The drop data.
   * @returns {Promise<Item5e|void>}      The updated item.
   */
  async _onDropTarget(data) {
    const item = await fromUuid(data.uuid);
    if (!this.document.system.allowedTargetTypes.includes(item.type)) return;
    return this.document.update({"system.crafting.target.uuid": item.uuid});
  }

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
    });
    html[0].querySelectorAll("[type=text], [type=number]").forEach(n => {
      n.addEventListener("focus", event => event.currentTarget.select());
    });
  }

  /**
   * Handle deleting a component.
   * @param {PointerEvent} event
   * @returns {Promise<Item5e>}
   */
  async _onDeleteComponent(event) {
    const idx = event.currentTarget.closest("[data-idx]").dataset.idx;
    const components = foundry.utils.deepClone(this.document.system.crafting.components);
    components.splice(idx, 1);
    return this.document.update({"system.crafting.components": components});
  }

  /**
   * Handle adding a component.
   * @param {PointerEvent} event
   * @returns {Promise<Item5e>}
   */
  async _onAddComponent(event) {
    const components = foundry.utils.deepClone(this.document.system.crafting.components);
    components.push({quantity: null, identifier: ""});
    return this.document.update({"system.crafting.components": components});
  }

  /**
   * Handle clearing the target.
   * @param {PointerEvent} event
   * @returns {Promise<Item5e>}
   */
  async _onClearTarget(event) {
    return this.document.update({"system.crafting.target": {uuid: "", quantity: null}});
  }

  /**
   * Handle learning a recipe.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Promise<Actor5e>}
   */
  async _learnRecipe(event) {
    const id = event.currentTarget.closest("[data-actor-id]").dataset.actorId;
    const actor = game.actors.get(id);
    const learned = new Set(actor.flags[MODULE.ID]?.recipes?.learned ?? []);
    learned.add(this.document.id);
    await actor.setFlag(MODULE.ID, "recipes.learned", [...learned]);
    this.render();
    return actor;
  }

  /**
   * Handle unlearning a recipe.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Promise<Actor5e>}
   */
  async _unlearnRecipe(event) {
    const id = event.currentTarget.closest("[data-actor-id]").dataset.actorId;
    const actor = game.actors.get(id);
    const learned = new Set(actor.flags[MODULE.ID]?.recipes?.learned ?? []);
    learned.delete(this.document.id);
    await actor.setFlag(MODULE.ID, "recipes.learned", [...learned]);
    this.render();
    return actor;
  }

  /**
   * Find what actors know this recipe.
   * @returns {Actor5e[]}
   */
  getLearned() {
    const folder = game.settings.get(MODULE.ID, "identifiers").folders.partyActors;
    return folder ? folder.contents.filter(a => this.document.system.knowsRecipe(a)) : [];
  }

  /**
   * Find what actors can learn this recipe.
   * @returns {Actor5e[]}
   */
  getLearners() {
    const folder = game.settings.get(MODULE.ID, "identifiers").folders.partyActors;
    return folder ? folder.contents.filter(a => this.document.system.canLearnRecipe(a)) : [];
  }
}
