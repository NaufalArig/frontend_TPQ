import api from "@/lib/axios";
import {
    AbsensiSantriResponse,
    AbsensiSubmitData,
    AttendanceStatus,
    RiwayatAbsensiItem,
} from "@/types/absensi";

export async function getAbsensiSantri(
    attendance_date: string,
    study_class_id?: string | number
): Promise<AbsensiSantriResponse> {
    const res = await api.get("/absensi-santri", {
        params: {
            attendance_date,
            study_class_id,
        },
    });

    return res.data;
}

export async function saveAbsensiSantri(data: AbsensiSubmitData) {
    const res = await api.post("/absensi-santri", data);
    return res.data;
}

export async function getRiwayatAbsensi(params?: {
    attendance_date?: string;
    date_from?: string;
    date_to?: string;
    student_id?: string | number;
    status?: AttendanceStatus | "";
}): Promise<RiwayatAbsensiItem[]> {
    const cleanParams = Object.fromEntries(
        Object.entries(params || {}).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
        )
    );

    const res = await api.get("/absensi-santri-riwayat", {
        params: cleanParams,
    });

    return res.data;
}