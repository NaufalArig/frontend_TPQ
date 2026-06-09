"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { KategoriKeuangan } from "@/types/kategori-keuangan";
import {
    deleteKategoriKeuangan,
    getKategoriKeuangan,
} from "@/services/kategori-keuangan";
import Pagination from "@/components/ui/pagination/Pagination";

type Props = {
    search: string;
};

export default function KategoriKeuanganCardList({ search }: Props) {
    const [data, setData] = useState<KategoriKeuangan[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        id: number | null;
        nama: string;
    }>({
        show: false,
        id: null,
        nama: "",
    });

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        getKategoriKeuangan()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredData = data.filter((kategori) => {
        const keyword = search.toLowerCase();

        const matchSearch =
            kategori.name.toLowerCase().includes(keyword) ||
            (kategori.description || "").toLowerCase().includes(keyword);

        const matchStatus =
            statusFilter === "" || kategori.status === statusFilter;

        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(pageStart, pageStart + pageSize);

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteKategoriKeuangan(deleteModal.id);

            setData((prev) =>
                prev.filter((item) => item.id !== deleteModal.id)
            );

            showToast(
                `Kategori ${deleteModal.nama} berhasil dihapus!`,
                "success"
            );

            setDeleteModal({
                show: false,
                id: null,
                nama: "",
            });
        } catch (error) {
            console.error(error);
            showToast(
                "Gagal menghapus kategori. Pastikan kategori belum digunakan.",
                "error"
            );
        }
    };

    if (loading) return <p>Loading data kategori keuangan...</p>;

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

                    <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                            <span className="text-2xl">&#128465;</span>
                        </div>

                        <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                            Hapus Kategori?
                        </h4>

                        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                            Apakah kamu yakin ingin menghapus kategori{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {deleteModal.nama}
                            </span>
                            ?
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        id: null,
                                        nama: "",
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

            <div className="space-y-4">
                <div className="flex justify-end">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-lg border border-brand-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs hover:bg-brand-100 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-44"
                    >
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>

                {filteredData.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                        <p className="text-sm text-gray-500">
                            Data kategori keuangan tidak ditemukan
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {paginatedData.map((kategori) => (
                                <div
                                    key={kategori.id}
                                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl">
                                                &#128176;
                                            </div>

                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                {kategori.name}
                                            </h3>

                                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                                {kategori.description || "Tidak ada deskripsi"}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                                kategori.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {kategori.status}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                router.push(
                                                    `/kategori-keuangan/edit/${kategori.id}`
                                                )
                                            }
                                            className="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                setDeleteModal({
                                                    show: true,
                                                    id: kategori.id,
                                                    nama: kategori.name,
                                                })
                                            }
                                            className="flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <Pagination
                                totalItems={filteredData.length}
                                currentPage={safeCurrentPage}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={setPageSize}
                                pageSizeOptions={[6, 9, 12]}
                            />
                        </div>
                    </>
                )}
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
