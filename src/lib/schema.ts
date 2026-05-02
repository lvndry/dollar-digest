import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  category: text("category", { enum: ["tech", "politics"] }).notNull(),
  subcategory: text("subcategory"),
  bias: text("bias", {
    enum: ["far-left", "left", "center", "right", "far-right"],
  }),
  publishedAt: text("published_at").notNull(),
  readingTimeMinutes: integer("reading_time_minutes"),
  importanceScore: real("importance_score"),
  imageUrl: text("image_url"),
  digestDate: text("digest_date").notNull(),
  createdAt: text("created_at").notNull(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
