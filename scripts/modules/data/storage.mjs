import {StorageSheet} from "../applications/storage-sheet.mjs";
import {StorageData} from "./models/storage-actor.mjs";

/** Utility class for anything related to the storage actor and sheet. */
export class Storage {
  /** Initialize module. */
  static init() {
    Object.assign(CONFIG.Actor.dataModels, {"mythacri-scripts.storage": StorageData});
    DocumentSheetConfig.registerSheet(Actor, "mythacri-scripts", StorageSheet, {
      types: ["mythacri-scripts.storage"], makeDefault: true, label: "MYTHACRI.SheetStorage"
    });
    Hooks.on("preCreateActiveEffect", Storage._cancelEffectCreation);
  }

  /**
   * Prevent creation of ActiveEffects on the storage actor.
   * @param {ActiveEffect5e} effect     The effect to be created.
   * @param {object} context            Options that modify the creation.
   */
  static _cancelEffectCreation(effect) {
    if (effect.parent?.type === "mythacri-scripts.storage") return false;
  }
}
