/**
 * Helper method to get all player owned characters.
 * @param {boolean} [assigned]      Whether to restrict to assigned actors.
 * @returns {Actor5e[]}             Player-owned characters.
 */
export default function(assigned = false) {
  return game.actors.reduce((acc, actor) => {
    if ((actor.type !== "character") || !actor.hasPlayerOwner) return acc;
    if (assigned && !game.users.some(user => user.character === actor)) return acc;
    acc.push(actor);
    return acc;
  }, []);
}
