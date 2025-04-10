/** Define full rest. */
export default () => {
  CONFIG.DND5E.restTypes.full = {
    duration: { normal: 1440, gritty: 10080, epic: 120 },
    recoverHitDice: true,
    recoverHitPoints: true,
    recoverPeriods: ["sr", "lr"],
    recoverSpellSlotTypes: new Set(["leveled", "pact"]),
  };

  foundry.utils.setProperty(CONFIG.DND5E.restTypes, "long.recoverHitPoints", false);
};
