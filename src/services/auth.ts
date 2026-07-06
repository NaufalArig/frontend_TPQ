import API_URL from "@/lib/api";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { User } from "@/types/user";

export type LoginResponse = {
    status: boolean;
    message: string;
    token: string;
    user: User;
};

export async function getUser(): Promise<User> {
    const res = await api.get("/user");
    return res.data;
}

export async function login(
    username: string,
    password: string
): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login gagal");
    }

    return data;
}

export async function logout() {
    const token = Cookies.get("token");

    const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });

    if (!res.ok) {
        throw new Error("Gagal logout");
    }

    return res.json();
}
