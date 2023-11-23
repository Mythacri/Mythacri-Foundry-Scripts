/* Utility class for additions, changes, and removals to the system configuration object. */
export class SystemConfig {
  static init() {
    SystemConfig._featureTypes();
    SystemConfig._languages();
    SystemConfig._activationTypes();
    SystemConfig._armorClasses();
    SystemConfig._weaponProperties();
    SystemConfig._weaponProficiencies();
    SystemConfig._conditions();
    SystemConfig._currencies();
    SystemConfig._consumableTypes();
  }

  static _featureTypes() {
    foundry.utils.mergeObject(CONFIG.DND5E.featureTypes, {
      devilFruit: {
        label: "MYTHACRI.FeatureDevilFruit",
        subtypes: {
          logia: "MYTHACRI.FeatureDevilFruitLogia",
          zoan: "MYTHACRI.FeatureDevilFruitZoan",
          paramecia: "MYTHACRI.FeatureDevilFruitParamecia"
        }
      },
      companion: {
        label: "MYTHACRI.FeatureCompanion"
      },
      class: {
        subtypes: {
          investigatorTrinket: "MYTHACRI.FeatureInvestigatorTrinket",
          wardenManeuver: "MYTHACRI.FeatureWardenManeuver",
          wardenSentinelSoul: "MYTHACRI.FeatureWardenSentinelSoul",
          wardenSentinelStand: "MYTHACRI.FeatureWardenSentinelStand",
          wardenSentinelStep: "MYTHACRI.FeatureWardenSentinelStep",
          witchCurse: "MYTHACRI.FeatureWitchCurse",
          witchGrandHex: "MYTHACRI.FeatureWitchGrandHex",
          witchHex: "MYTHACRI.FeatureWitchHex"
        }
      },
      spiritTech: {
        label: "MYTHACRI.FeatureSpiritTech"
      }
    });

    // Subtypes of entirely new feature types are not automatically prelocalized.
    dnd5e.utils.preLocalize("featureTypes.devilFruit.subtypes", {sort: true});
  }

  static _languages() {
    foundry.utils.mergeObject(CONFIG.DND5E.languages, {
      "-=orc": null, // delete 'orc'
      "-=gith": null, // delete 'gith'
      "-=gnoll": null, // delete 'gnoll'
      "-=ignan": null, // delete 'ignan'
      "-=terran": null, // delete 'terran'
      "-=auran": null, // delete 'auran'
      "-=aquan": null, // delete 'aquan'
      "-=druidic": null, // delete 'druidic'
      "-=gnomish": null, // delete 'gnomish'
    }, {performDeletions: true});
  }

  static _activationTypes() {
    foundry.utils.mergeObject(CONFIG.DND5E.abilityActivationTypes, {
      "-=legendary": null,
      mayhem: "MYTHACRI.ActivationMayhem"
    }, {performDeletions: true});
  }

  static _armorClasses() {
    foundry.utils.mergeObject(CONFIG.DND5E.armorClasses, {
      witchCurseFeral: {
        label: "MYTHACRI.ArmorClassFeral",
        formula: "13 + @abilities.dex.mod"
      },
      grandHexHybrid: {
        label: "MYTHACRI.ArmorClassHybrid",
        formula: "10 + @abilities.dex.mod + @abilities.cha.mod"
      },
      hexMalevolence: {
        label: "MYTHACRI.ArmorClassMalevolence",
        formula: "12 + @abilities.dex.mod + @abilities.cha.mod"
      }
    });
  }

  static _weaponProperties() {
    foundry.utils.mergeObject(CONFIG.DND5E.weaponProperties, {
      parrying: "MYTHACRI.WeaponPropertyParry",
      scatter: "MYTHACRI.WeaponPropertyScatter",
      superheavy: "MYTHACRI.WeaponPropertySuperheavy",
      // Journeyman Properties
      rocket: "MYTHACRI.WeaponPropertyRocket",
      heat: "MYTHACRI.WeaponPropertyHeat",
      twinshot: "MYTHACRI.WeaponPropertyTwinshot"
    });
  }

  static _weaponProficiencies() {
    // The sections in the weapon proficiency config.
    foundry.utils.mergeObject(CONFIG.DND5E.weaponProficiencies, {
      firearmRen: "MYTHACRI.WeaponProficiencyFirearmRenPl",
      firearmInd: "MYTHACRI.WeaponProficiencyFirearmIndPl"
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
      firearmInd: "MYTHACRI.WeaponProficiencyFirearmInd"
    });

    // Weapon ids.
    // CONFIG.DND5E.weaponIds.gun = "<compendium id>.<item id>";
  }

  static _conditions() {
    // Add two new conditions to the token HUD.
    CONFIG.statusEffects.push({
      id: "dazed",
      label: "MYTHACRI.ConDazed",
      icon: "icons/svg/stoned.svg"
    }, {
      id: "impaired",
      label: "MYTHACRI.ConImpaired",
      icon: "icons/svg/tankard.svg"
    });

    // Add two new condition types available on the actor sheets.
    foundry.utils.mergeObject(CONFIG.DND5E.conditionTypes, {
      dazed: "MYTHACRI.ConDazed",
      impaired: "MYTHACRI.ConImpaired"
    });
  }

  static _currencies() {
    // Remove all currencies, replacing them with 'marbles'.
    foundry.utils.mergeObject(CONFIG.DND5E.currencies, {
      "-=cp": null,
      "-=sp": null,
      "-=ep": null,
      "-=gp": null,
      "-=pp": null,
      mrb: {
        abbreviation: "MYTHACRI.CurrencyAbbrMarbles",
        conversion: 1,
        label: "MYTHACRI.CurrencyMarbles"
      }
    }, {performDeletions: true});

    // Change currency weight (marbles weigh half as much as a coin).
    CONFIG.DND5E.encumbrance.currencyPerWeight.imperial *= 2;
    CONFIG.DND5E.encumbrance.currencyPerWeight.metric *= 2;
  }

  static _consumableTypes() {
    CONFIG.DND5E.consumableTypes.rune = "MYTHACRI.ConsumableRune";
    CONFIG.DND5E.consumableTypes.spirit = "MYTHACRI.ConsumableSpirit";
  }
}
