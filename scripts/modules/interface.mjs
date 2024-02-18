import {ResourcePopulator} from "./applications/resource-populator.mjs";
import {Soundboard} from "./applications/soundboard.mjs";
import {Crafting} from "./data/crafting.mjs";
import {Encounter} from "./data/encounter.mjs";
import {Mayhem} from "./data/mayhem.mjs";
import {Award} from "./data/award.mjs";

/**
 * Set up the public API.
 */
export class PublicInterface {
  /** Initialize module. */
  static init() {
    globalThis.mythacri = {
      mayhem: Mayhem,
      crafting: Crafting,
      encounter: Encounter,
      award: Award,
      resource: ResourcePopulator,
      soundboard: Soundboard
    };
  }
}
