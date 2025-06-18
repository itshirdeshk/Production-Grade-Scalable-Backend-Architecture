import { model, Schema, Types } from "mongoose";

export enum RoleCode {
    USER = "USER",
    ADMIN = "ADMIN",
}

export interface RoleDoc {
    _id: Types.ObjectId;
    code: RoleCode;
    status: boolean;
};

export const DOCUMENT_NAME = "Role";
export const COLLECTION_NAME = "roles";

const schema = new Schema<RoleDoc>({
    code: {
        type: String,
        enum: Object.values(RoleCode),
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    }

}, { timestamps: true, versionKey: false });

schema.index({
    code: 1, status: 1
});

export const RoleModel = model<RoleDoc>(DOCUMENT_NAME, schema, COLLECTION_NAME);