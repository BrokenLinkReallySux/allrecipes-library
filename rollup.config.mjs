import { resolve } from "path";
import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";

process.chdir(import.meta.dirname);

export default defineConfig({
	input: resolve("./src/index.ts"),
	external: ["jquery", "jsdom", "axios", "tslib"],
	plugins: [nodeResolve(), typescript()],
	output: [
		{
			file: resolve("./dist/index.cjs"),
			format: "cjs",
		},
		{
			file: resolve("./dist/index.mjs"),
			format: "es",
		},
	],
});
