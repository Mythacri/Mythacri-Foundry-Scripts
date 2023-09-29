export class Resting {
  /** Initialize hooks. */
  static init() {
    Hooks.on("dnd5e.preLongRest", Resting.preLongRest);
    Hooks.on("dnd5e.preRestCompleted", Resting.preRestCompleted);
    Hooks.on("dnd5e.restCompleted", Resting.restCompleted);
    Hooks.on("renderLongRestDialog", Resting.renderLongRestDialog);
    Hooks.on("renderActorSheet5eCharacter", Resting.renderCharacterSheet);
    Hooks.on("preCreateActor", Resting.preCreateActor);
    dnd5e.documents.Actor5e.prototype.fullRest = Resting.fullRestDialog;
  }

  /** Never display the default chat message for a long rest. */
  static preLongRest(actor, config) {
    config.chat = false;
  }

  /**
   * Do not recover full amount of hp on a long rest, and reduce exhaustion by 1.
   * @param {Actor} actor       The actor taking a rest.
   * @param {object} result     Rest data. **will be mutated**
   */
  static preRestCompleted(actor, result) {
    if (result.longRest) {
      const exh = actor.system.attributes.exhaustion;
      result.updateData["system.attributes.exhaustion"] = Math.max(exh - 1, 0);
      delete result.updateData["system.attributes.hp.value"];
    }
  }

  /** Display a custom chat message when recovering from a long rest. */
  static restCompleted(actor, result) {
    if (result.longRest) return actor._displayRestResultMessage({...result, dhp: 0}, true);
  }

  /**
   * Display new buttons in the default LongRestDialog.
   * @param {LongRestDialog} dialog     The rendered long rest dialog.
   * @param {HTMLElement} html          The element of the dialog.
   */
  static async renderLongRestDialog(dialog, [html]) {
    const availableHD = dialog.actor.items.reduce((hd, item) => {
      if (item.type === "class") {
        const {levels, hitDice, hitDiceUsed} = item.system;
        const denom = hitDice ?? "d6";
        const available = parseInt(levels ?? 1) - parseInt(hitDiceUsed ?? 0);
        hd[denom] = (denom in hd) ? (hd[denom] + available) : available;
      }
      return hd;
    }, {});
    const div = document.createElement("DIV");
    div.innerHTML = await renderTemplate("modules/mythacri-scripts/templates/parts/long-rest.hbs", {
      haveHealed: dialog.healed,
      availableHD,
      canRoll: dialog.actor.system.attributes.hd > 0,
      denomination: availableHD[dialog._denom] > 0 ? dialog._denom : Object.keys(availableHD).find(k => availableHD[k] > 0)
    });

    // Add event listeners.
    div.querySelector("#roll-hd").addEventListener("click", dnd5e.applications.actor.ShortRestDialog.prototype._onRollHitDie.bind(dialog));
    div.querySelector("#free-heal").addEventListener("click", Resting.freeLongRestHeal.bind(dialog, availableHD));

    // Inject.
    html.querySelector(".form-group").before(...div.childNodes);
    dialog.setPosition({height: "auto"});
  }

  /**
   * Handle clicking the 'free healing' button in the long rest dialog.
   * @param {object} dice     The available options in the hit die roll select.
   */
  static freeLongRestHeal(dice) {
    this.healed = true;
    const max = Math.max(...Object.keys(dice).map(d => Number(d.replace("d", ""))));
    const total = max + this.actor.system.abilities.con.mod;
    this.actor.applyDamage(total, -1);
    this.render();
  }

  /**
   * Inject the 'Full Rest' button.
   * @param {ActorSheet5eCharacter} sheet     The rendered actor sheet.
   * @param {HTMLElement} html                The element of the sheet.
   */
  static renderCharacterSheet(sheet, [html]) {
    const div = document.createElement("DIV");
    div.innerHTML = `<a class="rest full-rest" data-tooltip="MYTHACRI.FullRest">${game.i18n.localize("MYTHACRI.RestF")}</a`;
    div.querySelector("A").addEventListener("click", Resting.fullRestDialog.bind(sheet.actor));
    html.querySelector(".rest.long-rest").after(div.firstElementChild);
  }

  /**
   * Render a prompt to recover all expended resources. Added to actor prototype.
   * @returns {Promise<object>}     A promise that resolves to the result of the full rest.
   */
  static async fullRestDialog() {
    return Dialog.wait({
      title: `${game.i18n.localize("MYTHACRI.FullRest")}: ${this.name}`,
      content: `<p>${game.i18n.localize("MYTHACRI.FullRestHint")}</p>`,
      buttons: {
        rest: {
          icon: "<i class='fa-solid fa-bed'></i>",
          label: game.i18n.localize("DND5E.Rest"),
          callback: Resting.fullRest.bind(this)
        },
        cancel: {
          icon: "<i class='fa-solid fa-times'></i>",
          label: game.i18n.localize("Cancel"),
          callback: null
        }
      },
      close: () => null
    });
  }

  /**
   * Create pending updates to the actor and their items from a full rest.
   * @returns {Promise<object>}     A promise that resolves to the result of the full rest.
   */
  static async fullRest() {
    const {updates: hitPointUpdates, hitPointsRecovered} = this._getRestHitPointRecovery();
    const {updates: hitDiceUpdates, hitDiceRecovered} = this._getRestHitDiceRecovery({maxHitDice: Infinity});
    const rolls = [];
    const result = {
      dhd: hitDiceRecovered,
      dhp: hitPointsRecovered,
      updateData: {
        ...hitPointUpdates,
        ...this._getRestResourceRecovery({recoverShortRestResoruces: true, recoverLongRestResources: true}),
        ...this._getRestSpellRecovery({recoverSpells: true})
      },
      updateItems: [
        ...hitDiceUpdates,
        ...(await this._getRestItemUsesRecovery({recoverLongRestUses: true, recoverDailyUses: true, rolls}))
      ],
      longRest: false,
      newDay: true
    };

    // Remove levels of exhaustion.
    const exh = this.system.attributes.exhaustion;
    result.updateData["system.attributes.exhaustion"] = Math.max(exh - 3, 0);

    result.rolls = rolls;
    await this.update(result.updateData);
    await this.updateEmbeddedDocuments("Item", result.updateItems);
    await Resting.displayFullRestMessage.call(this, result);
    return result;
  }

  /**
   * Display the results of the actor's full rest.
   * @param {object} result     The result of the full rest.
   * @returns {ChatMessage}     The resulting chat message.
   */
  static async displayFullRestMessage(result) {
    const {dhd, dhp} = result;
    const diceRestored = dhd !== 0;
    const healthRestored = dhp !== 0;

    // Determine the chat message to display
    let message;
    if (diceRestored && healthRestored) message = `MYTHACRI.FullRestResult`;
    else if (!diceRestored && healthRestored) message = "MYTHACRI.FullRestResultHitPoints";
    else if (diceRestored && !healthRestored) message = "MYTHACRI.FullRestResultHitDice";
    else message = `MYTHACRI.FullRestResultShort`;

    // Create a chat message
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({actor: this}),
      flavor: game.i18n.localize("MYTHACRI.FullRestFlavor"),
      rolls: result.rolls,
      content: game.i18n.format(message, {name: this.name, dice: dhd, health: dhp})
    };
    ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
    return ChatMessage.create(chatData);
  }

  /**
   * When a blank 'character' type actor is created, add `-@attributes.exhaustion` in appropriate fields.
   * @param {Actor} actor     The actor being created.
   */
  static preCreateActor(actor) {
    if (actor.type !== "character") return;
    const keys = [
      "abilities.check",
      "abilities.save",
      "msak.attack",
      "mwak.attack",
      "rsak.attack",
      "rwak.attack",
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
}
