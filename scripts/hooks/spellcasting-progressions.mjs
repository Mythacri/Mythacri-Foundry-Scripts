/** Merge in new shield progression types. */
export default () => {
  CONFIG.DND5E.spellcastingTypes.leveled.progression.bewitcher = { label: "MYTHACRI.SPELLCASTING.Bewitcher", divisor: 100 };
  CONFIG.DND5E.spellProgression.bewitcher = "MYTHACRI.SPELLCASTING.Bewitcher";
};
