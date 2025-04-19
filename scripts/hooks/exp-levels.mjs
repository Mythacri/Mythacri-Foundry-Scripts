/**
 * Set character experience thresholds.
 */
export default () => {
  CONFIG.DND5E.CHARACTER_EXP_LEVELS = Array.fromRange(20).map(n => 10 * n);
};
