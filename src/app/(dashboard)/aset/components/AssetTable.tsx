"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { deleteAsset, getAssetCategories, getAssets } from "@/services/aset";
import { Asset, AssetCategory, AssetCondition, AssetStatus } from "@/types/aset";
import Pagination from "@/components/ui/pagination/Pagination";
import SortableHeader, {
    SortDirection,
} from "@/components/ui/table/SortableHeader";

type Props = {
    search: string;
};

const conditionLabel: Record<AssetCondition, string> = {
    good: "Baik",
    minor_damage: "Rusak Ringan",
    damaged: "Rusak Berat",
    lost: "Hilang",
};

const statusLabel: Record<AssetStatus, string> = {
    available: "Tersedia",
    in_use: "Dipakai",
    maintenance: "Perbaikan",
    disposed: "Dihapuskan",
};

const conditionClass: Record<AssetCondition, string> = {
    good: "bg-green-100 text-green-700",
    minor_damage: "bg-yellow-100 text-yellow-700",
    damaged: "bg-red-100 text-red-700",
    lost: "bg-gray-100 text-gray-700",
};

const statusClass: Record<AssetStatus, string> = {
    available: "bg-green-100 text-green-700",
    in_use: "bg-blue-100 text-blue-700",
    maintenance: "bg-yellow-100 text-yellow-700",
    disposed: "bg-gray-100 text-gray-700",
};

function formatRupiah(value?: number | string | null) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(value || 0));
}

export default function AssetTable({
    search,
}: Props) {
    const [data, setData] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [conditionFilter, setConditionFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        id: number | null;
        name: string;
    }>({
        show: false,
        id: null,
        name: "",
    });

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const loadAssets = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getAssets({
                search,
                asset_category_id: categoryFilter,
                condition: conditionFilter,
                status: statusFilter,
            });

            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Gagal mengambil data aset:", error);
            showToast("Gagal mengambil data aset", "error");
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, conditionFilter, search, showToast, statusFilter]);

    const loadCategories = useCallback(async () => {
        try {
            const result = await getAssetCategories();
            setCategories(result.filter((item: AssetCategory) => item.status === "active"));
        } catch (error) {
            console.error("Gagal mengambil kategori aset:", error);
        }
    }, []);

    const handleSort = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadAssets();
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [loadAssets]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadCategories();
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [loadCategories]);

    const summary = useMemo(() => {
        return data.reduce(
            (total, item) => ({
                quantity: total.quantity + Number(item.quantity || 0),
                value:
                    total.value +
                    Number(item.estimated_value || 0) * Number(item.quantity || 0),
            }),
            { quantity: 0, value: 0 }
        );
    }, [data]);
    const sortedData = [...data].sort((a, b) => {
        if (!sortKey || !sortDirection) return 0;

        const getValue = (item: Asset) => {
            switch (sortKey) {
                case "asset_code":
                    return item.asset_code || "";
                case "name":
                    return item.name || "";
                case "category":
                    return item.category?.name || "";
                case "quantity":
                    return Number(item.quantity || 0);
                case "location":
                    return item.location || "";
                case "condition":
                    return conditionLabel[item.condition] || "";
                case "status":
                    return statusLabel[item.status] || "";
                case "estimated_value":
                    return Number(item.estimated_value || 0);
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
        categoryFilter !== "" || conditionFilter !== "" || statusFilter !== "";

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteAsset(deleteModal.id);
            setData((prev) => prev.filter((item) => item.id !== deleteModal.id));
            showToast(`Aset ${deleteModal.name} berhasil dihapus!`, "success");
            setDeleteModal({ show: false, id: null, name: "" });
        } catch (error) {
            console.error("Gagal menghapus aset:", error);
            showToast("Gagal menghapus aset", "error");
        }
    };

    if (loading) return <p>Loading data aset...</p>;

    return (
        <>
            {deleteModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() =>
                            setDeleteModal({ show: false, id: null, name: "" })
                        }
                    />

                    <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                            <span className="text-2xl">🗑️</span>
                        </div>

                        <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                            Hapus Aset?
                        </h4>

                        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                            Apakah kamu yakin ingin menghapus aset{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {deleteModal.name}
                            </span>
                            ?
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        id: null,
                                        name: "",
                                    })
                                }
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">Total Jumlah Aset</p>
                    <p className="mt-1 text-2xl font-bold text-blue-800">
                        {summary.quantity}
                    </p>
                </div>

                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-700">Estimasi Nilai Aset</p>
                    <p className="mt-1 text-2xl font-bold text-green-800">
                        {formatRupiah(summary.value)}
                    </p>
                </div>
            </div>

            <div className="mb-3 mt-4 flex flex-wrap items-center gap-3">
                <select
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    aria-label="Filter kategori aset"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <select
                    value={conditionFilter}
                    onChange={(e) => {
                        setConditionFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    aria-label="Filter kondisi aset"
                >
                    <option value="">Semua Kondisi</option>
                    <option value="good">Baik</option>
                    <option value="minor_damage">Rusak Ringan</option>
                    <option value="damaged">Rusak Berat</option>
                    <option value="lost">Hilang</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    aria-label="Filter status aset"
                >
                    <option value="">Semua Status</option>
                    <option value="available">Tersedia</option>
                    <option value="in_use">Dipakai</option>
                    <option value="maintenance">Perbaikan</option>
                    <option value="disposed">Dihapuskan</option>
                </select>

                {hasActiveFilter && (
                    <button
                        type="button"
                        onClick={() => {
                            setCategoryFilter("");
                            setConditionFilter("");
                            setStatusFilter("");
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
                    <div className="min-w-[1150px]">
                        <Table>
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">No</TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Kode
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        <SortableHeader
                                            label="Nama Aset"
                                            sortKey="name"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Kategori
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Jumlah
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Lokasi
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Kondisi
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Status
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Nilai
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {sortedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            className="px-4 py-6 text-center text-theme-sm text-gray-500"
                                        >
                                            Data aset tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((asset, index) => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {pageStart + index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {asset.asset_code || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-700">
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {asset.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {asset.brand || "Tanpa merek"}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {asset.category?.name || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {asset.quantity} {asset.unit || "unit"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {asset.location || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${conditionClass[asset.condition]}`}
                                                >
                                                    {conditionLabel[asset.condition]}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass[asset.status]}`}
                                                >
                                                    {statusLabel[asset.status]}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm font-semibold text-gray-700">
                                                {formatRupiah(asset.estimated_value)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/aset/edit/${asset.id}`)
                                                    }
                                                    className="text-sm text-blue-500 hover:underline"
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
                                                            id: asset.id,
                                                            name: asset.name,
                                                        })
                                                    }
                                                    className="text-sm text-red-500 hover:underline"
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
