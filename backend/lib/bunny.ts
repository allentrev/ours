import * as BunnyStorageSDK from "@bunny.net/storage-sdk";

console.log("/lib/bunny.ts");

const storageZoneName = process.env.BUNNY_STORAGE_ZONE;
const accessKey = process.env.BUNNY_ACCESS_KEY;

if (!storageZoneName || !accessKey) {
  throw new Error(
    "Missing one or more Bunny environment variables."
  );
}

export const storageZone =
  BunnyStorageSDK.zone.connect_with_accesskey(
    BunnyStorageSDK.regions.StorageRegion.Singapore,
    storageZoneName,
    accessKey
  );