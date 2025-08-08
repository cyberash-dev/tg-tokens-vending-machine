import Database from "better-sqlite3";

import type { NewToken, Token, TokensRepository } from "@tg-tokens-vending-machine/core";

export class SQLiteTokenRepository implements TokensRepository {
	private db: Database.Database;

	constructor(
		dbPath: string = "tokens.db",
	) {
		this.db = new Database(dbPath);
		this.initDatabase();
	}

	private initDatabase(): void {
		const createTable = this.db.prepare(`
			CREATE TABLE IF NOT EXISTS tokens (
				name TEXT NOT NULL,
				token TEXT PRIMARY KEY,
				created_at INTEGER NOT NULL,
				life_time_ms INTEGER NOT NULL,
				owner_id TEXT NOT NULL
			)
		`);
		createTable.run();
	}

	async newToken(newToken: NewToken): Promise<Token> {
		const token: Token = {
			...newToken,
			createdAt: Date.now(),
		};

		const insert = this.db.prepare(`
			INSERT INTO tokens (name, token, created_at, life_time_ms, owner_id)
			VALUES (?, ?, ?, ?, ?)
		`);

		insert.run(token.name, token.token, token.createdAt, token.lifeTimeMs, token.ownerId);
		return token;
	}

	async byToken(token: string): Promise<Token | undefined> {
		const select = this.db.prepare(`
			SELECT name, token, created_at as createdAt, life_time_ms as lifeTimeMs, owner_id as ownerId
			FROM tokens
			WHERE token = ?
		`);

		const result = select.get(token) as Token | undefined;
		return result;
	}

	async byOwnerId(ownerId: string): Promise<Token[]> {
		const select = this.db.prepare(`
			SELECT name, token, created_at as createdAt, life_time_ms as lifeTimeMs, owner_id as ownerId
			FROM tokens
			WHERE owner_id = ?
		`);

		const results = select.all(ownerId) as Token[];
		return results;
	}

	async revokeToken(token: string): Promise<void> {
		const deleteStmt = this.db.prepare(`
			DELETE FROM tokens WHERE token = ?
		`);

		deleteStmt.run(token);
	}

	async all(): Promise<Token[]> {
		const selectAll = this.db.prepare(`
			SELECT name, token, created_at as createdAt, life_time_ms as lifeTimeMs, owner_id as ownerId
			FROM tokens
		`);

		const results = selectAll.all() as Token[];
		return results;
	}

	close(): void {
		this.db.close();
	}
}
