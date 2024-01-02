/**
 * Actor sheet for ship-type actors.
 */
export class ShipSheet extends dnd5e.applications.actor.ActorSheet5eVehicle {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["sheet", "actor", "dnd5e", "ship"];
    // options.width = options.height = 600;
    // options.tabs.push({navSelector: ".tabs", contentSelector: ".sheet-body"});
    return options;
  }

  /** @override */
  get template() {
    return "modules/mythacri-scripts/templates/ship-sheet.hbs";
  }

  /**
   * A set of item types that should be prevented from being dropped on this type of actor sheet.
   * @type {Set<string>}
   */
  unsupportedItemTypes = new Set(["race", "class", "subclass", "background", "mythacri-scripts.recipe"]);

  /**
   * A set of actor types that should be prevented from being dropped on this type of actor sheet.
   * @type {Set<string>}
   */
  unsupportedActorTypes = new Set(["mythacri-scripts.ship", "mythacri-scripts.storage", "vehicle", "group"]);

  /** @override */
  async getData(options = {}) {
    const data = await super.getData(options);
    console.warn(data);
    return data;
  }

  /** @override */
  _prepareItems(context) {
    //super._prepareItems(context);
    context.cargo = []; //items that are not features or ship equipment
  }

  /** @override */
  async _onDropActor(event, data) {
    return super._onDropActor(event, data);
  }

  /** @override */
  async _onDropSingleItem(itemData) {
    return super._onDropSingleItem(itemData);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  /** @override */
  async _onItemDelete(event) {
    return super._onItemDelete(event);
  }
}
