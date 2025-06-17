import ApiKeyDoc, { ApiKeyModel } from "../models/ApiKeyModel";

async function findByKey(key: string): Promise<ApiKeyDoc | null> {
    return ApiKeyModel.findOne({ key, status: true });
}

export {findByKey};