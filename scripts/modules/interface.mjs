import crafting from "./data/crafting.mjs";
import {Encounter} from "./data/encounter.mjs";
import {Mayhem} from "./data/mayhem.mjs";
import {RecipeData} from "./data/models/recipe-item.mjs";
import {ResourcePopulator} from "./applications/resource-populator.mjs";
import {Soundboard} from "./applications/soundboard.mjs";
import award from "./data/award.mjs";
import combat from "./data/combat.mjs";
import transfer from "./data/item-transfer.mjs";

/**
 * Set up the public API.
 */
export class PublicInterface {
  /** Initialize module. */
  static init() {
    globalThis.mythacri = {
      mayhem: Mayhem,
      encounter: Encounter,
      award,
      combat,
      crafting,
      transfer,
      resource: ResourcePopulator,
      soundboard: Soundboard,

      dataModels: {
        RecipeData: RecipeData
      }
    };
  }
}
