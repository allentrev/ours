import { Webhook } from "svix";
import { EventMap, ClerkUnknownEvent } from "../types/events.js";

export type AppEvent =
  | { type: "user.created"; data: EventMap["user.created"] }
  | { type: "user.deleted"; data: EventMap["user.deleted"] }
  | { type: string; data: ClerkUnknownEvent }; // catch-all

export function createTypedWebhook(secret: string) {
  const wh = new Webhook(secret);

  function verify(payload: string, headers: Record<string, string>): AppEvent {
    return wh.verify(payload, headers) as AppEvent;
  }

  return { verify };
}

// --- Type guards ---
export function isUserCreatedEvent(evt: AppEvent): evt is Extract<AppEvent, { type: "user.created" }> {
  return evt.type === "user.created";
}

export function isUserDeletedEvent(evt: AppEvent): evt is Extract<AppEvent, { type: "user.deleted" }> {
  return evt.type === "user.deleted";
}

export function isUnknownEvent(
  evt: AppEvent
): evt is Extract<AppEvent, { type: string; data: ClerkUnknownEvent }> {
  return evt.type !== "user.created" && evt.type !== "user.deleted";
}