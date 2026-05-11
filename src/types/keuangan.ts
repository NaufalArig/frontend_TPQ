export type Keuangan = {
    id: number;
    tanggal: string;
    jenis: "pemasukan" | "pengeluaran";
    nominal: number;
    keterangan: string;
    user_id: number;
    user?: { id: number; name: string };
    created_at?: string;
    updated_at?: string;
};

export type KeuanganFormData = {
    tanggal: string;
    jenis: "pemasukan" | "pengeluaran";
    nominal: number;
    keterangan: string;
};

export type KeuanganSummary = {
    data: Keuangan[];
    pemasukan: number;
    pengeluaran: number;
    saldo: number;
};