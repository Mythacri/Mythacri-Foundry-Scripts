import {Crafting} from "./data/crafting/base-crafting.mjs";
import {Encounter} from "./data/encounter.mjs";
import {Mayhem} from "./data/mayhem.mjs";
import {ExperiencePips} from "./data/pips.mjs";

export class PublicInterface {
  static init() {
    globalThis.mythacri = {
      mayhem: Mayhem,
      crafting: Crafting,
      encounter: Encounter,
      experience: ExperiencePips
    };
  }
}
