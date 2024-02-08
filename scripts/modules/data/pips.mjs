export class ExperiencePips {
  /** Initialize module. */
  static init() {
    ExperiencePips._expLevels();
    Hooks.once("ready", ExperiencePips._enableExperience);
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
   * Award all player-owned character-type actors with 1 pip.
   * @param {boolean} [assigned]        Whether to restrict to assigned actors.
   * @returns {Promise<Actor5e[]>}      The updated actors.
   */
  static async grantPip(assigned = false) {
    const updates = game.actors.reduce((acc, actor) => {
      if ((actor.type !== "character") || !actor.hasPlayerOwner) return acc;
      if (assigned && !game.users.some(user => user.character === actor)) return acc;
      const xp = actor.system.details.xp.value;
      acc.push({_id: actor.id, "system.details.xp.value": xp + 1});
      return acc;
    }, []);
    return Actor.implementation.updateDocuments(updates);
  }
}
