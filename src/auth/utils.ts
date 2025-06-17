import { Types } from "mongoose";
import { tokenInfo } from "../config";
import { BadRequestError, InternalServerError } from "../core/CustomError";
import JWT, { JwtPayload } from "../core/JWT";
import { UserDoc } from "../models/userModel";

export enum Header {
    API_KEY = 'x-api-key'
}

export async function createTokens(user: UserDoc, accessTokenKey: string, refreshTokenKey: string) {

    const accessToken = await JWT.encode(new JwtPayload(tokenInfo.issuer, tokenInfo.audience, user._id.toString(), accessTokenKey, tokenInfo.accessTokenValidity), tokenInfo.secret);

    if (!accessToken) throw new InternalServerError("Access token generation failed");

    const refreshToken = await JWT.encode(new JwtPayload(tokenInfo.issuer, tokenInfo.audience, user._id.toString(), refreshTokenKey, tokenInfo.refreshTokenValidity), tokenInfo.secret);
    if (!refreshToken) throw new InternalServerError("Refresh token generation failed");

    return {
        accessToken,
        refreshToken
    };
}

export const getAccessToken = (authorization?: string) => {
    if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new BadRequestError("Authorization header is missing or invalid");
    }

    return authorization.split(" ")[1];
}

export const validateTokenData = (payload: JwtPayload) => {
    if (!payload || payload.aud !== tokenInfo.audience || !payload.sub || payload.iss !== tokenInfo.issuer || !payload.iat || !payload.exp || Types.ObjectId.isValid(payload.sub) === false) {
        throw new BadRequestError("Invalid token data");
    }

    return true;
}