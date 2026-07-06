import api from "@/lib/axios";
import {
    AssetCategory,
    AssetCategoryFormData,
} from "@/types/kategori-aset";

export async function getAssetCategories(): Promise<AssetCategory[]> {
    const res = await api.get("/asset-categories");
    return res.data;
}

export async function getAssetCategoryById(
    id: string | number
): Promise<AssetCategory> {
    const res = await api.get(`/asset-categories/${id}`);
    return res.data;
}

export async function createAssetCategory(data: AssetCategoryFormData) {
    const res = await api.post("/asset-categories", data);
    return res.data;
}

export async function updateAssetCategory(
    id: string | number,
    data: AssetCategoryFormData
) {
    const res = await api.put(`/asset-categories/${id}`, data);
    return res.data;
}

export async function deleteAssetCategory(id: number) {
    const res = await api.delete(`/asset-categories/${id}`);
    return res.data;
}