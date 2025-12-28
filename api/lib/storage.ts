import { events, responses, type Event, type InsertEvent, type Response, type InsertResponse } from "./schema.js";
import { db } from "./db.js";
import { eq } from "drizzle-orm";

export async function createEvent(insertEvent: InsertEvent): Promise<Event> {
  const [event] = await db.insert(events).values(insertEvent).returning();
  return event;
}

export async function getEvent(id: string): Promise<Event | undefined> {
  const [event] = await db.select().from(events).where(eq(events.id, id));
  return event || undefined;
}

export async function getEventWithResponses(id: string): Promise<(Event & { responses: Response[] }) | undefined> {
  const event = await getEvent(id);
  if (!event) return undefined;
  const eventResponses = await getResponsesByEvent(id);
  return { ...event, responses: eventResponses };
}

export async function createResponse(insertResponse: InsertResponse): Promise<Response> {
  const [response] = await db.insert(responses).values(insertResponse).returning();
  return response;
}

export async function getResponsesByEvent(eventId: string): Promise<Response[]> {
  return await db.select().from(responses).where(eq(responses.eventId, eventId));
}
