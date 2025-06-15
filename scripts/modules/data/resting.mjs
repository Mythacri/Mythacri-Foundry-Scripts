Hooks.on("dnd5e.preRestCompleted", _preRestCompleted);
Hooks.on("preCreateActor", _preCreateActor);

/* -------------------------------------------------- */

/**
 * On a long rest, reduce exhaustion by 1 point.
 * @param {Actor} actor       The actor taking a rest.
 * @param {object} result     Rest data. **will be mutated**
 */
function _preRestCompleted(actor, result) {
  if (result.longRest) {
    const exh = Math.max(actor.system.attributes.exhaustion - 1, 0);
    result.updateData["system.attributes.exhaustion"] = exh;
  }
}

/* -------------------------------------------------- */

/**
 * When a blank 'character' type actor is created, add `-@attributes.exhaustion` in appropriate fields.
 * @param {Actor} actor     The actor being created.
 */
function _preCreateActor(actor) {
  if (actor.type !== "character") return;
  const keys = [
    "spell.dc",
  ];
  const string = "@attributes.exhaustion";
  const update = {};
  for (const key of keys) {
    const prop = foundry.utils.getProperty(actor.system.bonuses, key);
    if (!prop.includes(string)) update[`system.bonuses.${key}`] = `${prop} - ${string}`.trim();
  }
  actor.updateSource(update);
}

/* -------------------------------------------------- */

export default {};
