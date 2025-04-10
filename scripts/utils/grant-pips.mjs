/**
 * Award all player-owned character-type actors with pips.
 * @param {object} [options]                Options to modify the awarding.
 * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
 * @param {number} [options.amount]         The amount of pips to grant.
 * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
 * @returns {Promise}
 */
export default async function({ assigned = false, amount = null, each = true } = {}) {
  amount ??= await mythacri.utils.promptAmount("pip");
  if (!amount) return;
  const destinations = mythacri.utils.getDestinations(assigned);
  const results = new Map();
  await dnd5e.applications.Award.awardXP(amount, destinations, { each, results });
  return dnd5e.applications.Award.displayAwardMessages(results);
}
