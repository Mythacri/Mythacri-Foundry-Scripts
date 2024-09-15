import Encounter from "./modules/data/encounter.mjs";
import InitializeBehaviors from "./modules/data/models/behaviors.mjs";
import PublicInterface from "./modules/interface.mjs";
import Soundboard from "./modules/applications/soundboard.mjs";

Hooks.once("init", Encounter.init);
Hooks.once("init", InitializeBehaviors);
Hooks.once("init", PublicInterface.init);
Hooks.once("init", Soundboard.init);
