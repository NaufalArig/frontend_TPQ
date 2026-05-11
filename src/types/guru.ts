export type GuruFormData = {
    nama: string;
    alamat: string;
    kontak: string;
    tanggal_masuk: string;
    tanggal_keluar: string;
    status: "aktif" | "nonaktif";
};

export type Guru = GuruFormData & {
    id: number;
    created_at?: string;
    updated_at?: string;
};