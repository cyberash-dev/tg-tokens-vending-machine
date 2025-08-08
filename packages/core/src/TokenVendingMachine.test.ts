import { TokenVendingMachine, TokenStatus } from "./TokenVendingMachine";
import { FakeTelegramBot } from "./adapters/TelegramBot";
import { FakeTokensRepository } from "./domain/Token/services/TokensRepository";
import { FakeAllowedUsers } from "./adapters/AllowedUsers";
import { FakeRandomTokens } from "./adapters/RandomTokens";

describe("TokenVendingMachine", () => {
	let telegramBot: FakeTelegramBot;
	let allowedUsers: FakeAllowedUsers;
	let tokensRepository: FakeTokensRepository;
	let randomTokens: FakeRandomTokens;
	let tokenVendingMachine: TokenVendingMachine;

	const ALLOWED_USER_ID = 12345;
	const DISALLOWED_USER_ID = 99999;
	const TOKEN_LIFETIME_MS = 1000 * 60 * 60; // 1 hour for tests
	const MAX_TOKENS_PER_USER = 3;

	beforeEach(() => {
		telegramBot = new FakeTelegramBot();
		allowedUsers = new FakeAllowedUsers();
		tokensRepository = new FakeTokensRepository();
		randomTokens = new FakeRandomTokens();

		allowedUsers.addUser(ALLOWED_USER_ID);

		tokenVendingMachine = new TokenVendingMachine(
			telegramBot,
			allowedUsers,
			tokensRepository,
			randomTokens,
			TOKEN_LIFETIME_MS,
			MAX_TOKENS_PER_USER,
		);
	});

	afterEach(() => {
		allowedUsers.reset();
		tokensRepository.reset();
		randomTokens.reset();
	});

	describe("/start command", () => {
		it("should greet allowed user", async () => {
			const replies = await telegramBot.simulateStart(ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Welcome! Use /token to get a new API token.");
		});

		it("should reject unauthorized user", async () => {
			const replies = await telegramBot.simulateStart(DISALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Access denied.");
		});
	});

	describe("/token command", () => {
		it("should create new token for allowed user", async () => {
			randomTokens.setPredefinedTokens(["test-token-123"]);

			const replies = await telegramBot.simulateCommand("token", ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toContain("Your new API token:");
			expect(replies[0]).toContain("test-token-123");
			expect(replies[0]).toContain("Token is valid until:");

			const tokens = await tokensRepository.byOwnerId(ALLOWED_USER_ID.toString());
			expect(tokens).toHaveLength(1);
			expect(tokens[0].ownerId).toBe(ALLOWED_USER_ID.toString());
		});

		it("should reject unauthorized user", async () => {
			const replies = await telegramBot.simulateCommand("token", DISALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Access denied.");

			const tokens = await tokensRepository.byOwnerId(DISALLOWED_USER_ID.toString());
			expect(tokens).toHaveLength(0);
		});

		it("should reject token creation when limit is reached", async () => {
			for (let i = 0; i < MAX_TOKENS_PER_USER; i++) {
				await telegramBot.simulateCommand("token", ALLOWED_USER_ID);
			}

			const replies = await telegramBot.simulateCommand("token", ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("You have reached the maximum number of tokens.");

			const tokens = await tokensRepository.byOwnerId(ALLOWED_USER_ID.toString());
			expect(tokens).toHaveLength(MAX_TOKENS_PER_USER);
		});

		it("should handle errors when creating token", async () => {
			jest.spyOn(tokensRepository, "newToken").mockRejectedValueOnce(new Error("Database error"));
			jest.spyOn(console, "error").mockImplementation(() => {});

			const replies = await telegramBot.simulateCommand("token", ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Error creating token. Please try again later.");

			(console.error as jest.Mock).mockRestore();
		});
	});

	describe("/tokens command", () => {
		it("should show token list for allowed user", async () => {
			randomTokens.setPredefinedTokens(["token-1", "token-2"]);

			await telegramBot.simulateCommand("token", ALLOWED_USER_ID);
			await telegramBot.simulateCommand("token", ALLOWED_USER_ID);

			const replies = await telegramBot.simulateCommand("tokens", ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toContain("**All tokens:**");
			expect(replies[0]).toContain("token-1");
			expect(replies[0]).toContain("token-2");
			expect(replies[0]).toContain("✅ Valid");
		});

		it("should show expired tokens", async () => {
			const expiredToken = {
				name: "expired-token",
				token: "expired-123",
				ownerId: ALLOWED_USER_ID.toString(),
				createdAt: Date.now() - TOKEN_LIFETIME_MS - 1000,
				lifeTimeMs: TOKEN_LIFETIME_MS,
			};

			tokensRepository.setToken(expiredToken);

			const replies = await telegramBot.simulateCommand("tokens", ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toContain("❌ Expired");
			expect(replies[0]).toContain("expired-123");
		});

		it("should notify if no tokens found", async () => {
			const replies = await telegramBot.simulateCommand("tokens", ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("No tokens found.");
		});

		it("should reject unauthorized user", async () => {
			const replies = await telegramBot.simulateCommand("tokens", DISALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Access denied.");
		});

		it("should handle errors when getting tokens", async () => {
			jest.spyOn(tokensRepository, "byOwnerId").mockRejectedValueOnce(new Error("Database error"));
			jest.spyOn(console, "error").mockImplementation(() => {});

			const replies = await telegramBot.simulateCommand("tokens", ALLOWED_USER_ID);

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Error getting tokens. Please try again later.");

			(console.error as jest.Mock).mockRestore();
		});
	});

	describe("/revoke command", () => {
		it("should revoke token by value", async () => {
			randomTokens.setPredefinedTokens(["token-to-revoke"]);
			await telegramBot.simulateCommand("token", ALLOWED_USER_ID);

			const replies = await telegramBot.simulateCommand("revoke", ALLOWED_USER_ID, "/revoke token-to-revoke");

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Token `token-to-revoke` has been revoked.");

			const token = await tokensRepository.byToken("token-to-revoke");
			expect(token).toBeUndefined();
		});

		it("should show usage instruction on incorrect usage", async () => {
			const replies = await telegramBot.simulateCommand("revoke", ALLOWED_USER_ID, "/revoke");

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Usage: /revoke <token_value>\nExample: /revoke abc123def456");
		});

		it("should reject unauthorized user", async () => {
			const replies = await telegramBot.simulateCommand("revoke", DISALLOWED_USER_ID, "/revoke some-token");

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Access denied.");
		});

		it("should handle errors when revoking token", async () => {
			jest.spyOn(tokensRepository, "revokeToken").mockRejectedValueOnce(new Error("Database error"));
			jest.spyOn(console, "error").mockImplementation(() => {});

			const replies = await telegramBot.simulateCommand("revoke", ALLOWED_USER_ID, "/revoke some-token");

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Error revoking token. Please try again later.");

			(console.error as jest.Mock).mockRestore();
		});
	});

	describe("regular messages", () => {
		it("should show command list to allowed user", async () => {
			const replies = await telegramBot.simulateMessage(ALLOWED_USER_ID, "Hello");

			expect(replies).toHaveLength(1);
			expect(replies[0]).toContain("Use commands:");
			expect(replies[0]).toContain("/start");
			expect(replies[0]).toContain("/token");
			expect(replies[0]).toContain("/tokens");
			expect(replies[0]).toContain("/revoke");
		});

		it("should reject unauthorized user", async () => {
			const replies = await telegramBot.simulateMessage(DISALLOWED_USER_ID, "Hello");

			expect(replies).toHaveLength(1);
			expect(replies[0]).toBe("Access denied.");
		});
	});

	describe("tokenStatus method", () => {
		it("should return VALID for valid token", async () => {
			const validToken = {
				name: "valid-token",
				token: "valid-123",
				ownerId: ALLOWED_USER_ID.toString(),
				createdAt: Date.now(),
				lifeTimeMs: TOKEN_LIFETIME_MS,
			};

			tokensRepository.setToken(validToken);

			const status = await tokenVendingMachine.tokenStatus("valid-123");

			expect(status).toBe(TokenStatus.VALID);
		});

		it("should return EXPIRED for expired token", async () => {
			const expiredToken = {
				name: "expired-token",
				token: "expired-123",
				ownerId: ALLOWED_USER_ID.toString(),
				createdAt: Date.now() - TOKEN_LIFETIME_MS - 1000,
				lifeTimeMs: TOKEN_LIFETIME_MS,
			};

			tokensRepository.setToken(expiredToken);

			const status = await tokenVendingMachine.tokenStatus("expired-123");

			expect(status).toBe(TokenStatus.EXPIRED);
		});

		it("should return NOT_FOUND for non-existent token", async () => {
			const status = await tokenVendingMachine.tokenStatus("non-existent-token");

			expect(status).toBe(TokenStatus.NOT_FOUND);
		});
	});

	describe("integration tests", () => {
		it("should correctly handle full token lifecycle", async () => {
			randomTokens.setPredefinedTokens(["integration-token"]);

			const createReplies = await telegramBot.simulateCommand("token", ALLOWED_USER_ID);
			expect(createReplies[0]).toContain("integration-token");

			const status = await tokenVendingMachine.tokenStatus("integration-token");
			expect(status).toBe(TokenStatus.VALID);

			const listReplies = await telegramBot.simulateCommand("tokens", ALLOWED_USER_ID);
			expect(listReplies[0]).toContain("integration-token");

			const revokeReplies = await telegramBot.simulateCommand("revoke", ALLOWED_USER_ID, "/revoke integration-token");
			expect(revokeReplies[0]).toContain("has been revoked");

			const finalStatus = await tokenVendingMachine.tokenStatus("integration-token");
			expect(finalStatus).toBe(TokenStatus.NOT_FOUND);
		});

		it("should correctly handle token limits", async () => {
			for (let i = 0; i < MAX_TOKENS_PER_USER; i++) {
				const replies = await telegramBot.simulateCommand("token", ALLOWED_USER_ID);
				expect(replies[0]).toContain("Your new API token:");
			}

			const limitReachedReplies = await telegramBot.simulateCommand("token", ALLOWED_USER_ID);
			expect(limitReachedReplies[0]).toBe("You have reached the maximum number of tokens.");

			const tokens = await tokensRepository.byOwnerId(ALLOWED_USER_ID.toString());
			expect(tokens).toHaveLength(MAX_TOKENS_PER_USER);
		});
	});
});
