import mayhem from "./data/mayhem.mjs";
import {RecipeData} from "./data/models/recipe-item.mjs";
import {ResourcePopulator} from "./applications/resource-populator.mjs";
import {Soundboard} from "./applications/soundboard.mjs";
import award from "./data/award.mjs";
import combat from "./data/combat.mjs";
import Crafting from "./data/crafting.mjs";
import Encounter from "./data/encounter.mjs";
import resting from "./data/resting.mjs";
import transfer from "./data/transfer.mjs";

/**
 * Set up the public API.
 */
export class PublicInterface {
  /** Initialize module. */
  static init() {
    globalThis.mythacri = {
      award,
      combat,
      crafting: Crafting,
      encounter: Encounter,
      mayhem,
      resource: ResourcePopulator,
      resting,
      soundboard: Soundboard,
      transfer,

      dataModels: {
        RecipeData: RecipeData
      }
    };
  }
}
