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
import Pagination from "@/components/ui/pagination/Pagination";
import ModalPortal from "@/components/ui/modal/ModalPortal";
import { AssetCategory } from "@/types/kategori-aset";
import {
    deleteAssetCategory,
    getAssetCategories,
} from "@/services/kategori-aset";

type Props = {
    search: string;
};

export default function AssetCategoryTable({ search }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [data, setData] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        id: number | null;
        name: string;
    }>({
        show: false,
        id: null,
        name: "",
    });

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            getAssetCategories()
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false));
        }, 0);

        return () => window.clearTimeout(timeout);
    }, []);

    const filteredData = data.filter((item) => {
        const keyword = search.toLowerCase();

        const statusText =
            item.status === "active" ? "aktif" : "nonaktif";

        return (
            item.name.toLowerCase().includes(keyword) ||
            (item.description || "").toLowerCase().includes(keyword) ||
            item.status.toLowerCase().includes(keyword) ||
            statusText.includes(keyword)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(pageStart, pageStart + pageSize);

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteAssetCategory(deleteModal.id);

            setData((prev) =>
                prev.filter((item) => item.id !== deleteModal.id)
            );

            showToast(
                `Kategori aset ${deleteModal.name} berhasil dihapus`,
                "success"
            );

            setDeleteModal({
                show: false,
                id: null,
                name: "",
            });
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
                message?: string;
            };

            showToast(
                err.response?.data?.message ||
                    err.message ||
                    "Gagal menghapus kategori aset",
                "error"
            );
        }
    };

    if (loading) {
        return <p className="text-sm text-gray-500">Memuat kategori aset...</p>;
    }

    return (
        <>
            {deleteModal.show && (
                <ModalPortal>
                    <div className="fixed inset-0 z-[99999] isolate flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() =>
                                setDeleteModal({
                                    show: false,
                                    id: null,
                                    name: "",
                                })
                            }
                        />

                        <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M3 6H5H21"
                                        stroke="#ef4444"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18.132 19.142C18.058 20.178 17.195 21 16.157 21H7.843C6.805 21 5.942 20.178 5.868 19.142L5 6H19Z"
                                        stroke="#ef4444"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                                Hapus Kategori Aset?
                            </h4>

                            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                                Apakah kamu yakin ingin menghapus kategori{" "}
                                <span className="font-semibold text-gray-700 dark:text-gray-200">
                                    {deleteModal.name}
                                </span>
                                ? Kategori tidak bisa dihapus jika masih digunakan aset.
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
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
                </ModalPortal>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="ml-auto text-xs text-gray-400">
                    {filteredData.length} data ditemukan
                </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="w-full overflow-x-hidden">
                    <Table className="w-full table-fixed">
                        <TableHeader className="border-b border-brand-300 bg-brand-100">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="w-[70px] px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400"
                                >
                                    No
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="w-[28%] px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400"
                                >
                                    Nama Kategori
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="w-[34%] px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400"
                                >
                                    Deskripsi
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="w-[120px] px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400"
                                >
                                    Jumlah Aset
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="w-[120px] px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400"
                                >
                                    Status
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="w-[150px] px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400"
                                >
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-gray-500 text-theme-sm"
                                    >
                                        Data kategori aset tidak ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                            {pageStart + index + 1}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-theme-sm">
                                            <p className="truncate font-medium text-gray-800">
                                                {item.name}
                                            </p>
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                            <p className="line-clamp-2">
                                                {item.description || "-"}
                                            </p>
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                            {item.assets_count ?? 0}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-theme-sm">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    item.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {item.status === "active"
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-theme-sm">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/kategori-aset/edit/${item.id}`
                                                        )
                                                    }
                                                    className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteModal({
                                                            show: true,
                                                            id: item.id,
                                                            name: item.name,
                                                        })
                                                    }
                                                    className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    totalItems={filteredData.length}
                    currentPage={safeCurrentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
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