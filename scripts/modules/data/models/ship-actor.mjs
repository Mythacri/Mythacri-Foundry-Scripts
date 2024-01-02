/**
 * Data model for `storage` actors.
 * @property {object} currency
 * @property {object} capacity
 * @property {}
 */
export class ShipData extends dnd5e.dataModels.actor.VehicleData {
  /** @override */
  static defineSchema() {
    const schema = super.defineSchema();
    delete schema.cargo;
    delete schema.attributes.fields.ac.fields.motionless;
    delete schema.attributes.fields.actions;
    delete schema.attributes.fields.capacity.fields.creature;
    delete schema.attributes.fields.capacity.fields.cargo;
    schema.attributes.fields.capacity.fields.max = new foundry.data.fields.NumberField({integer: true, min: 0})
    delete schema.attributes.fields.hp.fields.dt;
    delete schema.attributes.fields.hp.fields.mt;
    return schema;
  }

  /** @override */
  prepareDerivedData() {
  }

  /** @override */
  async _preCreate(data, options, user) {
    const actor = this.parent;
    actor.updateSource({
      prototypeToken: {
        actorLink: true
      }
    });
  }
}
