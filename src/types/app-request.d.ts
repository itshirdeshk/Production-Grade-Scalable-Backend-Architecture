import { Request } from "express";
import ApiKeyDoc from "../models/apiKeyModel";
import { UserDoc } from "../models/userModel";
import KeyStoreDoc from "../models/keyStoreModel";
import { RoleCode } from "../models/roleModel";

declare interface PublicRequest extends Request {
    apiKey?: ApiKeyDoc;
}


declare interface ProtectedRequest extends Request {
    user: UserDoc,
    accessToken: string;
    keyStore: KeyStoreDoc;
}

declare interface RoleRequest extends ProtectedRequest {
    currentRoleCodes?: RoleCode[];
}