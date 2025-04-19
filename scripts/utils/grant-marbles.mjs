/**
 * Award all player-owned character-type actors with marbles.
 * @param {object} [options]                Options to modify the awarding.
 * @param {boolean} [options.assigned]      Whether to restrict to assigned actors.
 * @param {number} [options.amount]         The amount to grant.
 * @param {boolean} [options.each]          Whether to grant this amount to each, or split them.
 * @returns {Promise}
 */
export default async function({ assigned = false, amount = null, each = false } = {}) {
  amount ??= await mythacri.utils.promptAmount("gp");
  if (!amount) return;
  const destinations = mythacri.utils.getDestinations(assigned);
  const results = new Map();
  await dnd5e.applications.Award.awardCurrency({ gp: amount }, destinations, { each, results });
  return dnd5e.applications.Award.displayAwardMessages(results);
}
