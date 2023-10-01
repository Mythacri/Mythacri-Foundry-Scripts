import {Crafting} from "./modules/data/crafting/base-crafting.mjs";
import {Mayhem} from "./modules/data/mayhem.mjs";
import {Resting} from "./modules/data/resting.mjs";
import {PublicInterface} from "./modules/interface.mjs";
import {SystemConfig} from "./modules/system-config.mjs";
import {RecipeData} from "./modules/data/crafting/recipe-item.mjs";
import {RecipeSheet} from "./modules/applications/recipe-sheet.mjs";

Hooks.once("init", SystemConfig.init);
Hooks.once("init", PublicInterface.init);
Hooks.once("init", Mayhem.init);
Hooks.once("init", Resting.init);
Hooks.once("init", Crafting.init);

// TODO: move this into the 'Crafting' class's init hook.
Hooks.on("init", () => {
  Object.assign(CONFIG.Item.dataModels, {
    "mythacri-scripts.recipe": RecipeData
  });
});

// TODO: move this into the 'Crafting' class's init hook.
Hooks.on("init", () => {
  DocumentSheetConfig.registerSheet(Item, "mythacri-scripts", RecipeSheet, {
      types: ["mythacri-scripts.recipe"],
      makeDefault: true
    });
});
