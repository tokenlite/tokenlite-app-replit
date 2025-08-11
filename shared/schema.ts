import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const litepapers = pgTable("litepapers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectName: text("project_name").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  description: text("description").notNull(),
  problemStatement: text("problem_statement").notNull(),
  targetMarket: text("target_market"),
  marketSize: text("market_size"),
  totalSupply: text("total_supply").notNull(),
  initialPrice: real("initial_price"),
  vestingPeriod: integer("vesting_period"),
  tokenDistribution: jsonb("token_distribution").notNull(),
  features: jsonb("features").notNull(),
  logoUrl: text("logo_url"),
  outputFormat: text("output_format").notNull(),
  contentStyle: text("content_style").default("professional"),
  documentLength: text("document_length").default("standard"),
  includeCharts: text("include_charts").default("true"),
  generatedContent: jsonb("generated_content"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertLitepaperSchema = createInsertSchema(litepapers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  generatedContent: true,
}).extend({
  projectName: z.string().min(1, "Project name is required"),
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  problemStatement: z.string().min(10, "Problem statement must be at least 10 characters"),
  totalSupply: z.string().min(1, "Total supply is required"),
  tokenDistribution: z.record(z.number()).refine((dist) => {
    const total = Object.values(dist).reduce((sum, val) => sum + val, 0);
    return Math.abs(total - 100) < 0.01;
  }, "Token distribution must total 100%"),
  features: z.array(z.object({
    name: z.string().min(1, "Feature name is required"),
    description: z.string().min(1, "Feature description is required"),
  })).min(1, "At least one feature is required"),
  outputFormat: z.enum(["pdf", "html", "markdown"]),
});

export type InsertLitepaper = z.infer<typeof insertLitepaperSchema>;
export type Litepaper = typeof litepapers.$inferSelect;
