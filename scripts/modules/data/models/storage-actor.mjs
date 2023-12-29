import {StorageSheet} from "../../applications/storage-sheet.mjs";

/**
 * Data model for `storage` actors.
 * @property {object} currency
 * @property {object} capacity
 * @property {}
 */
export class StorageData extends dnd5e.dataModels.SystemDataModel.mixin() {
  /** @override */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      currency: {},
      capacity: {}
    });
  }

  static init() {
    Object.assign(CONFIG.Item.dataModels, {"mythacri-scripts.storage": StorageData});
    DocumentSheetConfig.registerSheet(Actor, "mythacri-scripts", StorageSheet, {
      types: ["mythacri-scripts.storage"], makeDefault: true, label: "MYTHACRI.SheetStorage"
    });
  }
}
