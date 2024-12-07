import { getRecipe } from "../dist/index.mjs";

const recipe = await getRecipe(
	"https://www.allrecipes.com/marry-me-chicken-soup-recipe-8421914"
);
console.log(recipe.name);
