import type { NewToken } from "@tg-token-vending-machine/core";
import { SQLiteTokenRepository } from "./SQLiteTokenRepository";

describe("SQLiteTokenRepository", () => {
	let repository: SQLiteTokenRepository;

	beforeEach(() => {
		repository = new SQLiteTokenRepository(":memory:");
	});

	afterEach(() => {
		repository.close();
	});

	it("should create and retrieve token", async () => {
		const newToken: NewToken = {
			name: "test",
			token: "test_token_1",
			lifeTimeMs: 1000,
			ownerId: "user123"
		};

		const token = await repository.newToken(newToken);

		expect(token.name).toBe("test");
		expect(token.token).toBe("test_token_1");
		expect(token.lifeTimeMs).toBe(1000);
		expect(token.ownerId).toBe("user123");
		expect(typeof token.createdAt).toBe("number");

		const retrieved = await repository.byToken(token.token);
		expect(retrieved).toEqual(token);
	});

	it("should return undefined for non-existent token", async () => {
		const result = await repository.byToken("non_existent");
		expect(result).toBeUndefined();
	});

	it("should revoke token", async () => {
		const newToken: NewToken = {
			name: "test",
			token: "test_token_2",
			lifeTimeMs: 1000,
			ownerId: "user123"
		};

		const token = await repository.newToken(newToken);

		await repository.revokeToken(token.token);

		const retrieved = await repository.byToken(token.token);
		expect(retrieved).toBeUndefined();
	});

	it("should return all tokens", async () => {
		const newToken1: NewToken = {
			name: "test1",
			token: "test_token_3",
			lifeTimeMs: 1000,
			ownerId: "user123"
		};
		const newToken2: NewToken = {
			name: "test2",
			token: "test_token_4",
			lifeTimeMs: 2000,
			ownerId: "user456"
		};

		const token1 = await repository.newToken(newToken1);
		const token2 = await repository.newToken(newToken2);

		const all = await repository.all();

		expect(all).toHaveLength(2);
		expect(all).toContainEqual(token1);
		expect(all).toContainEqual(token2);
	});

	it("should handle empty repository", async () => {
		const all = await repository.all();
		expect(all).toHaveLength(0);
	});

	it("should find tokens by owner id", async () => {
		const newToken1: NewToken = {
			name: "token1",
			token: "test_token_5",
			lifeTimeMs: 1000,
			ownerId: "user123"
		};
		const newToken2: NewToken = {
			name: "token2",
			token: "test_token_6",
			lifeTimeMs: 2000,
			ownerId: "user123"
		};
		const newToken3: NewToken = {
			name: "token3",
			token: "test_token_7",
			lifeTimeMs: 3000,
			ownerId: "user456"
		};

		const token1 = await repository.newToken(newToken1);
		const token2 = await repository.newToken(newToken2);
		await repository.newToken(newToken3);

		const user123Tokens = await repository.byOwnerId("user123");
		const user456Tokens = await repository.byOwnerId("user456");
		const nonExistentUserTokens = await repository.byOwnerId("user999");

		expect(user123Tokens).toHaveLength(2);
		expect(user123Tokens).toContainEqual(token1);
		expect(user123Tokens).toContainEqual(token2);

		expect(user456Tokens).toHaveLength(1);
		expect(user456Tokens[0].ownerId).toBe("user456");

		expect(nonExistentUserTokens).toHaveLength(0);
	});
});
