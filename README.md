# Allrecipes

A Node.JS interface for allrecipes.com

### Search For Recipes

```ts
import { search, type SimpleRecipe } from "allrecipes";

for await (const recipe of search("chicken", 10)) {
	console.log(recipe.name);
}
```

### Get Info About A Recipe

```ts
import { getRecipe, type Recipe } from "allrecipes";

const recipe: Recipe = await getRecipe(
	"https://www.allrecipes.com/marry-me-chicken-soup-recipe-8421914"
);
console.log(recipe.name);
console.log(recipe.description);
```

## API

**getRecipe(url: RecipeURL): Promise\<Recipe\>**

Fetch information about a recipe

```ts
import { type Recipe, getRecipe } from "allrecipes";
const recipe: Recipe = await getRecipe(
	"https://www.allrecipes.com/recipe/216756/baked-ham-and-cheese-party-sandwiches/"
);
```

**search(query: string, maxRecipes?: number): AsyncGenerator\<SimpleRecipe, SimpleRecipe | void, undefined\>**

Search for recipes

```ts
import { search } from "allrecipes";
for await (const recipe of search("ice cream", 10)) {
	// ...
}
```

**search.array(query: string, maxRecipes?: number): Promise\<SimpleRecipe[]\>**

Like `search`, but returns an array.

```ts
import { search, type SimpleRecipe } from "allrecipes";
const recipes: SimpleRecipe[] = await search.array("ice cream");
```

**searchOnce(query: string, last?: AllrecipesSearchResult): Promise\<AllRecipesSearchResult\>**

Fetch a single page of search results. To fetch the next page, pass the previous results as the second argument.

```ts
import { searchOnce, type AllrecipesSearchResult } from "allrecipes";
const firstPage = await searchOnce("chocolate");
const secondPage = await searchOnce("chocolate", firstPage);
```
