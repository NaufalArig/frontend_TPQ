import { jwtDecode } from "jwt-decode";

export type TokenPayload = {
    role?: string;
};

export function getUserFromRequest(req: Request): TokenPayload | null {
    const cookie = req.headers.get("cookie");

    if (!cookie) return null;

    const token = cookie
        .split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    if (!token) return null;

    try {
        return jwtDecode<TokenPayload>(token);
    } catch {
        return null;
    }
}