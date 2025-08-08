import type { Token } from "../entities/Token";

export type NewToken = Pick<Token, "name" | "lifeTimeMs" | "ownerId" | "token">;
export type TokensRepository = {
	newToken(newToken: NewToken): Promise<Token>;
	byToken(tokenValue: string): Promise<Token | undefined>;
	byOwnerId(ownerId: string): Promise<Token[]>;
	revokeToken(token: string): Promise<void>;
};

export class FakeTokensRepository implements TokensRepository {
	private tokens: Map<string, Token> = new Map();
	// biome-ignore lint/correctness/noUnusedPrivateClassMembers: because it's a fake repository
	private counter = 0;

	async newToken(newToken: NewToken): Promise<Token> {
		const token: Token = {
			...newToken,
			createdAt: Date.now(),
		};
		this.tokens.set(token.token, token);
		return token;
	}

	async byToken(tokenValue: string): Promise<Token | undefined> {
		return this.tokens.get(tokenValue);
	}

	async byOwnerId(ownerId: string): Promise<Token[]> {
		return Array.from(this.tokens.values()).filter((token) => token.ownerId === ownerId);
	}

	async revokeToken(tokenValue: string): Promise<void> {
		this.tokens.delete(tokenValue);
	}

	reset(): void {
		this.tokens.clear();
		this.counter = 0;
	}

	setToken(token: Token): void {
		this.tokens.set(token.token, token);
	}
}
