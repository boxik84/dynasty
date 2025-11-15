import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL;

export const authClient = createAuthClient({
    /** the base url of the server (optional if you're using the same domain) */
    baseURL,
});