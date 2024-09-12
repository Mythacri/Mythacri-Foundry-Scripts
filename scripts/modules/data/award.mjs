Hooks.once("init", _expLevels);
Hooks.once("ready", _enableExperience);

/* -------------------------------------------------- */

/**
 * Set character experience thresholds.
 */
function _expLevels() {
  CONFIG.DND5E.CHARACTER_EXP_LEVELS = Array.fromRange(20).map(n => 10 * n);
}

/* -------------------------------------------------- */

/**
 * Forcibly enable experience tracking.
 */
function _enableExperience() {
  if (!game.user.isGM) return;
  game.settings.set("dnd5e", "disableExperienceTracking", false);
}

/* -------------------------------------------------- */

/**
 * Award all player-owned character-type actors with pips.
 * @param {object} [options]                Options to modify the awarding.
 * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
 * @param {number} [options.amount]         The amount of pips to grant.
 * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
 * @returns {Promise}
 */
async function grantPip({assigned = false, amount = null, each = true} = {}) {
  amount ??= await _promptAmount("pip");
  if (!amount) return;
  const destinations = _getDestinations(assigned);
  const results = new Map();
  await dnd5e.applications.Award.awardXP(amount, destinations, {each, results});
  return dnd5e.applications.Award.displayAwardMessages(results);
}

/* -------------------------------------------------- */

/**
 * Award all player-owned character-type actors with marbles.
 * @param {object} [options]                Options to modify the awarding.
 * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
 * @param {number} [options.amount]         The amount to grant.
 * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
 * @returns {Promise}
 */
async function grantMarbles({assigned = false, amount = null, each = false} = {}) {
  amount ??= await _promptAmount("mrb");
  if (!amount) return;
  const destinations = _getDestinations(assigned);
  const results = new Map();
  await dnd5e.applications.Award.awardCurrency({mrb: amount}, destinations, {each, results});
  return dnd5e.applications.Award.displayAwardMessages(results);
}

/* -------------------------------------------------- */

/**
 * Helper method to get all player owned characters.
 * @param {boolean} [assigned]      Whether to restrict to assigned actors.
 * @returns {Actor5e[]}             Player-owned characters.
 */
function _getDestinations(assigned = false) {
  return game.actors.reduce((acc, actor) => {
    if ((actor.type !== "character") || !actor.hasPlayerOwner) return acc;
    if (assigned && !game.users.some(user => user.character === actor)) return acc;
    acc.push(actor);
    return acc;
  }, []);
}

/* -------------------------------------------------- */

/**
 * Helper method to prompt for an amount of pips or marbles.
 * @param {string} [type]               The type to prompt for, either 'pip' or 'mrb'.
 * @returns {Promise<number|null>}      The input amount, or null if cancelled.
 */
async function _promptAmount(type = "pip") {
  const label = game.i18n.localize("MYTHACRI." + ((type === "pip") ? "Pips" : "CurrencyMarbles"));

  const field = new foundry.data.fields.NumberField({
    label: label,
    integer: true,
    min: 1,
    nullable: false
  }).toFormGroup({}, {name: "amount", value: 1});

  const amount = await foundry.applications.api.DialogV2.prompt({
    rejectClose: false,
    content: `<fieldset>${field.outerHTML}</fieldset>`,
    window: {title: label},
    ok: {
      label: "Confirm",
      callback: (event, button) => button.form.elements.amount.valueAsNumber
    },
    position: {width: 400, height: "auto"},
    modal: true
  });
  if (!amount) return null;
  return amount;
}

/* -------------------------------------------------- */

export default {
  grantMarbles,
  grantPip
};
