import {CraftingApplication} from "../../applications/crafting-application.mjs";
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
                acid: "MYTHACRI.ResourceMonsterAcid",
                antenna: "MYTHACRI.ResourceMonsterAntenna",
                antler: "MYTHACRI.ResourceMonsterAntler",
                blood: "MYTHACRI.ResourceMonsterBlood",
                bone: "MYTHACRI.ResourceMonsterBone",
                brain: "MYTHACRI.ResourceMonsterBrain",
                breathSac: "MYTHACRI.ResourceMonsterBreathSac",
                carapace: "MYTHACRI.ResourceMonsterCarapace",
                claws: "MYTHACRI.ResourceMonsterClaws",
                dust: "MYTHACRI.ResourceMonsterDust",
                egg: "MYTHACRI.ResourceMonsterEgg",
                etherealIchor: "MYTHACRI.ResourceMonsterEtherealIchor",
                eye: "MYTHACRI.ResourceMonsterEye",
                fat: "MYTHACRI.ResourceMonsterFat",
                feathers: "MYTHACRI.ResourceMonsterFeathers",
                fin: "MYTHACRI.ResourceMonsterFin",
                flesh: "MYTHACRI.ResourceMonsterFlesh",
                heart: "MYTHACRI.ResourceMonsterHeart",
                hide: "MYTHACRI.ResourceMonsterHide",
                horn: "MYTHACRI.ResourceMonsterHorn",
                instructions: "MYTHACRI.ResourceMonsterInstructions",
                liver: "MYTHACRI.ResourceMonsterLiver",
                mainEye: "MYTHACRI.ResourceMonsterMainEye",
                mote: "MYTHACRI.ResourceMonsterMote",
                mucus: "MYTHACRI.ResourceMonsterMucus",
                oil: "MYTHACRI.ResourceMonsterOil",
                pincer: "MYTHACRI.ResourceMonsterPincer",
                plating: "MYTHACRI.ResourceMonsterPlating",
                poisonGland: "MYTHACRI.ResourceMonsterPoisonGland",
                sap: "MYTHACRI.ResourceMonsterSap",
                scales: "MYTHACRI.ResourceMonsterScales",
                skin: "MYTHACRI.ResourceMonsterSkin",
                stinger: "MYTHACRI.ResourceMonsterStinger",
                talon: "MYTHACRI.ResourceMonsterTalon",
                teeth: "MYTHACRI.ResourceMonsterTeeth",
                tentacle: "MYTHACRI.ResourceMonsterTentacle",
                tusk: "MYTHACRI.ResourceMonsterTusk"
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
    loadTemplates(["modules/mythacri-scripts/templates/parts/crafting-recipe.hbs"]);
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
    const type = event.currentTarget.dataset.action;
    return new CraftingApplication(this.document, type).render(true);
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
    let id = `${data.type}.${data.subtype}`;
    if (data.type === "monster") id += `.${data.subsubtype}`;

    const valid = Crafting.validIdentifier(id);
    if (!valid) return null;

    return id;
  }

  /**
   * Is this resource identifier valid?
   * @param {string} id     A string id, usually of the form `monster.celestial.eye`.
   * @returns {boolean}
   */
  static validIdentifier(id) {
    const [type, subtype, subsubtype] = id?.split(".") ?? [];
    const types = Crafting.resourceTypes;
    let path = `${type}.subtypes.${subtype}`;
    if (type === "monster") path += `.subsubtypes.${subsubtype}`;
    return foundry.utils.hasProperty(types, path);
  }

  /**
   * Get a human-readable label from a resource identifier.
   * @param {string} id
   * @returns {string}
   */
  static getLabel(id) {
    const types = Crafting.resourceTypes;
    const [type, subtype, subsubtype] = id.split(".");
    const typeLabel = game.i18n.localize(types[type].label);
    const subtypeLabel = game.i18n.localize(!subsubtype ? types[type].subtypes[subtype] : types[type].subtypes[subtype].label);
    const subsubtypeLabel = subsubtype ? game.i18n.localize(types[type].subtypes[subtype].subsubtypes[subsubtype]) : null;

    const data = {type: typeLabel, subtype: subtypeLabel, subsubtype: subsubtypeLabel};
    return game.i18n.format(`MYTHACRI.ResourceTypeLabel${type.capitalize()}`, data);
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
