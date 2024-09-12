import {PublicInterface} from "./modules/interface.mjs";
import {Soundboard} from "./modules/applications/soundboard.mjs";
import {SystemConfig} from "./modules/system-config.mjs";
import Crafting from "./modules/data/crafting.mjs";
import Encounter from "./modules/data/encounter.mjs";
import GameConfig from "./modules/game-config.mjs";
import InitializeBehaviors from "./modules/data/models/behaviors.mjs";

Hooks.once("init", Crafting.init);
Hooks.once("init", Encounter.init);
Hooks.once("init", GameConfig.init);
Hooks.once("init", PublicInterface.init);
Hooks.once("init", Soundboard.init);
Hooks.once("init", SystemConfig.init);
Hooks.once("init", InitializeBehaviors);
