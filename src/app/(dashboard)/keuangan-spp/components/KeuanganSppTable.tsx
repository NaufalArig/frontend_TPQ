"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import {
    deleteKeuanganSpp,
    getKeuanganSpp,
} from "@/services/keuangan-spp";
import { KeuanganSpp } from "@/types/keuangan-spp";
import Pagination from "@/components/ui/pagination/Pagination";

type Props = {
    search: string;
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
};

const bulanLabel: Record<number, string> = {
    1: "Januari",
    2: "Februari",
    3: "Maret",
    4: "April",
    5: "Mei",
    6: "Juni",
    7: "Juli",
    8: "Agustus",
    9: "September",
    10: "Oktober",
    11: "November",
    12: "Desember",
};

function formatRupiah(value: number | string) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(value || 0));
}

export default function KeuanganSppTable({
    search,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
}: Props) {
    const [data, setData] = useState<KeuanganSpp[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { toast, showToast, hideToast } = useToast();
    const router = useRouter();

    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        id: number | null;
        nama: string;
    }>({
        show: false,
        id: null,
        nama: "",
    });

    useEffect(() => {
        getKeuanganSpp()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredData = data.filter((item) => {
        const keyword = search.toLowerCase();
        const matchDateFrom = !dateFrom || item.payment_date >= dateFrom;
        const matchDateTo = !dateTo || item.payment_date <= dateTo;
        const matchSearch =
            (item.student?.name || "").toLowerCase().includes(keyword) ||
            (item.student?.nisn || "").toLowerCase().includes(keyword) ||
            (item.note || "").toLowerCase().includes(keyword) ||
            (item.user?.name || "").toLowerCase().includes(keyword) ||
            String(item.amount).toLowerCase().includes(keyword) ||
            String(item.year).toLowerCase().includes(keyword) ||
            item.payment_date.toLowerCase().includes(keyword);

        return matchSearch && matchDateFrom && matchDateTo;
    });

    const totalNominal = filteredData.reduce(
        (total, item) => total + Number(item.amount || 0),
        0
    );
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(pageStart, pageStart + pageSize);

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteKeuanganSpp(deleteModal.id);

            setData((prev) =>
                prev.filter((item) => item.id !== deleteModal.id)
            );

            showToast(`Data SPP ${deleteModal.nama} berhasil dihapus!`, "success");

            setDeleteModal({
                show: false,
                id: null,
                nama: "",
            });
        } catch (error) {
            console.error(error);
            showToast("Gagal menghapus data SPP", "error");
        }
    };

    if (loading) return <p>Loading data SPP...</p>;

    return (
        <>
            {deleteModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() =>
                            setDeleteModal({
                                show: false,
                                id: null,
                                nama: "",
                            })
                        }
                    />

                    <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6 dark:bg-gray-900">
                        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-red-100">
                            <span className="text-2xl">🗑️</span>
                        </div>

                        <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                            Hapus Data SPP?
                        </h4>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Apakah kamu yakin ingin menghapus data SPP{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {deleteModal.nama}
                            </span>
                            ?
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        id: null,
                                        nama: "",
                                    })
                                }
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-700">Total Pembayaran SPP</p>
                <p className="mt-1 text-2xl font-bold text-green-800">
                    {formatRupiah(totalNominal)}
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1100px]">
                        <Table>
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">No</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">
                                        <div className="space-y-2">
                                            <span>Tanggal</span>
                                            <div className="flex gap-1">
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => onDateFromChange(e.target.value)}
                                                    className="h-8 w-32 rounded-md border border-brand-300 bg-white px-2 text-xs font-normal text-gray-700 focus:outline-none"
                                                    aria-label="Tanggal awal"
                                                />
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => onDateToChange(e.target.value)}
                                                    className="h-8 w-32 rounded-md border border-brand-300 bg-white px-2 text-xs font-normal text-gray-700 focus:outline-none"
                                                    aria-label="Tanggal akhir"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Santri</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Bulan</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Tahun</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Nominal</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Keterangan</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Petugas</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="px-4 py-6 text-center text-gray-500 text-theme-sm"
                                        >
                                            Data SPP tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {pageStart + index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {item.payment_date}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                <div>
                                                    <span className="block font-medium text-gray-800">
                                                        {item.student?.name || "-"}
                                                    </span>
                                                    <span className="block text-xs text-gray-400">
                                                        NISN: {item.student?.nisn || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {bulanLabel[Number(item.month)] || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {item.year}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-700 text-theme-sm font-semibold">
                                                {formatRupiah(item.amount)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {item.note || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {item.user?.name || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/keuangan-spp/edit/${item.id}`)
                                                    }
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    Edit
                                                </button>

                                                <span className="mx-1 font-semibold text-gray-300">
                                                    |
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        setDeleteModal({
                                                            show: true,
                                                            id: item.id,
                                                            nama: item.student?.name || "SPP",
                                                        })
                                                    }
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
                <Pagination
                    totalItems={filteredData.length}
                    currentPage={safeCurrentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
}
