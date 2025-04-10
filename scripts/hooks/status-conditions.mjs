/** Merge in new custom conditions and configure their effects. */
export default () => {
  // Modify exhaustion.
  CONFIG.DND5E.conditionEffects.halfHealth.delete("exhaustion-4");
  CONFIG.DND5E.conditionEffects.halfMovement.delete("exhaustion-2");
  CONFIG.DND5E.conditionEffects.noMovement.delete("exhaustion-5");

  const exhaustionData = CONFIG.DND5E.conditionTypes.exhaustion;
  const exhaustionEffect = CONFIG.statusEffects.find(e => e.id === "exhaustion");

  foundry.utils.mergeObject(exhaustionData, {
    levels: 10,
    img: "modules/mythacri-scripts/assets/statuses/exhaustion.svg",
    icon: "modules/mythacri-scripts/assets/statuses/exhaustion.svg",
    reference: "Compendium.mythacri-shared-compendium.journals-myth.JournalEntry.nD9KF9ezmvqmlN61.JournalEntryPage.adMJ3j1HBbTJKCyY",
    reduction: { rolls: 1, speed: 0 },
  }, { insertKeys: false });

  // TODO: Not needed with dnd5e v4.4. https://github.com/foundryvtt/dnd5e/pull/5351
  foundry.utils.mergeObject(exhaustionEffect, exhaustionData, { insertKeys: false });
};
