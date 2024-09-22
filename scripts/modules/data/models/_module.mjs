import behaviors from "./behaviors.mjs";
import RecipeData from "./recipe-item.mjs";
import StorageData from "./storage-actor.mjs";

export default {
  actor: {
    StorageData
  },
  item: {
    RecipeData
  },
  behavior: {
    ...behaviors
  }
};
