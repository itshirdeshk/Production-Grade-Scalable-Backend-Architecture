import express, { Request, Response } from "express"
import swaggerJSDoc from "swagger-jsdoc";
import { port } from "./config";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

const options:swaggerJSDoc.Options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Todo API",
            version: "1.0.0",
            description: "Todo API documentation"
        },
        tags: [
            {
                name: "todos",
                description: "Todos API"
            },
            {
                name: "users",
                description: "Users API"
            }
        ],
        servers: [
            {
                url: `http://localhost:${port}`,
                description: "Development Server"
            }
        ],
        components: {
            securitySchemes: {
                Bearer: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT key authentication for API"
                },
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "x-api-key",
                    description: "API key authorization for API"
                }
            }
        }
    },
    apis: ['./src/routes/*.ts']
}

const swaggerSpec = swaggerJSDoc(options);

require("swagger-model-validator")(swaggerSpec)

router.get("/json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
})

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export default router;