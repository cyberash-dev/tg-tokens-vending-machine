import type { NewToken, Token, TokensRepository } from "../domain/Token";

export class InMemoryTokenRepository implements TokensRepository {
	private tokens = new Map<string, Token>();

	async byOwnerId(ownerId: string): Promise<Token[]> {
		return Array.from(this.tokens.values()).filter((token) => token.ownerId === ownerId);
	}

	async newToken(newToken: NewToken): Promise<Token> {
		const token: Token = {
			...newToken,
			createdAt: Date.now(),
		};

		this.tokens.set(token.token, token);

		return token;
	}

	async byToken(token: string): Promise<Token | undefined> {
		return this.tokens.get(token);
	}

	async revokeToken(token: string): Promise<void> {
		this.tokens.delete(token);
	}
}
