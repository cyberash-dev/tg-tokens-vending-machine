# @tg-token-vending-machine/sqlite-tokens-repository

SQLite implementation of the tokens repository interface for the Telegram bot token vending machine. Provides persistent storage for API tokens with full CRUD operations.

## 📋 Features

- **Persistent Storage**: SQLite database for reliable token storage
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Automatic Schema**: Database schema creation and initialization
- **Thread Safe**: Safe for concurrent access
- **In-Memory Support**: Option for in-memory database for testing
- **Type Safe**: Full TypeScript support with proper typing

## 🚀 Installation

```bash
npm install @tg-token-vending-machine/sqlite-tokens-repository
```

### Peer Dependencies

```bash
npm install @tg-token-vending-machine/core
```

## 📖 Usage

### Basic Usage

```typescript
import { SQLiteTokenRepository } from '@tg-token-vending-machine/sqlite-tokens-repository';
import { TokenVendingMachine } from '@tg-token-vending-machine/core';

// Create repository with file-based database
const repository = new SQLiteTokenRepository('./tokens.db');

// Or use in-memory database (for testing)
const memoryRepository = new SQLiteTokenRepository(':memory:');

// Use with TokenVendingMachine
const vendingMachine = new TokenVendingMachine(
  telegramBot,
  allowedUsers,
  repository  // SQLite repository
);
```

### Manual Repository Operations

```typescript
import type { NewToken } from '@tg-token-vending-machine/core';

// Create a new token
const newTokenData: NewToken = {
  name: 'api-token-1',
  token: 'abc123def456',
  ownerId: 'user123',
  lifeTimeMs: 1000 * 60 * 60 * 24 * 30 // 30 days
};

const token = await repository.newToken(newTokenData);
console.log('Created token:', token);

// Find token by value
const foundToken = await repository.byToken('abc123def456');
console.log('Found token:', foundToken);

// Get all tokens for a user
const userTokens = await repository.byOwnerId('user123');
console.log('User tokens:', userTokens);

// Revoke a token
await repository.revokeToken('abc123def456');
console.log('Token revoked');

// Get all tokens (admin operation)
const allTokens = await repository.all();
console.log('All tokens:', allTokens);

// Clean up
repository.close();
```

## 🗄️ Database Schema

The repository automatically creates the following table structure:

```sql
CREATE TABLE tokens (
  name TEXT NOT NULL,
  token TEXT PRIMARY KEY,
  ownerId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  lifeTimeMs INTEGER NOT NULL
);

CREATE INDEX idx_tokens_ownerId ON tokens(ownerId);
CREATE INDEX idx_tokens_createdAt ON tokens(createdAt);
```

### Column Descriptions

- **name**: Human-readable token identifier
- **token**: Unique token value (primary key)
- **ownerId**: ID of the user who owns this token
- **createdAt**: Unix timestamp of token creation
- **lifeTimeMs**: Token lifetime in milliseconds

## ⚙️ API Reference

### Constructor

```typescript
new SQLiteTokenRepository(databasePath: string)
```

**Parameters:**
- `databasePath` - Path to SQLite database file, or `:memory:` for in-memory database

### Methods

#### `newToken(tokenData: NewToken): Promise<Token>`

Creates a new token in the database.

**Parameters:**
- `tokenData` - Token data without createdAt (auto-generated)

**Returns:** Complete token object with createdAt timestamp

**Throws:** Error if token already exists

#### `byToken(tokenValue: string): Promise<Token | undefined>`

Finds a token by its value.

**Parameters:**
- `tokenValue` - The token string to search for

**Returns:** Token object if found, undefined otherwise

#### `byOwnerId(ownerId: string): Promise<Token[]>`

Gets all tokens belonging to a specific user.

**Parameters:**
- `ownerId` - User ID to search for

**Returns:** Array of token objects (empty if none found)

#### `revokeToken(tokenValue: string): Promise<void>`

Removes a token from the database.

**Parameters:**
- `tokenValue` - The token string to revoke

**Returns:** Promise that resolves when token is deleted

#### `all(): Promise<Token[]>`

Gets all tokens in the database (admin function).

**Returns:** Array of all token objects

#### `close(): void`

Closes the database connection. Call this when shutting down.

## 🔧 Configuration

### Database Path Options

```typescript
// File-based database (persistent)
new SQLiteTokenRepository('./data/tokens.db');
new SQLiteTokenRepository('/var/lib/app/tokens.db');

// In-memory database (testing/temporary)
new SQLiteTokenRepository(':memory:');
```

### Performance Considerations

- **Indexes**: Automatic indexes on `ownerId` and `createdAt` for fast queries
- **Connection Pooling**: Single connection per repository instance
- **WAL Mode**: Consider enabling WAL mode for better concurrent access
- **Backup**: Regular database backups recommended for production

## 🔗 Related Packages

- **[@tg-token-vending-machine/core](../core)** - Core functionality and interfaces
- **[@tg-token-vending-machine/telegraf-bot-adapter](../telegraf-bot-adapter)** - Telegraf framework integration

## 📄 Dependencies

- **better-sqlite3**: Fast, reliable SQLite3 bindings for Node.js
- **@tg-token-vending-machine/core**: Core interfaces and types

## 📄 License

MIT
