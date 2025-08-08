import type { AllowedUsers } from "./AllowedUsers";

export class AllowedIds implements AllowedUsers {
	constructor(private readonly allowedIds: number[]) {}

	async contains(telegramId: number): Promise<boolean> {
		return this.allowedIds.includes(telegramId);
	}
}
