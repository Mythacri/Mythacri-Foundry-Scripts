/** Merge in new feature types. */
export default () => {
  foundry.utils.mergeObject(CONFIG.DND5E.featureTypes, {
    devilFruit: {
      label: "MYTHACRI.FeatureDevilFruit",
      subtypes: {
        logia: "MYTHACRI.FeatureDevilFruitLogia",
        zoan: "MYTHACRI.FeatureDevilFruitZoan",
        paramecia: "MYTHACRI.FeatureDevilFruitParamecia",
      },
    },
    companion: {
      label: "MYTHACRI.FeatureCompanion",
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
        bewitcherGrandEnchantment: "MYTHACRI.FeatureBewitcherGrandEnchantment",
      },
    },
    spiritTech: {
      label: "MYTHACRI.FeatureSpiritTech",
    },
  });

  // Subtypes of entirely new feature types are not automatically prelocalized.
  dnd5e.utils.preLocalize("featureTypes.devilFruit.subtypes", { sort: true });
};
