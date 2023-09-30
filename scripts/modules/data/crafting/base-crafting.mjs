import {MODULE} from "../../constants.mjs";

export class Crafting {
  static get resourceTypes() {
    return {
      gem: {
        label: "MYTHACRI.ResourceTypeGem",
        subtypes: {
          ruby: "MYTHACRI.ResourceGemRuby",
          emerald: "MYTHACRI.ResourceGemEmerald"
        }
      },
      essence: {
        label: "MYTHACRI.ResourceTypeEssence",
        subtypes: {...CONFIG.DND5E.creatureTypes}
      },
      monster: {
        label: "MYTHACRI.ResourceTypeMonster",
        subtypes: Object.entries(CONFIG.DND5E.creatureTypes).reduce((acc, [key, label]) => {
          acc[key] = {
            label: label,
            subsubtypes: {
              eye: "MYTHACRI.ResourceMonsterEye",
              horn: "MYTHACRI.ResourceMonsterHorn",
              bone: "MYTHACRI.ResourceMonsterBone"
            }
          };
          return acc;
        }, {})
      }
    };
  }

  /** Initialize crafting. */
  static init() {
    Hooks.on("renderItemSheet", Crafting._renderItemSheet);
  }

  /**
   * Inject dropdowns into loot item sheets for setting the resource type.
   * @param {ItemSheet} sheet
   * @param {HTMLElement} html
   */
  static async _renderItemSheet(sheet, [html]) {
    if (sheet.document.type !== "loot") return;

    const data = sheet.document.getFlag(MODULE.ID, "resource") ?? {};
    const template = "modules/mythacri-scripts/templates/parts/resource-types.hbs";
    const div = document.createElement("DIV");

    const typeOptions = Crafting.resourceTypes;
    const subtypeOptions = typeOptions[data.type]?.subtypes ?? {};
    const subsubtypeOptions = subtypeOptions[data.subtype]?.subsubtypes ?? {};

    const templateData = {
      ...data,
      typeOptions: typeOptions,
      subtypeOptions: subtypeOptions,
      subsubtypeOptions: subsubtypeOptions,
      hasSubtype: !foundry.utils.isEmpty(subtypeOptions),
      hasSubsubtype: data.type === "monster",
      showSubsubtype: !foundry.utils.isEmpty(subsubtypeOptions),
      subtypeLabel: `MYTHACRI.ResourceLabelSubtype${(data.type ?? "").capitalize()}`,
      subsubtypeLabel: `MYTHACRI.ResourceLabelSubsubtype${(data.type ?? "").capitalize()}`,
      disable: !game.user.isGM
    };

    div.innerHTML = await renderTemplate(template, templateData);
    html.querySelector(".item-properties").append(...div.children);
  }

  /**
   * Get the resource identifier from a loot-type item, e.g., 'monster.celestial.eye' or 'gem.ruby'.
   * @param {Item} item         The item with the identifier.
   * @returns {string|null}     The proper identifier, or null if invalid or not applicable.
   */
  static getIdentifier(item) {
    if (item?.type !== "loot") return null;

    const data = item.getFlag(MODULE.ID, "resource") ?? {};
    const types = Crafting.resourceTypes;

    let path = `${data.type}.subtypes.${data.subtype}`;
    if (data.type === "monster") path += `.subsubtypes.${data.subsubtype}`;

    const has = foundry.utils.hasProperty(types, path);
    if (!has) return null;

    if (data.type === "monster") return `${data.type}.${data.subtype}.${data.subsubtype}`;
    else return `${data.type}.${data.subtype}`;
  }
}

class BaseRecipe extends foundry.abstract.DataModel {
  static defineSchema() {
    // TODO
  }

  /**
   * Get the parts that make up this item.
   * @type {string[]}     The uuids (or items? idk)
   */
  get parts() {}
}
class RuneCarvingRecipe extends BaseRecipe {}
class SpiritBindingRecipe extends BaseRecipe {}
class MonsterCraftingRecipe extends BaseRecipe {}
class MonsterCookingRecipe extends BaseRecipe {}

class RecipeInterface extends Application {}

class BaseCraftingApplication extends Application {}
class SpiritBindingApplication extends BaseCraftingApplication {}
class RuneCarvingApplication extends BaseCraftingApplication {}
class MonsterCraftingApplication extends BaseCraftingApplication {}
class MonsterCookingApplication extends BaseCraftingApplication {}