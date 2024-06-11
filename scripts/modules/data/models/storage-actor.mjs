const {SchemaField, NumberField, StringField} = foundry.data.fields;

/**
 * Data model for `storage` actors.
 * @property {object} currency
 * @property {object} capacity
 * @property {}
 */
export class StorageData extends dnd5e.dataModels.SystemDataModel.mixin(
  dnd5e.dataModels.shared.CurrencyTemplate
) {
  /** @override */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      attributes: new SchemaField({
        capacity: new SchemaField({
          max: new NumberField({positive: true, integer: true, initial: 100}),
          type: new StringField({required: true, initial: "quantity"})
        })
      })
    });
  }

  /** @override */
  prepareDerivedData() {
    const cap = this.attributes.capacity;
    const isQty = cap.type === "quantity";
    const total = this.parent.items.reduce((acc, item) => {
      if (isQty) return acc + (item.system.quantity || 0);
      return acc + (item.system.weight || 0) * (item.system.quantity || 0);
    }, 0);
    this.attributes.capacity.value = Math.round(total);
    this.attributes.capacity.pct = Math.round(Math.clamped(total / this.attributes.capacity.max, 0, 1) * 100);
    this.attributes.capacity.overflow = total > this.attributes.capacity.max;
  }

  /** @override */
  async _preCreate(data, options, user) {
    const actor = this.parent;
    actor.updateSource({
      prototypeToken: {
        actorLink: true,
        "bar1.attribute": null,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        displayName: CONST.TOKEN_DISPLAY_MODES.NONE,
        displayBars: CONST.TOKEN_DISPLAY_MODES.NONE
      }
    });
  }
}
