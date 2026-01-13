import { createAuthClient } from "better-auth/react"

const getBaseURL = () => {
    if (typeof window !== "undefined") {
        return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
    fetchOptions: {
        credentials: "include"
    }
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient
