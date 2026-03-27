import dotenv from "dotenv";
dotenv.config(); // load .env automatically when this module is imported
// 
import ImageKit from "imagekit";

console.log("/lib/imagekit.ts");
if (!process.env.IK_PUBLIC_KEY || !process.env.IK_PRIVATE_KEY || !process.env.IK_URL_ENDPOINT) {
  throw new Error("Missing one or more ImageKit environment variables!");
}

export const imagekit = new ImageKit({
  publicKey: process.env.IK_PUBLIC_KEY!,
  privateKey: process.env.IK_PRIVATE_KEY!,
  urlEndpoint: process.env.IK_URL_ENDPOINT!,
});
