export class RecipeData extends dnd5e.dataModels.SystemDataModel.mixin(
  dnd5e.dataModels.item.ItemDescriptionTemplate
) {
  /** @override */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      type: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.StringField()
      }),
      crafting: new foundry.data.fields.SchemaField({
        target: new foundry.data.fields.SchemaField({
          uuid: new foundry.data.fields.StringField(),
          quantity: new foundry.data.fields.NumberField({integer: true, min: 1, initial: 1})
        }),
        components: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
          identifier: new foundry.data.fields.StringField(),
          quantity: new foundry.data.fields.NumberField({integer: true, min: 1, initial: 1})
        })),
        basic: new foundry.data.fields.BooleanField()
      }),
      rarity: new foundry.data.fields.StringField({required: true, blank: true, label: "DND5E.Rarity"}),
      price: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({
          required: true, nullable: false, initial: 0, min: 0, label: "DND5E.Price"
        }),
        denomination: new foundry.data.fields.StringField({
          required: true, blank: false, initial: "gp", label: "DND5E.Currency"
        })
      }, {label: "DND5E.Price"}),
    });
  }

  /**
   * The list of item types that are valid creations from a recipe.
   * @type {string[]}
   */
  get allowedTargetTypes() {
    return ["feat", "backpack", "consumable", "weapon", "loot", "equipment", "tool"];
  }

  /**
   * Get the target item of this recipe.
   * @returns {Promise<Item|null>}      The item that will be created, if valid.
   */
  async getTarget() {
    const uuid = this.crafting.target.uuid || "";
    if (!uuid || (typeof uuid !== "string")) return null;
    const item = await fromUuid(uuid);
    if ((item instanceof Item) && this.allowedTargetTypes.includes(item.type)) return item;
    return null;
  }

  /**
   * Get the crafting array reduced to only those that are valid identifiers.
   * @returns {object[]}      An array of objects with `identifier` and `quantity`.
   */
  getComponents() {
    return this.crafting.components.reduce((acc, c) => {
      if (c.identifier) acc.push({identifier: c.identifier, quantity: c.quantity || 1});
      return acc;
    }, []);
  }
}