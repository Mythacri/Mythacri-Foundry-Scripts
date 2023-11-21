import {MODULE} from "../constants.mjs";

/**
 * Soundboard application for previewing and playing sound files.
 */
export class Soundboard extends Application {
  /**
   * Initialize the soundboard.
   */
  static init() {
    Hooks.once("ready", Soundboard.create);
  }

  /**
   * Factor method for rendering an instance of this application.
   * @returns {Soundboard}
   */
  static create() {
    if (!game.user.isGM) return;
    return new Soundboard().render(true);
  }

  /**
   * @constructor
   * @param {object} [options={}]     Rendering options.
   */
  constructor(options={}) {
    super(options);
    this.path = game.settings.get(MODULE.ID, "identifiers").paths.soundboard;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/mythacri-scripts/templates/soundboard.hbs",
      classes: [MODULE.ID, "soundboard"],
      minimizable: false
    });
  }

  /** @override */
  async getData() {
    return {files: await this.getFiles()};
  }

  /** @override */
  close() {
    return; // do not allow this application to be closed.
  }

  /** @override */
  render(force = false, options = {}) {
    // restore the saved position.
    const pos = game.settings.get(MODULE.ID, "soundboard-position") ?? {};
    options.top ??= pos.top;
    options.left ??= pos.left;
    return super.render(force, options);
  }

  /**
   * Retrieve all audio files from the set file path location.
   * @returns {Promise<object[]>}     A promise that resolves to an array of objects with `src` and `name`.
   */
  async getFiles() {
    const errorMessage = "No sound files were found at the specified location.";
    try {
      const extentions = Object.keys(CONST.AUDIO_FILE_EXTENSIONS).map(k => `.${k}`);
      const {files} = await FilePicker.browse("data", this.path, {extentions});
      if (!files.length) throw new Error(errorMessage);
      return files.map(src => ({src: src, name: AudioHelper.getDefaultSoundName(src)}));
    } catch (err) {
      ui.notifications.error(errorMessage, {permanent: true});
      return [];
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html[0].querySelectorAll("[data-action]").forEach(n => {
      const action = n.dataset.action;
      if (["preview", "play"].includes(action)) n.addEventListener("click", this._play.bind(this));
      else if (action === "toggle") n.addEventListener("click", this._toggle.bind(this));
    });

    // Create a draggable and override its mouse-up event to save the position.
    const draggable = new Draggable(this, html, html[0].querySelector(".header .name"), false);
    const fn = draggable._onDragMouseUp;
    draggable._onDragMouseUp = function newDragMouseUp(event) {
      fn.call(this, event);
      return game.settings.set(MODULE.ID, "soundboard-position", {
        left: this.app.position.left,
        top: this.app.position.top
      });
    };
  }

  /**
   * Play the sound locally or globally.
   * @param {PointerEvent} event        The initiating click event.
   * @returns {Sound}                   A Sound instance which controls audio playback.
   */
  _play(event) {
    const push = event.currentTarget.dataset.action === "play";
    const src = event.currentTarget.closest("[data-src]").dataset.src;
    return AudioHelper.play({src: src}, push);
  }

  /**
   * Collapse the ui.
   * @param {PointerEvent} event      The initiating click event.
   */
  _toggle(event) {
    event.currentTarget.closest(".header").classList.toggle("collapsed");
  }
}
