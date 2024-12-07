'use strict';

var jquery = require('jquery');
var jsdom = require('jsdom');
var axios = require('axios');

/**
 * Fetch information about a recipe including the name and description
 * @param url a string containing the url of the recipe; follows the schema `https://allrecipes.com/...`
 */
async function getRecipe(url) {
    const response = await axios.get(url), text = response.data, { window } = new jsdom.JSDOM(text), { document } = window;
    // @ts-ignore
    // if jquery is already loaded with a document, return jquery, otherwise load it with the passed document
    // i have no idea why this creates an ts error but maybe i'm just stupid :)
    const $ = ("fn" in jquery ? jquery : jquery(window));
    // fetch the schema element that allrecipes has
    const schemaElements = $(".allrecipes-schema", document);
    if (schemaElements.length === 0) {
        throw new Error("The recipe link provided did not yield " +
            "a webpage with a recipe schema. " +
            "Perhaps you made a typo?");
    }
    const jsonText = schemaElements.eq(0).html(), schema = JSON.parse(jsonText)[0];
    return {
        get schema() {
            return jsonText;
        },
        name: schema.name,
        authors: schema.author.map((author) => {
            const { "@type": _, ...rest } = author;
            return rest;
        }),
        prepTime: schema.prepTime,
        cookTime: schema.cookTime,
        totalTime: schema.totalTime,
        yield: schema.recipeYield,
        datePublished: new Date(schema.datePublished),
        description: schema.description,
        url,
        aggregateRating: Number(schema.aggregateRating.ratingValue),
        ratingCount: Number(schema.aggregateRating.ratingCount),
        image: {
            height: schema.image.height,
            width: schema.image.width,
            url: schema.image.url,
        },
        steps: schema.recipeInstructions.map((step) => {
            const { image, text } = step;
            return {
                images: image,
                text: text,
            };
        }),
        nutrition: (() => {
            const { "@type": _, ...rest } = schema.nutrition;
            return rest;
        })(),
        category: schema.recipeCategory,
        ingredients: schema.recipeIngredient,
        cuisine: schema.recipeCuisine,
    };
}

const cardQuery = ".mntl-card-list-card--extendable";
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
async function searchOnce(query, last) {
    if (last && !last.continues)
        return {
            offset: 0,
            continues: false,
            recipes: [],
        };
    const encodedQuery = encodeURIComponent(query);
    let searchURL = "https://allrecipes.com/search?q=" + encodedQuery;
    if (last && last.continues) {
        searchURL += `&offset=` + last.offset;
    }
    const response = await axios.get(searchURL), text = response.data, { window } = new jsdom.JSDOM(text), { document } = window;
    // see get-recipe.ts
    // @ts-ignore
    const $ = ("fn" in jquery ? jquery : jquery(window));
    let recipes = [];
    for (const element of $(cardQuery, document)) {
        const imageElement = $("img", element);
        const src = imageElement.attr("data-src");
        const title = $(".card__title-text", element).text();
        const url = $(element).attr("href");
        const image = {
            url: src,
        };
        if (imageElement.attr("height")) {
            image.height = Number(imageElement.attr("height"));
        }
        if (imageElement.attr("width")) {
            image.width = Number(imageElement.attr("width"));
        }
        recipes.push({
            title,
            url,
            image,
        });
    }
    const nextButton = $(".mntl-pagination__next", document);
    return {
        recipes,
        offset: $(cardQuery, document).length + (last?.offset ?? 0),
        continues: nextButton.text().length > 0,
    };
}

/**
 * An async generator function that fetches searches recipes and yields them
 * @see {@link searchOnce}
 * @param maxRecipes If provided, limits the number of recipes returned
 */
async function* search(query, maxRecipes) {
    let recipeCount = 0;
    let lastResults;
    let shouldContinue = true;
    while (shouldContinue) {
        const result = await searchOnce(query, lastResults);
        if (result.recipes.length === 0) {
            return;
        }
        if (maxRecipes !== undefined) {
            recipeCount += result.offset;
            if (recipeCount >= maxRecipes) {
                let recipes = result.recipes.filter((_, index) => !(recipeCount - index > maxRecipes + 1));
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
search.array = async function (query, maxRecipes) {
    let arr = [];
    for await (const recipe of search(query, maxRecipes)) {
        arr.push(recipe);
    }
    return arr;
};

exports.getRecipe = getRecipe;
exports.search = search;
exports.searchOnce = searchOnce;
