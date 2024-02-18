export class Award {
  /** Initialize module. */
  static init() {
    Award._expLevels();
    Hooks.once("ready", Award._enableExperience);
  }

  /**
   * Forcibly set the system setting to be disabled.
   * @returns {Promise<Setting>}
   */
  static async _enableExperience() {
    return game.settings.set("dnd5e", "disableExperienceTracking", false);
  }


  /** Modify the experience level thresholds to multiples of 10. */
  static _expLevels() {
    CONFIG.DND5E.CHARACTER_EXP_LEVELS = Array.fromRange(20).map(n => 10 * n);
  }

  /**
   * Helper method to get all player owned characters.
   * @param {boolean} [assigned]      Whether to restrict to assigned actors.
   * @returns {Actor5e[]}             Player-owned characters.
   */
  static _getDestinations(assigned = false) {
    return game.actors.reduce((acc, actor) => {
      if ((actor.type !== "character") || !actor.hasPlayerOwner) return acc;
      if (assigned && !game.users.some(user => user.character === actor)) return acc;
      acc.push(actor);
      return acc;
    }, []);
  }

  /**
   * Helper method to prompt for an amount of pips or marbles.
   * @param {string} [type]               The type to prompt for, either 'pip' or 'mrb'.
   * @returns {Promise<number|null>}      The input amount, or null if cancelled.
   */
  static async _promptAmount(type = "pip") {
    const label = game.i18n.localize("MYTHACRI." + ((type === "pip") ? "Pips" : "CurrencyMarbles"));
    const html = `
    <form>
      <div class="form-group">
        <label>${label}</label>
        <div class="form-fields">
          <input type="number" name="amount" autofocus>
        </div>
      </div>
    </form>`;
    const amount = await dnd5e.applications.DialogMixin(Dialog).prompt({
      rejectClose: false,
      title: label,
      label: game.i18n.localize("MYTHACRI.Confirm"),
      content: html,
      callback: ([html]) => new FormDataExtended(html.querySelector("FORM")).object.amount,
      options: {classes: ["dialog", "dnd5e2"]}
    });
    if (!amount) return null;
    return amount;
  }

  /**
   * Award all player-owned character-type actors with pips.
   * @param {object} [options]                Options to modify the awarding.
   * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
   * @param {number} [options.amount]         The amount of pips to grant.
   * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
   * @returns {Promise<void>}
   */
  static async grantPip({assigned = false, amount = null, each = true} = {}) {
    amount ??= await this._promptAmount("pip");
    if (!amount) return;
    const destinations = this._getDestinations(assigned);
    const results = new Map();
    await dnd5e.applications.Award.awardXP(amount, destinations, {each, results});
    return dnd5e.applications.Award.displayAwardMessages(results);
  }

  /**
   * Award all player-owned character-type actors with marbles.
   * @param {object} [options]                Options to modify the awarding.
   * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
   * @param {number} [options.amount]         The amount to grant.
   * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
   * @returns {Promise<void>}
   */
  static async grantMarbles({assigned = false, amount = null, each = false} = {}) {
    amount ??= await this._promptAmount("mrb");
    if (!amount) return;
    const destinations = this._getDestinations(assigned);
    const results = new Map();
    await dnd5e.applications.Award.awardCurrency({mrb: amount}, destinations, {each, results});
    return dnd5e.applications.Award.displayAwardMessages(results);
  }
}
