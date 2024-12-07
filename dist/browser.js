throw new Error(
	"This library ('allrecipes') is not supported on the client side because cors exists. " +
		"If you want to use this library to fetch recipes from the client, " +
		"you should implement a REST api or something."
);
