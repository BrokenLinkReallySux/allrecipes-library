import type { RecipeImage, RecipeURL } from "./get-recipe";
export interface SimpleRecipe {
    url: RecipeURL;
    title: string;
    image: RecipeImage;
}
export interface AllrecipesSearchResult {
    offset: number;
    continues: boolean;
    recipes: SimpleRecipe[];
}
/**
 * Search for a bunch *(one page of search results)* of recipe data from allrecipes
 * @param query A search query
 * @param last The last page of results; If provided, this function will search for *the next* page of search results, as opposed to the first.
 * @example
 * ```
 * const first = await searchOnce(query); // page 1 of search results
 * const second = await searchOne(query, first); // page 2
 * ```
 */
export default function searchOnce(query: string, last?: AllrecipesSearchResult): Promise<AllrecipesSearchResult>;
