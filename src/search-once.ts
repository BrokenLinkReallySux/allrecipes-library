import jquery from "jquery";
import axios from "axios";
import { JSDOM } from "jsdom";
import type { RecipeImage, RecipeURL } from "./get-recipe";

const cardQuery = ".mntl-card-list-card--extendable";

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
export default async function searchOnce(
	query: string,
	last?: AllrecipesSearchResult
): Promise<AllrecipesSearchResult> {
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
	const response = await axios.get<string>(searchURL),
		text = response.data,
		{ window } = new JSDOM(text),
		{ document } = window;
	// see get-recipe.ts
	// @ts-ignore
	const $ = ("fn" in jquery ? jquery : jquery(window)) as JQueryStatic;
	let recipes: SimpleRecipe[] = [];

	for (const element of $(cardQuery, document)) {
		const imageElement = $("img", element);
		const src = imageElement.attr("data-src")!;
		const title = $(".card__title-text", element).text();
		const url = $(element).attr("href") as RecipeURL;
		const image: RecipeImage = {
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
