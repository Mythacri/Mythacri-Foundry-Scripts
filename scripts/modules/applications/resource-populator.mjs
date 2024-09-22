import MODULE from "../constants.mjs";
import ResourcePopulatorModel from "../data/models/resource-populator.mjs";

/**
 * Prompt for populating an actor with lootable resources.
 * @param {Actor5e} actor     The actor to populate.
 */
async function populate(actor) {
  if (!actor || !["character", "npc"].includes(actor.type)) {
    throw new Error(`${actor?.name} is not a character or npc!`);
  }

  const model = new ResourcePopulatorModel();

  const options = {
    window: {
      title: game.i18n.format("MYTHACRI.CRAFTING.POPULATOR.Title", {name: actor.name})
    },
    position: {width: 600, height: "auto"},
    classes: ["resource-populator", "mythacri-scripts"]
  };

  const content = () => {
    const types = model.schema.getField("types");
    const formulas = model.schema.getField("formulas");
    const subsubtypes = mythacri.crafting.TYPES.subsubtypes;

    let html = "<fieldset>";

    html += types.toFormGroup({
      classes: ["stacked"],
      label: "MYTHACRI.CRAFTING.POPULATOR.label",
      hint: "MYTHACRI.CRAFTING.POPULATOR.hint"
    }, {
      name: "types",
      type: "checkboxes",
      localize: true,
      value: model.types,
      options: Object.entries(subsubtypes).map(([type, {label}]) => {
        return {label: label, value: type};
      })
    }).outerHTML;

    html += "</fieldset><fieldset>";

    for (const field of formulas) {
      html += field.toFormGroup({
        label: game.i18n.localize(subsubtypes[field.name].label),
        classes: model.types.has(field.name) ? [] : ["hidden"]
      }, {
        value: model.formulas[field.name],
        name: field.fieldPath
      }).outerHTML;
    }

    html += "</fieldset>";

    return html;
  };

  options.content = content();

  const render = (event, html) => {
    const input = html.querySelector("[name]");
    input.addEventListener("change", () => {
      const formData = new FormDataExtended(html.querySelector("form")).object;
      model.updateSource(formData);

      for (const input of html.querySelectorAll("[name^=formulas]")) {
        input.closest(".form-group").classList.toggle("hidden", !model.types.has(input.name.split(".").at(-1)));
      }
    });
  };

  options.render = render;

  const callback = async () => {
    for (const k of model.types) {
      const formula = model.formulas[k];
      if (!formula || !Roll.validate(formula)) model.updateSource({[`formulas.${k}`]: "1d2"});
    }

    const pack = game.settings.get(MODULE.ID, "identifiers").packs.craftingResources;
    const items = await pack.getDocuments({
      type: "loot",
      flags: {
        [MODULE.ID]: {
          resource: {
            type: "monster",
            subsubtype__in: Array.from(model.types)
          }
        }
      }
    });

    const list = foundry.utils.deepClone(actor.getFlag("simple-loot-list", "loot-list") ?? []);

    for (const [key, formula] of Object.entries(model.formulas)) {
      const item = items.find(item => item.flags[MODULE.ID].resource.subsubtype === key);
      if (item) throw new Error(`No item with monster part type '${key}' exists!`);

      const existing = list.find(entry => entry.uuid === item.uuid);
      if (existing) existing.quantity = dnd5e.dice.simplifyRollFormula(`${existing.quantity} + ${formula}`);
      else list.push({uuid: item.uuid, quantity: formula});
    }

    actor.setFlag("simple-loot-list", "loot-list", list);
  };

  options.ok = {callback: callback};

  foundry.applications.api.DialogV2.prompt(options);
}

/* -------------------------------------------------- */

export default {
  populate
};
