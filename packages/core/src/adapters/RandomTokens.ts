export type RandomTokens<T> = {
	next(): Promise<T>;
};

export class FakeRandomTokens implements RandomTokens<string> {
	private counter = 0;
	private predefinedTokens: string[] = [];

	async next(): Promise<string> {
		if (this.predefinedTokens.length > 0) {
			return this.predefinedTokens.shift()!;
		}
		return `fake-token-${++this.counter}`;
	}

	setPredefinedTokens(tokens: string[]): void {
		this.predefinedTokens = [...tokens];
	}

	reset(): void {
		this.counter = 0;
		this.predefinedTokens = [];
	}
}
