"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kelas } from "@/types/kelas";
import { deleteKelas, getKelas } from "@/services/kelas";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import Pagination from "@/components/ui/pagination/Pagination";

type Props = {
    search: string;
};

export default function KelasCardList({ search }: Props) {
    const [data, setData] = useState<Kelas[]>([]);
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
        getKelas()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredData = data.filter((kelas) => {
        const keyword = search.toLowerCase();

        const matchSearch =
            kelas.name.toLowerCase().includes(keyword) ||
            (kelas.description || "").toLowerCase().includes(keyword);

        const matchStatus =
            statusFilter === "" || kelas.status === statusFilter;

        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(pageStart, pageStart + pageSize);

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteKelas(deleteModal.id);

            setData((prev) =>
                prev.filter((item) => item.id !== deleteModal.id)
            );

            showToast(
                `Kelas ${deleteModal.nama} berhasil dihapus!`,
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
                "Gagal menghapus kelas. Pastikan kelas belum digunakan oleh santri.",
                "error"
            );
        }
    };

    if (loading) {
        return <p>Loading data kelas...</p>;
    }

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
                            Hapus Kelas?
                        </h4>

                        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                            Apakah kamu yakin ingin menghapus kelas{" "}
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
                            Data kelas tidak ditemukan
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {paginatedData.map((kelas) => (
                                <div
                                    key={kelas.id}
                                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-xl">
                                                &#128218;
                                            </div>

                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                                {kelas.name}
                                            </h3>

                                            <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                                                {kelas.description || "Tidak ada deskripsi"}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                                kelas.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {kelas.status}
                                        </span>
                                    </div>

                                    <div className="mb-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                                        <p className="text-xs text-gray-500">
                                            Jumlah Santri Aktif
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                                            {kelas.santris_count ?? 0}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                router.push(`/kelas/edit/${kelas.id}`)
                                            }
                                            className="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                setDeleteModal({
                                                    show: true,
                                                    id: kelas.id,
                                                    nama: kelas.name,
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
