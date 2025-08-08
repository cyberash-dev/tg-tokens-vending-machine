export type TelegramMessage = {
	fromId: number;
	text: string;
	reply(text: string, options?: { isMarkdown?: boolean }): Promise<void>;
};

export type MessageHandler = (message: TelegramMessage) => Promise<void>;

export type TelegramBot = {
	start(handler: MessageHandler): void;
	command(command: string, handler: MessageHandler): void;
	on(event: "message", handler: MessageHandler): void;
};

export class FakeTelegramBot implements TelegramBot {
	private startHandler?: MessageHandler;
	private commandHandlers = new Map<string, MessageHandler>();
	private messageHandler?: MessageHandler;
	private isLaunched = false;
	private isStopped = false;

	start(handler: MessageHandler): void {
		this.startHandler = handler;
	}

	command(command: string, handler: MessageHandler): void {
		this.commandHandlers.set(command, handler);
	}

	on(_event: "message", handler: MessageHandler): void {
		this.messageHandler = handler;
	}

	async launch(): Promise<void> {
		this.isLaunched = true;
	}

	stop(): void {
		this.isStopped = true;
	}

	async simulateStart(userId: number): Promise<string[]> {
		const replies: string[] = [];
		const context = this.createMockContext(userId, "/start", replies);

		if (this.startHandler) {
			await this.startHandler(context);
		}

		return replies;
	}

	async simulateCommand(command: string, userId: number, text?: string): Promise<string[]> {
		const replies: string[] = [];
		const context = this.createMockContext(userId, text || `/${command}`, replies);

		const handler = this.commandHandlers.get(command);
		if (handler) {
			await handler(context);
		}

		return replies;
	}

	async simulateMessage(userId: number, text: string): Promise<string[]> {
		const replies: string[] = [];
		const context = this.createMockContext(userId, text, replies);

		if (this.messageHandler) {
			await this.messageHandler(context);
		}

		return replies;
	}

	isLaunchedStatus(): boolean {
		return this.isLaunched;
	}

	isStoppedStatus(): boolean {
		return this.isStopped;
	}

	private createMockContext(userId: number, text: string, replies: string[]): TelegramMessage {
		const message: TelegramMessage = {
			fromId: userId,
			text,
			reply: async (replyText: string) => {
				replies.push(replyText);
			},
		};

		return {
			fromId: userId,
			text,
			reply: async (replyText: string) => {
				replies.push(replyText);
			}
		};
	}
}
