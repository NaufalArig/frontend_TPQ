"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getGuru, deleteGuru } from "@/services/guru";
import { Guru } from "@/types/guru";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import API_URL from "@/lib/api";
import Pagination from "@/components/ui/pagination/Pagination";

type Props = {
    search: string;
};

const DEFAULT_USER_PHOTO = "/images/user/default-user.png";
const STORAGE_URL = API_URL.replace(/\/api\/?$/, "/storage");

function getPhotoUrl(photo?: string | null) {
    if (!photo) return DEFAULT_USER_PHOTO;

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
        return photo;
    }

    return `${STORAGE_URL}/${photo}`;
}

function formatDate(value?: string | null) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function GuruTable({ search }: Props) {
    const [data, setData] = useState<Guru[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState("");
    const { toast, showToast, hideToast } = useToast();

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

    const handleDeleteClick = (id: number, nama: string) => {
        setDeleteModal({ show: true, id, nama });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteGuru(deleteModal.id);

            setData((prev) =>
                prev.filter((item) => item.id !== deleteModal.id)
            );

            showToast(
                `Data guru ${deleteModal.nama} berhasil dihapus!`,
                "success"
            );

            setDeleteModal({
                show: false,
                id: null,
                nama: "",
            });
        } catch (error) {
            console.error(error);
            showToast("Gagal menghapus data guru", "error");
        }
    };

    const filteredData = data.filter((guru) => {
        const keyword = search.toLowerCase();

        const matchSearch =
            guru.name.toLowerCase().includes(keyword) ||
            (guru.phone || "").toLowerCase().includes(keyword) ||
            (guru.address || "").toLowerCase().includes(keyword) ||
            (guru.user?.username || "").toLowerCase().includes(keyword) ||
            (guru.teacher_number || "").toLowerCase().includes(keyword) ||
            (guru.tpq_number || "").toLowerCase().includes(keyword);

        const matchStatus =
            statusFilter === "" || guru.status === statusFilter;

        return matchSearch && matchStatus;
    });
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(pageStart, pageStart + pageSize);

    useEffect(() => {
        getGuru()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading data guru...</p>;

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
                            Hapus Data Guru?
                        </h4>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Apakah kamu yakin ingin menghapus data guru{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {deleteModal.nama}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
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

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1100px]">
                        <Table>
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">No</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">Nama Guru</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">Kontak</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">Alamat</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">Tanggal Masuk</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">Tanggal Keluar</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        <div className="space-y-2">
                                            <span>Status</span>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="h-8 w-full rounded-md border border-brand-300 bg-white px-2 text-xs font-normal text-gray-700 focus:outline-none"
                                            >
                                                <option value="">Semua</option>
                                                <option value="pending">Pending</option>
                                                <option value="active">Aktif</option>
                                                <option value="inactive">Nonaktif</option>
                                            </select>
                                        </div>
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">Aksi</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="px-4 py-6 text-center text-gray-500 text-theme-sm"
                                        >
                                            Data guru tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((guru, index) => (
                                        <TableRow key={guru.id}>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {pageStart + index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={getPhotoUrl(guru.photo)}
                                                            alt={guru.name}
                                                            onError={(event) => {
                                                                event.currentTarget.src = DEFAULT_USER_PHOTO;
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                            {guru.name}
                                                        </span>

                                                        <span className="block text-xs text-gray-400">
                                                            {guru.gender === "male"
                                                                ? "Laki-laki"
                                                                : guru.gender === "female"
                                                                    ? "Perempuan"
                                                                    : "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {guru.phone || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {guru.address || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {formatDate(guru.join_date)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                                {formatDate(guru.leave_date)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm capitalize">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${guru.status === "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : guru.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {guru.status}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/guru/edit/${guru.id}`)
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
                                                        handleDeleteClick(guru.id, guru.name)
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
