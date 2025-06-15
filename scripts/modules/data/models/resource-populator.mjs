const {SchemaField, SetField, StringField} = foundry.data.fields;

/* -------------------------------------------------- */

/** Utility model for holding and refreshing data when creating loot on an actor. */
export default class ResourcePopulatorModel extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    const types = mythacri.crafting.TYPES.monsterSubsubtypes;
    return {
      types: new SetField(new StringField()),
      formulas: new SchemaField(Object.keys(types).reduce((acc, key) => {
        acc[key] = new StringField({initial: "1d2", required: true});
        return acc;
      }, {})),
    };
  }
}
