import { randomUUID } from "crypto";
import type { RandomTokens } from "./RandomTokens";

export class RandomUUIDTokens implements RandomTokens<string> {
	next(): Promise<string> {
		return Promise.resolve(randomUUID());
	}
}
