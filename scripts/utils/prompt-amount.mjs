/**
 * Helper method to prompt for an amount of pips or marbles.
 * @param {string} [type]               The type to prompt for, either 'pip' or 'gp'.
 * @returns {Promise<number|null>}      The input amount, or null if cancelled.
 */
export default async function(type = "pip") {
  const label = game.i18n.localize("MYTHACRI." + ((type === "pip") ? "Pips" : "CurrencyMarbles"));

  const field = new foundry.data.fields.NumberField({
    label: label,
    integer: true,
    min: 1,
    nullable: false,
  }).toFormGroup({}, { name: "amount", value: 1 });

  const amount = await foundry.applications.api.DialogV2.prompt({
    rejectClose: false,
    content: `<fieldset>${field.outerHTML}</fieldset>`,
    window: { title: label },
    ok: {
      label: "Confirm",
      callback: (event, button) => button.form.elements.amount.valueAsNumber,
    },
    position: { width: 400, height: "auto" },
    modal: true,
  });
  if (!amount) return null;
  return amount;
}
