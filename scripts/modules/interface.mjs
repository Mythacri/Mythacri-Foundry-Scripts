import {Crafting} from "./data/crafting/base-crafting.mjs";
import {Mayhem} from "./data/mayhem.mjs";

export class PublicInterface {
  static init() {
    globalThis.mythacri = {
      mayhem: Mayhem,
      crafting: Crafting
    };
  }
}
