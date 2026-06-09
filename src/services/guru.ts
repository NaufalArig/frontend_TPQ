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

function buildGuruFormData(data: GuruFormData) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
            return;
        }

        // Jangan kirim photo lama dalam bentuk string.
        // Photo hanya dikirim kalau File baru.
        if (key === "photo" && !(value instanceof File)) {
            return;
        }

        formData.append(key, value as string | Blob);
    });

    return formData;
}

async function handleResponse(res: Response, fallbackMessage: string) {
    const result = await res.json();

    if (!res.ok) {
        if (result.errors) {
            throw new Error(JSON.stringify(result.errors));
        }

        throw new Error(result.message || fallbackMessage);
    }

    return result;
}

export async function getGuruById(id: string | number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/guru/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil data guru");
}

export async function getGuru() {
    const token = getToken();

    const res = await fetch(`${API_URL}/guru`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil data guru");
}

export async function createGuru(data: GuruFormData) {
    const token = Cookies.get("token");
    const formData = buildGuruFormData(data);

    const res = await fetch(`${API_URL}/guru`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return handleResponse(res, "Gagal menambahkan data guru");
}

export async function updateGuru(id: string | number, data: GuruFormData) {
    const token = getToken();
    const formData = buildGuruFormData(data);

    formData.append("_method", "PUT");

    const res = await fetch(`${API_URL}/guru/${id}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    });

    return handleResponse(res, "Gagal memperbarui data guru");
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

    return handleResponse(res, "Gagal menghapus guru");
}