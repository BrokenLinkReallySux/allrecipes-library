import { searchOnce } from "../dist/index.mjs";

const first = await searchOnce("chicken");
console.log(first.recipes[0]);
const second = await searchOnce("chicken", first);
console.log(second.recipes[0]);
