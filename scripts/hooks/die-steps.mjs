/** Add additional die sizes for rolls. */
export default () => {
  CONFIG.DND5E.dieSteps.push(5);
  CONFIG.DND5E.dieSteps.sort((a, b) => a - b);
};
