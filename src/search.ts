import searchOnce, {
	type AllrecipesSearchResult,
	type SimpleRecipe,
} from "./search-once";

/**
 * An async generator function that fetches searches recipes and yields them
 * @see {@link searchOnce}
 * @param maxRecipes If provided, limits the number of recipes returned
 */
export default async function* search(
	query: string,
	maxRecipes?: number
): AsyncGenerator<SimpleRecipe, SimpleRecipe | void, undefined> {
	let recipeCount = 0;
	let lastResults: AllrecipesSearchResult | undefined;
	let shouldContinue = true;
	while (shouldContinue) {
		const result = await searchOnce(query, lastResults);
		if (result.recipes.length === 0) {
			return;
		}
		if (maxRecipes !== undefined) {
			recipeCount += result.offset;
			if (recipeCount >= maxRecipes) {
				let recipes = result.recipes.filter(
					(_, index) => !(recipeCount - index > maxRecipes + 1)
				);
				const lastRecipe = recipes.pop();
				yield* recipes;
				return lastRecipe;
			}
		}
		yield* result.recipes;
	}
}

/**
 * Does the same thing as {@link search|*search*}, but returns an array of recipes instead of a generator.
 * @see {@link search}
 */
search.array = async function (query: string, maxRecipes?: number) {
	let arr: SimpleRecipe[] = [];
	for await (const recipe of search(query, maxRecipes)) {
		arr.push(recipe);
	}
	return arr;
};
