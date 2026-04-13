import { Document, Types} from "mongoose";

export interface ImageDocument extends Document {
    _id: Types.ObjectId;
    originalName: string;
    url: string;
    size: number;
    base: string;
    folder: string;
    fileName: string;
}