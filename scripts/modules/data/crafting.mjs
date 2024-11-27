import MODULE from "../constants.mjs";
import CraftingApplication from "../applications/crafting-application.mjs";
import RecipeData from "./models/recipe-item.mjs";
import RecipeSheet from "../applications/recipe-sheet.mjs";
import RunesConfig from "../applications/runes-config.mjs";

/* -------------------------------------------------- */

/**
 * @typedef {object} CraftingType
 * @property {string} icon      Font-Awesome icon.
 * @property {string} label     Human-readable label.
 */

/* -------------------------------------------------- */

/**
 * Configuration for crafting, with types, subtypes, and subsubtypes.
 * @type {object}
 */
const TYPES = {
  /**
   * Recipe types.
   * @type {Record<string, string>}
   */
  recipeTypes: {
    alchemy: "MYTHACRI.CRAFTING.RECIPE.Alchemy",
    cooking: "MYTHACRI.CRAFTING.RECIPE.Cooking",
    monster: "MYTHACRI.CRAFTING.RECIPE.Monster",
    rune: "MYTHACRI.CRAFTING.RECIPE.Rune",
    spirit: "MYTHACRI.CRAFTING.RECIPE.Spirit"
  },

  /* -------------------------------------------------- */

  /**
   * Crafting types.
   * @type {Record<string, CraftingType>}
   */
  craftingTypes: {
    alchemy: {
      label: "MYTHACRI.CRAFTING.ALCHEMY.Title",
      icon: "fa-solid fa-flask"
    },
    cooking: {
      label: "MYTHACRI.CRAFTING.COOKING.Title",
      icon: "fa-solid fa-drumstick-bite"
    },
    monster: {
      label: "MYTHACRI.CRAFTING.MONSTER.Title",
      icon: "fa-solid fa-hand-fist"
    },
    rune: {
      label: "MYTHACRI.CRAFTING.RUNE.Title",
      icon: "fa-solid fa-gem"
    },
    spirit: {
      label: "MYTHACRI.CRAFTING.SPIRIT.Title",
      icon: "fa-solid fa-fire-flame-simple"
    }
  },

  /* -------------------------------------------------- */

  /**
   * Main resource types.
   * @type {Record<string, string>}
   */
  typeOptions: {
    alchemy: "MYTHACRI.RESOURCE.typeOptionAlchemy",
    gem: "MYTHACRI.RESOURCE.typeOptionGem",
    essence: "MYTHACRI.RESOURCE.typeOptionEssence",
    monster: "MYTHACRI.RESOURCE.typeOptionMonster"
  },

  /* -------------------------------------------------- */

  /**
   * Monster sub-subtypes. The parts that can be harvested for physical parts.
   * The 'uncommon' array contains a list of creature types from which this part is rarely or never found.
   * @type {object}
   */
  monsterSubsubtypes: {
    acid: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.acid",
      uncommon: [
        "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "plant", "undead"
      ]
    },
    antenna: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.antenna",
      uncommon: [
        "celestial", "construct", "dragon", "elemental", "fiend", "giant", "humanoid", "ooze", "plant", "undead"
      ]
    },
    antler: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.antler",
      uncommon: [
        "aberration", "celestial", "construct", "dragon", "elemental", "fiend", "giant",
        "humanoid", "ooze", "plant", "undead"
      ]
    },
    blood: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.blood",
      uncommon: ["celestial", "dragon", "elemental", "ooze", "plant"]
    },
    bone: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.bone",
      uncommon: ["humanoid", "ooze", "plant"]
    },
    brain: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.brain",
      uncommon: ["dragon", "elemental", "fey", "humanoid", "monstrosity", "ooze", "plant"]
    },
    breathSac: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.breathSac",
      uncommon: [
        "aberration", "celestial", "construct", "elemental", "fey", "fiend", "giant", "humanoid",
        "monstrosity", "ooze", "plant", "undead"
      ]
    },
    carapace: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.carapace",
      uncommon: [
        "celestial", "construct", "dragon", "fey", "fiend", "giant", "humanoid", "ooze", "plant", "undead"
      ]
    },
    claws: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.claws",
      uncommon: ["construct", "elemental", "giant", "humanoid", "ooze", "plant", "undead"]
    },
    dust: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.dust",
      uncommon: [
        "beast", "construct", "dragon", "fey", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"
      ]
    },
    egg: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.egg",
      uncommon: [
        "celestial", "construct", "elemental", "fey", "fiend", "giant", "humanoid", "ooze", "plant", "undead"
      ]
    },
    etherealIchor: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.etherealIchor",
      uncommon: [
        "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
        "humanoid", "monstrosity", "ooze", "plant"
      ]
    },
    eye: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.eye",
      uncommon: ["construct", "humanoid", "ooze", "plant"]
    },
    fat: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.fat",
      uncommon: ["construct", "elemental", "humanoid", "ooze", "plant", "undead"]
    },
    feathers: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.feathers",
      uncommon: ["aberration", "construct", "elemental", "giant", "humanoid", "ooze", "plant", "undead"]
    },
    fin: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.fin",
      uncommon: ["construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "ooze", "plant", "undead"]
    },
    flesh: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.flesh",
      uncommon: ["elemental", "humanoid", "ooze", "plant"]
    },
    heart: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.heart",
      uncommon: ["construct", "elemental", "humanoid", "ooze", "plant", "undead"]
    },
    hide: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.hide",
      uncommon: [
        "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
        "ooze", "plant", "undead"
      ]
    },
    horn: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.horn",
      uncommon: ["construct", "giant", "humanoid", "ooze", "plant", "undead"]
    },
    instructions: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.instructions",
      uncommon: [
        "aberration", "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
        "monstrosity", "ooze", "plant", "undead"
      ]
    },
    liver: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.liver",
      uncommon: ["construct", "elemental", "humanoid", "ooze", "plant", "undead"]
    },
    mainEye: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.mainEye",
      uncommon: [
        "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
        "humanoid", "monstrosity", "ooze", "plant", "undead"
      ]
    },
    mote: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.mote",
      uncommon: [
        "aberration", "beast", "celestial", "construct", "dragon", "fey", "fiend", "giant",
        "humanoid", "monstrosity", "ooze", "plant", "undead"
      ]
    },
    mucus: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.mucus",
      uncommon: [
        "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
        "monstrosity", "plant", "undead"
      ]
    },
    oil: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.oil",
      uncommon: [
        "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
        "monstrosity", "ooze", "plant", "undead"
      ]
    },
    pincer: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.pincer",
      uncommon: [
        "celestial", "construct", "dragon", "elemental", "fey", "giant", "humanoid", "ooze", "plant", "undead"
      ]
    },
    plating: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.plating",
      uncommon: [
        "beast", "celestial", "dragon", "elemental", "fey", "fiend", "giant", "humanoid",
        "monstrosity", "ooze", "plant", "undead"
      ]
    },
    poisonGland: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.poisonGland",
      uncommon: [
        "celestial", "construct", "dragon", "elemental", "fey", "giant", "humanoid",
        "ooze", "plant", "undead"
      ]
    },
    sap: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.sap",
      uncommon: [
        "aberration", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
        "humanoid", "monstrosity", "ooze", "undead"
      ]
    },
    scales: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.scales",
      uncommon: ["beast", "construct", "elemental", "fey", "giant", "humanoid", "ooze", "plant", "undead"]
    },
    skin: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.skin",
      uncommon: ["beast", "construct", "dragon", "elemental", "humanoid", "ooze", "undead"]
    },
    stinger: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.stinger",
      uncommon: [
        "beast", "celestial", "construct", "dragon", "elemental", "fey", "giant", "humanoid", "ooze", "undead"
      ]
    },
    talon: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.talon",
      uncommon: [
        "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "giant",
        "humanoid", "ooze", "plant", "undead"
      ]
    },
    teeth: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.teeth",
      uncommon: ["beast", "construct", "elemental", "humanoid", "ooze", "plant"]
    },
    tentacle: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.tentacle",
      uncommon: [
        "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant",
        "humanoid", "ooze", "plant", "undead"
      ]
    },
    tusk: {
      label: "MYTHACRI.RESOURCE.subsubtypeOption.monster.tusk",
      uncommon: [
        "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend",
        "giant", "humanoid", "ooze", "plant", "undead"
      ]
    }
  },

  /* -------------------------------------------------- */

  /**
   * Gem subtypes.
   * @type {object}
   */
  gemSubtypes: {
    amber: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.amber"},
    amethyst: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.amethyst"},
    aquamarine: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.aquamarine"},
    citrine: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.citrine"},
    diamond: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.diamond"},
    emerald: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.emerald"},
    garnet: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.garnet"},
    jade: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.jade"},
    jasper: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.jasper"},
    jet: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.jet"},
    lapisLazuli: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.lapisLazuli"},
    moonstone: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.moonstone"},
    mossAgate: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.mossAgate"},
    obsidian: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.obsidian"},
    onyx: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.onyx"},
    opal: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.opal"},
    pearl: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.pearl"},
    peridot: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.peridot"},
    quartz: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.quartz"},
    ruby: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.ruby"},
    sapphire: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.sapphire"},
    spinel: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.spinel"},
    topaz: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.topaz"},
    turquoise: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.turquoise"},
    zircon: {label: "MYTHACRI.RESOURCE.subtypeOption.gem.zircon"}
  },

  /* -------------------------------------------------- */

  /**
   * Alchemical subtypes.
   * @type {object}
   */
  alchemySubtypes: {
    crystal: {
      label: "MYTHACRI.RESOURCE.subtypeOption.alchemy.crystal"
    },
    flower: {
      label: "MYTHACRI.RESOURCE.subtypeOption.alchemy.flower"
    },
    herb: {
      label: "MYTHACRI.RESOURCE.subtypeOption.alchemy.herb"
    },
    mushroom: {
      label: "MYTHACRI.RESOURCE.subtypeOption.alchemy.mushroom"
    }
  },

  /* -------------------------------------------------- */

  /**
   * Alchemical sub-subtypes.
   * @type {object}
   */
  alchemySubsubtypes: {
    crystal: {
      aetherite: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.aetherite"
      },
      pyroclast: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.pyroclast"
      },
      solunat: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.solunat"
      },
      stormshard: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.stormshard"
      }
    },
    flower: {
      brassicSplash: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.brassicSplash"
      },
      gablips: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.gablips"
      },
      manastaracae: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.manastaracae"
      },
      moonflower: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.moonflower"
      }
    },
    herb: {
      ambergrain: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.ambergrain"
      },
      ebonbark: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.ebonbark"
      },
      heartsease: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.heartsease"
      },
      vitamoss: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.vitamoss"
      }
    },
    mushroom: {
      ascoverte: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.ascoverte"
      },
      rubyVeil: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.rubyVeil"
      },
      spectreSprings: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.spectreSprings"
      },
      whisperingSpore: {
        label: "MYTHACRI.RESOURCE.subsubtypeOption.alchemy.whisperingSpore"
      }
    }
  },

  /* -------------------------------------------------- */

  /**
   * Valid item types for having runes.
   * @type {Set<string>}
   */
  validRuneItemTypes: new Set(["equipment", "tool", "weapon"])
};

/* -------------------------------------------------- */

/**
 * Resource config.
 * @type {object}
 */
Object.defineProperty(TYPES, "resourceTypes", {
  get: function() {
    const {typeOptions, monsterSubsubtypes, gemSubtypes, alchemySubtypes} = TYPES;
    return {
      alchemy: {
        label: typeOptions.alchemy,
        subtypes: Object.entries(alchemySubtypes).reduce((acc, [k, v]) => {
          acc[k] = {
            label: v.label,
            subsubtypes: TYPES.alchemySubsubtypes[k]
          };
          return acc;
        }, {})
      },
      gem: {
        label: typeOptions.gem,
        subtypes: gemSubtypes
      },
      essence: {
        label: typeOptions.essence,
        subtypes: {...CONFIG.DND5E.creatureTypes}
      },
      monster: {
        label: typeOptions.monster,
        subtypes: Object.entries(CONFIG.DND5E.creatureTypes).reduce((acc, [key, {label}]) => {
          acc[key] = {
            label: label,
            subsubtypes: monsterSubsubtypes
          };
          return acc;
        }, {})
      }
    };
  }
});

/* -------------------------------------------------- */

Hooks.on("renderItemSheet5e", _renderItemSheet);
Hooks.on("renderActorSheet5eCharacter2", _renderCharacterSheet);
Hooks.on("dnd5e.preDisplayCardV2", _preUseItem);
Hooks.on("dnd5e.preRollAttackV2", _preRollAttack);
Hooks.once("init", () => {
  _characterFlags();
  Object.assign(CONFIG.Item.dataModels, {"mythacri-scripts.recipe": RecipeData});
  DocumentSheetConfig.registerSheet(Item, "mythacri-scripts", RecipeSheet, {
    types: ["mythacri-scripts.recipe"],
    makeDefault: true,
    label: "MYTHACRI.CRAFTING.SHEET.SheetLabel"
  });
  dnd5e.applications.actor.ActorSheet5eCharacter2.TABS.push({
    label: "MYTHACRI.CRAFTING.TAB",
    icon: "fa-solid fa-hammer",
    tab: "mythacri"
  });
  loadTemplates([
    "modules/mythacri-scripts/templates/parts/crafting-recipe.hbs",
    "modules/mythacri-scripts/templates/parts/crafting-selected.hbs"
  ]);
});
Hooks.once("i18nInit", () => {
  const localize = object => {
    for (const [k, v] of Object.entries(object)) {
      switch (foundry.utils.getType(v)) {
        case "string":
          object[k] = game.i18n.localize(v);
          break;
        case "Object":
          localize(v);
          break;
        default:
          break;
      }
    }
  };

  localize(TYPES);
});

/* -------------------------------------------------- */

/**
 * Inject module fields into item sheets.
 * @param {ItemSheet} sheet
 * @param {HTMLElement} html
 */
function _renderItemSheet(sheet, [html]) {
  const type = sheet.document.type;
  if (type === "loot") _renderLootItemDropdowns(sheet, html);
  else if (TYPES.validRuneItemTypes.has(type)) _renderRunesData(sheet, html);
}

/* -------------------------------------------------- */

/**
 * Render form group for runes.
 * @param {ItemSheet} sheet
 * @param {HTMLElement} html
 */
async function _renderRunesData(sheet, html) {
  const node = html.querySelector(".tab.details fieldset");
  const data = sheet.document.flags[MODULE.ID]?.runes ?? {};
  const div = document.createElement("DIV");
  div.innerHTML = await renderTemplate("modules/mythacri-scripts/templates/parts/runes-item-property.hbs", data);
  div.querySelector("[type=number]")?.addEventListener("focus", event => event.currentTarget.select());
  node.after(div.firstElementChild);
}

/* -------------------------------------------------- */

/**
 * Inject dropdowns into loot item sheets for setting the resource type.
 * @param {ItemSheet} sheet
 * @param {HTMLElement} html
 */
async function _renderLootItemDropdowns(sheet, html) {
  const data = sheet.document.getFlag(MODULE.ID, "resource") ?? {};

  const element = document.createElement("FIELDSET");
  element.insertAdjacentHTML("beforeend", `<legend>${game.i18n.localize("MYTHACRI.RESOURCE.Configuration")}</legend>`);

  const fields = _constructResourceFields(data);
  for (const {field, value, name} of fields) {
    element.insertAdjacentElement("beforeend", field.toFormGroup({localize: true}, {
      name: name, blank: "-", value: value, localize: true
    }));
  }

  const id = getIdentifier(sheet.document);
  if (id) {
    const label = getLabel(id);
    element.insertAdjacentHTML("beforeend", `<p class="hint">${game.i18n.format("MYTHACRI.RESOURCE.Hint", {
      identifier: id,
      label: label
    })}</p>`);
  }

  if (!sheet.isEditable || !game.user.isGM) element.disabled = true;
  html.querySelector(".tab.details").insertAdjacentElement("beforeend", element);
}

/* -------------------------------------------------- */

/**
 * Utility function for the template data of the triple dropdowns for resource items.
 * @param {object} [data]                 Flag data.
 * @param {string} [data.type]            The stored type.
 * @param {string} [data.subtype]         The stored subtype.
 * @param {string} [data.subsubtype]      The stored sub-subtype.
 * @param {number} [data.grade]           A stored spirit grade.
 * @returns {object}
 */
function _constructResourceFields(data = {}) {
  const typeOptions = TYPES.resourceTypes;
  const {NumberField, StringField} = foundry.data.fields;
  const fields = [];

  fields.push({
    field: new StringField({
      label: "MYTHACRI.RESOURCE.type.label",
      choices: typeOptions
    }),
    value: data.type,
    name: "flags.mythacri-scripts.resource.type"
  });

  if (data.type in typeOptions) {
    fields.push({
      field: new StringField({
        label: `MYTHACRI.RESOURCE.subtype.label${data.type.capitalize()}`,
        choices: typeOptions[data.type].subtypes
      }),
      value: data.subtype,
      name: "flags.mythacri-scripts.resource.subtype"
    });
  }

  if ((data.type === "monster") && (data.subtype in CONFIG.DND5E.creatureTypes)) {
    fields.push({
      field: new StringField({
        label: `MYTHACRI.RESOURCE.subsubtype.label${data.type.capitalize()}`,
        choices: TYPES.monsterSubsubtypes
      }),
      value: data.subsubtype,
      name: "flags.mythacri-scripts.resource.subsubtype"
    });
  }

  else if ((data.type === "essence") && (data.subtype in CONFIG.DND5E.creatureTypes)) {
    fields.push({
      field: new NumberField({
        label: "MYTHACRI.RESOURCE.grade.label",
        choices: Object.fromEntries(Array.fromRange(6, 1).map(n => [n, n.ordinalString()]))
      }),
      value: data.grade,
      name: "flags.mythacri-scripts.resource.grade"
    });
  }

  else if ((data.type === "alchemy") && (data.subtype in typeOptions.alchemy.subtypes)) {
    fields.push({
      field: new StringField({
        label: `MYTHACRI.RESOURCE.subsubtype.labelAlchemy${data.subtype.capitalize()}`,
        choices: TYPES.alchemySubsubtypes[data.subtype]
      }),
      value: data.subsubtype,
      name: "flags.mythacri-scripts.resource.subsubtype"
    });
  }

  return fields;
}

/* -------------------------------------------------- */

/**
 * Inject module elements into the character sheet.
 * @param {ActorSheet5eCharacter2} sheet
 * @param {HTMLElement} html
 */
async function _renderCharacterSheet(sheet, [html]) {
  // Render crafting buttons.
  _renderCraftingTab(sheet, html);

  // Render rune configuration menus.
  if (game.modules.get("babonus")?.active) {
    for (const node of html.querySelectorAll(".tab.inventory .inventory-list .item")) {
      const item = sheet.document.items.get(node.closest("[data-item-id]")?.dataset.itemId);
      if (itemCanHaveRunes(item)) _renderRunesOnItem(item, node);
    }
  }
}

/* -------------------------------------------------- */

/**
 * Inject crafting buttons into the character sheet.
 * @param {ActorSheet5eCharacter2} sheet
 * @param {HTMLElement} html
 */
function _renderCraftingTab(sheet, html) {
  // Button data.
  const buttons = [];
  for (const [k, v] of Object.entries(TYPES.craftingTypes)) {
    buttons.push({
      disabled: !sheet.document.flags.dnd5e?.crafting?.[k],
      key: k,
      label: game.i18n.localize(v.label),
      icon: v.icon
    });
  }
  buttons.sort((a, b) => a.label.localeCompare(b.label)).sort((a, b) => {
    return (a.disabled === b.disabled) ? 0 : a.disabled ? 1 : -1;
  });

  // Tab wrapper.
  const div = document.createElement("DIV");
  div.classList.add("tab", "mythacri");
  if (sheet._tabs[0].active === "mythacri") div.classList.add("active");
  div.dataset.group = "primary";
  div.dataset.tab = "mythacri";

  for (const button of buttons) {
    const element = document.createElement("BUTTON");
    element.classList.add(button.key, "gold-button");
    element.dataset.action = button.key;
    element.disabled = button.disabled;
    element.type = "button";
    element.innerHTML = `<i class="${button.icon}"></i><span class="label">${button.label}</span>`;
    div.insertAdjacentElement("beforeend", element);
  }

  div.querySelectorAll("[data-action]").forEach(n => n.addEventListener("click", _onClickCraft.bind(sheet)));
  const body = html.querySelector(".tab-body");
  if (!body.querySelector(".tab.mythacri")) body.insertAdjacentElement("beforeend", div);
}

/* -------------------------------------------------- */

/**
 * Inject runes config button on each relevant item.
 * @param {Item5e} item
 * @param {HTMLElement}
 */
async function _renderRunesOnItem(item, html) {
  const after = html.querySelector(".item-name");
  const template = "modules/mythacri-scripts/templates/parts/runes-config-icon.hbs";
  const div = document.createElement("DIV");
  const value = babonus.getCollection(item).filter(bonus => {
    return bonus.enabled && bonus.flags[MODULE.ID]?.isRune;
  }).length;
  div.innerHTML = await renderTemplate(template, {...item.flags[MODULE.ID].runes, value: value});
  div.querySelector("[data-action]").addEventListener("click", _onClickRunesConfig.bind(item));
  after.after(div.firstElementChild);
}

/* -------------------------------------------------- */

/**
 * Render runes config for the given item.
 * @this {Item5e}
 * @returns {null|RunesConfig}
 */
function _onClickRunesConfig() {
  const runes = babonus.getCollection(this).filter(bonus => bonus.flags[MODULE.ID]?.isRune);
  if (!runes.length) {
    ui.notifications.warn("MYTHACRI.CRAFTING.RUNE.Warning.NoRunesOnItem", {localize: true});
    return null;
  }
  return new RunesConfig({document: this}).render({force: true});
}

/* -------------------------------------------------- */

/**
 * Handle clicking a crafting button.
 * @this {ActorSheet5eCharacter2}
 * @param {PointerEvent} event      The initiating click event.
 */
function _onClickCraft(event) {
  const type = event.currentTarget.dataset.action;
  new CraftingApplication(this.document, type).render(true);
}

/* -------------------------------------------------- */

/**
 * Return whether an item can have runes on it.
 * @param {Item5e} item
 * @returns {boolean}
 */
function itemCanHaveRunes(item) {
  const runes = item?.flags[MODULE.ID]?.runes;
  if (!runes) return false;
  return runes.enabled && Number.isNumeric(runes.max) && (runes.max > 0);
}

/* -------------------------------------------------- */

/**
 * Get the resource identifier from a loot-type item, e.g., 'monster.celestial.eye' or 'gem.ruby'.
 * @param {Item5e} item       The item with the identifier.
 * @returns {string|null}     The proper identifier, or null if invalid or not applicable.
 */
function getIdentifier(item) {
  if (item?.type !== "loot") return null;

  const data = item.getFlag(MODULE.ID, "resource") ?? {};
  let id = `${data.type}.${data.subtype}`;
  if ((data.type === "monster") || (data.type === "alchemy")) id += `.${data.subsubtype}`;

  const valid = validIdentifier(id, {allowWildCard: false});
  if (!valid) return null;

  return id;
}

/* -------------------------------------------------- */

/**
 * Is this resource identifier valid?
 * @param {string} id                   A string id, usually of the form `monster.celestial.eye`.
 * @param {boolean} [allowWildCard]     Is the wildcard token `*` allowed?
 * @returns {boolean}
 */
function validIdentifier(id, {allowWildCard = true} = {}) {
  const [type, subtype, subsubtype] = id?.split(".") ?? [];
  const types = TYPES.resourceTypes;
  let path = `${type}.subtypes.${subtype}`;

  switch (type) {
    case "alchemy":
      if (allowWildCard) return foundry.utils.hasProperty(types, `${path}.subsubtypes`);
      return foundry.utils.hasProperty(types, `${path}.subsubtypes.${subsubtype}.label`);
    case "gem":
    case "essence":
      if (subtype === "*") return allowWildCard && (type in types);
      return foundry.utils.hasProperty(types, path);
    case "monster":
      return (((subsubtype === "*") && allowWildCard) || (subsubtype in TYPES.monsterSubsubtypes))
        && (((subtype === "*") && allowWildCard) || (subtype in CONFIG.DND5E.creatureTypes));
    default:
      return false;
  }
}

/* -------------------------------------------------- */

/**
 * Is this item a valid match for this part of the recipe?
 * @param {Item5e} item     The item being tested.
 * @param {string} id       The id in the recipe.
 * @returns {boolean}       Whether the item can be used for this part of the recipe.
 */
function validResourceForComponent(item, id) {
  const [type, subtype, subsubtype] = id.split(".");
  const hasWildcard = (subtype === "*") || (((type === "monster") || (type === "alchemy")) && (subsubtype === "*"));

  const identifier = getIdentifier(item);
  if (!identifier) return false;
  if (!hasWildcard) return identifier === id;

  const [itype, isubtype, isubsubtype] = identifier.split(".");
  if (type !== itype) return false;

  const validSub = (subtype === isubtype) || (subtype === "*");
  if (!validSub) return false;

  if (["alchemy", "monster"].includes(type)) return (subsubtype === isubsubtype) || (subsubtype === "*");

  return true;
}

/* -------------------------------------------------- */

/**
 * Get a human-readable label from a resource identifier.
 * @param {string} id
 * @returns {string}
 */
function getLabel(id) {
  const [type, subtype, subsubtype] = id.split(".");

  switch (type) {
    case "alchemy":
      return _getAlchemyLabel(type, subtype, subsubtype);
    case "essence":
    case "gem":
      return _getLabel(type, subtype);
    case "monster":
      return _getMonsterLabel(type, subtype, subsubtype);
  }
}

/* -------------------------------------------------- */

function _getAlchemyLabel(type, subtype, subsubtype) {
  let string = "MYTHACRI.RESOURCE.LABEL.ALCHEMY";
  if (subsubtype === "*") string += "_WILDCARD";

  const alch = TYPES.resourceTypes.alchemy.subtypes;

  subsubtype = alch[subtype].subsubtypes[subsubtype]?.label;
  subtype = alch[subtype].label;

  return game.i18n.format(string, {subtype, subsubtype});
}

/* -------------------------------------------------- */

function _getLabel(type, subtype) {
  if (subtype === "*") return game.i18n.localize(`MYTHACRI.RESOURCE.LABEL.${type.toUpperCase()}_WILDCARD`);
  const types = TYPES.resourceTypes;
  return game.i18n.format(`MYTHACRI.RESOURCE.LABEL.${type.toUpperCase()}`, {
    type: types[type]?.label,
    subtype: types[type].subtypes[subtype]?.label
  });
}

/* -------------------------------------------------- */

function _getMonsterLabel(type, subtype, subsubtype) {
  if ((subtype === "*") && (subsubtype === "*")) return _getLabel(type, subtype);

  if (subtype === "*") {
    return game.i18n.format("MYTHACRI.RESOURCE.LABEL.MONSTER_WILDCARD_SUBTYPE", {
      subsubtype: TYPES.monsterSubsubtypes[subsubtype]?.label
    });
  }

  if (subsubtype === "*") {
    return game.i18n.format("MYTHACRI.RESOURCE.LABEL.MONSTER_WILDCARD_SUBSUBTYPE", {
      subtype: CONFIG.DND5E.creatureTypes[subtype]?.label
    });
  }

  const data = {
    subtype: CONFIG.DND5E.creatureTypes[subtype]?.label,
    subsubtype: TYPES.monsterSubsubtypes[subsubtype]?.label
  };
  return game.i18n.format("MYTHACRI.RESOURCE.LABEL.MONSTER", data);
}

/* -------------------------------------------------- */

/**
 * Set up character flags for opting into crafting types.
 */
function _characterFlags() {
  for (const key of Object.keys(TYPES.recipeTypes)) {
    const label = key.toUpperCase();
    CONFIG.DND5E.characterFlags[`crafting.${key}`] = {
      name: `MYTHACRI.CRAFTING.${label}.Title`,
      hint: `MYTHACRI.CRAFTING.${label}.FlagHint`,
      section: "MYTHACRI.CRAFTING.Section",
      type: Boolean
    };
  }
}

/* -------------------------------------------------- */

/**
 * Cancel the display of a consumable item if it is a rune or bound spirit, then execute transfer behaviour.
 * @param {Item5e} item     The item being used.
 * @returns {void|boolean}
 */
function _preUseItem(item) {
  if ((item.type !== "consumable") || item.system.activities.size) return;

  switch (item.system.type.value) {
    case "rune":
      if (!game.modules.get("babonus")?.active) {
        ui.notifications.error("Build-a-Bonus is not enabled to allow for rune transfer.");
        return;
      }
      _promptRuneTransfer(item);
      return false;
    case "spirit":
      _promptSpiritTransfer(item);
      return false;
  }
}

/* -------------------------------------------------- */

/**
 * When an item with a 'grade' is used for an attack roll, if the ability used (strength or dexterity) is
 * lower than the grade, set `@mod` to be equal to the grade.
 * @param {object} config       Roll configuration.
 * @param {object} dialog       Dialog configuration.
 * @param {object} message      Message configurtation.
 */
function _preRollAttack(config, dialog, message) {
  const item = config.subject?.item;
  if ((item?.type === "feat") && (item.system.type.value === "spiritTech")) {
    const mod = config.subject.ability;
    const grade = item.flags[MODULE.ID]?.spiritGrade || 1;
    if (!["str", "dex"].includes(mod)) return;
    for (const roll of config.rolls) roll.data.mod = Math.max(grade, roll.data.mod);
  }
}

/* -------------------------------------------------- */

/**
 * Initiate the dialog to transfer a rune from the consumable to target item.
 * @param {Item5e} item                 The consumable rune's item.
 * @returns {Promise<Item5e|null>}      The targeted item receiving the rune.
 */
async function _promptRuneTransfer(item) {
  const targets = item.actor.items.reduce((acc, item) => {
    if (!TYPES.validRuneItemTypes.has(item.type)) return acc;
    const {enabled, max} = item.flags[MODULE.ID]?.runes ?? {};
    if (enabled && (max > 0)) acc.push({
      value: item.id,
      label: item.name,
      group: CONFIG.Item.typeLabels[item.type]
    });
    return acc;
  }, []);

  if (!targets.length) {
    ui.notifications.warn("MYTHACRI.CRAFTING.RUNE.Warning.NoItemsAvailable", {localize: true});
    return null;
  }

  const bonus = babonus.getCollection(item).contents[0].toObject();
  foundry.utils.mergeObject(bonus, {
    [`flags.${MODULE.ID}.isRune`]: true,
    name: game.i18n.format("MYTHACRI.CRAFTING.RUNE.Name", {name: bonus.name})
  });

  const field = new foundry.data.fields.StringField({
    label: "MYTHACRI.CRAFTING.RUNE.ApplyTarget.label",
    hint: "MYTHACRI.CRAFTING.RUNE.ApplyTarget.hint",
    required: true
  });

  const itemId = await foundry.applications.api.DialogV2.prompt({
    content: await renderTemplate("modules/mythacri-scripts/templates/runes-target.hbs", {bonus, field: field}),
    rejectClose: false,
    window: {title: "MYTHACRI.CRAFTING.RUNE.Apply"},
    ok: {
      label: "Confirm",
      callback: (event, button) => button.form.elements.itemId.value
    },
    position: {width: 400, height: "auto"}
  });
  if (!itemId) return null;

  const target = item.actor.items.get(itemId);
  if (bonus.enabled) bonus.enabled = _determineSuppression(target);
  const rune = babonus.createBabonus(bonus);
  await _reduceOrDestroyConsumable(item);
  return babonus.embedBabonus(target, rune);
}

/* -------------------------------------------------- */

/**
 * Prompt for using the bound spirit's item and transferring the held technique onto the owner.
 * @param {Item5e} item                 The item being used.
 * @returns {Promise<Item5e|null>}      The created item.
 */
async function _promptSpiritTransfer(item) {
  const data = foundry.utils.deepClone(item.flags[MODULE.ID] ?? {});
  const grade = data.spiritGrade ||= 1;
  const recipe = data.recipeUuid;

  if (!recipe) {
    ui.notifications.warn("MYTHACRI.CRAFTING.Warning.NoRecipeUuid", {localize: true});
    return null;
  }

  const existing = recipe ? item.actor.items.find(item => {
    return (item.type === "feat") && (item.flags[MODULE.ID]?.recipeUuid === recipe);
  }) : null;

  if (existing) {
    const eg = existing.flags[MODULE.ID].spiritGrade;
    if (eg >= grade) {
      ui.notifications.warn("MYTHACRI.CRAFTING.SPIRIT.Consume.Warning", {localize: true});
      return null;
    }
  }

  const target = await fromUuid(data.sourceId);
  let content = "<p>" + game.i18n.format("MYTHACRI.CRAFTING.SPIRIT.Consume.hint", {
    name: target.name,
    grade: grade.ordinalString()
  }) + "</p>";
  if (existing) content += `<p><em>${game.i18n.localize("MYTHACRI.CRAFTING.SPIRIT.Consume.hintReplace")}</em></p>`;
  const confirm = await foundry.applications.api.DialogV2.confirm({
    window: {title: game.i18n.format("MYTHACRI.CRAFTING.SPIRIT.Consume.Title", {name: target.name})},
    content: content,
    rejectClose: false,
    position: {width: 400}
  });
  if (!confirm) return null;
  const itemData = game.items.fromCompendium(target);
  itemData.name = game.i18n.format("MYTHACRI.CRAFTING.SPIRIT.Name", {
    name: itemData.name,
    grade: grade.ordinalString()
  });

  itemData.system.type.value = "spiritTech";
  itemData.flags[MODULE.ID] = data;

  await _reduceOrDestroyConsumable(item);
  if (existing) await existing.delete();
  return Item.implementation.create(itemData, {parent: item.actor});
}

/* -------------------------------------------------- */

/**
 * Set the enabled state of the rune depending on whether its addition would put the target item over the maximum.
 * @param {Item5e} item     The item receiving a rune.
 * @returns {boolean}       The enabled state.
 */
function _determineSuppression(item) {
  const value = babonus.getCollection(item).filter(bonus => {
    return bonus.enabled && bonus.flags[MODULE.ID]?.isRune;
  }).length;
  const max = item.flags[MODULE.ID]?.runes?.max ?? 0;
  return value < max;
}

/* -------------------------------------------------- */

/**
 * Reduce the quantity of an item by 1. If that would reduce it to 0, delete it instead.
 * @param {Item5e} item           The item to modify or delete.
 * @returns {Promise<Item5e>}     The updated or deleted item.
 */
async function _reduceOrDestroyConsumable(item) {
  const qty = item.system.quantity;
  if (qty === 1) return item.delete();
  else return item.update({"system.quantity": qty - 1});
}

/* -------------------------------------------------- */

export default {
  TYPES: TYPES,
  getIdentifier,
  getLabel,
  itemCanHaveRunes,
  validIdentifier,
  validResourceForComponent
};
