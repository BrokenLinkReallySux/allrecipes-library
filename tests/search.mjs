import { search } from "../dist/index.mjs";

// with async iteration
console.log("-- Chicken Recipes --");
let idx = 1;
for await (const recipe of search("chicken", 10)) {
	console.log(idx + ": " + recipe.title);
	idx++;
}

// with the `.array` method
idx = 1;
console.log("-- Beef Recipes --");
(await search.array("beef", 10)).forEach((recipe) => {
	console.log(idx + ": " + recipe.title);
	idx++;
});
