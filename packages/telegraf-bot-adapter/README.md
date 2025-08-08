# @tg-tokens-vending-machine/telegraf-bot-adapter

Telegraf bot adapter for the Telegram token vending machine. This package provides seamless integration between the core token vending machine functionality and the Telegraf framework for Telegram bots.

## 📋 Features

- **Telegraf Integration**: Complete Telegraf framework support
- **Message Handling**: Automatic message parsing and routing
- **Error Handling**: Robust error handling for bot operations
- **Type Safety**: Full TypeScript support with proper typing
- **Context Management**: Proper Telegram context handling
- **Middleware Support**: Compatible with Telegraf middleware system

## 🚀 Installation

```bash
npm install @tg-tokens-vending-machine/telegraf-bot-adapter telegraf
```

### Peer Dependencies

```bash
npm install @tg-tokens-vending-machine/core telegraf
```

## 📖 Usage

### Basic Setup

```typescript
import { Telegraf } from 'telegraf';
import { TelegrafBotAdapter } from '@tg-tokens-vending-machine/telegraf-bot-adapter';
import { TokenVendingMachine } from '@tg-tokens-vending-machine/core';

// Create Telegraf instance
const telegraf = new Telegraf(process.env.BOT_TOKEN);

// Create adapter
const botAdapter = new TelegrafBotAdapter(telegraf);

// Use with TokenVendingMachine
const vendingMachine = new TokenVendingMachine(
  botAdapter,      // Telegraf adapter
  allowedUsers,    // Your access control implementation
  repository       // Your storage implementation
);

// Start the bot
telegraf.launch();

// Graceful shutdown
process.once('SIGINT', () => telegraf.stop('SIGINT'));
process.once('SIGTERM', () => telegraf.stop('SIGTERM'));
```

### Advanced Configuration

```typescript
import { Telegraf } from 'telegraf';
import { TelegrafBotAdapter } from '@tg-tokens-vending-machine/telegraf-bot-adapter';

const telegraf = new Telegraf(process.env.BOT_TOKEN);

// Add middleware
telegraf.use(async (ctx, next) => {
  console.log(`Message from ${ctx.from?.username}: ${ctx.message?.text}`);
  await next();
});

// Enable logging
telegraf.use(Telegraf.log());

// Create adapter
const botAdapter = new TelegrafBotAdapter(telegraf);

// Configure bot settings
telegraf.telegram.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'token', description: 'Generate new API token' },
  { command: 'tokens', description: 'List all your tokens' },
  { command: 'revoke', description: 'Revoke a token' }
]);
```

### Environment Variables

```bash
# Required
BOT_TOKEN=your_telegram_bot_token_here

# Optional
NODE_ENV=production
PORT=3000
```

## 🏗️ Architecture

### TelegrafBotAdapter Class

The adapter implements the `TelegramBot` interface from the core package:

```typescript
import type { TelegramBot, BotMessage } from '@tg-tokens-vending-machine/core';

class TelegrafBotAdapter implements TelegramBot {
  constructor(private telegraf: Telegraf) {}

  start(handler: (message: BotMessage) => Promise<void>): void {
    // Handle /start command
  }

  command(command: string, handler: (message: BotMessage) => Promise<void>): void {
    // Handle specific commands
  }

  on(event: string, handler: (message: BotMessage) => Promise<void>): void {
    // Handle general messages
  }
}
```

### Message Transformation

The adapter transforms Telegraf contexts into standardized `BotMessage` objects:

```typescript
type BotMessage = {
  fromId: number;           // User ID
  text: string;             // Message text
  reply: (text: string, options?: {
    isMarkdown?: boolean;
  }) => Promise<void>;      // Reply function
}
```

## 🔧 API Reference

### Constructor

```typescript
new TelegrafBotAdapter(telegraf: Telegraf)
```

**Parameters:**
- `telegraf` - Configured Telegraf instance

### Methods

#### `start(handler: (message: BotMessage) => Promise<void>): void`

Sets up handler for the `/start` command.

**Parameters:**
- `handler` - Function to handle start command messages

#### `command(command: string, handler: (message: BotMessage) => Promise<void>): void`

Sets up handler for a specific command.

**Parameters:**
- `command` - Command name (without `/`)
- `handler` - Function to handle command messages

#### `on(event: string, handler: (message: BotMessage) => Promise<void>): void`

Sets up handler for general message events.

**Parameters:**
- `event` - Event type (typically `'message'`)
- `handler` - Function to handle messages

## 🧪 Testing

The package includes tests for the adapter functionality:

## 🔍 Error Handling

The adapter includes comprehensive error handling:

```typescript
// Error handling in command handlers
telegraf.command('token', async (ctx) => {
  try {
    await handler(transformedMessage);
  } catch (error) {
    console.error('Command error:', error);
    await ctx.reply('An error occurred. Please try again later.');
  }
});

// Global error handling
telegraf.catch((err, ctx) => {
  console.error('Telegraf error:', err);
  return ctx.reply('An unexpected error occurred.');
});
```
## 🔗 Related Packages

- **[@tg-tokens-vending-machine/core](../core)** - Core functionality and interfaces
- **[@tg-tokens-vending-machine/sqlite-tokens-repository](../sqlite-tokens-repository)** - SQLite storage implementation

## 📄 Dependencies

- **telegraf**: Modern Telegram Bot API framework
- **@tg-tokens-vending-machine/core**: Core interfaces and types

## 📄 License

MIT
