import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { corsUrl, environment } from "./config"
import "./database/index"
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
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
        if (err.type === ErrorType.INTERNAL_SERVER_ERROR) {
            Logger.error(
                `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            )
        } else {
            Logger.error(
                `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            )
        }

        Logger.error(err.stack || "No stack trace available")

        if (environment === 'development') {
            res.status(500).send({
                message: err.message, stack: err.stack
            })
        }
    }
    ApiError.handle(new InternalServerError(), res);
})

export default app;