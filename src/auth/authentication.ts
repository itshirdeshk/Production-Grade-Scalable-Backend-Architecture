import express, { NextFunction, Request, Response } from "express";
import { validateTokenData } from "./utils";
import { ProtectedRequest } from "../types/app-request";
import JWT from "../core/JWT";
import { tokenInfo } from "../config";
import { Types } from "mongoose";
import User from "../models/userModel";
import { BadRequestError, TokenExpiredError } from "../core/CustomError";
import { KeyStoreModel } from "../models/keyStoreModel";
import asyncHandler from "../helpers/asyncHandler";

const router = express.Router();

export default router.use(
    asyncHandler(
        async (req: ProtectedRequest, res: Response, next: NextFunction) => {
            try {
                const payload = await JWT.validate(req.cookies.accessToken, tokenInfo.secret)
                validateTokenData(payload);

                const user = await User.findById(new Types.ObjectId(payload.sub));

                if (!user) throw new BadRequestError("User not found");
                req.user = user;

                const keyStore = await KeyStoreModel.findOne({
                    client: req.user,
                    primaryKey: payload.prm,
                    status: true
                })

                if (!keyStore) throw new BadRequestError("Invalid access token");
                req.keyStore = keyStore;
                next();
            } catch (error) {
                throw new TokenExpiredError("Access token has expired or is invalid");
            }
        }
    )
)