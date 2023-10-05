import {Crafting} from "./modules/data/crafting/base-crafting.mjs";
import {Mayhem} from "./modules/data/mayhem.mjs";
import {Resting} from "./modules/data/resting.mjs";
import {PublicInterface} from "./modules/interface.mjs";
import {Settings} from "./modules/data/settings.mjs";
import {SystemConfig} from "./modules/system-config.mjs";
import {Soundboard} from "./modules/applications/soundboard.mjs";

Hooks.once("init", SystemConfig.init);
Hooks.once("init", PublicInterface.init);
Hooks.once("init", Mayhem.init);
Hooks.once("init", Resting.init);
Hooks.once("init", Crafting.init);
Hooks.once("init", Settings.init);
Hooks.once("init", Soundboard.init);
