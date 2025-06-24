import { it, describe, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app";
import JWT from "../../src/core/JWT";
import { tokenInfo } from "../../src/config";

describe("Tests the register functionality", () => {
    // Arrange
    const endpoint = "/api/users/register";
    const userPayload = {
        name: "John Doe",
        email: "johndoe@gmail.com",
        password: "password123",
    }
    it("should register a user", async () => {
        // Act
        const res = await request(app).post(endpoint).send(userPayload);

        // Assert
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            name: "John Doe",
            email: "johndoe@gmail.com",
        });
        expect(res.body._id).toBeDefined();
    })

    it("should give 400 with invalid email", async () => {
        const res = await request(app).post(endpoint).send({
            name: "John Doe",
            email: "johndoegmail",
            password: "password123",
        });

        // Assert
        expect(res.status).toBe(400);
    })

    it("disallows duplicate registeration", async () => {
        await request(app).post(endpoint).send(userPayload).expect(201);

        await request(app).post(endpoint).send(userPayload).expect(400);
    })

    it("should generate tokens with the correct payload", async () => {
        const res = await request(app).post(endpoint).send(userPayload)

        const cookies = Array.isArray(res.headers["set-cookie"])
            ? res.headers["set-cookie"]
            : []

        const accessTokenCookie = cookies.find((cookie: string) =>
            cookie.startsWith("accessToken=")
        )
        const refreshTokenCookie = cookies.find((cookie: string) =>
            cookie.startsWith("refreshToken=")
        )

        expect(accessTokenCookie).toBeDefined()
        expect(refreshTokenCookie).toBeDefined()

        const accessToken = accessTokenCookie?.split(";")[0].split("=")[1]
        const refreshToken = refreshTokenCookie?.split(";")[0].split("=")[1]

        const decodedAccessToken = await JWT.decode(accessToken!)
        const decodedRefreshToken = await JWT.decode(refreshToken!)

        expect(decodedAccessToken.sub).toBeDefined()
        expect(decodedAccessToken.iss).toBe(tokenInfo.issuer)
        expect(decodedAccessToken.aud).toBe(tokenInfo.audience)

        expect(decodedRefreshToken.sub).toBeDefined()
        expect(decodedRefreshToken.iss).toBe(tokenInfo.issuer)
        expect(decodedRefreshToken.aud).toBe(tokenInfo.audience)
    })
});