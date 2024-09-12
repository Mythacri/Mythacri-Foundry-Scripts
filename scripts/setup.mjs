import {Auras} from "./modules/data/token-auras.mjs";
import {PublicInterface} from "./modules/interface.mjs";
import {Soundboard} from "./modules/applications/soundboard.mjs";
import {Storage} from "./modules/data/storage.mjs";
import {SystemConfig} from "./modules/system-config.mjs";
import Crafting from "./modules/data/crafting.mjs";
import Encounter from "./modules/data/encounter.mjs";
import GameConfig from "./modules/game-config.mjs";
import InitializeBehaviors from "./modules/data/models/behaviors.mjs";

Hooks.once("init", Auras.init);
Hooks.once("init", Crafting.init);
Hooks.once("init", Encounter.init);
Hooks.once("init", GameConfig.init);
Hooks.once("init", PublicInterface.init);
Hooks.once("init", Soundboard.init);
Hooks.once("init", Storage.init);
Hooks.once("init", SystemConfig.init);
Hooks.once("init", InitializeBehaviors);
