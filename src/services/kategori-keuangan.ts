import api from "@/lib/axios";
import { KategoriKeuanganFormData } from "@/types/kategori-keuangan";

export async function getKategoriKeuangan() {
    const res = await api.get("/kategori-keuangan");
    return res.data;
}

export async function getKategoriKeuanganById(id: string | number) {
    const res = await api.get(`/kategori-keuangan/${id}`);
    return res.data;
}

export async function createKategoriKeuangan(data: KategoriKeuanganFormData) {
    const res = await api.post("/kategori-keuangan", data);
    return res.data;
}

export async function updateKategoriKeuangan(
    id: string | number,
    data: KategoriKeuanganFormData
) {
    const res = await api.put(`/kategori-keuangan/${id}`, data);
    return res.data;
}

export async function deleteKategoriKeuangan(id: number) {
    const res = await api.delete(`/kategori-keuangan/${id}`);
    return res.data;
}