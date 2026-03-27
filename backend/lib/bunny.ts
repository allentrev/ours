import dotenv from "dotenv";
dotenv.config(); // load .env automatically when this module is imported
// 

import * as BunnyStorageSDK from "@bunny.net/storage-sdk";

console.log("/lib/bunny.ts");
if (!process.env.BUNNY_STORAGE_ZONE || !process.env.BUNNY_ACCESS_KEY) {
  throw new Error("Missing one or more Bunny environment variables!");
}

export const storageZone = BunnyStorageSDK.zone.connect_with_accesskey(
  BunnyStorageSDK.regions.StorageRegion.Singapore,
  process.env.BUNNY_STORAGE_ZONE!,
  process.env.BUNNY_ACCESS_KEY!,
);
