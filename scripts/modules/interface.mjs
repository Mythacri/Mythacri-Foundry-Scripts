import auras from "./data/auras.mjs";
import award from "./data/award.mjs";
import combat from "./data/combat.mjs";
import configuration from "./data/configuration.mjs";
import Crafting from "./data/crafting.mjs";
import Encounter from "./data/encounter.mjs";
import mayhem from "./data/mayhem.mjs";
import RecipeData from "./data/models/recipe-item.mjs";
import resource from "./applications/resource-populator.mjs";
import resting from "./data/resting.mjs";
import settings from "./data/settings.mjs";
import Soundboard from "./applications/soundboard.mjs";
import storage from "./data/storage.mjs";
import transfer from "./data/transfer.mjs";

/**
 * Set up the public API.
 */
export default class PublicInterface {
  /** Initialize module. */
  static init() {
    globalThis.mythacri = {
      auras,
      award,
      combat,
      configuration,
      crafting: Crafting,
      encounter: Encounter,
      mayhem,
      resource,
      resting,
      settings,
      soundboard: Soundboard,
      storage,
      transfer,

      dataModels: {
        RecipeData: RecipeData
      }
    };
  }
}
