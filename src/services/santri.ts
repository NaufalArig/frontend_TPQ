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

export async function getSantriById(id: string | number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil data santri");
    }

    return res.json();
}

export async function getSantri() {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil data santri");
    }

    return res.json();
}

function buildSantriFormData(data: SantriFormData) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
            formData.append(key, value as string | Blob);
        }
    });

    return formData;
}

//Function Tambah Santri
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

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.message || JSON.stringify(result));
    }

    return result;
}

//Function Edit Santri
export async function updateSantri(
    id: string | number,
    data: SantriFormData
) {
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

    const result = await res.json();

    if (!res.ok) {
        throw new Error(JSON.stringify(result.errors || result));
    }

    return result;
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

    if (!res.ok) {
        throw new Error("Gagal menghapus santri");
    }

    return res.json();
}