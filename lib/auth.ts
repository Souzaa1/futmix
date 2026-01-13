import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 6,
        maxPasswordLength: 128,
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL!,
    session: {
        updateAge: 24 * 60 * 60, // 24 hours
        expiresIn: 60 * 60 * 24 * 7, // 7 days
    },
    trustedOrigins: process.env.BETTER_AUTH_URL
        ? [process.env.BETTER_AUTH_URL, "http://localhost:3000"]
        : ["http://localhost:3000"],
    plugins: [nextCookies()],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "PLAYER"
            }
        }
    }
});