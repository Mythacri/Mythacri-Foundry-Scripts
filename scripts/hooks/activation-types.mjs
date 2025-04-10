/** Merge in new activation types. */
export default () => {
  const activations = {
    mayhem: {
      group: "DND5E.ACTIVATION.Category.Monster",
      label: "MYTHACRI.MAYHEM.Action",
      scalar: true,
    },
  };

  foundry.utils.mergeObject(CONFIG.DND5E.activityActivationTypes, activations);
  for (const [k, v] of Object.entries(activations)) {
    CONFIG.DND5E.abilityActivationTypes[k] = v.label;
  }
};
