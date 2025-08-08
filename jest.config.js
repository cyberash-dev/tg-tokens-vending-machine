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
};
