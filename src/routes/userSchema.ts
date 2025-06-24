import {z} from 'zod';

export const userLoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
})

export const userRegisterSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
})

export const refreshAccessTokenSchema = z.object({
    refreshToken: z.string().nonempty({ message: "Refresh token is required" }),
})