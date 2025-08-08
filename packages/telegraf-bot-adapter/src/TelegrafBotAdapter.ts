import type { MessageHandler, TelegramBot, TelegramMessage } from "@tg-token-vending-machine/core";
import { Telegraf, type Context } from "telegraf";

export class TelegrafBotAdapter implements TelegramBot {
	constructor(private readonly bot: Telegraf) {}

	start(handler: MessageHandler): void {
		this.bot.start(async (ctx: Context) => {
			const message = this.createTelegramMessage(ctx);
			await handler(message);
		});
	}

	command(command: string, handler: MessageHandler): void {
		this.bot.command(command, async (ctx: Context) => {
			const message = this.createTelegramMessage(ctx);
			await handler(message);
		});
	}

	on(event: "message", handler: MessageHandler): void {
		this.bot.on("message", async (ctx: Context) => {
			const message = this.createTelegramMessage(ctx);
			await handler(message);
		});
	}

	async launch(): Promise<void> {
		await this.bot.launch();
	}

	stop(): void {
		this.bot.stop();
	}

	private createTelegramMessage(ctx: Context): TelegramMessage {
		const fromId = ctx.from?.id || 0;
		const text = "text" in ctx.message! ? ctx.message.text || "" : "";

		return {
			fromId,
			text,
			reply: async (replyText: string, options?: { isMarkdown?: boolean }) => {
				if (options?.isMarkdown) {
					await ctx.reply(replyText, { parse_mode: "Markdown" });
				} else {
					await ctx.reply(replyText);
				}
			}
		};
	}
}
