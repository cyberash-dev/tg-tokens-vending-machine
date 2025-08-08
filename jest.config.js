module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/packages"],
	testMatch: ["**/*.test.ts"],
	collectCoverageFrom: [
		"packages/**/src/**/*.ts",
		"!packages/**/src/**/*.d.ts",
		"!packages/**/src/index.ts",
		"!packages/**/src/cli.ts",
	],
	moduleNameMapper: {
		"^@tg-tokens-vending-machine/core$": "<rootDir>/packages/core/src",
		"^@tg-tokens-vending-machine/core/(.*)$": "<rootDir>/packages/core/src/$1",
		"^@tg-tokens-vending-machine/sqlite-tokens-repository$": "<rootDir>/packages/sqlite-tokens-repository/src",
		"^@tg-tokens-vending-machine/sqlite-tokens-repository/(.*)$": "<rootDir>/packages/sqlite-tokens-repository/src/$1",
		"^@tg-tokens-vending-machine/telegraf-bot-adapter$": "<rootDir>/packages/telegraf-bot-adapter/src",
		"^@tg-tokens-vending-machine/telegraf-bot-adapter/(.*)$": "<rootDir>/packages/telegraf-bot-adapter/src/$1",
	},
};
