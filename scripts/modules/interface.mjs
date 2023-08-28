import {Mayhem} from "./data/mayhem.mjs";

export class PublicInterface {
  static init() {
    globalThis.mythacri = {
      mayhem: Mayhem
    };
  }
}
