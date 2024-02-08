/* Utility class for additions, changes, and removals to the system configuration object. */
export class SystemConfig {
  static init() {
    SystemConfig._featureTypes();
    SystemConfig._languages();
    SystemConfig._activationTypes();
    SystemConfig._armorClasses();
    SystemConfig._weaponProperties();
    SystemConfig._weaponProficiencies();
    SystemConfig._armorProficencies();
    SystemConfig._conditions();
    SystemConfig._currencies();
    SystemConfig._consumableTypes();
    SystemConfig._characterFlags();
    SystemConfig._spellProgression();
    SystemConfig._toolProficiencies();
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
          moxie: "MYTHACRI.FeatureMoxie",
          rangerAspect: "MYTHACRI.FeatureRangerAspect",
          wardenManeuver: "MYTHACRI.FeatureWardenManeuver",
          wardenSentinelSoul: "MYTHACRI.FeatureWardenSentinelSoul",
          wardenSentinelStand: "MYTHACRI.FeatureWardenSentinelStand",
          wardenSentinelStep: "MYTHACRI.FeatureWardenSentinelStep",
          witchCurse: "MYTHACRI.FeatureWitchCurse",
          witchGrandHex: "MYTHACRI.FeatureWitchGrandHex",
          witchHex: "MYTHACRI.FeatureWitchHex",
          bewitcherCurse: "MYTHACRI.FeatureBewitcherCurse",
          bewitcherGrandEnchantment: "MYTHACRI.FeatureBewitcherGrandEnchantment"
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
      "-=druidic": null, // delete 'druidic'
      "exotic.children.-=gith": null, // delete 'gith'
      "exotic.children.-=gnoll": null, // delete 'gnoll'
      "exotic.children.primordial.-=children": null, // delete 'ignan, terran, auran, aquan'
      "standard.children.-=gnomish": null, // delete 'gnomish'
      "standard.children.-=orc": null // delete 'orc'
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
      },
      ironChin: {
        label: "MYTHACRI.ArmorClassIronChin",
        formula: "12 + @abilities.con.mod"
      }
    });
  }

  static _weaponProperties() {
    const properties = {
      aerodynamic: {label: "MYTHACRI.WeaponPropertyAerodynamic"},
      concealable: {label: "MYTHACRI.WeaponPropertyConcealable"},
      scatter: {label: "MYTHACRI.WeaponPropertyScatter"},
      sighted: {label: "MYTHACRI.WeaponPropertySighted"},
      superheavy: {label: "MYTHACRI.WeaponPropertySuperheavy"},
      parrying: {label: "MYTHACRI.WeaponPropertyParry"},
      explosive: {label: "MYTHACRI.WeaponPropertyExplosive", isJourneyman: true},
      heat: {label: "MYTHACRI.WeaponPropertyHeat", isJourneyman: true},
      massive: {label: "MYTHACRI.WeaponPropertyMassive", isJourneyman: true},
      mounted: {label: "MYTHACRI.WeaponPropertyMounted", isJourneyman: true},
      rocket: {label: "MYTHACRI.WeaponPropertyRocket", isJourneyman: true},
      tension: {label: "MYTHACRI.WeaponPropertyTension", isJourneyman: true},
      twinshot: {label: "MYTHACRI.WeaponPropertyTwinshot", isJourneyman: true},
      coldIron: {label: "MYTHACRI.WeaponPropertyColdIron", isPhysical: true}
    };
    for (const [k, v] of Object.entries(properties)) {
      CONFIG.DND5E.itemProperties[k] = v;
      CONFIG.DND5E.validProperties.weapon.add(k);
    }
  }

  static _weaponProficiencies() {
    // The sections in the weapon proficiency config.
    foundry.utils.mergeObject(CONFIG.DND5E.weaponProficiencies, {
      firearmRen: "MYTHACRI.WeaponProficiencyFirearmRenPl",
      firearmInd: "MYTHACRI.WeaponProficiencyFirearmIndPl",
      exotic: "MYTHACRI.WeaponProficiencyExoticPl"
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
      exotic: "MYTHACRI.WeaponProficiencyExotic"
    });

    // Weapon ids.
    CONFIG.DND5E.weaponIds.assaultRifle = "mythacri-shared-compendium.equipment-myth.2mg0Z9UsSTCv9hw2";
    CONFIG.DND5E.weaponIds.huntingRifle = "mythacri-shared-compendium.equipment-myth.WHXDLxF6lJ6toaMm";
    CONFIG.DND5E.weaponIds.machineGun = "mythacri-shared-compendium.equipment-myth.k7PvZwWEDYWJNVtH";
    CONFIG.DND5E.weaponIds.pistol = "mythacri-shared-compendium.equipment-myth.jY3XQOpCfp8rRF2l";
    CONFIG.DND5E.weaponIds.revolver = "mythacri-shared-compendium.equipment-myth.i8Ysr1zn74h8jxlr";
    CONFIG.DND5E.weaponIds.doubleBarrelShotgun = "mythacri-shared-compendium.equipment-myth.RkMpHsAsAgFsl6OP";
    CONFIG.DND5E.weaponIds.blunderbuss = "mythacri-shared-compendium.equipment-myth.U9xCVu4nMr2o4Ip0";
    CONFIG.DND5E.weaponIds.flintlock = "mythacri-shared-compendium.equipment-myth.csl5Lu9LCoD8ZnwD";
    CONFIG.DND5E.weaponIds.musket = "mythacri-shared-compendium.equipment-myth.J6kVMp2X9WrUoRzT";
    CONFIG.DND5E.weaponIds.pepperbox = "mythacri-shared-compendium.equipment-myth.qdwtzYWwQ7Ac3Goj";

    CONFIG.DND5E.weaponIds.cutlass = "mythacri-shared-compendium.equipment-myth.9r8gPk4RGDUUytZy";
    CONFIG.DND5E.weaponIds.estoc = "mythacri-shared-compendium.equipment-myth.xw77ea4rCFnpHgNy";
    CONFIG.DND5E.weaponIds.harpoon = "mythacri-shared-compendium.equipment-myth.EanNQeIbvCMz03w5";
    CONFIG.DND5E.weaponIds.throwingDagger = "mythacri-shared-compendium.equipment-myth.5fAnwS37xiOTwpOS";

    CONFIG.DND5E.weaponIds.fishhook = "mythacri-shared-compendium.equipment-myth.lQqGpkcldeOKwZM0";
    CONFIG.DND5E.weaponIds.shovel = "mythacri-shared-compendium.equipment-myth.1D0WRHGVgbjaikkM";
    CONFIG.DND5E.weaponIds.machete = "mythacri-shared-compendium.equipment-myth.06hcru0PpE0Q33Av";

    CONFIG.DND5E.weaponIds.volleyGun = "mythacri-shared-compendium.equipment-myth.HHePiOzWRtjYjcl6";
    CONFIG.DND5E.weaponIds.duckfootPistol = "mythacri-shared-compendium.equipment-myth.GthTZpxLEVrMHQMm";
    CONFIG.DND5E.weaponIds.greatspear = "mythacri-shared-compendium.equipment-myth.YK1KjJ1qtDJlppVd";
    CONFIG.DND5E.weaponIds.greatbow = "mythacri-shared-compendium.equipment-myth.XPPoSL8Xhp2gYZPn";
    CONFIG.DND5E.weaponIds.grimScythe = "mythacri-shared-compendium.equipment-myth.Gx1ChtHKXEE5AEfN";
    CONFIG.DND5E.weaponIds.goliathSling = "mythacri-shared-compendium.equipment-myth.8lqu07cKqDTt6qeE";
    CONFIG.DND5E.weaponIds.portableBallista = "mythacri-shared-compendium.equipment-myth.52ayA03VImoL1361";
  }

  static _toolProficiencies() {
    // Tool ids.
    // CONFIG.DND5E.toolIds.gun = "<compendium id>.<item id>";
    CONFIG.DND5E.toolIds.piano = "mythacri-shared-compendium.equipment-myth.AMehut6zpyXifMqo";
  }

  static _armorProficencies() {
    CONFIG.DND5E.shieldIds.bucklerShield = "mythacri-shared-compendium.equipment-myth.NhBHlkBDDLBKkxGL";
    CONFIG.DND5E.shieldIds.towerShield = "mythacri-shared-compendium.equipment-myth.LzlPn07cT6FPV1fs";
  }

  static _spellProgression(){
    CONFIG.DND5E.spellcastingTypes.leveled.progression.bewitcher = {label: "MYTHACRI.Bewitcher", divisor: 100};
    CONFIG.DND5E.spellProgression.bewitcher = "MYTHACRI.Bewitcher";
  }

  static _conditions() {
    // Add two new conditions to the token HUD.
    const effects = {
      dazed: {
        label: "MYTHACRI.ConDazed",
        icon: "icons/svg/stoned.svg",
        reference: "", // uuid to a journal page
      },
      impaired: {
        label: "MYTHACRI.ConImpaired",
        icon: "icons/svg/tankard.svg",
        reference: ""
      }
    };

    for (const [k, v] of Object.entries(effects)) {
      CONFIG.statusEffects.push({
        id: k,
        name: v.label,
        icon: v.icon,
        reference: v.reference
      });
      CONFIG.DND5E.conditionTypes[k] = v;
    }

    // Modify exhaustion.
    CONFIG.DND5E.conditionEffects.halfHealth?.delete("exhaustion-4");
    CONFIG.DND5E.conditionEffects.halfMovement.delete("exhaustion-2");
    CONFIG.DND5E.conditionEffects.noMovement.delete("exhaustion-5");
    CONFIG.DND5E.conditionTypes.exhaustion.levels = 10;
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
    CONFIG.DND5E.consumableTypes.rune = {label: "MYTHACRI.ConsumableRune"};
    CONFIG.DND5E.consumableTypes.spirit = {label: "MYTHACRI.ConsumableSpirit"};
  }

  static _characterFlags() {
    CONFIG.DND5E.characterFlags.peakPhysical = {
      hint: "MYTHACRI.FlagsPeakPhysicalHint",
      name: "MYTHACRI.FlagsPeakPhysicalName",
      section: "DND5E.Feats",
      type: Boolean
    };
  }
}
