import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { corsUrl, environment } from "./config"
import "./database/index"
import "./cache/index"
import userRoutes from "./routes/userRoutes"
import todoRoutes from "./routes/todoRoutes"
import { ApiError, ErrorType } from "./core/ApiError"
import Logger from "./core/Logger"
import { InternalServerError } from "./core/CustomError"

export const app = express()

app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 }))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: Request, res: Response) => {
    res.status(200).send({
        message: "Welcome to the Todo API",
        version: "1.0.0",
        environment: environment,
    })
})

app.use("/api/users", userRoutes)
app.use("/api/todo", todoRoutes)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // If the headers have already been sent, let Express handle it
    if (res.headersSent) {
        return next(err);
    }
    
    if (err instanceof ApiError) {
        // Log the error details
        const errType = err.type === ErrorType.INTERNAL_SERVER_ERROR ? '500' : err.statusCode;
        Logger.error(
            `${errType} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
        
        Logger.error(err.stack || "No stack trace available");
        
        // Send the response once
        return ApiError.handle(err, res);
    }
    
    // For non-ApiError types, convert to Internal Server Error and handle
    const internalError = new InternalServerError(err.message || 'Something went wrong');
    Logger.error(`500 - ${internalError.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    Logger.error(err.stack || "No stack trace available");
    
    return ApiError.handle(internalError, res);
})

export default app;