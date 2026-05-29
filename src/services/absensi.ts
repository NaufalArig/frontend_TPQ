import api from "@/lib/axios";
import { AbsensiSubmitData } from "@/types/absensi";

export async function getAbsensiSantri(tanggal: string) {
    const res = await api.get(`/absensi-santri?tanggal=${tanggal}`);
    return res.data;
}

export async function saveAbsensiSantri(data: AbsensiSubmitData) {
    const res = await api.post("/absensi-santri", data);
    return res.data;
}

export async function getRiwayatAbsensi(params?: {
    tanggal?: string;
    status?: string;
}) {
    const query = new URLSearchParams();

    if (params?.tanggal) query.append("tanggal", params.tanggal);
    if (params?.status) query.append("status", params.status);

    const res = await api.get(`/absensi-santri-riwayat?${query.toString()}`);
    return res.data;
}