// TODO: add drop event for dropping components onto the sheet.
export class RecipeSheet extends dnd5e.applications.item.ItemSheet5e {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "item", "recipe"],
      width: 400,
      dragDrop: [{dropSelector: "[data-action='drop-target']"}]
    });
  }

  get template() {
    return "modules/mythacri-scripts/templates/recipe-sheet.hbs";
  }

  async getData(options = {}) {
    const data = await super.getData(options);

    // TODO: recipe type (cooking, monster, rune, spirit), get these from the Crafting class.
    data.recipeTypes = {
      cooking: "Cooking",
      monster: "Monster Crafting",
      rune: "Runecarving",
      spirit: "Spiritbinding"
    };

    data.recipeTarget = await this._validTargetItemLink();

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
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Item") return;

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
    });
    html[0].querySelectorAll("[type=text], [type=number]").forEach(n => {
      n.addEventListener("focus", event => event.currentTarget.select());
    });
  }

  /**
   * Handle deleting a component.
   * @param {PointerEvent} event
   * @returns {Item5e}
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
   * @returns {Item5e}
   */
  async _onAddComponent(event) {
    const components = foundry.utils.deepClone(this.document.system.crafting.components);
    components.push({quantity: null, identifier: ""});
    return this.document.update({"system.crafting.components": components});
  }

  /**
   * Handle clearing the target.
   * @param {PointerEvent} event
   * @returns {Item5e}
   */
  async _onClearTarget(event) {
    return this.document.update({"system.crafting.target": {uuid: "", quantity: null}});
  }
}
