/** Merge in new and remove some old currencies, and change the weight of 'coin'. */
export default () => {
  // Rename currencies to marbles, remove EP.
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
  }, { performDeletions: true });

  // Change currency weight (marbles weigh half as much as a coin).
  CONFIG.DND5E.encumbrance.currencyPerWeight.imperial *= 2;
  CONFIG.DND5E.encumbrance.currencyPerWeight.metric *= 2;
};
