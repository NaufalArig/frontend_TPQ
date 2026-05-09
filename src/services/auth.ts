import API_URL from "@/lib/api";

import api from "@/lib/axios";
import Cookies from "js-cookie";


export async function getUser() {
    const res = await api.get("/user");
    return res.data;
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login gagal");
    }

    return data;
}

export async function logout() {
    try {
        await api.post("/logout");
    } catch (err) {
        console.log(err);
    }

    Cookies.remove("token");

    window.location.href = "/login";
}