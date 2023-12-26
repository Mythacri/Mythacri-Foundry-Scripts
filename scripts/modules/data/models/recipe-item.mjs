import {MODULE} from "../../constants.mjs";
import {Crafting} from "../crafting.mjs";

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
    return this.constructor.allowedTargetTypes;
  }
  static get allowedTargetTypes() {
    return ["feat", "backpack", "consumable", "weapon", "equipment", "tool"];
  }

  /**
   * Get the target item of this recipe.
   * @returns {Promise<Item|null>}      The item that will be created, if valid.
   */
  async getTarget() {
    if (!this.hasTarget) return null;
    return fromUuid(this.crafting.target.uuid) || null;
  }

  /**
   * Does this item have a valid target?
   * @type {boolean}
   */
  get hasTarget() {
    return this.constructor.hasTarget(this.crafting.target.uuid);
  }

  /**
   * Does this item have a valid target?
   * @param {string} uuid     The uuid of the target.
   * @returns {boolean}       Whether the item has a target.
   */
  static hasTarget(uuid) {
    if (!uuid || (typeof uuid !== "string")) return false;
    const entry = fromUuidSync(uuid);
    return this.allowedTargetTypes.includes(entry?.type);
  }

  /**
   * Get the crafting object reduced to only those that are valid identifiers.
   * @returns {object}      An object mapping `identifier` to `quantity`.
   */
  getComponents() {
    return this.constructor.getComponents(this.crafting.components);
  }

  /**
   * Get the crafting object reduced to only those that are valid identifiers.
   * @param {object[]} [components]     The array of components with `identifier` and `quantity`.
   * @returns {object}                  An object mapping `identifier` to `quantity`.
   */
  static getComponents(components = []) {
    return components.reduce((acc, c) => {
      const id = c.identifier;
      if (Crafting.validIdentifier(id, {allowWildcard: true})) {
        acc[id] ??= 0;
        acc[id] += (c.quantity || 1);
      }
      return acc;
    }, {});
  }

  /**
   * Does this item have valid components?
   * @type {boolean}
   */
  get hasComponents() {
    return this.constructor.hasComponents(this.crafting.components);
  }

  /**
   * Does this item have valid components?
   * @param {object[]} [components]     The array of components with `identifier` and `quantity`.
   * @returns {boolean}                 Whether any components are valid.
   */
  static hasComponents(components = []) {
    return components.some(c => Crafting.validIdentifier(c.identifier, {allowWildcard: true}));
  }

  /**
   * Return whether an actor knows a recipe.
   * @param {Actor5e} actor     The actor to test.
   * @returns {boolean}
   */
  knowsRecipe(actor) {
    return this.constructor.knowsRecipe(actor, this.parent.id, this.type.value, this.crafting.basic);
  }

  /**
   * Return whether an actor knows a recipe.
   * @param {Actor5e} actor             The actor to test.
   * @param {string} id                 The id of the recipe.
   * @param {string} recipeType         The type of recipe ('rune', 'spirit', 'monster', 'cooking').
   * @param {boolean} [basic=false]     Is this a basic recipe?
   */
  static knowsRecipe(actor, id, recipeType, basic = false) {
    if (actor.type !== "character") return false;
    const isEnabled = !!actor.flags.dnd5e?.crafting?.[recipeType];
    const isLearned = !!actor.flags[MODULE.ID]?.recipes?.learned?.includes(id);
    return isEnabled && (basic || isLearned);
  }

  /**
   * Return whether an actor can learn a recipe.
   * @param {Actor5e} actor     The actor to test.
   * @returns {boolean}
   */
  canLearnRecipe(actor) {
    return this.constructor.canLearnRecipe(actor, this.parent.id, this.type.value, this.crafting.basic);
  }

  /**
   * Return whether an actor can learn a recipe.
   * @param {Actor5e} actor             The actor to test.
   * @param {string} id                 The id of the recipe.
   * @param {string} recipeType         The type of recipe ('rune', 'spirit', 'monster', 'cooking').
   * @param {boolean} [basic=false]     Is this a basic recipe?
   */
  static canLearnRecipe(actor, id, recipeType, basic = false) {
    if (actor.type !== "character") return false;
    const isEnabled = !!actor.flags.dnd5e?.crafting?.[recipeType];
    const isLearned = !!actor.flags[MODULE.ID]?.recipes?.learned?.includes(id);
    return isEnabled && !basic && !isLearned;
  }
}
