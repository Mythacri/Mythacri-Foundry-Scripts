/**
 * Adjust default scene configuration.
 * @param {Scene} scene           The scene to be created.
 * @param {object} sceneData      The data given for the creation.
 * @param {object} options        The scene creation options.
 * @param {string} userId         The id of the user creating the scene.
 */
export default (scene, sceneData, options, userId) => {
  // Defaults to use unless other properties are explicitly provided.
  const defaults = {
    backgroundColor: "#000000",
    "environment.globalLight.enabled": true,
    "grid.type": CONST.GRID_TYPES.HEXODDR,
  };

  const update = {};
  for (const [path, value] of Object.entries(defaults)) {
    if (!foundry.utils.hasProperty(sceneData, path)) {
      update[path] = value;
    }
  }

  scene.updateSource(update);
};
