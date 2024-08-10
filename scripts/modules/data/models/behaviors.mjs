import {MODULE} from "../../constants.mjs";

const {BooleanField, HTMLField, NumberField, SchemaField, StringField} = foundry.data.fields;

/**
 * Initialization function to register data models.
 */
export default function initializeBehaviors() {
  CONFIG.RegionBehavior.dataModels[`${MODULE.ID}.trap`] = TrapData;
  CONFIG.RegionBehavior.typeIcons[`${MODULE.ID}.trap`] = "fa-solid fa-person-falling-burst";
}

/**
 * Behavior type that configures a trap that prompts a saving throw and deals damage.
 */
class TrapData extends foundry.data.regionBehaviors.RegionBehaviorType {
  /** @override */
  static events = {
    [CONST.REGION_EVENTS.TOKEN_ENTER]: foundry.utils.debounce(TrapData.#onTokenMoveIn, 150)
  };

  /* -------------------------------------------------- */

  /** @override */
  static LOCALIZATION_PREFIXES = ["MYTHACRI.REGION.TRAP"];

  /* -------------------------------------------------- */

  /** @override */
  static defineSchema() {
    return {
      save: new SchemaField({
        targetValue: new NumberField({integer: true, initial: 15}),
        type: new StringField({
          choices: CONFIG.DND5E.abilities, required: true, initial: "dex"
        })
      }),
      damage: new SchemaField({
        formula: new dnd5e.dataModels.fields.FormulaField({
          required: true, validate: value => Roll.validate(value)
        }),
        type: new StringField({
          choices: CONFIG.DND5E.damageTypes, required: true, initial: "piercing"
        })
      }),
      config: new SchemaField({
        toggle: new BooleanField({initial: true}),
        message: new HTMLField({required: true})
      })
    };
  }

  /* -------------------------------------------------- */

  /**
   * The script that is executed when a token moves into the region.
   * @param {RegionEvent} event     The region event data from triggering this behavior.
   */
  static async #onTokenMoveIn(event) {
    const {data: {token}, user} = event;

    const gm = game.users.activeGM;
    if (![gm, user].includes(game.user)) return;

    const actor = token.actor;
    if (!actor) {
      ui.notifications.error("MYTHACRI.REGION.TRAP.WARNINGS.ActorMissing", {localize: true});
      return;
    }

    if (!this.damage.formula) {
      ui.notifications.error("MYTHACRI.REGION.TRAP.WARNINGS.FormulaMissing", {localize: true});
      return;
    }

    // GM only functions.
    if (game.user === gm) {
      if (this.config.toggle) await this.behavior.update({disabled: true});
    }

    // Triggering user functions.
    if (game.user === user) {
      const rollData = actor.getRollData();
      const roll = new CONFIG.Dice.DamageRoll(this.damage.formula, rollData, {type: this.damage.type});

      const template = "modules/mythacri-scripts/templates/behavior-trap-message.hbs";
      const context = {
        name: this.behavior.name,
        ability: this.save.type,
        label: game.i18n.format("DND5E.SaveDC", {
          dc: this.save.targetValue,
          ability: CONFIG.DND5E.abilities[this.save.type].label
        }),
        labelHidden: CONFIG.DND5E.abilities[this.save.type].label,
        dc: this.save.targetValue,
        message: this.config.message ? this.config.message : null
      };
      const html = await renderTemplate(template, context);

      // Get all targets.
      const targets = [];
      for (const token of this.scene.tokens) {
        if (token.regions.has(this.region)) {
          const actor = token.actor;
          if (actor) {
            targets.push({img: token.texture.src, name: token.name, uuid: actor.uuid});
          }
        }
      }

      await roll.toMessage({
        flavor: await TextEditor.enrichHTML(html, {rollData: rollData, relativeTo: actor}),
        speaker: gm ? {alias: gm.name} : undefined,
        "flags.dnd5e.targets": targets,
        "flags.dnd5e.roll.type": "damage"
      });
    }
  }
}
