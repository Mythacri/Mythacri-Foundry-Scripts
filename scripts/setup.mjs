import {SystemConfig} from "./modules/system-config.mjs";

Hooks.once("init", SystemConfig.init);
