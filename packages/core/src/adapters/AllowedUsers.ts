export type AllowedUsers = {
	contains(telegramId: number): Promise<boolean>;
};

export class FakeAllowedUsers implements AllowedUsers {
	private allowedUserIds = new Set<number>();

	async contains(telegramId: number): Promise<boolean> {
		return this.allowedUserIds.has(telegramId);
	}

	addUser(telegramId: number): void {
		this.allowedUserIds.add(telegramId);
	}

	removeUser(telegramId: number): void {
		this.allowedUserIds.delete(telegramId);
	}

	reset(): void {
		this.allowedUserIds.clear();
	}
}
