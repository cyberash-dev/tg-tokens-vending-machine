module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/packages"],
	testMatch: ["**/*.test.ts"],
	collectCoverageFrom: [
		"packages/**/src/**/*.ts",
		"!packages/**/src/**/*.d.ts",
		"!packages/**/src/index.ts",
		"!packages/**/src/cli.ts"
	],
	moduleNameMapper: {
		"^@tg-tokens-vending-machine/core$": "<rootDir>/packages/core/src",
		"^@tg-tokens-vending-machine/core/(.*)$": "<rootDir>/packages/core/src/$1"
	}
};
