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