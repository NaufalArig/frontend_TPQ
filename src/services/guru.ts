import API_URL from "@/lib/api";
import { GuruFormData } from "@/types/guru";
import Cookies from "js-cookie";

function getToken() {
    if (typeof document === "undefined") return null;

    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
}

export async function getGuruById(id: string | number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/guru/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil data guru");
    }

    const result = await res.json();
    console.log("RAW RESPONSE getGuruById:", result);
    return result;
}

export async function getGuru() {
    const token = getToken();

    const res = await fetch(`${API_URL}/guru`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    console.log("API response:", res.json);

    if (!res.ok) {
        throw new Error("Gagal mengambil data guru");
    }

    return res.json();
}

export async function createGuru(data: GuruFormData) {
    const token = Cookies.get("token");

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, value as string | Blob);
        }
    });

    const res = await fetch(`${API_URL}/guru`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || JSON.stringify(result));
    }

    return result;
}

export async function updateGuru(
    id: string | number,
    data: GuruFormData
) {
    const token = getToken();

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, value as string | Blob);
        }
    });

    formData.append("_method", "PUT");

    const res = await fetch(`${API_URL}/guru/${id}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error.errors || error));
    }

    return res.json();
}

export async function deleteGuru(id: number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/guru/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal menghapus guru");
    }

    return res.json();
}