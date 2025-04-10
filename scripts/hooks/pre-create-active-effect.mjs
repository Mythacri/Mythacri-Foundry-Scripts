/**
 * Prevent creation of ActiveEffects on the storage actor.
 * @param {ActiveEffect5e} effect     The effect to be created.
 * @param {object} context            Options that modify the creation.
 */
export default (effect) => {
  if (effect.parent?.type === `${mythacri.id}.storage`) return false;
};
