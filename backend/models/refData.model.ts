import mongoose, { Schema, Document } from "mongoose";
import { RefDataDocument } from "../types/refData.js";

const refDataSchema = new Schema<RefDataDocument>(
    {
        refKey: {
            type: String,
            required: true,
            unique: true,
        },
        webPage: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: false,
        },
        value: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

const RefData = mongoose.model<RefDataDocument>("Refdata", refDataSchema);

export default RefData;
