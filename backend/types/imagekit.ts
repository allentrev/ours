// types/imagekit.ts
export interface ImageResponse {
    fileId: string;
    url: string;
    name: string;
    [key: string]: any;
}

export interface ImageData {
    id: string;
    url: string;
    name: string;
}
