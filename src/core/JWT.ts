import { sign, SignOptions, decode as jwtDecode, verify as jwtVerify } from "jsonwebtoken";
import { BadTokenError, InternalServerError, TokenExpiredError } from "./CustomError";

export class JwtPayload {
    aud: string;
    sub: string;
    iss: string;
    iat: number;
    exp: number;
    prm: string;
    constructor(issuer: string, audience: string, subject: string, param: string, validity: number) {
        this.iss = issuer;
        this.aud = audience;
        this.sub = subject;
        this.prm = param;
        this.iat = Math.floor(Date.now() / 1000);
        this.exp = this.iat + validity;
    }
}

function encode(payload: JwtPayload, secret: string): Promise<string> {
    if (!secret) throw new InternalServerError("Token generation failed: Secret key is missing");

    const options: SignOptions = {
        algorithm: 'HS256',
    }

    try {
        return new Promise((resolve, reject) => {
            sign({ ...payload }, secret, options, (err, token) => {
                if (err) return reject(new InternalServerError("Token generation failed"));
                resolve(token as string);
            })
        })
    } catch (error) {
        throw new InternalServerError("Token generation failed");
    }
}

async function decode(token: string): Promise<JwtPayload> {
    if (!token) throw new InternalServerError("Token decoding failed: Token is missing");

    try {
        const decoded = jwtDecode(token);
        if (!decoded || typeof (decoded) === "string") throw new BadTokenError("Token decoding failed: Invalid token");
        return decoded as JwtPayload;
    } catch (error) {
        throw new BadTokenError("Token decoding failed");
    }
}

async function validate(token: string, secret: string): Promise<JwtPayload> {
    if (!token) throw new InternalServerError("Token verification failed: Token is missing");
    if (!secret) throw new InternalServerError("Token verification failed: Secret key is missing");

    try {
        return new Promise((resolve, reject) => {
            jwtVerify(token, secret, (err, decoded) => {
                if (err) {
                    if (err?.name === 'TokenExpiredError') {
                        return reject(new TokenExpiredError("Token has expired"));
                    }
                    return reject(new BadTokenError("Token verification failed"));
                }
                resolve(decoded as JwtPayload);
            })
        })
    } catch (error) {
        throw new BadTokenError("Token verification failed");
    }
}

export default {
    encode,
    decode,
    validate
}