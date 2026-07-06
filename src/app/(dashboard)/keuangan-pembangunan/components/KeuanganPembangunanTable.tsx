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
    deleteKeuanganPembangunan,
    getKeuanganPembangunan,
} from "@/services/keuangan-pembangunan";
import { KeuanganPembangunan } from "@/types/keuangan-pembangunan";
import Pagination from "@/components/ui/pagination/Pagination";
import SortableHeader, {
    SortDirection,
} from "@/components/ui/table/SortableHeader";
import DatePicker from "@/components/form/date-picker";

type Props = {
    search: string;
    dateFrom: string;
    dateTo: string;
    filterMonth: string;
    transactionType: "" | "income" | "expense";
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onFilterMonthChange: (value: string) => void;
    onTransactionTypeChange: (value: "" | "income" | "expense") => void;
};

function formatRupiah(value: number | string) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(value || 0));
}

function getDateOnly(value?: string | null) {
    return value ? value.slice(0, 10) : "";
}

function formatDate(value?: string | null) {
    const dateOnly = getDateOnly(value);
    if (!dateOnly) return "-";

    const date = new Date(`${dateOnly}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getCategoryName(item: KeuanganPembangunan) {
    return item.financial_category?.name || item.financialCategory?.name || "-";
}

export default function KeuanganPembangunanTable({
    search,
    dateFrom,
    dateTo,
    filterMonth,
    transactionType,
    onDateFromChange,
    onDateToChange,
    onFilterMonthChange,
    onTransactionTypeChange,
}: Props) {
    const [data, setData] = useState<KeuanganPembangunan[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
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
        getKeuanganPembangunan()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSort = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const filteredData = data.filter((item) => {
        const keyword = search.toLowerCase();
        const paymentDate = getDateOnly(item.payment_date);
        const matchDateFrom = !dateFrom || paymentDate >= dateFrom;
        const matchDateTo = !dateTo || paymentDate <= dateTo;
        const matchMonth = !filterMonth || paymentDate.startsWith(filterMonth);
        const matchTransactionType =
            transactionType === "" || item.transaction_type === transactionType;
        const matchSearch =
            (item.financialCategory?.name || "").toLowerCase().includes(keyword) ||
            (item.financial_category?.name || "").toLowerCase().includes(keyword) ||
            (item.transaction_type === "expense" ? "pengeluaran" : "pemasukan")
                .toLowerCase()
                .includes(keyword) ||
            (item.note || "").toLowerCase().includes(keyword) ||
            (item.user?.name || "").toLowerCase().includes(keyword) ||
            String(item.amount).toLowerCase().includes(keyword) ||
            formatDate(item.payment_date).toLowerCase().includes(keyword) ||
            paymentDate.includes(keyword);

        return matchSearch && matchDateFrom && matchDateTo && matchMonth && matchTransactionType;
    });

    const totalPemasukan = filteredData.reduce((total, item) => {
        if (item.transaction_type !== "expense") {
            return total + Number(item.amount || 0);
        }

        return total;
    }, 0);

    const totalPengeluaran = filteredData.reduce((total, item) => {
        if (item.transaction_type === "expense") {
            return total + Number(item.amount || 0);
        }

        return total;
    }, 0);

    const saldoPembangunan = totalPemasukan - totalPengeluaran;

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortKey || !sortDirection) return 0;

        const getValue = (item: KeuanganPembangunan) => {
            switch (sortKey) {
                case "payment_date":
                    return item.payment_date || "";
                case "transaction_type":
                    return item.transaction_type === "expense" ? "Pengeluaran" : "Pemasukan";
                case "category":
                    return getCategoryName(item);
                case "amount":
                    return Number(item.amount || 0);
                case "note":
                    return item.note || "";
                case "user":
                    return item.user?.name || "";
                default:
                    return "";
            }
        };

        const valueA = getValue(a);
        const valueB = getValue(b);

        if (typeof valueA === "number" && typeof valueB === "number") {
            return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
        }

        const compare = String(valueA).localeCompare(String(valueB), "id", {
            numeric: true,
            sensitivity: "base",
        });

        return sortDirection === "asc" ? compare : -compare;
    });

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(pageStart, pageStart + pageSize);
    const hasActiveFilter =
        dateFrom !== "" || dateTo !== "" || filterMonth !== "" || transactionType !== "";

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteKeuanganPembangunan(deleteModal.id);

            setData((prev) =>
                prev.filter((item) => item.id !== deleteModal.id)
            );

            showToast(
                `Data ${deleteModal.nama} berhasil dihapus!`,
                "success"
            );

            setDeleteModal({
                show: false,
                id: null,
                nama: "",
            });
        } catch (error) {
            console.error(error);
            showToast("Gagal menghapus data keuangan pembangunan", "error");
        }
    };

    if (loading) return <p>Loading data keuangan pembangunan...</p>;

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
                            Hapus Data Keuangan?
                        </h4>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Apakah kamu yakin ingin menghapus data{" "}
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

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-700">Total Pemasukan</p>
                    <p className="mt-1 text-2xl font-bold text-green-800">
                        {formatRupiah(totalPemasukan)}
                    </p>
                </div>

                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">Total Pengeluaran</p>
                    <p className="mt-1 text-2xl font-bold text-red-800">
                        {formatRupiah(totalPengeluaran)}
                    </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">Saldo Pembangunan</p>
                    <p className="mt-1 text-2xl font-bold text-blue-800">
                        {formatRupiah(saldoPembangunan)}
                    </p>
                </div>
            </div>

            <div className="mb-3 flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-48">
                    <DatePicker
                        key={dateFrom || "empty-pembangunan-date-from"}
                        id="keuangan-pembangunan-date-from"
                        label="Dari Tanggal"
                        placeholder="Tanggal awal"
                        defaultDate={dateFrom || undefined}
                        maxDate={dateTo || undefined}
                        onChange={(_, currentDateString) => {
                            onDateFromChange(currentDateString || "");
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="w-full sm:w-48">
                    <DatePicker
                        key={dateTo || "empty-pembangunan-date-to"}
                        id="keuangan-pembangunan-date-to"
                        label="Sampai Tanggal"
                        placeholder="Tanggal akhir"
                        defaultDate={dateTo || undefined}
                        minDate={dateFrom || undefined}
                        onChange={(_, currentDateString) => {
                            onDateToChange(currentDateString || "");
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="w-full sm:w-48">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Pilih Bulan
                    </label>
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={(event) => {
                            onFilterMonthChange(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20"
                    />
                </div>

                <select
                    value={transactionType}
                    onChange={(e) => {
                        onTransactionTypeChange(e.target.value as "" | "income" | "expense");
                        setCurrentPage(1);
                    }}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    aria-label="Filter jenis transaksi"
                >
                    <option value="">Semua Jenis</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                </select>

                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={() => {
                            onDateFromChange("");
                            onDateToChange("");
                            onFilterMonthChange("");
                            onTransactionTypeChange("");
                            setCurrentPage(1);
                        }}
                        className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Reset Filter
                    </button>
                )}

                <span className="ml-auto text-xs text-gray-400">
                    {sortedData.length} data ditemukan
                </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1120px]">
                        <Table>
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">No</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">
                                        Tanggal
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">
                                        Jenis
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">
                                        <SortableHeader
                                            label="Kategori"
                                            sortKey="category"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">
                                        Nominal
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">
                                        Keterangan
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">
                                        Petugas
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {sortedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="px-4 py-6 text-center text-gray-500 text-theme-sm"
                                        >
                                            Data keuangan pembangunan tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {pageStart + index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                {formatDate(item.payment_date)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        item.transaction_type === "expense"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-green-100 text-green-700"
                                                    }`}
                                                >
                                                    {item.transaction_type === "expense"
                                                        ? "Pengeluaran"
                                                        : "Pemasukan"}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm">
                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                    {getCategoryName(item)}
                                                </span>
                                            </TableCell>

                                            <TableCell
                                                className={`px-4 py-3 text-theme-sm font-semibold ${
                                                    item.transaction_type === "expense"
                                                        ? "text-red-600"
                                                        : "text-green-700"
                                                }`}
                                            >
                                                {item.transaction_type === "expense" ? "- " : "+ "}
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
                                                        router.push(
                                                            `/keuangan-pembangunan/edit/${item.id}`
                                                        )
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
                                                            nama: getCategoryName(item),
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
                    totalItems={sortedData.length}
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
