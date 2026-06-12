import api from "@/lib/axios";
import { KelasFormData } from "@/types/kelas";

export async function getKelas() {
    const res = await api.get("/kelas");
    return res.data;
}

export async function getKelasById(id: string | number) {
    const res = await api.get(`/kelas/${id}`);
    return res.data;
}

export async function createKelas(data: KelasFormData) {
    const res = await api.post("/kelas", {
        ...data,
        teacher_id: data.teacher_id || null,
    });

    return res.data;
}

export async function updateKelas(id: string | number, data: KelasFormData) {
    const res = await api.put(`/kelas/${id}`, {
        ...data,
        teacher_id: data.teacher_id || null,
    });

    return res.data;
}

export async function deleteKelas(id: number) {
    const res = await api.delete(`/kelas/${id}`);
    return res.data;
}

export async function getAvailableSantriForKelas(id: string | number) {
    const res = await api.get(`/kelas/${id}/available-santri`);
    return res.data;
}

export async function assignSantriToKelas(
    id: string | number,
    studentIds: number[]
) {
    const res = await api.post(`/kelas/${id}/assign-santri`, {
        student_ids: studentIds,
    });

    return res.data;
}