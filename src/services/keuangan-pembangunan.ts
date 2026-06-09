import api from "@/lib/axios";
import { KeuanganPembangunanFormData } from "@/types/keuangan-pembangunan";

export async function getKeuanganPembangunan() {
    const res = await api.get("/keuangan-pembangunan");
    return res.data;
}

export async function getKeuanganPembangunanById(id: string | number) {
    const res = await api.get(`/keuangan-pembangunan/${id}`);
    return res.data;
}

export async function createKeuanganPembangunan(
    data: KeuanganPembangunanFormData
) {
    const res = await api.post("/keuangan-pembangunan", {
        financial_category_id: data.financial_category_id,
        payment_date: data.payment_date,
        transaction_type: data.transaction_type || "income",
        amount: data.amount,
        note: data.note || null,
    });

    return res.data;
}

export async function updateKeuanganPembangunan(
    id: string | number,
    data: KeuanganPembangunanFormData
) {
    const res = await api.put(`/keuangan-pembangunan/${id}`, {
        financial_category_id: data.financial_category_id,
        payment_date: data.payment_date,
        transaction_type: data.transaction_type || "income",
        amount: data.amount,
        note: data.note || null,
    });

    return res.data;
}

export async function deleteKeuanganPembangunan(id: number) {
    const res = await api.delete(`/keuangan-pembangunan/${id}`);
    return res.data;
}
