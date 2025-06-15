Hooks.on("renderGamePause", _animatePause);

/* -------------------------------------------------- */

/**
 * Bounce the pause image when the game is paused.
 * @param {Pause} pause                 The pause application.
 * @param {HTMLElement} html            The html element.
 * @param {object} options              Options object.
 * @param {boolean} options.paused      Whether the game is paused.
 */
function _animatePause(pause, html, {paused}) {
  if (!paused) return;
  const frames = [
    {transform: "translateY(-200px) scale(1.5)"},
    {transform: "translateY(0px) scale(1)"},
    {transform: "translateY(-25px) scale(1)"},
    {transform: "translateY(0px) scale(1)"},
  ];
  const options = {duration: 2000, iterations: 1, easing: "cubic-bezier(0.8, 2, 0, 1)"};
  html.animate(frames, options);
}

/* -------------------------------------------------- */

export default {};
