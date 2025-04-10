/**
 * Prefix for any compendium items for the purpose of proficiencies.
 * @type {string}
 */
const PREFIX = "Compendium.mythacri-shared-compendium.equipment-myth.Item";

/* -------------------------------------------------- */

/** Merge in new armor and shield proficiencies. */
export default () => {
  const shieldIds = {
    bucklerShield: "NhBHlkBDDLBKkxGL",
    towerShield: "LzlPn07cT6FPV1fs",
  };
  for (const [k, id] of Object.entries(shieldIds)) {
    CONFIG.DND5E.shieldIds[k] = `${PREFIX}.${id}`;
  }

  const toolIds = {
    piano: "AMehut6zpyXifMqo",
  };
  for (const [k, id] of Object.entries(toolIds)) {
    CONFIG.DND5E.tools[k] = { ability: "dex", id: `${PREFIX}.${id}` };
  }

  // The sections in the weapon proficiency config.
  foundry.utils.mergeObject(CONFIG.DND5E.weaponProficiencies, {
    firearmRen: "MYTHACRI.WeaponProficiencyFirearmRenPl",
    firearmInd: "MYTHACRI.WeaponProficiencyFirearmIndPl",
    exotic: "MYTHACRI.WeaponProficiencyExoticPl",
  });
  // The weapon type itself, as an option in an item sheet.
  foundry.utils.mergeObject(CONFIG.DND5E.weaponTypes, {
    firearmRen: "MYTHACRI.WeaponProficiencyFirearmRen",
    firearmInd: "MYTHACRI.WeaponProficiencyFirearmInd",
    exotic: "MYTHACRI.WeaponProficiencyExotic",
  });
  // Weapon ids.
  const weaponIds = {
    assaultRifle: "2mg0Z9UsSTCv9hw2",
    blunderbuss: "U9xCVu4nMr2o4Ip0",
    cutlass: "9r8gPk4RGDUUytZy",
    doubleBarrelShotgun: "RkMpHsAsAgFsl6OP",
    duckfootPistol: "GthTZpxLEVrMHQMm",
    estoc: "xw77ea4rCFnpHgNy",
    fishhook: "lQqGpkcldeOKwZM0",
    flintlock: "csl5Lu9LCoD8ZnwD",
    goliathSling: "8lqu07cKqDTt6qeE",
    greatbow: "XPPoSL8Xhp2gYZPn",
    greatspear: "YK1KjJ1qtDJlppVd",
    grimScythe: "Gx1ChtHKXEE5AEfN",
    harpoon: "EanNQeIbvCMz03w5",
    huntingRifle: "WHXDLxF6lJ6toaMm",
    machete: "06hcru0PpE0Q33Av",
    machineGun: "k7PvZwWEDYWJNVtH",
    musket: "J6kVMp2X9WrUoRzT",
    pepperbox: "qdwtzYWwQ7Ac3Goj",
    pistol: "jY3XQOpCfp8rRF2l",
    portableBallista: "52ayA03VImoL1361",
    revolver: "i8Ysr1zn74h8jxlr",
    shovel: "1D0WRHGVgbjaikkM",
    throwingDagger: "5fAnwS37xiOTwpOS",
    volleyGun: "HHePiOzWRtjYjcl6",
  };
  for (const [k, id] of Object.entries(weaponIds)) {
    CONFIG.DND5E.weaponIds[k] = `${PREFIX}.${id}`;
  }
};
