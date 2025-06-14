Hooks.on("preCreateScene", _preCreateScene);
Hooks.once("init", _configure);

/* -------------------------------------------------- */

/**
 * Prefix for any compendium items for the purpose of proficiencies.
 * @type {string}
 */
const PREFIX = "Compendium.mythacri-shared-compendium.equipment-myth.Item";

/* -------------------------------------------------- */

/**
 * Adjust default scene configuration.
 * @param {Scene} scene           The scene to be created.
 * @param {object} sceneData      The data given for the creation.
 * @param {object} options        The scene creation options.
 * @param {string} userId         The id of the user creating the scene.
 */
function _preCreateScene(scene, sceneData, options, userId) {
  // Defaults to use unless other properties are explicitly provided.
  const defaults = {
    backgroundColor: "#000000",
    "environment.globalLight.enabled": true,
    "grid.type": CONST.GRID_TYPES.HEXODDR,
  };

  const update = {};
  for (const [path, value] of Object.entries(defaults)) {
    if (!foundry.utils.hasProperty(sceneData, path)) {
      update[path] = value;
    }
  }

  scene.updateSource(update);
}

/* -------------------------------------------------- */

/**
 * Execute internal configuration methods.
 */
function _configure() {
  _activationTypes();
  _armorProficencies();
  _conditions();
  _consumableTypes();
  _currencies();
  _dieSteps();
  _featureTypes();
  _languages();
  _spellProgression();
  _toolProficiencies();
  _weaponProficiencies();
  _weaponProperties();
}

/* -------------------------------------------------- */

/** Merge in new activation types. */
function _activationTypes() {
  const activations = {
    mayhem: {
      group: "DND5E.ACTIVATION.Category.Monster",
      header: "MYTHACRI.MAYHEM.Action",
      label: "MYTHACRI.MAYHEM.Action",
      scalar: true,
    },
  };

  foundry.utils.mergeObject(CONFIG.DND5E.activityActivationTypes, activations);
  for (const [k, v] of Object.entries(activations)) {
    CONFIG.DND5E.abilityActivationTypes[k] = v.label;
  }
}

/* -------------------------------------------------- */

/** Merge in new armor and shield proficiencies. */
function _armorProficencies() {
  const shieldIds = {
    bucklerShield: "NhBHlkBDDLBKkxGL",
    towerShield: "LzlPn07cT6FPV1fs",
  };
  for (const [k, id] of Object.entries(shieldIds)) {
    CONFIG.DND5E.shieldIds[k] = `${PREFIX}.${id}`;
  }
}

/* -------------------------------------------------- */

/** Merge in new custom conditions and configure their effects. */
function _conditions() {
  // Add two new conditions to the token HUD.
  const journal = "Compendium.mythacri-shared-compendium.journals-myth.JournalEntry.nD9KF9ezmvqmlN61";

  // Modify exhaustion.
  CONFIG.DND5E.conditionEffects.halfHealth.delete("exhaustion-4");
  CONFIG.DND5E.conditionEffects.halfMovement.delete("exhaustion-2");
  CONFIG.DND5E.conditionEffects.noMovement.delete("exhaustion-5");

  const exhaustionData = CONFIG.DND5E.conditionTypes.exhaustion;
  foundry.utils.mergeObject(exhaustionData, {
    levels: 10,
    icon: "modules/mythacri-scripts/assets/statuses/exhaustion.svg",
    reference: `${journal}.JournalEntryPage.adMJ3j1HBbTJKCyY`,
    reduction: {rolls: 1, speed: 0},
  }, {insertKeys: false});
}

/* -------------------------------------------------- */

/** Merge in new consumable types. */
function _consumableTypes() {
  CONFIG.DND5E.consumableTypes.rune = {label: "MYTHACRI.CRAFTING.ConsumableType.Rune"};
  CONFIG.DND5E.consumableTypes.spirit = {label: "MYTHACRI.CRAFTING.ConsumableType.Spirit"};
}

/* -------------------------------------------------- */

/** Merge in new and remove some old currencies, and change the weight of 'coin'. */
function _currencies() {
  // Remove all currencies, replacing them with 'marbles'.
  foundry.utils.mergeObject(CONFIG.DND5E.currencies, {
    "cp.abbreviation": "MYTHACRI.CURRENCY.CP.ABBR",
    "cp.label": "MYTHACRI.CURRENCY.CP.LABEL",
    "sp.abbreviation": "MYTHACRI.CURRENCY.SP.ABBR",
    "sp.label": "MYTHACRI.CURRENCY.SP.LABEL",
    "gp.abbreviaton": "MYTHACRI.CURRENCY.GP.ABBR",
    "gp.label": "MYTHACRI.CURRENCY.GP.LABEL",
    "pp.abbreviation": "MYTHACRI.CURRENCY.PP.ABBR",
    "pp.label": "MYTHACRI.CURRENCY.PP.LABEL",
    "-=ep": null,
  }, {performDeletions: true});

  // Change currency weight (marbles weigh half as much as a coin).
  CONFIG.DND5E.encumbrance.currencyPerWeight.imperial *= 2;
  CONFIG.DND5E.encumbrance.currencyPerWeight.metric *= 2;
}

/* -------------------------------------------------- */

/** Add additional die sizes for rolls. */
function _dieSteps() {
  CONFIG.DND5E.dieSteps.push(5);
  CONFIG.DND5E.dieSteps.sort((a, b) => a - b);
}

/* -------------------------------------------------- */

/** Merge in new feature types. */
function _featureTypes() {
  foundry.utils.mergeObject(CONFIG.DND5E.featureTypes, {
    companion: {
      label: "MYTHACRI.FeatureCompanion",
    },
    spiritTech: {
      label: "MYTHACRI.FeatureSpiritTech",
    },
  });

  // Subtypes of entirely new feature types are not automatically prelocalized.
  dnd5e.utils.preLocalize("featureTypes.devilFruit.subtypes", {sort: true});
}

/* -------------------------------------------------- */

/** Merge in new and remove some old languages. */
function _languages() {
  foundry.utils.mergeObject(CONFIG.DND5E.languages, {
    "-=druidic": null, // delete 'druidic'
    "exotic.children.-=gith": null, // delete 'gith'
    "exotic.children.-=gnoll": null, // delete 'gnoll'
    "exotic.children.primordial.-=children": null, // delete 'ignan, terran, auran, aquan'
    "standard.children.-=gnomish": null, // delete 'gnomish'
    "standard.children.-=orc": null, // delete 'orc'
    "standard.childern.-=dwarvish": null,
  }, {performDeletions: true});
}

/* -------------------------------------------------- */

/** Merge in new tool proficiencies. */
function _toolProficiencies() {
  const toolIds = {
    piano: "AMehut6zpyXifMqo",
  };

  for (const [k, id] of Object.entries(toolIds)) {
    CONFIG.DND5E.tools[k] = {ability: "dex", id: `${PREFIX}.${id}`};
  }
}

/* -------------------------------------------------- */

/** Merge in new weapon proficiencies. */
function _weaponProficiencies() {
  // The sections in the weapon proficiency config.
  foundry.utils.mergeObject(CONFIG.DND5E.weaponProficiencies, {
    firearmRen: "MYTHACRI.WeaponProficiencyFirearmRenPl",
    firearmInd: "MYTHACRI.WeaponProficiencyFirearmIndPl",
  });

  // Which section each entry belongs under (like 'simple melee' belongs under 'simple').
  // Not necessary if the keys and entries are identical.
  /*foundry.utils.mergeObject(CONFIG.DND5E.weaponProficienciesMap, {
      firearmRen: "firearmRen",
      firearmInd: "firearmInd"
    });*/

  // The weapon type itself, as an option in an item sheet.
  foundry.utils.mergeObject(CONFIG.DND5E.weaponTypes, {
    firearmRen: "MYTHACRI.WeaponProficiencyFirearmRen",
    firearmInd: "MYTHACRI.WeaponProficiencyFirearmInd",
  });

  // Weapon ids.
  const weaponIds = {
    assaultRifle: "2mg0Z9UsSTCv9hw2",
    blunderbuss: "U9xCVu4nMr2o4Ip0",
    cutlass: "9r8gPk4RGDUUytZy",
    doubleBarrelShotgun: "RkMpHsAsAgFsl6OP",
    duckfootPistol: "GthTZpxLEVrMHQMm",
    estoc: "xw77ea4rCFnpHgNy",
    fishhook: "lQqGpkcldeOKwZM0",
    flintlock: "csl5Lu9LCoD8ZnwD",
    goliathSling: "8lqu07cKqDTt6qeE",
    greatbow: "XPPoSL8Xhp2gYZPn",
    greatspear: "YK1KjJ1qtDJlppVd",
    grimScythe: "Gx1ChtHKXEE5AEfN",
    harpoon: "EanNQeIbvCMz03w5",
    huntingRifle: "WHXDLxF6lJ6toaMm",
    machete: "06hcru0PpE0Q33Av",
    machineGun: "k7PvZwWEDYWJNVtH",
    musket: "J6kVMp2X9WrUoRzT",
    pepperbox: "qdwtzYWwQ7Ac3Goj",
    pistol: "jY3XQOpCfp8rRF2l",
    portableBallista: "52ayA03VImoL1361",
    revolver: "i8Ysr1zn74h8jxlr",
    shovel: "1D0WRHGVgbjaikkM",
    throwingDagger: "5fAnwS37xiOTwpOS",
    volleyGun: "HHePiOzWRtjYjcl6",
  };

  for (const [k, id] of Object.entries(weaponIds)) {
    CONFIG.DND5E.weaponIds[k] = `${PREFIX}.${id}`;
  }
}

/* -------------------------------------------------- */

/** Merge in new weapon properties */
function _weaponProperties() {
  const properties = {
    aerodynamic: {
      label: "MYTHACRI.WeaponPropertyAerodynamic",
    },
    coldIron: {
      icon: "systems/dnd5e/icons/svg/activity/enchant.svg",
      label: "MYTHACRI.WeaponPropertyColdIron",
      isPhysical: true,
    },
    concealable: {label: "MYTHACRI.WeaponPropertyConcealable"},
    explosive: {label: "MYTHACRI.WeaponPropertyExplosive", isJourneyman: true},
    heat: {label: "MYTHACRI.WeaponPropertyHeat", isJourneyman: true},
    massive: {label: "MYTHACRI.WeaponPropertyMassive", isJourneyman: true},
    mounted: {label: "MYTHACRI.WeaponPropertyMounted", isJourneyman: true},
    parrying: {label: "MYTHACRI.WeaponPropertyParry"},
    rocket: {label: "MYTHACRI.WeaponPropertyRocket", isJourneyman: true},
    scatter: {label: "MYTHACRI.WeaponPropertyScatter"},
    sighted: {label: "MYTHACRI.WeaponPropertySighted"},
    superheavy: {label: "MYTHACRI.WeaponPropertySuperheavy"},
    tension: {label: "MYTHACRI.WeaponPropertyTension", isJourneyman: true},
    twinshot: {label: "MYTHACRI.WeaponPropertyTwinshot", isJourneyman: true},
  };
  for (const [k, v] of Object.entries(properties)) {
    CONFIG.DND5E.itemProperties[k] = v;
    CONFIG.DND5E.validProperties.weapon.add(k);
  }
}

/* -------------------------------------------------- */

export default {};
