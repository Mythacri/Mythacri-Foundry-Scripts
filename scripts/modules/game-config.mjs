/** Utility class for any changes made to core foundry. */
export default class GameConfig {
  /** Initialize module. */
  static init() {
    Hooks.on("preCreateScene", GameConfig.preCreateScene);
  }

  /**
   * Adjust default scene configuration.
   * @param {Scene} scene           The scene to be created.
   * @param {object} sceneData      The data given for the creation.
   * @param {object} options        The scene creation options.
   * @param {string} userId         The id of the user creating the scene.
   */
  static preCreateScene(scene, sceneData, options, userId) {
    const globalLight = sceneData.environment?.globalLight ?? {};
    const update = {};
    if (!("enabled" in globalLight)) update["environment.globalLight.enabled"] = true;
    scene.updateSource(update);
  }
}
