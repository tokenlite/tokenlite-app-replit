import { type Litepaper, type InsertLitepaper } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getLitepaper(id: string): Promise<Litepaper | undefined>;
  createLitepaper(litepaper: InsertLitepaper & { generatedContent?: any; status?: string }): Promise<Litepaper>;
  getRecentLitepapers(limit: number): Promise<Litepaper[]>;
}

export class MemStorage implements IStorage {
  private litepapers: Map<string, Litepaper>;

  constructor() {
    this.litepapers = new Map();
  }

  async getLitepaper(id: string): Promise<Litepaper | undefined> {
    return this.litepapers.get(id);
  }

  async createLitepaper(insertLitepaper: InsertLitepaper & { generatedContent?: any; status?: string }): Promise<Litepaper> {
    const id = randomUUID();
    const now = new Date();
    const litepaper: Litepaper = {
      ...insertLitepaper,
      id,
      createdAt: now,
      updatedAt: now,
      status: insertLitepaper.status || "pending",
      generatedContent: insertLitepaper.generatedContent || null,
      targetMarket: insertLitepaper.targetMarket || null,
      marketSize: insertLitepaper.marketSize || null,
    };
    this.litepapers.set(id, litepaper);
    return litepaper;
  }

  async getRecentLitepapers(limit: number): Promise<Litepaper[]> {
    const allLitepapers = Array.from(this.litepapers.values());
    return allLitepapers
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
