import {CraftingApplication} from "../applications/crafting-application.mjs";
import {MODULE} from "../constants.mjs";
import {RecipeData} from "./models/recipe-item.mjs";
import {RecipeSheet} from "../applications/recipe-sheet.mjs";
import {RunesConfig} from "../applications/runes-config.mjs";

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
   * Monster sub-subtypes. The parts that can be harvested for physical parts.
   * The 'uncommon' array contains a list of creature types from which this part is rarely or never found.
   * @type {object}
   */
  static get subsubtypes() {
    return {
      acid: {
        label: "MYTHACRI.ResourceMonsterAcid",
        uncommon: [
          "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "plant", "undead"
        ]
      },
      antenna: {
        label: "MYTHACRI.ResourceMonsterAntenna",
        uncommon: [
          "celestial", "construct", "dragon", "elemental", "fiend", "giant", "humanoid", "ooze", "plant", "undead"
        ]
      },
      antler: {
        label: "MYTHACRI.ResourceMonsterAntler",
        uncommon: [
          "aberration", "celestial", "construct", "dragon", "elemental", "fiend", "giant",
          "humanoid", "ooze", "plant", "undead"
        ]
      },
      blood: {
        label: "MYTHACRI.ResourceMonsterBlood",
        uncommon: ["celestial", "dragon", "elemental", "ooze", "plant"]
      },
      bone: {
        label: "MYTHACRI.ResourceMonsterBone",
        uncommon: ["humanoid", "ooze", "plant"]
      },
      brain: {
        label: "MYTHACRI.ResourceMonsterBrain",
        uncommon: ["dragon", "elemental", "fey", "humanoid", "monstrosity", "ooze", "plant"]
      },
      breathSac: {
        label: "MYTHACRI.ResourceMonsterBreathSac",
        uncommon: [
          "aberration", "celestial", "construct", "elemental", "fey", "fiend", "giant", "humanoid",
          "monstrosity", "ooze", "plant", "undead"
        ]
      },
      carapace: {
        label: "MYTHACRI.ResourceMonsterCarapace",
        uncommon: [
          "celestial", "construct", "dragon", "fey", "fiend", "giant", "humanoid", "ooze", "plant", "undead"
        ]
      },
      claws: {
        label: "MYTHACRI.ResourceMonsterClaws",
        uncommon: ["construct", "elemental", "giant", "humanoid", "ooze", "plant", "undead"]
      },
      dust: {
        label: "MYTHACRI.ResourceMonsterDust",
        uncommon: [
          "beast", "construct", "dragon", "fey", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"
        ]
      },
      egg: {
        label: "MYTHACRI.ResourceMonsterEgg",
        uncommon: [
          "celestial", "construct", "elemental", "fey", "fiend", "giant", "humanoid", "ooze", "plant", "undead"
        ]
      },
      etherealIchor: {
        label: "MYTHACRI.ResourceMonsterEtherealIchor",
        uncommon: [
          "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
          "humanoid", "monstrosity", "ooze", "plant"
        ]
      },
      eye: {
        label: "MYTHACRI.ResourceMonsterEye",
        uncommon: ["construct", "humanoid", "ooze", "plant"]
      },
      fat: {
        label: "MYTHACRI.ResourceMonsterFat",
        uncommon: ["construct", "elemental", "humanoid", "ooze", "plant", "undead"]
      },
      feathers: {
        label: "MYTHACRI.ResourceMonsterFeathers",
        uncommon: ["aberration", "construct", "elemental", "giant", "humanoid", "ooze", "plant", "undead"]
      },
      fin: {
        label: "MYTHACRI.ResourceMonsterFin",
        uncommon: ["construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "ooze", "plant", "undead"]
      },
      flesh: {
        label: "MYTHACRI.ResourceMonsterFlesh",
        uncommon: ["elemental", "humanoid", "ooze", "plant"]
      },
      heart: {
        label: "MYTHACRI.ResourceMonsterHeart",
        uncommon: ["construct", "elemental", "humanoid", "ooze", "plant", "undead"]
      },
      hide: {
        label: "MYTHACRI.ResourceMonsterHide",
        uncommon: [
          "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
          "ooze", "plant", "undead"
        ]
      },
      horn: {
        label: "MYTHACRI.ResourceMonsterHorn",
        uncommon: ["construct", "giant", "humanoid", "ooze", "plant", "undead"]
      },
      instructions: {
        label: "MYTHACRI.ResourceMonsterInstructions",
        uncommon: [
          "aberration", "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
          "monstrosity", "ooze", "plant", "undead"
        ]
      },
      liver: {
        label: "MYTHACRI.ResourceMonsterLiver",
        uncommon: ["construct", "elemental", "humanoid", "ooze", "plant", "undead"]
      },
      mainEye: {
        label: "MYTHACRI.ResourceMonsterMainEye",
        uncommon: [
          "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
          "humanoid", "monstrosity", "ooze", "plant", "undead"
        ]
      },
      mote: {
        label: "MYTHACRI.ResourceMonsterMote",
        uncommon: [
          "aberration", "beast", "celestial", "construct", "dragon", "fey", "fiend", "giant",
          "humanoid", "monstrosity", "ooze", "plant", "undead"
        ]
      },
      mucus: {
        label: "MYTHACRI.ResourceMonsterMucus",
        uncommon: [
          "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
          "monstrosity", "plant", "undead"
        ]
      },
      oil: {
        label: "MYTHACRI.ResourceMonsterOil",
        uncommon: [
          "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
          "monstrosity", "ooze", "plant", "undead"
        ]
      },
      pincer: {
        label: "MYTHACRI.ResourceMonsterPincer",
        uncommon: [
          "celestial", "construct", "dragon", "elemental", "fey", "giant", "humanoid", "ooze", "plant", "undead"
        ]
      },
      plating: {
        label: "MYTHACRI.ResourceMonsterPlating",
        uncommon: [
          "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
          "monstrosity", "ooze", "plant", "undead"
        ]
      },
      poisonGland: {
        label: "MYTHACRI.ResourceMonsterPoisonGland",
        uncommon: [
          "celestial", "construct", "dragon", "elemental", "fey", "giant", "humanoid",
          "ooze", "plant", "undead"
        ]
      },
      sap: {
        label: "MYTHACRI.ResourceMonsterSap",
        uncommon: [
          "aberration", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
          "humanoid", "monstrosity", "ooze", "undead"
        ]
      },
      scales: {
        label: "MYTHACRI.ResourceMonsterScales",
        uncommon: ["beast", "construct", "elemental", "fey", "giant", "humanoid", "ooze", "plant", "undead"]
      },
      skin: {
        label: "MYTHACRI.ResourceMonsterSkin",
        uncommon: ["beast", "construct", "dragon", "elemental", "humanoid", "ooze", "undead"]
      },
      stinger: {
        label: "MYTHACRI.ResourceMonsterStinger",
        uncommon: [
          "beast", "celestial", "construct", "dragon", "elemental", "fey", "giant", "humanoid", "ooze", "undead"
        ]
      },
      talon: {
        label: "MYTHACRI.ResourceMonsterTalon",
        uncommon: [
          "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "giant",
          "humanoid", "ooze", "plant", "undead"
        ]
      },
      teeth: {
        label: "MYTHACRI.ResourceMonsterTeeth",
        uncommon: ["beast", "construct", "elemental", "humanoid", "ooze", "plant"]
      },
      tentacle: {
        label: "MYTHACRI.ResourceMonsterTentacle",
        uncommon: [
          "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
          "humanoid", "ooze", "plant", "undead"
        ]
      },
      tusk: {
        label: "MYTHACRI.ResourceMonsterTusk",
        uncommon: [
          "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend",
          "giant", "humanoid", "ooze", "plant", "undead"
        ]
      }
    };
  }

  /**
   * Gem subtypes.
   * @type {object}
   */
  static get gemSubtypes() {
    return {
      amber: {label: "MYTHACRI.ResourceGemAmber"},
      amethyst: {label: "MYTHACRI.ResourceGemAmethyst"},
      aquamarine: {label: "MYTHACRI.ResourceGemAquamarine"},
      citrine: {label: "MYTHACRI.ResourceGemCitrine"},
      diamond: {label: "MYTHACRI.ResourceGemDiamond"},
      emerald: {label: "MYTHACRI.ResourceGemEmerald"},
      garnet: {label: "MYTHACRI.ResourceGemGarnet"},
      jade: {label: "MYTHACRI.ResourceGemJade"},
      jasper: {label: "MYTHACRI.ResourceGemJasper"},
      jet: {label: "MYTHACRI.ResourceGemJet"},
      lapisLazuli: {label: "MYTHACRI.ResourceGemLapisLazuli"},
      moonstone: {label: "MYTHACRI.ResourceGemMoonstone"},
      mossAgate: {label: "MYTHACRI.ResourceGemMossAgate"},
      obsidian: {label: "MYTHACRI.ResourceGemObsidian"},
      onyx: {label: "MYTHACRI.ResourceGemOnyx"},
      opal: {label: "MYTHACRI.ResourceGemOpal"},
      pearl: {label: "MYTHACRI.ResourceGemPearl"},
      peridot: {label: "MYTHACRI.ResourceGemPeridot"},
      quartz: {label: "MYTHACRI.ResourceGemQuartz"},
      ruby: {label: "MYTHACRI.ResourceGemRuby"},
      sapphire: {label: "MYTHACRI.ResourceGemSapphire"},
      spinel: {label: "MYTHACRI.ResourceGemSpinel"},
      topaz: {label: "MYTHACRI.ResourceGemTopaz"},
      turquoise: {label: "MYTHACRI.ResourceGemTurquoise"},
      zircon: {label: "MYTHACRI.ResourceGemZircon"}
    };
  }

  /**
   * Resource config.
   * @type {object}
   */
  static get resourceTypes() {
    const subsubtypes = Crafting.subsubtypes;
    const gemTypes = Crafting.gemSubtypes;
    return {
      gem: {
        label: "MYTHACRI.ResourceTypeGem",
        subtypes: gemTypes
      },
      essence: {
        label: "MYTHACRI.ResourceTypeEssence",
        subtypes: {...CONFIG.DND5E.creatureTypes}
      },
      monster: {
        label: "MYTHACRI.ResourceTypeMonster",
        subtypes: Object.entries(CONFIG.DND5E.creatureTypes).reduce((acc, [key, {label}]) => {
          acc[key] = {
            label: label,
            subsubtypes: subsubtypes
          };
          return acc;
        }, {})
      }
    };
  }

  /**
   * Valid item types for having runes.
   * @type {Set<string>}
   */
  static get validRuneItemTypes() {
    return new Set(["equipment", "tool", "weapon"]);
  }

  /** Initialize crafting. */
  static init() {
    Hooks.on("renderItemSheet", Crafting._renderItemSheet);
    Hooks.on("renderActorSheet5eCharacter2", Crafting._renderCharacterSheet);
    Hooks.on("dnd5e.preUseItem", Crafting._preUseItem);
    Hooks.on("dnd5e.preRollAttack", Crafting._preRollAttack);
    Crafting._characterFlags();
    Object.assign(CONFIG.Item.dataModels, {"mythacri-scripts.recipe": RecipeData});
    DocumentSheetConfig.registerSheet(Item, "mythacri-scripts", RecipeSheet, {
      types: ["mythacri-scripts.recipe"], makeDefault: true, label: "MYTHACRI.SheetRecipe"
    });
    dnd5e.applications.actor.ActorSheet5eCharacter2.TABS.push({
      label: "MYTHACRI.Crafting", icon: "fa-solid fa-hammer", tab: "mythacri"
    });
    loadTemplates([
      "modules/mythacri-scripts/templates/parts/crafting-recipe.hbs",
      "modules/mythacri-scripts/templates/parts/crafting-selected.hbs"
    ]);
  }

  /**
   * Inject module fields into item sheets.
   * @param {ItemSheet} sheet
   * @param {HTMLElement} html
   */
  static async _renderItemSheet(sheet, [html]) {
    const type = sheet.document.type;
    if (type === "loot") await Crafting._renderLootItemDropdowns(sheet, html);
    else if (Crafting.validRuneItemTypes.has(type)) await Crafting._renderRunesData(sheet, html);
  }

  /**
   * Render form group for runes.
   * @param {ItemSheet} sheet
   * @param {HTMLElement} html
   */
  static async _renderRunesData(sheet, html) {
    const node = html.querySelector("[name='system.proficient'], [name='system.armor.value']");
    const data = sheet.document.flags[MODULE.ID]?.runes ?? {};
    const div = document.createElement("DIV");
    div.innerHTML = await renderTemplate("modules/mythacri-scripts/templates/parts/runes-item-property.hbs", data);
    div.querySelector("[type=number]")?.addEventListener("focus", event => event.currentTarget.select());
    if (node?.name === "system.proficient") node.closest(".form-group").after(div.firstElementChild);
    else if (node?.name === "system.armor.value") node.closest(".form-group").before(div.firstElementChild);
  }

  /**
   * Inject dropdowns into loot item sheets for setting the resource type.
   * @param {ItemSheet} sheet
   * @param {HTMLElement} html
   */
  static async _renderLootItemDropdowns(sheet, html) {
    const data = sheet.document.getFlag(MODULE.ID, "resource") ?? {};
    const template = "modules/mythacri-scripts/templates/parts/resource-types.hbs";
    const div = document.createElement("DIV");

    const templateData = Crafting.getTemplateData(data);
    templateData.disable = !game.user.isGM;

    div.innerHTML = await renderTemplate(template, templateData);
    html.querySelector(".item-properties").append(...div.children);
  }

  /**
   * Inject module elements into the character sheet.
   * @param {ActorSheet5eCharacter} sheet
   * @param {HTMLElement} html
   */
  static async _renderCharacterSheet(sheet, [html]) {
    // Render crafting buttons.
    Crafting._renderCraftingTab(sheet, html);

    // Render rune configuration menus.
    if (game.modules.get("babonus")?.active) {
      for (const node of html.querySelectorAll(".tab.inventory .inventory-list .item")) {
        const item = sheet.document.items.get(node.closest("[data-item-id]")?.dataset.itemId);
        if (Crafting.itemCanHaveRunes(item)) Crafting._renderRunesOnItem(item, node);
      }
    }
  }

  /**
   * Inject crafting buttons into the character sheet.
   * @param {ActorSheet5eCharacter} sheet
   * @param {HTMLElement} html
   */
  static async _renderCraftingTab(sheet, html) {
    const template = "modules/mythacri-scripts/templates/parts/crafting-buttons.hbs";
    const buttons = sheet.document.flags.dnd5e?.crafting ?? {};
    const active = sheet._tabs[0].active === "mythacri" ? "active" : "";
    const div = document.createElement("DIV");
    div.innerHTML = await renderTemplate(template, {...buttons, active: active});
    div.querySelectorAll("[data-action]").forEach(n => n.addEventListener("click", Crafting._onClickCraft.bind(sheet)));
    const body = html.querySelector(".tab-body");
    if (!body.querySelector(".tab.mythacri")) body.insertAdjacentElement("beforeend", div.firstElementChild);
  }

  /**
   * Inject runes config button on each relevant item.
   * @param {Item5e} item
   * @param {HTMLElement}
   */
  static async _renderRunesOnItem(item, html) {
    const after = html.querySelector(".item-name");
    const template = "modules/mythacri-scripts/templates/parts/runes-config-icon.hbs";
    const div = document.createElement("DIV");
    const value = babonus.getCollection(item).filter(bonus => {
      return bonus.enabled && bonus.flags[MODULE.ID]?.isRune;
    }).length;
    div.innerHTML = await renderTemplate(template, {...item.flags[MODULE.ID].runes, value: value});
    div.querySelector("[data-action]").addEventListener("click", Crafting._onClickRunesConfig.bind(item));
    after.after(div.firstElementChild);
  }

  /**
   * Return whether an item can have runes on it.
   * @param {Item5e} item
   * @returns {boolean}
   */
  static itemCanHaveRunes(item) {
    const runes = item?.flags[MODULE.ID]?.runes;
    if (!runes) return false;
    return runes.enabled && Number.isNumeric(runes.max) && (runes.max > 0);
  }

  /**
   * Render runes config for the given item.
   * @returns {null|RunesConfig}
   */
  static _onClickRunesConfig() {
    const runes = babonus.getCollection(this).filter(bonus => bonus.flags[MODULE.ID]?.isRune);
    if (!runes.length) {
      ui.notifications.warn("MYTHACRI.CraftingNoRunesOnItem", {localize: true});
      return null;
    }
    return new RunesConfig(this).render(true);
  }

  /**
   * Handle clicking a crafting button.
   * @param {PointerEvent} event        The initiating click event.
   * @returns {CraftingApplication}     The rendered crafting application.
   */
  static _onClickCraft(event) {
    const type = event.currentTarget.dataset.action;
    return new CraftingApplication(this.document, type).render(true);
  }

  /**
   * Utility function for the template data of the triple dropdowns for resource items.
   * @param {object} [data]                 Flag data.
   * @param {string} [data.type]            The stored type.
   * @param {string} [data.subtype]         The stored subtype.
   * @param {string} [data.subsubtype]      The stored sub-subtype.
   * @param {number} [data.grade]           A stored spirit grade.
   * @returns {object}
   */
  static getTemplateData(data = {}) {
    const typeOptions = Crafting.resourceTypes;
    const subtypeOptions = typeOptions[data.type]?.subtypes ?? {};
    const isEssence = (data.type === "essence") && (data.subtype in CONFIG.DND5E.creatureTypes);
    const isMonster = (data.type === "monster") && (data.subtype in CONFIG.DND5E.creatureTypes);
    const templateData = {
      ...data,
      typeOptions: typeOptions,
      subtypeOptions: subtypeOptions,
      hasSubtype: data.type in typeOptions,
      isMonster: isMonster,
      monsterPartOptions: Crafting.subsubtypes,
      subtypeLabel: `MYTHACRI.ResourceLabelSubtype${(data.type ?? "").capitalize()}`,
      subsubtypeLabel: `MYTHACRI.ResourceLabelSubsubtype${(data.type ?? "").capitalize()}`,
      isEssence: isEssence,
      gradeOptions: Object.fromEntries(Array.fromRange(6, 1).map(n => [n, n.ordinalString()]))
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

    const valid = Crafting.validIdentifier(id, {allowWildCard: false});
    if (!valid) return null;

    return id;
  }

  /**
   * Is this resource identifier valid?
   * @param {string} id                   A string id, usually of the form `monster.celestial.eye`.
   * @param {boolean} [allowWildCard]     Is the wildcard token `*` allowed?
   * @returns {boolean}
   */
  static validIdentifier(id, {allowWildCard = true} = {}) {
    const [type, subtype, subsubtype] = id?.split(".") ?? [];
    const types = Crafting.resourceTypes;
    let path = `${type}.subtypes.${subtype}`;

    if (type !== "monster") {
      if (subtype === "*") return allowWildCard && (type in types);
      return foundry.utils.hasProperty(types, path);
    }

    // Special handling for monster parts.
    const validSubsub = ((subsubtype === "*") && allowWildCard) || (subsubtype in Crafting.subsubtypes);
    return validSubsub && (((subtype === "*") && allowWildCard) || (subtype in CONFIG.DND5E.creatureTypes));
  }

  /**
   * Is this item a valid match for this part of the recipe?
   * @param {Item5e} item     The item being tested.
   * @param {string} id       The id in the recipe.
   * @returns {boolean}       Whether the item can be used for this part of the recipe.
   */
  static validResourceForComponent(item, id) {
    const [type, subtype, subsubtype] = id.split(".");
    const hasWildcard = (subtype === "*") || ((type === "monster") && (subsubtype === "*"));

    const identifier = Crafting.getIdentifier(item);
    if (!identifier) return false;
    if (!hasWildcard) return identifier === id;

    const [itype, isubtype, isubsubtype] = identifier.split(".");
    if (type !== itype) return false;

    const validSub = (subtype === isubtype) || (subtype === "*");
    if (!validSub) return false;

    return (type === "monster") ? ((subsubtype === isubsubtype) || (subsubtype === "*")) : true;
  }

  /**
   * Get a human-readable label from a resource identifier.
   * @param {string} id
   * @returns {string}
   */
  static getLabel(id) {
    const [type, subtype, subsubtype] = id.split(".");
    if (["gem", "essence"].includes(type)) return Crafting._getLabel(type, subtype);
    if (type === "monster") return Crafting._getMonsterLabel(type, subtype, subsubtype);
  }
  static _getLabel(type, subtype) {
    if (subtype === "*") return game.i18n.localize(`MYTHACRI.ResourceTypeLabel${type.capitalize()}Wildcard`);
    const types = Crafting.resourceTypes;
    return game.i18n.format(`MYTHACRI.ResourceTypeLabel${type.capitalize()}`, {
      type: game.i18n.localize(types[type].label),
      subtype: game.i18n.localize(types[type].subtypes[subtype]?.label)
    });
  }
  static _getMonsterLabel(type, subtype, subsubtype) {
    if ((subtype === "*") && (subsubtype === "*")) return Crafting._getLabel(type, subtype);

    if (subtype === "*") {
      return game.i18n.format("MYTHACRI.ResourceTypeLabelMonsterWildcardSubtype", {
        subsubtype: game.i18n.localize(Crafting.subsubtypes[subsubtype].label)
      });
    }

    if (subsubtype === "*") {
      return game.i18n.format("MYTHACRI.ResourceTypeLabelMonsterWildcardSubsubtype", {
        subtype: CONFIG.DND5E.creatureTypes[subtype].label
      });
    }

    const data = {
      type: game.i18n.localize("MYTHACRI.ResourceTypeMonster"),
      subtype: CONFIG.DND5E.creatureTypes[subtype].label,
      subsubtype: game.i18n.localize(Crafting.subsubtypes[subsubtype].label)
    };
    return game.i18n.format("MYTHACRI.ResourceTypeLabelMonster", data);
  }

  /**
   * Set up character flags for opting into crafting types.
   */
  static _characterFlags() {
    for (const key of Object.keys(Crafting.recipeTypes)) {
      const label = key.capitalize();
      CONFIG.DND5E.characterFlags[`crafting.${key}`] = {
        name: `MYTHACRI.CraftingSection${label}`,
        hint: `MYTHACRI.CraftingSection${label}Hint`,
        section: "MYTHACRI.CraftingSection",
        type: Boolean
      };
    }
  }

  /**
   * Cancel the use of a consumable item if it is a rune or bound spirit, then execute transfer behaviour.
   * @param {Item5e} item     The item being used.
   * @returns {void|boolean}
   */
  static _preUseItem(item) {
    const type = item.system.type;
    if ((item.type !== "consumable") || !["rune", "spirit"].includes(type.value)) return;

    if (type.value === "rune") {
      if (!game.modules.get("babonus")?.active) {
        ui.notifications.error("Build-a-Bonus is not enabled to allow for rune transfer.");
        return;
      }
      Crafting.promptRuneTransfer(item);
      return false;
    } else if (type.value === "spirit") {
      Crafting.promptSpiritTransfer(item);
      return false;
    }
  }

  /**
   * When an item with a 'grade' is used for an attack roll, if the ability used (strength or dexterity) is
   * lower than the grade, set `@mod` to be equal to the grade.
   * @param {Item5e} item     The item used for the attack roll.
   * @param {object} config     The roll config.
   */
  static _preRollAttack(item, config) {
    if ((item.type === "feat") && (item.system.type.value === "spiritTech")) {
      const mod = item.abilityMod;
      const grade = item.flags[MODULE.ID]?.spiritGrade || 1;
      if ((grade > config.data.mod) && ["str", "dex"].includes(mod)) config.data.mod = grade;
    }
  }

  /**
   * Initiate the dialog to transfer a rune from the consumable to target item.
   * @param {Item5e} item                 The consumable rune's item.
   * @returns {Promise<Item5e|null>}      The targeted item receiving the rune.
   */
  static async promptRuneTransfer(item) {
    const targets = item.actor.items.reduce((acc, item) => {
      if (!Crafting.validRuneItemTypes.has(item.type)) return acc;
      const {enabled, max} = item.flags[MODULE.ID]?.runes ?? {};
      if (enabled && (max > 0)) acc[item.type].push(item);
      return acc;
    }, Object.fromEntries(Array.from(Crafting.validRuneItemTypes).map(type => [type, []])));

    if (!Object.values(targets).some(v => v.length > 0)) {
      ui.notifications.warn("MYTHACRI.CraftingRuneTargetNoneAvailable", {localize: true});
      return null;
    }

    const bonus = babonus.getCollection(item).contents[0].toObject();
    foundry.utils.mergeObject(bonus, {
      [`flags.${MODULE.ID}.isRune`]: true,
      name: game.i18n.format("MYTHACRI.CraftingRuneBonus", {name: bonus.name})
    });

    const itemId = await Dialog.prompt({
      content: await renderTemplate("modules/mythacri-scripts/templates/runes-target.hbs", {bonus, targets}),
      title: game.i18n.localize("MYTHACRI.CraftingApplyRune"),
      label: game.i18n.localize("MYTHACRI.CraftingApplyRune"),
      rejectClose: false,
      callback: html => new FormDataExtended(html[0].querySelector("FORM")).object.itemId,
      options: {id: `apply-rune-${item.uuid.replaceAll(".", "-")}`}
    });
    if (!itemId) return null;

    const target = item.actor.items.get(itemId);
    if (bonus.enabled) bonus.enabled = Crafting._determineSuppression(target);
    const rune = babonus.createBabonus(bonus);
    await Crafting.reduceOrDestroyConsumable(item);
    return babonus.embedBabonus(target, rune);
  }

  /**
   * Prompt for using the bound spirit's item and transferring the held technique onto the owner.
   * @param {Item5e} item                 The item being used.
   * @returns {Promise<Item5e|null>}      The created item.
   */
  static async promptSpiritTransfer(item) {
    const data = item.flags[MODULE.ID];
    const grade = data.spiritGrade || 1;
    const recipe = data.recipeUuid;
    const existing = item.actor.items.find(item => {
      return (item.type === "feat") && (item.flags[MODULE.ID]?.recipeUuid === recipe);
    });

    if (existing) {
      const eg = existing.flags[MODULE.ID].spiritGrade;
      if (eg >= grade) {
        ui.notifications.warn("MYTHACRI.CraftingConsumeSpiritItemWarn", {localize: true});
        return null;
      }
    }

    const target = await fromUuid(data.sourceId);
    let content = "<p>" + game.i18n.format("MYTHACRI.CraftingConsumeSpiritItemHint", {
      name: target.name,
      grade: grade.ordinalString()
    }) + "</p>";
    if (existing) content += `<p><em>${game.i18n.localize("MYTHACRI.CraftingConsumeSpiritItemHintReplace")}</em></p>`;
    const confirm = await Dialog.confirm({
      title: game.i18n.format("MYTHACRI.CraftingConsumeSpiritItemTitle", {name: target.name}),
      content: content
    });
    if (!confirm) return null;
    const itemData = game.items.fromCompendium(target);
    itemData.name = game.i18n.format("MYTHACRI.CraftingConsumeSpiritItemName", {
      name: itemData.name,
      grade: grade.ordinalString()
    });

    if (target.hasDamage) {
      const parts = [];
      for (const [formula, type] of target.toObject().system.damage.parts) {
        const roll = new Roll(formula);
        roll.dice.forEach(die => die.number += (grade - 1));
        parts.push([roll.formula, type]);
      }
      itemData.system.damage.parts = parts;
    }
    if (target.hasSave) {
      itemData.system.save.dc = dnd5e.utils.simplifyBonus(`10 + @prof + ${grade}`, item.getRollData({deterministic: true}));
      itemData.system.save.scaling = "flat";
    }
    if (target.hasAreaTarget) {
      itemData.system.target.value += (grade - 1) * 5;
      if (["wall", "line"].includes(itemData.system.target.type)) {
        itemData.system.target.width ||= 5;
        itemData.system.target.width += (grade - 1) * 2.5;
      }
    } else if (target.hasIndividualTarget) itemData.system.target.value += grade - 1;

    itemData.system.type.value = "spiritTech";
    itemData.flags[MODULE.ID] = foundry.utils.deepClone(data);

    await Crafting.reduceOrDestroyConsumable(item);
    if (existing) await existing.delete();
    return Item.implementation.create(itemData, {parent: item.actor});
  }

  /**
   * Set the enabled state of the rune depending on whether its addition would put the target item over the maximum.
   * @param {Item5e} item     The item receiving a rune.
   * @returns {boolean}       The enabled state.
   */
  static _determineSuppression(item) {
    const value = babonus.getCollection(item).filter(bonus => {
      return bonus.enabled && bonus.flags[MODULE.ID]?.isRune;
    }).length;
    const max = item.flags[MODULE.ID]?.runes?.max ?? 0;
    return value < max;
  }

  /**
   * Reduce the quantity of an item by 1. If that would reduce it to 0, delete it instead.
   * @param {Item5e} item           The item to modify or delete.
   * @returns {Promise<Item5e>}     The updated or deleted item.
   */
  static async reduceOrDestroyConsumable(item) {
    const qty = item.system.quantity;
    if (qty === 1) return item.delete();
    else return item.update({"system.quantity": qty - 1});
  }
}
