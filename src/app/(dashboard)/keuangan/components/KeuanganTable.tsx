"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getKeuangan, deleteKeuangan } from "@/services/keuangan";
import { Keuangan, KeuanganSummary } from "@/types/keuangan";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
}

type Props = {
    search: string;
    jenisFilter: string;
};

export default function KeuanganTable({ search, jenisFilter }: Props) {
    const [summary, setSummary] = useState<KeuanganSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        id: number | null;
        keterangan: string;
    }>({ show: false, id: null, keterangan: "" });

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const data = await getKeuangan();
            setSummary(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    const loadData = async () => {
        const data = await getKeuangan();
        setSummary(data);
        setLoading(false);
    };

    const handleDeleteClick = (id: number, keterangan: string) => {
        setDeleteModal({ show: true, id, keterangan });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        try {
            await deleteKeuangan(deleteModal.id);
            loadData();
            showToast(`Data keuangan ${deleteModal.keterangan} berhasil dihapus!`, "success");
            setDeleteModal({ show: false, id: null, keterangan: "" });
        } catch (error) {
            console.error(error);
            showToast("Gagal menghapus data keuangan", "error");
        }
    };

    const filteredData = (summary?.data ?? []).filter((item) => {
        const keyword = search.toLowerCase();
        const matchSearch = item.keterangan.toLowerCase().includes(keyword);
        const matchJenis = jenisFilter === "" || item.jenis === jenisFilter;
        return matchSearch && matchJenis;
    });

    if (loading) return <p className="p-4 text-sm text-gray-500">Loading data keuangan...</p>;

    return (
        <>
            {deleteModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setDeleteModal({ show: false, id: null, keterangan: "" })}
                    />
                    <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6 dark:bg-gray-900">
                        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-red-100">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18.132 19.142C18.058 20.178 17.195 21 16.157 21H7.843C6.805 21 5.942 20.178 5.868 19.142L5 6H19Z" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                            Hapus Transaksi?
                        </h4>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Apakah kamu yakin ingin menghapus transaksi{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {deleteModal.keterangan}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null, keterangan: "" })}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs sm:text-sm text-green-600 font-medium">Total Pemasukan</p>
                        <p className="text-lg sm:text-xl font-bold text-green-700 mt-1 break-all">
                            {formatRupiah(summary?.pemasukan || 0)}
                        </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-xs sm:text-sm text-red-600 font-medium">Total Pengeluaran</p>
                        <p className="text-lg sm:text-xl font-bold text-red-700 mt-1 break-all">
                            {formatRupiah(summary?.pengeluaran || 0)}
                        </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs sm:text-sm text-blue-600 font-medium">Saldo</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-700 mt-1 break-all">
                            {formatRupiah(summary?.saldo || 0)}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/[0.03]">
                    <div className="overflow-x-auto w-full">
                        <div className="min-w-[700px]">
                            <Table>
                                <TableHeader className="border-b border-brand-300 bg-brand-100">
                                    <TableRow>
                                        {["Tanggal", "Jenis", "Keterangan", "Nominal", "Dibuat Oleh", "Aksi"].map((h) => (
                                            <TableCell
                                                key={h}
                                                isHeader
                                                className="px-3 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                                            >
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredData.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-4 py-8 text-center text-sm text-gray-400 col-span-6">
                                                Tidak ada data transaksi
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredData.map((item: Keuangan) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-3 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-theme-sm capitalize">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${item.jenis === "pemasukan"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {item.jenis}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[180px] truncate">
                                                    {item.keterangan}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                                    {formatRupiah(item.nominal)}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                                    {item.user?.name || "-"}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-theme-sm whitespace-nowrap">
                                                    <button
                                                        onClick={() => router.push(`/keuangan/edit/${item.id}`)}
                                                        className="text-blue-500 hover:underline text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <span className="mx-1 font-semibold text-gray-300">|</span>
                                                    <button
                                                        onClick={() => handleDeleteClick(item.id, item.keterangan)}
                                                        className="text-red-500 hover:underline text-sm"
                                                    >
                                                        Hapus
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </>
    );
}