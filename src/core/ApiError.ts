import { Response } from "express";

export enum ErrorType {
    NOT_FOUND = 'NotFound',
    UNAUTHORIZED = 'Unauthorized',
    BAD_REQUEST = 'BadRequest',
    INTERNAL_SERVER_ERROR = 'InternalServerError',
    FORBIDDEN = 'Forbidden',
    TOKEN_EXPIRED = 'TokenExpired',
    BAD_TOKEN = 'BadToken',
    ACCESS_TOKEN_ERROR = 'AccessTokenError',
}

export class ApiError extends Error {
    type: ErrorType;
    statusCode: number;
    constructor(type: ErrorType, statusCode: number, message: string) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
        this.name = 'ApiError';
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    static handle(err: ApiError, res: Response) {
        res.status(err.statusCode || 500).json({
            type: err.type || ErrorType.INTERNAL_SERVER_ERROR,
            message: err.message || 'Internal Server Error',
        })
    }
}