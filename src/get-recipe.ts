import jquery from "jquery";
import { JSDOM } from "jsdom";
import axios from "axios";

export type RecipeURL = `https://allrecipes.com/recipe/${string}`;
export type RecipePeriodOfTimeString = `PT${`${number}H` | undefined}${
	| `${number}M`
	| undefined}`;
export interface RecipeAuthor {
	name: string;
}
export type Nutrients = {
	calories: never;
	carbohydrateContent: never;
	unsaturatedFatContent: never;
	fatContent: never;
	sugarContent: never;
	sodiumContent: never;
	saturatedFatContent: never;
	proteinContent: never;
	fiberContent: never;
};
type BaseNutritionInformation = {
	[K in keyof Nutrients]: string;
};
export type NutritionInformation = {
	[k: string]: string;
} & BaseNutritionInformation;
export interface RecipeImage {
	height?: number;
	width?: number;
	url: string;
}
export interface RecipeHowToStep {
	images?: RecipeImage[];
	text: string;
}
export interface Recipe {
	name: string;
	readonly schema: string;
	authors: RecipeAuthor[];
	datePublished: Date;
	ratingCount: number;
	aggregateRating: number;
	nutrition: NutritionInformation;
	url: RecipeURL;
	description: string;
	category: string[];
	prepTime: RecipePeriodOfTimeString;
	cookTime: RecipePeriodOfTimeString;
	totalTime: RecipePeriodOfTimeString;
	yield: string[];
	image: RecipeImage;
	steps: RecipeHowToStep[];
	ingredients: string[];
	cuisine: string[];
}

/**
 * Fetch information about a recipe including the name and description
 * @param url a string containing the url of the recipe; follows the schema `https://allrecipes.com/...`
 */
export default async function getRecipe(url: RecipeURL): Promise<Recipe> {
	const response = await axios.get<string>(url),
		text = response.data,
		{ window } = new JSDOM(text),
		{ document } = window;
	// @ts-ignore
	// if jquery is already loaded with a document, return jquery, otherwise load it with the passed document
	// i have no idea why this creates an ts error but maybe i'm just stupid :)
	const $ = ("fn" in jquery ? jquery : jquery(window)) as JQueryStatic;
	// fetch the schema element that allrecipes has
	const schemaElements = $(".allrecipes-schema", document);
	if (schemaElements.length === 0) {
		throw new Error(
			"The recipe link provided did not yield " +
				"a webpage with a recipe schema. " +
				"Perhaps you made a typo?"
		);
	}
	const jsonText = schemaElements.eq(0).html(),
		schema = JSON.parse(jsonText)[0];
	return {
		get schema() {
			return jsonText;
		},
		name: schema.name as string,
		authors: (schema.author as any[]).map((author) => {
			const { "@type": _, ...rest } = author;
			return rest as RecipeAuthor;
		}),
		prepTime: schema.prepTime as RecipePeriodOfTimeString,
		cookTime: schema.cookTime as RecipePeriodOfTimeString,
		totalTime: schema.totalTime as RecipePeriodOfTimeString,
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
		steps: (schema.recipeInstructions as any[]).map((step) => {
			const { image, text } = step;
			return {
				images: image as RecipeImage[],
				text: text as string,
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
