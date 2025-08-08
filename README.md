# Telegram Token Vending Machine

A comprehensive monorepo for managing API token distribution through a Telegram bot with SQLite storage and configurable access control.

## 📋 Overview

This project provides a complete solution for distributing API tokens via a Telegram bot. It consists of three main packages:

- **@tg-token-vending-machine/core** - Core functionality and business logic
- **@tg-token-vending-machine/sqlite-tokens-repository** - SQLite storage implementation
- **@tg-token-vending-machine/telegraf-bot-adapter** - Telegraf framework integration

## 🚀 Features

- **Token Management**: Create, list, and revoke API tokens
- **Access Control**: Configurable user access control
- **Storage**: Persistent SQLite database storage
- **Telegram Integration**: Full Telegram bot support with Telegraf
- **TypeScript**: Full TypeScript support with type definitions
- **Testing**: Comprehensive test coverage
- **Monorepo**: Well-organized monorepo structure

## 📦 Packages

### Core (@tg-token-vending-machine/core)

The main business logic package containing:
- Token lifecycle management
- User access control interfaces
- Bot command handlers
- Token validation logic

### SQLite Repository (@tg-token-vending-machine/sqlite-tokens-repository)

SQLite-based storage implementation:
- Persistent token storage
- CRUD operations for tokens
- Database migrations and setup

### Telegraf Bot Adapter (@tg-token-vending-machine/telegraf-bot-adapter)

Telegraf framework integration:
- Bot setup and configuration
- Message handling
- Telegram API integration

## 🛠️ Installation

```bash
npm install
```

## 🏗️ Building

Build all packages:

```bash
npm run build
```

## 🧪 Testing

Run tests for all packages:

```bash
npm test
```

## 📖 Usage

### Basic Setup

```typescript
import { TokenVendingMachine } from '@tg-token-vending-machine/core';
import { SQLiteTokenRepository } from '@tg-token-vending-machine/sqlite-tokens-repository';
import { TelegrafBotAdapter } from '@tg-token-vending-machine/telegraf-bot-adapter';

// Setup components
const bot = new TelegrafBotAdapter(process.env.BOT_TOKEN);
const allowedUsers = new AllowedUsersList(['user1', 'user2']);
const repository = new SQLiteTokenRepository('./tokens.db');

// Create vending machine
const vendingMachine = new TokenVendingMachine(
  bot,
  allowedUsers,
  repository
);

// Start the bot
bot.start();
```

### Available Commands

- `/start` - Welcome message and instructions
- `/token` - Generate a new API token
- `/tokens` - List all your tokens with status
- `/revoke <token>` - Revoke a specific token

## 🔧 Configuration

### Environment Variables

- `BOT_TOKEN` - Telegram bot token from BotFather
- `DATABASE_PATH` - Path to SQLite database file (optional, defaults to memory)
- `TOKEN_LIFETIME_MS` - Token lifetime in milliseconds (optional, defaults to 30 days)
- `MAX_TOKENS_PER_USER` - Maximum tokens per user (optional, defaults to 20)

### User Access Control

Implement the `AllowedUsers` interface to control access:

```typescript
import type { AllowedUsers } from '@tg-token-vending-machine/core';

class CustomAllowedUsers implements AllowedUsers {
  async contains(userId: number): Promise<boolean> {
    // Your custom logic here
    return allowedUserIds.includes(userId);
  }
}
```

## 📄 License

MIT
