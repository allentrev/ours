// backend/lib/familyIdGenerator.ts

import { randomUUID } from "crypto";

export function generateHandle() {
  return `_${randomUUID()}`;
}

export function generateLocalPersonId() {
  return `LOCAL-I-${randomUUID()}`;
}

export function generateLocalFamilyId() {
  return `LOCAL-F-${randomUUID()}`;
}
export function generateLocalPlaceId() {
  return `LOCAL-P-${randomUUID()}`;
}

export function generateLocalNoteId() {
  return `LOCAL-N-${randomUUID()}`;
}

export function generateLocalMediaId() {
  return `LOCAL-M-${randomUUID()}`;
}
