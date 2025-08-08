import type { TokensRepository } from "./domain/Token";
import type { AllowedUsers } from "./adapters/AllowedUsers";
import type { TelegramBot } from "./adapters/TelegramBot";
import type { RandomTokens } from "./adapters/RandomTokens";
import { InMemoryTokenRepository } from "./adapters/InMemoryTokenRepository";
import { RandomUUIDTokens } from "./adapters/RandomUUIDTokens";

export enum TokenStatus {
	NOT_FOUND = "NOT_FOUND",
	EXPIRED = "EXPIRED",
	VALID = "VALID",
}

export class TokenVendingMachine {
	constructor(
		private readonly telegramBot: TelegramBot,
		private readonly allowedUsers: AllowedUsers,

		private readonly tokensRepository: TokensRepository = new InMemoryTokenRepository(),
		private readonly randomTokens: RandomTokens<string> = new RandomUUIDTokens(),

		private readonly tokenLifetimeMs = 1000 * 60 * 60 * 24 * 30, // 1 month
		private readonly maxTokensPerUser = 20,
	) {
		this.setupHandlers();
	}

	private setupHandlers(): void {
		this.telegramBot.start(async (message) => {
			if (await this.allowedUsers.contains(message.fromId)) {
				await message.reply("Welcome! Use /token to get a new API token.");
			} else {
				await message.reply("Access denied.");
			}
		});

		this.telegramBot.command("token", async (message) => {
			const tokens = await this.tokensRepository.byOwnerId(message.fromId.toString());
			if (tokens.length >= this.maxTokensPerUser) {
				return message.reply("You have reached the maximum number of tokens.");
			}

			if (!(await this.allowedUsers.contains(message.fromId))) {
				return message.reply("Access denied.");
			}

			try {
				const token = await this.tokensRepository.newToken({
					name: `${message.fromId}-${Date.now()}`,
					lifeTimeMs: this.tokenLifetimeMs,
					ownerId: message.fromId.toString(),
					token: await this.randomTokens.next(),
				});

				const expiresAt = new Date(token.createdAt + token.lifeTimeMs);
				await message.reply(
					`Your new API token:\n\`${token.token}\`\n\nToken is valid until: ${expiresAt.toLocaleString()}`,
					{ isMarkdown: true },
				);
			} catch (e: unknown) {
				console.error(e);
				await message.reply("Error creating token. Please try again later.");
			}
		});

		this.telegramBot.command("tokens", async (message) => {
			if (!(await this.allowedUsers.contains(message.fromId))) {
				return await message.reply("Access denied.");
			}

			try {
				const tokens = await this.tokensRepository.byOwnerId(message.fromId.toString());

				if (tokens.length === 0) {
					return message.reply("No tokens found.");
				}

				const now = Date.now();
				const tokensList = tokens
					.map((token, index) => {
						const isExpired = token.createdAt + token.lifeTimeMs < now;
						const expiresAt = new Date(token.createdAt + token.lifeTimeMs);
						const status = isExpired ? "❌ Expired" : "✅ Valid";

						return (
							`${index + 1}. **${token.name}**\n` +
							`   Token: \`${token.token}\`\n` +
							`   Status: ${status}\n` +
							`   Expires: ${expiresAt.toLocaleString()}\n`
						);
					})
					.join("\n");

				await message.reply(`**All tokens:**\n\n${tokensList}`, { isMarkdown: true });
			} catch (e: unknown) {
				console.error(e);
				await message.reply("Error getting tokens. Please try again later.");
			}
		});

		this.telegramBot.command("revoke", async (message) => {
			if (!(await this.allowedUsers.contains(message.fromId))) {
				return await message.reply("Access denied.");
			}

			const args = message.text.split(" ");
			if (args.length !== 2) {
				return message.reply("Usage: /revoke <token_value>\nExample: /revoke abc123def456");
			}

			const tokenValue = args[1];

			try {
				await this.tokensRepository.revokeToken(tokenValue);
				await message.reply(`Token \`${tokenValue}\` has been revoked.`, { isMarkdown: true });
			} catch (e: unknown) {
				console.error(e);
				await message.reply("Error revoking token. Please try again later.");
			}
		});

		this.telegramBot.on("message", async (message) => {
			if (!(await this.allowedUsers.contains(message.fromId))) {
				return await message.reply("Access denied.");
			}

			await message.reply(
				"Use commands:\n/start - greeting\n/token - get a new API token\n/tokens - list all tokens\n/revoke <token> - revoke a token",
			);
		});
	}

	async tokenStatus(tokenValue: string): Promise<TokenStatus> {
		const token = await this.tokensRepository.byToken(tokenValue);
		if (!token) {
			return TokenStatus.NOT_FOUND;
		}

		const now = Date.now();
		if (token.createdAt + token.lifeTimeMs < now) {
			return TokenStatus.EXPIRED;
		}

		return TokenStatus.VALID;
	}
}
