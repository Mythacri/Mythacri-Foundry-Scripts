import {StorageSheet} from "../applications/storage-sheet.mjs";
import {StorageData} from "./models/storage-actor.mjs";

Hooks.once("init", _assign);
Hooks.on("preCreateActiveEffect", _cancelEffectCreation);

/* -------------------------------------------------- */

/**
 * Assign storage actor data model and actor sheet.
 */
function _assign() {
  Object.assign(CONFIG.Actor.dataModels, {"mythacri-scripts.storage": StorageData});
  DocumentSheetConfig.registerSheet(Actor, "mythacri-scripts", StorageSheet, {
    types: ["mythacri-scripts.storage"], makeDefault: true, label: "MYTHACRI.SheetStorage"
  });
}

/* -------------------------------------------------- */

/**
 * Prevent creation of ActiveEffects on the storage actor.
 * @param {ActiveEffect5e} effect     The effect to be created.
 * @param {object} context            Options that modify the creation.
 */
function _cancelEffectCreation(effect) {
  if (effect.parent?.type === "mythacri-scripts.storage") return false;
}

/* -------------------------------------------------- */

export default {};
