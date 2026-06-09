import API_URL from "@/lib/api";
import Cookies from "js-cookie";
import {
    AssetCategoryFormData,
    AssetFormData,
} from "@/types/aset";

function getToken() {
    if (typeof document === "undefined") return null;

    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
}

function buildAssetFormData(data: AssetFormData) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
            return;
        }

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


export async function getAssetCategories() {
    const token = getToken();

    const res = await fetch(`${API_URL}/asset-categories`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil kategori aset");
}

export async function getAssetCategoryById(id: string | number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/asset-categories/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil detail kategori aset");
}

export async function createAssetCategory(data: AssetCategoryFormData) {
    const token = Cookies.get("token");

    const res = await fetch(`${API_URL}/asset-categories`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return handleResponse(res, "Gagal menambahkan kategori aset");
}

export async function updateAssetCategory(
    id: string | number,
    data: AssetCategoryFormData
) {
    const token = getToken();

    const res = await fetch(`${API_URL}/asset-categories/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return handleResponse(res, "Gagal memperbarui kategori aset");
}

export async function deleteAssetCategory(id: number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/asset-categories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal menghapus kategori aset");
}


export async function getAssets(params?: {
    search?: string;
    asset_category_id?: string | number;
    condition?: string;
    status?: string;
}) {
    const token = getToken();
    const query = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            query.append(key, String(value));
        }
    });

    const res = await fetch(`${API_URL}/assets?${query.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil data aset");
}

export async function getAssetById(id: string | number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/assets/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal mengambil detail aset");
}

export async function createAsset(data: AssetFormData) {
    const token = Cookies.get("token");
    const formData = buildAssetFormData(data);

    const res = await fetch(`${API_URL}/assets`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    });

    return handleResponse(res, "Gagal menambahkan aset");
}

export async function updateAsset(id: string | number, data: AssetFormData) {
    const token = getToken();
    const formData = buildAssetFormData(data);

    formData.append("_method", "PUT");

    const res = await fetch(`${API_URL}/assets/${id}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    });

    return handleResponse(res, "Gagal memperbarui aset");
}

export async function deleteAsset(id: number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/assets/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return handleResponse(res, "Gagal menghapus aset");
}