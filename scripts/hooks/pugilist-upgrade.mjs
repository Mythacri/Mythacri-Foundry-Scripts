/**
 * Replace the first die of a pugilist weapon with a higher face if applicable.
 * @param {object} config       Roll configuration.
 * @param {object} dialog       Dialog configuration.
 * @param {object} message      Message configurtation.
 */
export default (config, dialog, message) => {
  if (config.attackMode === "twoHanded") return;
  const { data: rollData, parts } = config.rolls[0] ?? {};
  const item = config.subject?.item;
  const actor = item?.actor;
  const classes = actor?.classes ?? {};
  if (!parts?.length || !("pugilist" in classes) || !_isPugilistWeapon(item)) return;

  const rgx = /^[0-9]*d([0-9]+)/d;
  const match = rgx.exec(parts[0]);
  if (!match) return;
  const [start, end] = match.indices[1];
  const faces = parseInt(parts[0].slice(start, end));
  const pugilist = foundry.utils.getProperty(rollData, "scale.pugilist.fisticuffs.faces") ?? 0;
  if (pugilist < faces) return;
  const left = parts[0].slice(0, start);
  const right = parts[0].slice(end);
  const part = `${left}${pugilist}${right}`;
  parts[0] = part;
};

/**
 * Is this item a valid pugilist weapon?
 * @param {Item5e} item     An item that rolls damage.
 * @returns {boolean}       Whether it is a valid pugilist weapon.
 */
function _isPugilistWeapon(item) {
  if (item.type !== "weapon") return false;

  switch (item.system.type.value) {
    case "simpleM":
    case "improv":
      return true;
    case "martialM":
      return item.system.type.baseItem === "whip";
    default:
      return false;
  }
}
