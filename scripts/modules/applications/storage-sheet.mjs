/**
 * Actor sheet for storage-type actors.
 */
export class StorageSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes.push("actor", "dnd5e", "storage");
    options.width = options.height = 600;
    options.tabs.push({navSelector: ".tabs", contentSelector: ".sheet-body"});
    return options;
  }

  /** @override */
  get template() {
    return "modules/mythacri-scripts/templates/storage-sheet.hbs";
  }

  /**
   * A set of item types that should be prevented from being dropped on this type of actor sheet.
   * @type {Set<string>}
   */
  static unsupportedItemTypes = new Set(["feat", "race", "class", "subclass", "background"]);

  /** @override */
  async getData(options = {}) {
    const data = await super.getData(options);
    return data;
  }

  /** @override */
  setPosition(pos = {}) {
    if (!pos.height) pos.height = "auto";
    return super.setPosition(pos);
  }

  /** @override */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    if (data.type !== "Item") return;
    const item = await fromUuid(data.uuid);
    if (this.unsupportedItemTypes.has(item.type)) {
      ui.notifications.warn("You cannot drop a", item.type, "onto the storage actor.");
      return null;
    }
    return super._onDrop(event);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }
}
