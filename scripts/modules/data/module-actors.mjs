import {ShipSheet} from "../applications/ship-sheet.mjs";
import {StorageSheet} from "../applications/storage-sheet.mjs";
import {ShipData} from "./models/ship-actor.mjs";
import {StorageData} from "./models/storage-actor.mjs";

/**
 * Utility class for module actor subtypes.
 */
export class ModuleActors {
  /** Initialize module. */
  static init() {
    Object.assign(CONFIG.Actor.dataModels, {"mythacri-scripts.storage": StorageData});
    Object.assign(CONFIG.Actor.dataModels, {"mythacri-scripts.ship": ShipData});
    DocumentSheetConfig.registerSheet(Actor, "mythacri-scripts", StorageSheet, {
      types: ["mythacri-scripts.storage"], makeDefault: true, label: "MYTHACRI.SheetStorage"
    });
    DocumentSheetConfig.registerSheet(Actor, "mythacri-scripts", ShipSheet, {
      types: ["mythacri-scripts.ship"], makeDefault: true, label: "MYTHACRI.SheetShip"
    });
    Hooks.on("preCreateActiveEffect", ModuleActors._cancelEffectCreation);
    ModuleActors._patchActor();
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
