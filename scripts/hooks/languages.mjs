/** Merge in new and remove some old languages. */
export default () => {
  foundry.utils.mergeObject(CONFIG.DND5E.languages, {
    "-=druidic": null, // delete 'druidic'
    "exotic.children.-=gith": null, // delete 'gith'
    "exotic.children.-=gnoll": null, // delete 'gnoll'
    "exotic.children.primordial.-=children": null, // delete 'ignan, terran, auran, aquan'
    "standard.children.-=gnomish": null, // delete 'gnomish'
    "standard.children.-=orc": null, // delete 'orc'
    "standard.childern.-=dwarvish": null,
  }, { performDeletions: true });
};
