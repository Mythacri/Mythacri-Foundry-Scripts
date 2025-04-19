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

  // Assign subtype icons.
  Object.assign(CONFIG.RegionBehavior.typeIcons, {
    [`${mythacri.id}.trap`]: data.regionBehaviors.TrapData.metadata.icon,
  });

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
Hooks.on("preCreateScene", hooks.preCreateScene);
Hooks.on("renderActorSheet5eCharacter2", hooks.feralRegression);
Hooks.on("renderPause", hooks.animatePause);
