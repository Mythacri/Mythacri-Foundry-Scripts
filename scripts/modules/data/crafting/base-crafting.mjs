import {RecipeSheet} from "../../applications/recipe-sheet.mjs";
import {MODULE} from "../../constants.mjs";
import {RecipeData} from "./recipe-item.mjs";

/** Utility export class. */
export class Crafting {
  /**
   * Recipe types.
   * @type {object}
   */
  static get recipeTypes() {
    return {
      rune: "MYTHACRI.CraftingRecipeRune",
      spirit: "MYTHACRI.CraftingRecipeSpirit",
      monster: "MYTHACRI.CraftingRecipeMonster",
      cooking: "MYTHACRI.CraftingRecipeCooking"
    };
  }

  /**
   * Resource config.
   * @type {object}
   */
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
    Hooks.on("renderActorSheet5eCharacter", Crafting._renderCharacterSheet);
    Crafting._characterFlags();
    Object.assign(CONFIG.Item.dataModels, {"mythacri-scripts.recipe": RecipeData});
    DocumentSheetConfig.registerSheet(Item, "mythacri-scripts", RecipeSheet, {
      types: ["mythacri-scripts.recipe"], makeDefault: true
    });
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

    const templateData = Crafting.getTemplateData(data);
    templateData.disable = !game.user.isGM;

    div.innerHTML = await renderTemplate(template, templateData);
    html.querySelector(".item-properties").append(...div.children);
  }

  /**
   * Inject crafting buttons into the character sheet.
   * @param {ActorSheet5eCharacter} sheet
   * @param {HTMLElement} html
   */
  static async _renderCharacterSheet(sheet, [html]) {
    const template = "modules/mythacri-scripts/templates/parts/crafting-buttons.hbs";
    const buttons = sheet.document.flags.dnd5e?.crafting ?? {};
    const div = document.createElement("DIV");
    div.innerHTML = await renderTemplate(template, buttons);
    div.querySelectorAll("[data-action]").forEach(n => n.addEventListener("click", Crafting._onClickCraft.bind(sheet)));
    html.querySelector(".center-pane .counters").append(...div.childNodes);
  }

  /**
   * Handle clicking a crafting button.
   * @TODO Render a crafting app rather than returning undefined.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {*}                     The crafting application.
   */
  static _onClickCraft(event) {
    const action = event.currentTarget.dataset.action;
    if (action === "cooking") return;
    else if (action === "rune") return;
    else if (action === "spirit") return;
    else if (action === "monster") return;
  }

  /**
   * Utility function for the template data of the triple dropdowns for resource items.
   * @param {object} data
   * @param {string} data.type
   * @param {string} data.subtype
   * @param {string} data.subsubtype
   * @returns {object}
   */
  static getTemplateData(data = {}) {
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
      subsubtypeLabel: `MYTHACRI.ResourceLabelSubsubtype${(data.type ?? "").capitalize()}`
    };

    return templateData;
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

  /**
   * Set up character flags for opting into crafting types.
   */
  static _characterFlags() {
    for (const key in Crafting.recipeTypes) {
      const label = key.capitalize();
      CONFIG.DND5E.characterFlags[`crafting.${key}`] = {
        name: `MYTHACRI.CraftingSection${label}`,
        hint: `MYTHACRI.CraftingSection${label}Hint`,
        section: "MYTHACRI.CraftingSection",
        type: Boolean
      };
    }
  }
}
