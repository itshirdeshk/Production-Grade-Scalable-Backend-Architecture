import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { BadRequestError } from "../core/CustomError";

export enum ValidationSource {
    "BODY" = "body",
    "QUERY" = "query",
    "PARAMS" = "params",
    "HEADERS" = "headers",
}

const validateRequest = (schema: ZodSchema, source: ValidationSource = ValidationSource.BODY) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // For headers, we need to handle them differently since they're not a simple object
            let dataToValidate = req[source];
            
            // Ensure we don't modify the request object in a way that would break it
            const data = schema.parse(dataToValidate);
            
            // For headers, we don't want to assign back to headers as it might overwrite headers
            if (source !== ValidationSource.HEADERS) {
                Object.assign(req[source], data);
            }
            
            next();
        } catch (err) {
            if (err instanceof ZodError) {                
                const message = err.errors.map(error => error.message).join(", ");
                return next(new BadRequestError(`Validation Error: ${message}`));
            }
            next(err);
        }
    }
}

export default validateRequest;