import {Mayhem} from "./modules/data/mayhem.mjs";
import {PublicInterface} from "./modules/interface.mjs";
import {SystemConfig} from "./modules/system-config.mjs";

Hooks.once("init", SystemConfig.init);
Hooks.once("init", PublicInterface.init);
Hooks.once("init", Mayhem.init);
