import {MODULE} from "../constants.mjs";

/** A GM-only application for rolling and prompting for random encounters. */
export class Encounter extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  /** Initialize module. */
  static init() {
    Hooks.on("renderChatMessage", Encounter.renderChatMessage);
  }

  /* -------------------------------------------------- */

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: [MODULE.ID, "encounter"],
    position: {width: 400, height: "auto"},
    window: {title: "MYTHACRI.EncounterTitle"},
    id: "encounter",
    actions: {
      roll: Encounter.#gmRoll,
      prompt: Encounter.#prompt,
      adjust: Encounter.#adjust
    }
  };

  /* -------------------------------------------------- */

  /** @override */
  static PARTS = {
    form: {
      template: "modules/mythacri-scripts/templates/encounter-application.hbs"
    }
  };

  /* -------------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const rolls = this.rolls ?? [];
    const users = game.users.reduce((acc, user) => {
      if (!user.active || user.isSelf) return acc;
      const total = this.users?.[user.id];

      const cssClass = [];
      for (const roll of rolls) {
        if (roll.value === total) {
          roll.match = true;
          cssClass.push("match");
        }
      }

      if (total && rolls.length && !cssClass.length) cssClass.push("mismatch");

      acc.push({
        user: user,
        total: total ?? null,
        cssClass: Array.from(new Set(cssClass)).filterJoin(" ")
      });

      return acc;
    }, []);
    const amount = game.settings.get(MODULE.ID, "encounter-dice") ?? 1;
    return {rolls, users, amount};
  }

  /* -------------------------------------------------- */

  /**
   * The rendering hook on chat message prompts.
   * @param {ChatMessage} message
   */
  static #hook(message) {
    const flag = message.flags[MODULE.ID]?.encounter === true;
    if (!flag) return;
    const user = message.author;
    const roll = message.rolls[0];
    const window = foundry.applications.instances.get(Encounter.DEFAULT_OPTIONS.id);
    window.setRoll(user, roll);
  }

  /* -------------------------------------------------- */

  /**
   * Factory method to render this application and apply a hook.
   * @returns {Promise<Encounter>}      The rendered Encounter application.
   */
  static async create() {
    const existing = foundry.applications.instances.get(Encounter.DEFAULT_OPTIONS.id);
    if (existing) return existing.render({force: true});

    const application = new this();
    application.addEventListener("render", () => Hooks.on("createChatMessage", Encounter.#hook), {once: true});
    application.addEventListener("close", () => Hooks.off("createChatMessage", Encounter.#hook), {once: true});
    return application.render({force: true});
  }

  /* -------------------------------------------------- */

  /**
   * Prompt users with a chat message that asks them to roll a d12.
   * @this {Encounter}
   * @param {PointerEvent} event      Triggering click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static async #prompt(event, target) {
    ChatMessage.implementation.create({
      content: await renderTemplate("modules/mythacri-scripts/templates/encounter-prompt.hbs", {
        amount: game.settings.get(MODULE.ID, "encounter-dice")
      })
    });
  }

  /* -------------------------------------------------- */

  /**
   * Hook onto chat message rendering to add event listener to the prompt button.
   * @param {ChatMessage} message     The rendered chat message.
   * @param {HTMLElement} html        The element of the chat message.
   */
  static renderChatMessage(message, [html]) {
    html.querySelectorAll("[data-action='roll-encounter']").forEach(n => {
      n.addEventListener("click", Encounter.#roll.bind(Encounter));
    });
  }

  /* -------------------------------------------------- */

  /**
   * Create the d12 roll from the prompt.
   * @this {Encounter}
   * @param {PointerEvent} event          The initiating click event.
   * @returns {Promise<ChatMessage>}      The created chat message.
   */
  static async #roll(event) {
    event.currentTarget.disabled = true;
    Roll.create("1d12").toMessage({
      flavor: `${game.user.name} - ${game.i18n.localize("MYTHACRI.EncounterRoll")}`,
      "flags.mythacri-scripts.encounter": true
    });
  }

  /* -------------------------------------------------- */

  /**
   * Add the user's data to this application and then re-render.
   * @param {User} user     The user who made the roll.
   * @param {Roll} roll     The rolled d12.
   */
  setRoll(user, roll) {
    this.users ??= {};
    this.users[user.id] ??= roll.total;
    this.render();
  }

  /* -------------------------------------------------- */

  /**
   * Roll the GM's die and then re-render.
   * @this {Encounter}
   * @param {PointerEvent} event      Triggering click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static async #gmRoll(event, target) {
    const amount = game.settings.get(MODULE.ID, "encounter-dice") ?? 1;
    const roll = await Roll.create(`${amount}d12`).evaluate();
    roll.toMessage({
      flavor: `${game.user.name} - ${game.i18n.localize("MYTHACRI.EncounterRoll")}`
    }, {rollMode: CONST.DICE_ROLL_MODES.PRIVATE});
    this.rolls = roll.dice[0].results.map(r => ({value: r.result}));
    this.render();
  }

  /* -------------------------------------------------- */

  /**
   * Adjust the current amount of d12s that the GM is rolling.
   * @this {Encounter}
   * @param {PointerEvent} event      Triggering click event.
   * @param {HTMLElement} target      The element that defined the [data-action].
   */
  static async #adjust(event, target) {
    const diff = Number(target.dataset.diff);
    const value = game.settings.get(MODULE.ID, "encounter-dice");
    const newValue = Math.max(value + diff, 1);
    await game.settings.set(MODULE.ID, "encounter-dice", newValue);
    this.render();
  }
}
