# @tg-token-vending-machine/core

Core functionality for the Telegram bot token vending machine. This package contains the main business logic, interfaces, and token management functionality.

## 📋 Features

- **Token Lifecycle Management**: Create, validate, and revoke API tokens
- **User Access Control**: Configurable user permission system
- **Bot Command Handlers**: Complete set of Telegram bot commands
- **Token Status Validation**: Check token validity and expiration
- **Extensible Architecture**: Clean interfaces for custom implementations

## 🚀 Installation

```bash
npm install @tg-token-vending-machine/core
```

## 📖 Usage

### Basic Token Vending Machine

```typescript
import { TokenVendingMachine, TokenStatus } from '@tg-token-vending-machine/core';

// Create vending machine with your implementations
const vendingMachine = new TokenVendingMachine(
  telegramBot,      // Your bot implementation
  allowedUsers,     // Your user access control
  tokensRepository, // Your storage implementation
  randomTokens,     // Your token generator
  tokenLifetimeMs,  // Token lifetime (optional)
  maxTokensPerUser  // Max tokens per user (optional)
);

// Check token status
const status = await vendingMachine.tokenStatus('your-token-here');
console.log(status); // TokenStatus.VALID | TokenStatus.EXPIRED | TokenStatus.NOT_FOUND
```

### Available Bot Commands

The TokenVendingMachine automatically sets up these commands:

- **`/start`** - Welcome message and bot introduction
- **`/token`** - Generate a new API token for the user
- **`/tokens`** - List all user's tokens with status and expiration
- **`/revoke <token>`** - Revoke a specific token by its value

### Implementing Required Interfaces

#### TelegramBot Interface

```typescript
import type { TelegramBot, BotMessage } from '@tg-token-vending-machine/core';

class MyTelegramBot implements TelegramBot {
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

#### AllowedUsers Interface

```typescript
import type { AllowedUsers } from '@tg-token-vending-machine/core';

class MyAllowedUsers implements AllowedUsers {
  async contains(userId: number): Promise<boolean> {
    // Check if user is allowed to use the bot
    return this.allowedUserIds.includes(userId);
  }
}
```

#### TokensRepository Interface

```typescript
import type { TokensRepository, Token, NewToken } from '@tg-token-vending-machine/core';

class MyTokensRepository implements TokensRepository {
  async newToken(tokenData: NewToken): Promise<Token> {
    // Create and store new token
  }

  async byToken(tokenValue: string): Promise<Token | undefined> {
    // Find token by its value
  }

  async byOwnerId(ownerId: string): Promise<Token[]> {
    // Get all tokens for a user
  }

  async revokeToken(tokenValue: string): Promise<void> {
    // Remove/revoke a token
  }

  async all(): Promise<Token[]> {
    // Get all tokens (admin function)
  }
}
```

#### RandomTokens Interface

```typescript
import type { RandomTokens } from '@tg-token-vending-machine/core';

class MyRandomTokens implements RandomTokens<string> {
  async next(): Promise<string> {
    // Generate a new random token
    return generateRandomString();
  }
}
```

## 🏗️ Architecture

### Core Components

- **TokenVendingMachine**: Main orchestrator class
- **TokenStatus**: Enum for token validation states
- **Interfaces**: Clean contracts for external dependencies
- **Types**: TypeScript type definitions for all entities

### Token States

```typescript
enum TokenStatus {
  VALID = "VALID",           // Token is active and not expired
  EXPIRED = "EXPIRED",       // Token has exceeded its lifetime
  NOT_FOUND = "NOT_FOUND"    // Token doesn't exist in storage
}
```

### Token Entity

```typescript
type Token = {
  name: string;        // Human-readable token name
  token: string;       // Actual token value
  ownerId: string;     // User ID who owns this token
  createdAt: number;   // Creation timestamp (ms)
  lifeTimeMs: number;  // Token lifetime in milliseconds
}
```

## ⚙️ Configuration

### Constructor Parameters

```typescript
new TokenVendingMachine(
  telegramBot,                    // Required: Bot implementation
  allowedUsers,                   // Required: Access control
  tokensRepository?,              // Optional: Storage (defaults to in-memory)
  randomTokens?,                  // Optional: Token generator (defaults to UUID)
  tokenLifetimeMs?,              // Optional: Token lifetime (defaults to 30 days)
  maxTokensPerUser?              // Optional: Max tokens per user (defaults to 20)
)
```

### Default Values

- **Token Lifetime**: 30 days (2,592,000,000 ms)
- **Max Tokens Per User**: 20 tokens
- **Token Generator**: UUID v4
- **Storage**: In-memory repository

## 🔗 Related Packages

- **[@tg-token-vending-machine/sqlite-tokens-repository](../sqlite-tokens-repository)** - SQLite storage implementation
- **[@tg-token-vending-machine/telegraf-bot-adapter](../telegraf-bot-adapter)** - Telegraf framework integration

## 📄 License

MIT
