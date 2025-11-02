import { pgTable, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';

export const tasksTable = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  url: text('url').notNull(),
  question: text('question').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, processing, completed, failed
  answer: text('answer'),
  scrapedContent: jsonb('scraped_content'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type inference for insert and select
export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
