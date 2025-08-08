export type RandomTokens<T> = {
	next(): Promise<T>;
};

export class FakeRandomTokens implements RandomTokens<string> {
	// biome-ignore lint/correctness/noUnusedPrivateClassMembers: Used in next() method
	private _counter = 0;
	private predefinedTokens: string[] = [];

	async next(): Promise<string> {
		const token = this.predefinedTokens.shift();

		if (token) {
			return token;
		}

		return `fake-token-${++this._counter}`;
	}

	setPredefinedTokens(tokens: string[]): void {
		this.predefinedTokens = [...tokens];
	}

	reset(): void {
		this._counter = 0;
		this.predefinedTokens = [];
	}
}
