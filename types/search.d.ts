import { type SimpleRecipe } from "./search-once";
/**
 * An async generator function that fetches searches recipes and yields them
 * @see {@link searchOnce}
 * @param maxRecipes If provided, limits the number of recipes returned
 */
declare function search(query: string, maxRecipes?: number): AsyncGenerator<SimpleRecipe, SimpleRecipe | void, undefined>;
declare namespace search {
    var array: (query: string, maxRecipes?: number) => Promise<SimpleRecipe[]>;
}
export default search;
