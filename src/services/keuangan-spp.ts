import api from "@/lib/axios";
import { KeuanganSppFormData } from "@/types/keuangan-spp";

export async function getKeuanganSpp() {
    const res = await api.get("/keuangan-spp");
    return res.data;
}

export async function getKeuanganSppById(id: string | number) {
    const res = await api.get(`/keuangan-spp/${id}`);
    return res.data;
}

export async function createKeuanganSpp(data: KeuanganSppFormData) {
    const res = await api.post("/keuangan-spp", {
        student_id: data.student_id || null,
        payment_date: data.payment_date,
        month: data.month,
        year: data.year,
        amount: data.amount,
        note: data.note || null,
    });

    return res.data;
}

export async function updateKeuanganSpp(
    id: string | number,
    data: KeuanganSppFormData
) {
    const res = await api.put(`/keuangan-spp/${id}`, {
        student_id: data.student_id || null,
        payment_date: data.payment_date,
        month: data.month,
        year: data.year,
        amount: data.amount,
        note: data.note || null,
    });

    return res.data;
}

export async function deleteKeuanganSpp(id: number) {
    const res = await api.delete(`/keuangan-spp/${id}`);
    return res.data;
}