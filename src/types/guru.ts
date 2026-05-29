export type GuruFormData = {
    nama: string;
    email?: string;
    password?: string;
    alamat: string;
    kontak: string;
    tanggal_masuk: string;
    tanggal_keluar: string;
    status: "pending" | "aktif" | "nonaktif";
    foto?: File | null;
};

export type Guru = GuruFormData & {
    id: number;
    created_at?: string;
    updated_at?: string;
};