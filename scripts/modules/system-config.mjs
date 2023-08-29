/* Utility class for additions, changes, and removals to the system configuration object. */
export class SystemConfig {
  static init() {
    SystemConfig._featureTypes();
    SystemConfig._languages();
    SystemConfig._activationTypes();
    SystemConfig._armorClasses();
    SystemConfig._weaponProperties();
    SystemConfig._weaponProficiencies();
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
          wardenManeuver: "MYTHACRI.FeatureWardenManeuver",
          witchHex: "MYTHACRI.FeatureWitchHex",
          witchGrandHex: "MYTHACRI.FeatureWitchGrandHex"
        }
      }
    });

    // Subtypes of entirely new feature types are not automatically prelocalized.
    dnd5e.utils.preLocalize("featureTypes.devilFruit.subtypes", {sort: true});
  }

  static _languages() {
    const changes = {
      steve: "MYTHACRI.LanguageSteve",

      "-=orc": null, // delete 'orc'
      "-=gith": null, // delete 'gith'
      "-=gnoll": null, // delete 'gnoll'
      "-=ignan": null, // delete 'ignan'
      "-=terran": null, // delete 'terran'
      "-=auran": null, // delete 'auran'
      "-=aquan": null, // delete 'aquan'
      "-=druidic": null, // delete 'druidic'
      "-=gnomish": null, // delete 'gnomish'
    };

    foundry.utils.mergeObject(CONFIG.DND5E.languages, changes, {performDeletions: true});
  }

  static _activationTypes() {
    foundry.utils.mergeObject(CONFIG.DND5E.abilityActivationTypes, {
      "-=legendary": null,
      mayhem: "MYTHACRI.ActivationMayhem"
    }, {performDeletions: true});
  }

  static _armorClasses() {
    foundry.utils.mergeObject(CONFIG.DND5E.armorClasses, {
      witch: {
        label: "MYTHACRI.ArmorClassWitch",
        formula: "10 + @abilities.dex.mod + @abilities.cha.mod"
      }
    });
  }

  static _weaponProperties() {
    foundry.utils.mergeObject(CONFIG.DND5E.weaponProperties, {
      parrying: "Parrying"
      scatter: "Scatter"
      superheavy: "Superheavy"
      scatter: "Scatter"

      //Journeyman Properties
      rocket: "Rocket"
      heat: "Heat"
      twinshot: "Twinshot"

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
    CONFIG.DND5E.weaponIds.gun = "<compendium id>.<item id>";
  }
}
