import {MODULE} from "../../constants.mjs";

/**
 * Data model for `recipe` items.
 * @property {object} type
 * @property {string} type.value                            The recipe subtype, as defined in `Crafting.recipeTypes`.
 * @property {object} crafting
 * @property {object} crafting.target                       Reference data for the item that this recipe creates.
 * @property {string} crafting.target.uuid                  The uuid of the item to be created.
 * @property {number} crafting.target.quantity              The amount of items that will be created.
 * @property {object[]} crafting.components                 Reference data for the components needed.
 * @property {string} crafting.components[].identifier      The resource identifier of a loot-type item.
 * @property {number} crafting.components[].quantity        How many of this resource are needed.
 * @property {boolean} crafting.basic                       Whether this is considered a 'basic' recipe learned immediately.
 * @property {string} rarity                                The rarity of this recipe, as defined in `DND5E.itemRarity`.
 * @property {object} price
 * @property {number} price.value                           The value of this recipe.
 * @property {string} price.denomination                    The denomination of the value, as defined in `DND5E.currencies`.
 */
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

  /**
   * Return whether an actor knows a recipe.
   * @param {Actor5e} actor     The actor to test.
   * @returns {boolean}
   */
  knowsRecipe(actor) {
    const isBasic = this.crafting.basic;
    const isEnabled = !!actor.flags.dnd5e?.crafting?.[this.type.value];
    const isLearned = !!actor.flags[MODULE.ID]?.recipes?.learned?.includes(this.parent.id);
    return isEnabled && (isBasic || isLearned);
  }

  /**
   * Return whether an actor can learn a recipe.
   * @param {Actor5e} actor     The actor to test.
   * @returns {boolean}
   */
  canLearnRecipe(actor) {
    const isBasic = this.crafting.basic;
    const isEnabled = !!actor.flags.dnd5e?.crafting?.[this.type.value];
    const isLearned = !!actor.flags[MODULE.ID]?.recipes?.learned?.includes(this.parent.id);
    return isEnabled && !isBasic && !isLearned;
  }
}
