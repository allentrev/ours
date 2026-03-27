import { Document } from "mongoose";

export interface RefDataDocument extends Document {
    refKey: string;
    webPage: string;
    name?: string;
    value?: string;
}
