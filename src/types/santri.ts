export type SantriFormData = {
    nama: string;
    jenis_kelamin: "L" | "P" | "";
    tanggal_lahir: string;
    alamat: string;
    nama_wali: string;
    kontak_wali: string;
    tanggal_masuk: string;
    status: "pending" | "aktif" | "lulus" | "keluar";
    foto?: File | null;
};

export type Santri = SantriFormData & {
    id: number;
    created_at?: string;
    updated_at?: string;
};