import { sql, relations } from "drizzle-orm";
import {
  pgSchema,
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Put THIS APP's tables inside its own Postgres schema.
 * Rename "practice_scheduler" to whatever you want for this app.
 */
export const app = pgSchema("practice_scheduler");

export const events = app.table("events", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  dates: jsonb("dates").notNull().$type<string[]>(),
  timeSlots: jsonb("time_slots").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const responses = app.table("responses", {
  // Safer to use UUID type for IDs (works great in Postgres)
  id: uuid("id").primaryKey().defaultRandom(),

  eventId: varchar("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),

  participantName: text("participant_name").notNull(),
  selectedSlots: jsonb("selected_slots").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventsRelations = relations(events, ({ many }) => ({
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  event: one(events, {
    fields: [responses.eventId],
    references: [events.id],
  }),
}));

export const insertEventSchema = createInsertSchema(events).omit({ createdAt: true });
export const insertResponseSchema = createInsertSchema(responses).omit({ id: true, createdAt: true });

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
