/** Merge in new character flags. */
export default () => {
  CONFIG.DND5E.characterFlags.peakPhysical = {
    name: "MYTHACRI.FlagsPeakPhysical",
    hint: "MYTHACRI.FlagsPeakPhysicalHint",
    section: "DND5E.Feats",
    type: Boolean,
  };

  CONFIG.DND5E.characterFlags.feralRegression = {
    name: "MYTHACRI.FlagsFeralRegression",
    hint: "MYTHACRI.FlagsFeralRegressionHint",
    section: "DND5E.RacialTraits",
    type: Boolean,
  };
};
