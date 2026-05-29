export type AbsensiSantriItem = {
    santri_id: number;
    nama: string;
    tanggal: string | null;
    status: "hadir" | "izin" | "sakit" | "alpa";
    keterangan?: string | null;
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
        keterangan?: string | null;
    }[];
};

export type RiwayatAbsensiItem = {
    id: number;
    santri_id: number;
    user_id: number | null;
    tanggal: string;
    status: "hadir" | "izin" | "sakit" | "alpa";
    keterangan: string | null;
    santri?: {
        id: number;
        nama: string;
    };
    user?: {
        id: number;
        name: string;
    };
};