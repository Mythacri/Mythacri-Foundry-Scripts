import {Crafting} from "./modules/data/crafting.mjs";
import {Mayhem} from "./modules/data/mayhem.mjs";
import {Resting} from "./modules/data/resting.mjs";
import {PublicInterface} from "./modules/interface.mjs";
import {Settings} from "./modules/data/settings.mjs";
import {SystemConfig} from "./modules/system-config.mjs";
import {Soundboard} from "./modules/applications/soundboard.mjs";
import {Encounter} from "./modules/data/encounter.mjs";
import {Award} from "./modules/data/award.mjs";
import {CombatEnhancement} from "./modules/data/combat.mjs";
import {Storage} from "./modules/data/storage.mjs";
import {Auras} from "./modules/data/token-auras.mjs";

Hooks.once("init", SystemConfig.init);
Hooks.once("init", PublicInterface.init);
Hooks.once("init", Mayhem.init);
Hooks.once("init", Resting.init);
Hooks.once("init", Crafting.init);
Hooks.once("init", Settings.init);
Hooks.once("init", Soundboard.init);
Hooks.once("init", Encounter.init);
Hooks.once("init", Award.init);
Hooks.once("init", CombatEnhancement.init);
Hooks.once("init", Storage.init);
Hooks.once("init", Auras.init);
