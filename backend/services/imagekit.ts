// services/imagekit.ts
import axios from "axios";
import type { ImageResponse, ImageData } from "../types/imagekit.ts";

export async function getImages(folderPath: string): Promise<ImageData[]> {
    const IK_PRIVATE_KEY = process.env.IK_PRIVATE_KEY;
    if (!IK_PRIVATE_KEY) {
        throw new Error("IK_PRIVATE_KEY is not set in environment variables");
    }

    const url = "https://api.imagekit.io/v1/files";
    const auth = Buffer.from(`${IK_PRIVATE_KEY}:`).toString("base64");

    const response = await axios.get<ImageResponse[]>(url, {
        headers: {
            Authorization: `Basic ${auth}`,
        },
        params: {
            path: folderPath,
            limit: 50,
        },
    });

    return response.data.map((file) => ({
        id: file.fileId,
        url: file.url,
        name: file.name,
    }));
}
