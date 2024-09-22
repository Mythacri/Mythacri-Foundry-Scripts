Hooks.on("dnd5e.preLongRest", _preLongRest);
Hooks.on("dnd5e.preRestCompleted", _preRestCompleted);
Hooks.on("preCreateActor", _preCreateActor);
Hooks.on("renderActorSheet5eCharacter2", _renderCharacterSheet);
Hooks.on("renderLongRestDialog", _renderLongRestDialog);
Hooks.once("init", () => dnd5e.documents.Actor5e.prototype.fullRest = fullRestDialog);

/* -------------------------------------------------- */

/** Change the hit die fractio on long rests. */
function _preLongRest(actor, config) {
  config.fraction = actor.flags.dnd5e?.peakPhysical ? 1 : 0.5;
}

/* -------------------------------------------------- */

/**
 * Do not recover full amount of hp on a long rest, and reduce exhaustion by 1.
 * @param {Actor} actor       The actor taking a rest.
 * @param {object} result     Rest data. **will be mutated**
 */
function _preRestCompleted(actor, result) {
  if (result.longRest) {
    const isPeak = actor.flags.dnd5e?.peakPhysical ?? false;
    const exh = Math.max(actor.system.attributes.exhaustion - (isPeak ? 2 : 1), 0);
    foundry.utils.setProperty(result.updateData, "system.attributes.exhaustion", exh);
  }
}

/* -------------------------------------------------- */

/**
 * Display new buttons in the default LongRestDialog.
 * @param {LongRestDialog} dialog     The rendered long rest dialog.
 * @param {HTMLElement} html          The element of the dialog.
 */
async function _renderLongRestDialog(dialog, [html]) {
  const availableHD = dialog.actor.items.reduce((hd, item) => {
    if (item.type === "class") {
      const {levels, hitDice, hitDiceUsed} = item.system;
      const denom = hitDice ?? "d6";
      const available = levels - hitDiceUsed;
      hd[denom] = (denom in hd) ? (hd[denom] + available) : available;
    }
    return hd;
  }, {});
  const div = document.createElement("DIV");
  div.innerHTML = await renderTemplate("modules/mythacri-scripts/templates/parts/long-rest.hbs", {
    haveHealed: dialog.healed,
    availableHD,
    canRoll: dialog.actor.system.attributes.hd > 0,
    denomination: (availableHD[dialog._denom] > 0) ? dialog._denom : Object.keys(availableHD).find(k => availableHD[k] > 0)
  });

  // Add event listeners.
  const fn = dnd5e.applications.actor.ShortRestDialog.prototype._onRollHitDie;
  div.querySelector("#roll-hd").addEventListener("click", fn.bind(dialog));
  div.querySelector("#free-heal").addEventListener("click", _freeLongRestHeal.bind(dialog, availableHD));

  // Inject.
  html.querySelector(".form-group").before(...div.childNodes);
  dialog.setPosition({height: "auto"});
}

/* -------------------------------------------------- */

/**
 * Handle clicking the 'free healing' button in the long rest dialog.
 * @this {LongRestDialog}
 * @param {object} dice     The available options in the hit die roll select.
 */
function _freeLongRestHeal(dice) {
  this.healed = true;
  const max = Math.max(...Object.keys(dice).map(d => Number(d.replace("d", ""))));
  const total = max + this.actor.system.abilities[CONFIG.DND5E.defaultAbilities.hitPoints].mod;
  const hp = this.actor.system.attributes.hp;
  const value = Math.min(hp.value + total, hp.effectiveMax);
  this.actor.update({"system.attributes.hp.value": value}, {isRest: true});
  this.render();
}

/* -------------------------------------------------- */

/**
 * Inject the 'Full Rest' button.
 * @param {ActorSheet5eCharacter} sheet     The rendered actor sheet.
 * @param {HTMLElement} html                The element of the sheet.
 */
function _renderCharacterSheet(sheet, [html]) {
  const div = document.createElement("DIV");
  const tip = "MYTHACRI.REST.FULL.Label";
  div.innerHTML = `
  <button type="button" class="full-rest gold-button" data-tooltip="${tip}" aria-label="${game.i18n.localize(tip)}">
    <i class="fa-solid fa-house-chimney">
  </button>`;
  div.querySelector(".full-rest").addEventListener("click", fullRestDialog.bind(sheet.actor));
  html.querySelector(".long-rest").after(div.firstElementChild);
}

/* -------------------------------------------------- */

/**
 * Render a prompt to recover all expended resources. Added to actor prototype.
 * @this {Actor5e}
 * @returns {Promise<object>}     A promise that resolves to the result of the full rest.
 */
async function fullRestDialog() {
  const actor = this;

  return foundry.applications.api.DialogV2.confirm({
    content: `<p>${game.i18n.localize("MYTHACRI.REST.FULL.Hint")}</p>`,
    window: {
      icon: "fa-solid fa-house-chimney",
      title: `${game.i18n.localize("MYTHACRI.REST.FULL.Label")}: ${this.name}`
    },
    position: {width: 400},
    yes: {
      icon: "fa-solid fa-bed",
      label: "DND5E.Rest",
      callback: () => fullRest.call(actor)
    },
    no: {
      icon: "fa-solid fa-times",
      label: "Cancel",
      callback: () => null
    },
    rejectClose: false
  });
}

/* -------------------------------------------------- */

/**
 * Create pending updates to the actor and their items from a full rest.
 * @this {Actor5e}
 * @returns {Promise<object>}     A promise that resolves to the result of the full rest.
 */
async function fullRest() {
  const config = {
    type: "full",
    deltas: {hitPoints: 0, hitDice: 0},
    updateData: {},
    updateItems: [],
    newDay: true,
    rolls: [],
    fraction: 1, // hit dice
    recoverTemp: true, // hit points
    recoverTempMax: true,
    recoverShortRestResources: true, // resources
    recoverLongRestResources: true,
    recoverShort: true, // spell slots
    recoverLong: true,
    recoverShortRestUses: true, // item uses
    recoverLongRestUses: true,
    recoverDailyUses: true
  };
  const result = {};

  // Create rest configuration.
  this._getRestHitDiceRecovery(config, result);
  this._getRestHitPointRecovery(config, result);
  this._getRestResourceRecovery(config, result);
  this._getRestSpellRecovery(config, result);
  await this._getRestItemUsesRecovery(config, result);

  // Store exhaustion change after the system has added its own changes.
  result.updateData["system.attributes.exhaustion"] = Math.max(this.system.attributes.exhaustion - 3, 0);

  // Perform updates.
  await Promise.all([
    this.update(result.updateData),
    this.updateEmbeddedDocuments("Item", result.updateItems)
  ]);
  await _displayFullRestMessage.call(this, result);
  return result;
}

/* -------------------------------------------------- */

/**
 * Display the results of the actor's full rest.
 * @this {Actor5e}
 * @param {object} result     The result of the full rest.
 * @returns {ChatMessage}     The resulting chat message.
 */
async function _displayFullRestMessage(result) {
  const diceRestored = result.deltas.hitDice !== 0;
  const healthRestored = result.deltas.hitPoints !== 0;

  // Determine the chat message to display
  let message;
  if (diceRestored && healthRestored) message = "MYTHACRI.REST.RESULT.All";
  else if (!diceRestored && healthRestored) message = "MYTHACRI.REST.RESULT.HitPoints";
  else if (diceRestored && !healthRestored) message = "MYTHACRI.REST.RESULT.HitDice";
  else message = "MYTHACRI.REST.RESULT.None";

  // Create a chat message
  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.implementation.getSpeaker({actor: this}),
    flavor: game.i18n.localize("MYTHACRI.REST.FULL.Flavor"),
    content: game.i18n.format(message, {name: this.name, dice: result.deltas.hitDice, health: result.deltas.hitPoints})
  };
  ChatMessage.implementation.applyRollMode(chatData, game.settings.get("core", "rollMode"));
  return ChatMessage.implementation.create(chatData);
}

/* -------------------------------------------------- */

/**
 * When a blank 'character' type actor is created, add `-@attributes.exhaustion` in appropriate fields.
 * @param {Actor} actor     The actor being created.
 */
function _preCreateActor(actor) {
  if (actor.type !== "character") return;
  const keys = [
    "spell.dc"
  ];
  const string = "@attributes.exhaustion";
  const update = {};
  for (const key of keys) {
    const prop = foundry.utils.getProperty(actor.system.bonuses, key);
    if (!prop.includes(string)) update[`system.bonuses.${key}`] = `${prop} - ${string}`.trim();
  }
  actor.updateSource(update);
}

/* -------------------------------------------------- */

export default {};
