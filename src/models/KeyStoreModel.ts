import { model, Schema } from "mongoose";

export default interface KeyStoreDoc {
    _id: Schema.Types.ObjectId;
    client: Schema.Types.ObjectId;
    primaryKey: string;
    secondaryKey: string;
    status: boolean;
}

export const DOCUMENT_NAME = "KeyStore";
export const COLLECTION_NAME = "keystores";

const schema = new Schema<KeyStoreDoc>({
    client: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    primaryKey: {
        type: String,
        required: true,
        trim: true,
    },
    secondaryKey: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true, versionKey: false });

schema.index({ client: 1 });
schema.index({ client: 1, primararyKey: 1, status: 1 });
schema.index({ client: 1, primaryKey: 1, secondaryKey: 1 });

export const KeyStoreModel = model<KeyStoreDoc>(DOCUMENT_NAME, schema, COLLECTION_NAME);