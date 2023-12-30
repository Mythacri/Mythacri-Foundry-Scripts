import {StorageSheet} from "../applications/storage-sheet.mjs";
import {StorageData} from "./models/storage-actor.mjs";

export class Storage {
  /** Initialize module. */
  static init() {
    Object.assign(CONFIG.Actor.dataModels, {"mythacri-scripts.storage": StorageData});
    DocumentSheetConfig.registerSheet(Actor, "mythacri-scripts", StorageSheet, {
      types: ["mythacri-scripts.storage"], makeDefault: true, label: "MYTHACRI.SheetStorage"
    });
    Hooks.on("preCreateActiveEffect", Storage._cancelEffectCreation);
    Storage._patchActor();
  }

  /**
   * Prevent creation of ActiveEffects on the storage actor.
   * @param {ActiveEffect5e} effect     The effect to be created.
   * @param {object} context            Options that modify the creation.
   */
  static _cancelEffectCreation(effect) {
    if (effect.parent?.type === "mythacri-scripts.storage") return false;
  }

  /**
   * Patch the default Actor5e class due to roll data issues.
   */
  static _patchActor() {
    CONFIG.Actor.documentClass = class Actor5e extends CONFIG.Actor.documentClass {
      getRollData({deterministic = false} = {}) {
        if (this.type === "mythacri-scripts.storage") return {...this.system};
        return super.getRollData({deterministic});
      }
    }
  }
}
