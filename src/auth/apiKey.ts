import validator, { ValidationSource } from "../helpers/validator";
import express, { NextFunction, Request, Response } from "express";
import schema from "./schema";
import { Header } from "./utils";
import { ForbiddenError } from "../core/CustomError";
import { findByKey } from "../controllers/apiKeyController";
import { PublicRequest } from "../types/app-request";

const router = express.Router();

export default router.use(validator(schema.apiKey, ValidationSource.HEADERS),
    async (req: PublicRequest, res: Response, next: NextFunction) => {
        const key = req.headers[Header.API_KEY]?.toString();
        if (!key) return next(new ForbiddenError("API Key is required"));

        const apiKey = await findByKey(key);
        if (!apiKey) {
            return next(new ForbiddenError("Invalid API Key"));
        }

        req.apiKey = apiKey;
        return next();
    }
)