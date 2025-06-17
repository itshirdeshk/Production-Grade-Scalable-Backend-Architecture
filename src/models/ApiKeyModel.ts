import { model, Schema } from "mongoose";

export enum Permission {
    GENERAL = "GENERAL",
}

export default interface ApiKeyDoc {
    key: string;
    version: number;
    permissions: Permission[];
    status: boolean;
}

export const DOCUMENT_NAME = "ApiKey";
export const COLLECTION_NAME = "apikeys";

const schema = new Schema<ApiKeyDoc>({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxLength: 1024
    },
    version: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    permissions: {
        type: [{
            type: String,
            required: true,
            enum: Object.values(Permission)
        }],
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

schema.index({ key: 1, status: 1 });

export const ApiKeyModel = model<ApiKeyDoc>(DOCUMENT_NAME, schema, COLLECTION_NAME);