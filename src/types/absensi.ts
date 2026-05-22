export type AbsensiSantriItem = {
    santri_id: number;
    nama: string;
    tanggal: string | null;
    status: "hadir" | "izin" | "sakit" | "alpa";
    keterangan: string;
};

export type AbsensiSantriResponse = {
    tanggal: string;
    data: AbsensiSantriItem[];
};

export type AbsensiSubmitData = {
    tanggal: string;
    absensi: {
        santri_id: number;
        status: "hadir" | "izin" | "sakit" | "alpa";
        keterangan?: string;
    }[];
};