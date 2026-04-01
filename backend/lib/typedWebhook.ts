import { Webhook } from "svix";
import { ClerkWebhookEvent } from "../types/events.js";

export function createTypedWebhook(secret: string) {
  const wh = new Webhook(secret);

  function verify(
    payload: string,
    headers: Record<string, string>
  ): ClerkWebhookEvent {
    return wh.verify(payload, headers) as ClerkWebhookEvent;
  }

  return { verify };
}