import { Document, Types} from "mongoose";

export interface GalleryDocument extends Document {
    _id: Types.ObjectId;
    base: string;
    folder: string;
    access: string;
    title: string;
    cover: string;
    description: string;
}
