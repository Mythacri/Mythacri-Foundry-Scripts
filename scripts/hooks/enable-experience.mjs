/**
 * Forcibly enable experience tracking.
 */
export default () => {
  if (!game.user.isGM) return;
  game.settings.set("dnd5e", "levelingMode", "xpBoons");
};
