const {SchemaField, NumberField, StringField} = foundry.data.fields;

/* -------------------------------------------------- */

/**
 * Data model for `storage` actors.
 * @property {object} attributes
 * @property {object} attributes.capacity
 * @property {number} attributes.capacity.max
 * @property {string} attributes.capacity.type
 */
export default class StorageData extends dnd5e.dataModels.SystemDataModel.mixin(
  dnd5e.dataModels.shared.CurrencyTemplate
) {
  /** @override */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      attributes: new SchemaField({
        capacity: new SchemaField({
          max: new NumberField({positive: true, integer: true, initial: 100}),
          type: new StringField({
            required: true,
            initial: "quantity",
            choices: {
              quantity: "DND5E.Quantity",
              weight: "DND5E.Weight"
            }
          })
        })
      })
    });
  }

  /* -------------------------------------------------- */

  /** @override */
  static LOCALIZATION_PREFIXES = [
    "MYTHACRI.STORAGE"
  ];

  /* -------------------------------------------------- */

  /** @override */
  prepareDerivedData() {
    const cap = this.attributes.capacity;
    const isQty = cap.type === "quantity";

    let total = 0;

    for (const item of this.parent.items) {
      item.prepareFinalAttributes();
      if (isQty) total += (item.system.quantity || 0);
      else total += (item.system.weight?.value) * (item.system.quantity || 0);
    }

    this.attributes.capacity.value = Math.round(total);
    this.attributes.capacity.pct = Math.round(Math.clamp(total / this.attributes.capacity.max, 0, 1) * 100);
    this.attributes.capacity.overflow = total > this.attributes.capacity.max;
  }

  /* -------------------------------------------------- */

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
