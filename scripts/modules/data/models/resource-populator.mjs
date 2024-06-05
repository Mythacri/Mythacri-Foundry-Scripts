import {Crafting} from "../crafting.mjs";

const {SchemaField, BooleanField, StringField} = foundry.data.fields;

/** Utility model for holding and refreshing data when creating loot on an actor. */
export class ResourcePopulatorModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    return {
      types: new SchemaField(Object.entries(Crafting.subsubtypes).reduce((acc, [key, {label}]) => {
        acc[key] = new SchemaField({
          active: new BooleanField({initial: true}),
          formula: new StringField({initial: "1d2", required: true}),
        }, {label: label});
        return acc;
      }, {}))
    };
  }
}
