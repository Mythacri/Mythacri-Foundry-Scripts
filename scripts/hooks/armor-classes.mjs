/** Merge in new armor class calculations. */
export default () => {
  foundry.utils.mergeObject(CONFIG.DND5E.armorClasses, {
    witchCurseFeral: {
      label: "MYTHACRI.ArmorClassFeral",
      formula: "13 + @abilities.dex.mod",
    },
    grandHexHybrid: {
      label: "MYTHACRI.ArmorClassHybrid",
      formula: "10 + @abilities.dex.mod + @abilities.cha.mod",
    },
    hexMalevolence: {
      label: "MYTHACRI.ArmorClassMalevolence",
      formula: "12 + @abilities.dex.mod + @abilities.cha.mod",
    },
    ironChin: {
      label: "MYTHACRI.ArmorClassIronChin",
      formula: "12 + @abilities.con.mod",
    },
  });
};
