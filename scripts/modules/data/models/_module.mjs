import behaviors from "./behaviors.mjs";
import RecipeData from "./recipe-item.mjs";

export default {
  item: {
    RecipeData,
  },
  behavior: {
    ...behaviors,
  },
};
