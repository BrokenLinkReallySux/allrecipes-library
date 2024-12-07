export type RecipeURL = `https://allrecipes.com/recipe/${string}`;
export type RecipePeriodOfTimeString = `PT${`${number}H` | undefined}${`${number}M` | undefined}`;
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
export default function getRecipe(url: RecipeURL): Promise<Recipe>;
export {};
