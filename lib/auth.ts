import { betterAuth } from "better-auth";
import { mysqlAdapter } from "./better-auth-mysql-adapter";
import { webDb } from "./db";

export const auth = betterAuth({
    database: mysqlAdapter(webDb),
    origin: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: false,
    },
    socialProviders: {
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
            redirectUri: `${process.env.BETTER_AUTH_URL}/api/auth/callback/discord`,
        },
    },
});