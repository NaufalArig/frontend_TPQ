import API_URL from "@/lib/api";
import Cookies from "js-cookie";
import { SantriFormData } from "@/types/santri";

function getToken() {
    if (typeof document === "undefined") return null;

    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
}

function buildSantriFormData(data: SantriFormData) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
            return;
        }

        if (key === "join_date") {
            return;
        }

        if (
            ["photo", "family_card_file", "birth_certificate_file"].includes(key) &&
            !(value instanceof File)
        ) {
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

export async function getSantriById(id: string | number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil data santri");
}

export async function getSantri() {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil data santri");
}

export async function createSantri(data: SantriFormData) {
    const token = Cookies.get("token");
    const formData = buildSantriFormData(data);

    const res = await fetch(`${API_URL}/santri`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    return handleResponse(res, "Gagal menambahkan data santri");
}

export async function updateSantri(id: string | number, data: SantriFormData) {
    const token = getToken();
    const formData = buildSantriFormData(data);

    formData.append("_method", "PUT");

    const res = await fetch(`${API_URL}/santri/${id}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    });

    return handleResponse(res, "Gagal memperbarui data santri");
}

export async function deleteSantri(id: number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal menghapus santri");
}

export async function graduateSantri(id: number) {
    const token = getToken();
    const res = await fetch(`${API_URL}/santri/${id}/graduate`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return handleResponse(res, "Gagal meluluskan santri");
}