import * as applications from "./scripts/applications/_module.mjs";
import * as canvas from "./scripts/canvas/_module.mjs";
import * as data from "./scripts/data/_module.mjs";
import * as hooks from "./scripts/hooks/_module.mjs";
import * as utils from "./scripts/utils/_module.mjs";

globalThis.mythacri = {
  applications,
  canvas,
  data,
  utils,
  id: "mythacri-scripts",
};

/* -------------------------------------------------- */

Hooks.once("init", () => {
  // Assign data models.
  Object.assign(CONFIG.RegionBehavior.dataModels, {
    [`${mythacri.id}.trap`]: data.regionBehaviors.TrapData,
  });
  Object.assign(CONFIG.Actor.dataModels, {
    [`${mythacri.id}.storage`]: data.actors.StorageData,
  });

  // Assign subtype icons.
  Object.assign(CONFIG.RegionBehavior.typeIcons, {
    [`${mythacri.id}.trap`]: data.regionBehaviors.TrapData.metadata.icon,
  });
  Object.assign(CONFIG.Actor.typeIcons, {
    [`${mythacri.id}.storage`]: "fa-solid fa-box-archive",
  });

  // Register document sheets.
  foundry.applications.apps.DocumentSheetConfig.registerSheet(
    foundry.documents.Actor,
    mythacri.id,
    applications.sheets.StorageSheet,
    {
      types: [`${mythacri.id}.storage`],
      makeDefault: true,
      label: "MYTHACRI.STORAGE.SheetLabel",
    },
  );

  hooks.expLevels();
  hooks.activationTypes();
  hooks.armorClasses();
  hooks.proficiencies();
  hooks.characterFlags();
  hooks.statusConditions();
  hooks.consumableTypes();
  hooks.currencies();
  hooks.dieSteps();
  hooks.featureTypes();
  hooks.languages();
  hooks.restTypes();
  hooks.spellcastingProgressions();
  hooks.weaponProperties();
});

/* -------------------------------------------------- */

Hooks.once("ready", () => {
  hooks.enableExperience();
});

/* -------------------------------------------------- */

Hooks.on("dnd5e.preRollDamageV2", hooks.pugilistUpgrade);
Hooks.on("preCreateActiveEffect", hooks.preCreateActiveEffect);
Hooks.on("preCreateScene", hooks.preCreateScene);
Hooks.on("renderActorSheet5eCharacter2", hooks.feralRegression);
Hooks.on("renderPause", hooks.animatePause);
