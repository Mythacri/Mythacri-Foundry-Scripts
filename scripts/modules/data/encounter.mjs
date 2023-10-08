import {MODULE} from "../constants.mjs";

export class Encounter extends Application {
  /** Initialize module. */
  static init() {
    Hooks.on("renderChatMessage", Encounter.renderChatMessage);
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [MODULE.ID, "encounter"],
      template: "modules/mythacri-scripts/templates/encounter-application.hbs",
      width: 400,
      height: "auto",
      title: "MYTHACRI.EncounterTitle"
    });
  }

  /** @override */
  async getData() {
    const rolls = this.rolls ?? [];
    const users = game.users.reduce((acc, user) => {
      if (!user.active || user.isGM) return acc;
      const total = this.users?.[user.id];
      for(const roll of rolls) if(roll.value === total) roll.match = true;
      acc.push({
        user: user,
        total: total ?? null,
        match: rolls.some(r => r.value === total),
        mismatch: total && rolls.length && rolls.every(r => r.value !== total)
      });
      return acc;
    }, []);
    const amount = game.settings.get(MODULE.ID, "encounter-dice") ?? 1;
    return {rolls, users, amount};
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("[data-action]").forEach(n => {
      const action = n.dataset.action;
      if (action === "roll") n.addEventListener("click", this.roll.bind(this));
      else if (action === "prompt") n.addEventListener("click", this.prompt.bind(this));
      else if (action === "close") n.addEventListener("click", this.close.bind(this));
      else if (action === "adjust") n.addEventListener("click", this.adjust.bind(this));
    });
  }

  /**
   * The rendering hook on chat message prompts.
   * @param {ChatMessage} message
   */
  static hook(message) {
    const flag = message.flags[MODULE.ID]?.encounter === true;
    if (!flag) return;
    const user = message.user;
    const roll = message.rolls[0];
    const window = Object.values(ui.windows).find(w => w instanceof Encounter);
    window.setRoll(user, roll);
  }

  /**
   * Factory method to render this application and apply a hook.
   * @returns {Encounter}
   */
  static create() {
    Hooks.on("createChatMessage", Encounter.hook);
    return new this().render(true);
  }

  /** @override */
  close(...T) {
    super.close(...T);
    Hooks.off("createChatMessage", Encounter.hook);
    return this;
  }

  /**
   * Prompt users with a chat message that asks them to roll a d12.
   * @returns {Promise<ChatMessage>}
   */
  async prompt() {
    return ChatMessage.create({
      content: await renderTemplate("modules/mythacri-scripts/templates/encounter-prompt.hbs", {
        amount: game.settings.get(MODULE.ID, "encounter-dice")
      })
    });
  }

  /**
   * Hook onto chat message rendering to add event listener to the prompt button.
   * @param {ChatMessage} message     The rendered chat message.
   * @param {HTMLElement} html        The element of the chat message.
   */
  static renderChatMessage(message, [html]) {
    html.querySelectorAll("[data-action='roll-encounter']").forEach(n => {
      n.addEventListener("click", Encounter.roll.bind(Encounter));
    });
  }

  /**
   * Create the d12 roll from the prompt.
   * @param {PointerEvent} event          The initiating click event.
   * @returns {Promise<ChatMessage>}      The created chat message.
   */
  static async roll(event) {
    event.currentTarget.disabled = true;
    return new Roll("1d12").toMessage({
      flavor: `${game.user.name} - ${game.i18n.localize("MYTHACRI.EncounterRoll")}`,
      "flags.mythacri-scripts.encounter": true
    });
  }

  /**
   * Add the user's data to this application and then re-render.
   * @param {User} user     The user who made the roll.
   * @param {Roll} roll     The rolled d12.
   * @returns {Encounter}
   */
  setRoll(user, roll) {
    this.users ??= {};
    this.users[user.id] ??= roll.total;
    return this.render();
  }

  /**
   * Roll the GM's die and then re-render.
   * @returns {Encounter}
   */
  async roll(event) {
    const amount = game.settings.get(MODULE.ID, "encounter-dice") ?? 1;
    const roll = await new Roll(`${amount}d12`).evaluate();
    await roll.toMessage({flavor: `${game.user.name} - ${game.i18n.localize("MYTHACRI.EncounterRoll")}`});
    this.rolls = roll.dice[0].results.map(r => ({value: r.result}));
    return this.render();
  }

  /**
   * Adjust the current amount of d12s that the GM is rolling.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Encounter}
   */
  async adjust(event) {
    const diff = Number(event.currentTarget.dataset.diff);
    const value = game.settings.get(MODULE.ID, "encounter-dice");
    const newValue = Math.max(value + diff, 1);
    await game.settings.set(MODULE.ID, "encounter-dice", newValue);
    return this.render();
  }

  /** @override */
  setPosition(opt = {}) {
    opt.height ??= "auto";
    super.setPosition(opt);
  }
}
