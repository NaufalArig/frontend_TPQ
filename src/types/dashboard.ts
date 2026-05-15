export type SantriPending = {
    id: number;
    nama: string;
    tanggal_lahir: string;
    tanggal_masuk: string;
};

export type TransaksiTerakhir = {
    id: number;
    tanggal: string;
    jenis: "pemasukan" | "pengeluaran";
    nominal: number;
    keterangan: string;
    user?: { id: number; name: string };
};

export type ChartKeuangan = {
    bulan: string;
    pemasukan: number;
    pengeluaran: number;
};

export type DashboardStats = {
    total_santri: number;
    total_guru: number;
    total_user: number;
    pemasukan: number;
    pengeluaran: number;
    saldo: number;
    notifikasi_belum_dibaca: number;
    santri_pending: SantriPending[];
    transaksi_terakhir: TransaksiTerakhir[];
    chart_keuangan: ChartKeuangan[];
};