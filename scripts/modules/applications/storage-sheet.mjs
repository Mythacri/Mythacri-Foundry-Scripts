import {MODULE} from "../constants.mjs";

/**
 * Actor sheet for storage-type actors.
 */
export class StorageSheet extends dnd5e.applications.actor.ActorSheet5e {
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
   * IDs for items on the sheet that have been expanded.
   * @type {Set<string>}
   * @protected
   */
  _expanded = new Set();

  /**
   * A set of item types that should be prevented from being dropped on this type of actor sheet.
   * @type {Set<string>}
   */
  unsupportedItemTypes = new Set(["feat", "race", "class", "subclass", "background", "mythacri-scripts.recipe"]);

  /** @override */
  async getData(options = {}) {
    const data = {
      actor: this.document,
      system: this.document.system,
      itemContext: {},
      owner: this.document.isOwner,
      limited: this.document.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: this.document.isOwner ? "editable" : "locked",
      config: CONFIG.DND5E,
      rollableClass: this.isEditable ? "rollable" : "",
      elements: {inventory: "dnd5e-inventory"},
      labels: {
        currencies: Object.entries(CONFIG.DND5E.currencies).reduce((obj, [k, c]) => {
          obj[k] = c.label;
          return obj;
        }, {})
      }
    };

    const capacity = this.document.system.attributes.capacity;
    data.weightUnit = capacity.type === "quantity" ? "" : "lbs";
    data.encumbrance = {...capacity};

    this._prepareItems(data);
    data.expandedData = {};
    for (const id of this._expanded) {
      const item = this.actor.items.get(id);
      if (item) data.expandedData[id] = await item.getChatData({secrets: this.document.isOwner});
    }
    return data;
  }

  /**
   * Prepare the data structure for items which appear on the actor sheet.
   * @param {object} context      The rendering data.
   */
  _prepareItems(context) {
    // Partition items by category
    const items = this.document.items.reduce((obj, item) => {
      const quantity = item.system.quantity;

      // Item details
      const ctx = context.itemContext[item._id] ??= {};
      ctx.isStack = Number.isNumeric(quantity) && (quantity !== 1);

      // Prepare data needed to display expanded sections
      ctx.isExpanded = this._expanded.has(item._id);

      // Item usage
      ctx.hasUses = item.hasLimitedUses;

      // Classify items into types
      let category;
      let label;
      if (item.type === "weapon") {
        category = "weapons";
        label = `${CONFIG.Item.typeLabels[item.type]}Pl`;
      } else if (item.isArmor) {
        category = "armors";
        label = "DND5E.Armor";
      } else if (item.type === "equipment") {
        category = "equipment";
        label = `${CONFIG.Item.typeLabels[item.type]}Pl`;
      } else if (item.type === "container") {
        category = "containers";
        label = `${CONFIG.Item.typeLabels[item.type]}Pl`;
      } else if (item.type === "tool") {
        category = "tools";
        label = `${CONFIG.Item.typeLabels[item.type]}Pl`;
      } else if (item.type === "consumable") {
        const ct = item.system.type.value;
        if (ct in CONFIG.DND5E.consumableTypes) {
          category = ct;
          label = CONFIG.DND5E.consumableTypes[ct].label;
        } else {
          category = "consumable-other";
          label = "MYTHACRI.ConsumableTypeOther";
        }
      } else if (item.type === "loot") {
        const id = mythacri.crafting.getIdentifier(item);
        if (id && mythacri.crafting.validIdentifier(id)) {
          category = item.flags[MODULE.ID].resource.type;
          label = `MYTHACRI.ResourceType${category.capitalize()}`;
        } else {
          const lt = item.system.type.value;
          if (lt in CONFIG.DND5E.lootTypes) {
            category = lt;
            label = CONFIG.DND5E.lootTypes[lt].label;
          } else {
            category = "loot-other";
            label = "MYTHACRI.LootTypeOther";
          }
        }
      }
      if (!category) {
        console.warn("No category:", category, item);
        return obj;
      }
      obj[category] ??= {};
      obj[category].label ??= label;
      obj[category].items ??= [];
      obj[category].items.push(item);
      obj[category].dataset ??= {};
      return obj;
    }, {});

    // Assign and return
    context.gear = [items.weapons, items.armors, items.equipment, items.containers, items.tools];
    context.consumables = Object.keys(CONFIG.DND5E.consumableTypes).map(k => items[k]).concat([items["consumable-other"]]);
    context.loot = Object.keys(CONFIG.DND5E.lootTypes).map(k => items[k]).concat([items["loot-other"]]);
    context.resources = Object.keys(mythacri.crafting.resourceTypes).map(k => items[k]);
    ["gear", "consumables", "loot", "resources"].forEach(k => context[k] = context[k].filter(u => u));
    for (const k in items) items[k].items.sort((a, b) => {
      const diff = a.sort - b.sort;
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }

  /** @override */
  async _onDropActor(event, data) {
    return false;
  }

  /** @override */
  async _onDropActiveEffect(event, data) {
    return false;
  }

  /** @override */
  async _onDropSingleItem(itemData) {
    // Check to make sure items of this type are allowed on this actor
    if (this.unsupportedItemTypes.has(itemData.type)) {
      ui.notifications.warn(game.i18n.format("DND5E.ActorWarningInvalidItem", {
        itemType: game.i18n.localize(CONFIG.Item.typeLabels[itemData.type]),
        actorType: game.i18n.localize(CONFIG.Actor.typeLabels[this.actor.type])
      }));
      return false;
    }

    // Create a Consumable spell scroll on the Inventory tab
    if (itemData.type === "spell") {
      const scroll = await Item.implementation.createScrollFromSpell(itemData);
      return scroll.toObject();
    }

    // Clean up data
    this._onDropResetData(itemData);

    // Stack identical consumables
    const stacked = this._onDropStackConsumables(itemData);
    if (stacked) return false;

    return itemData;
  }

  /** @override */
  _onDropStackConsumables(itemData) {
    const stacked = super._onDropStackConsumables(itemData); // returns a Promise or null.
    if (stacked) return stacked;

    const identifier = mythacri.crafting.getIdentifier(new Item.implementation(itemData));
    if (!identifier) return null;
    const item = this.document.items.find(i => {
      const id = mythacri.crafting.getIdentifier(i);
      return id && (id === identifier);
    });
    if (!item) return null;
    return item.update({"system.quantity": item.system.quantity + Math.max(itemData.system.quantity, 1)});
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelector("[data-action=capacity]").addEventListener("click", this._onConfig.bind(this));
  }

  /**
   * Render configuration menu for modifying attributes.
   * @returns {Promise<Actor5e>}      The updated storage actor.
   */
  _onConfig() {
    const cap = this.document.system.attributes.capacity;
    const options = {
      quantity: "DND5E.Quantity",
      weight: "DND5E.Weight"
    };
    const selectOptions = HandlebarsHelpers.selectOptions(options, {
      hash: {selected: cap.type, localize: true, sort: true}
    });

    return Dialog.prompt({
      title: `${game.i18n.localize("MYTHACRI.CapacityConfig")}: ${this.document.name}`,
      label: game.i18n.localize("Save"),
      rejectClose: false,
      content: `
      <form class="dnd5e">
        <div class="form-group">
          <label>${game.i18n.localize("MYTHACRI.CapacityMax")}</label>
          <div class="form-fields">
            <input type="number" name="system.attributes.capacity.max" value="${cap.max}" autofocus>
          </div>
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("MYTHACRI.CapacityType")}</label>
          <div class="form-fields">
            <select name="system.attributes.capacity.type">${selectOptions}</select>
          </div>
        </div>
      </form>`,
      callback: ([html]) => {
        const update = new FormDataExtended(html.querySelector("FORM")).object;
        return this.document.update(update);
      },
      options: {
        id: `storage-config-${this.document.uuid.replaceAll(".", "-")}`
      }
    });
  }
}
