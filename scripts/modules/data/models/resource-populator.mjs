import {Crafting} from "../crafting.mjs";

/** Utility model for holding and refreshing data when creating loot on an actor. */
export class ResourcePopulatorModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      types: new fields.SchemaField(Object.entries(Crafting.subsubtypes).reduce((acc, [key, {label}]) => {
        acc[key] = new fields.SchemaField({
          active: new fields.BooleanField({initial: true}),
          formula: new fields.StringField({initial: "1d2", required: true}),
        }, {label: label});
        return acc;
      }, {}))
    };
  }
}
