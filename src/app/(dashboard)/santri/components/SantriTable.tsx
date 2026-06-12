"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getSantri, deleteSantri } from "@/services/santri";
import { Santri } from "@/types/santri";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";
import API_URL from "@/lib/api";
import Pagination from "@/components/ui/pagination/Pagination";
import SortableHeader, {
    SortDirection,
} from "@/components/ui/table/SortableHeader";

type Props = {
    search: string;
};

const DEFAULT_USER_PHOTO = "/images/user/default-user.png";
const STORAGE_URL = API_URL.replace(/\/api\/?$/, "/storage");

function getPhotoUrl(photo?: string | null) {
    if (!photo) return DEFAULT_USER_PHOTO;
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
    return `${STORAGE_URL}/${photo}`;
}

function getFileUrl(file?: string | null) {
    if (!file) return "";
    if (file.startsWith("http://") || file.startsWith("https://")) return file;
    return `${STORAGE_URL}/${file}`;
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

function studentTypeLabel(value?: string | null) {
    if (value === "regular") return "Biasa";
    if (value === "pre_qiraati") return "Pra PTPT";
    if (value === "qiraati") return "PTPT / Qiraati";
    return "-";
}

function genderLabel(value?: string | null) {
    if (value === "male") return "Laki-laki";
    if (value === "female") return "Perempuan";
    return "-";
}

function statusLabel(value?: string | null) {
    if (value === "pending") return "Pending";
    if (value === "active") return "Aktif";
    if (value === "graduated") return "Lulus";
    if (value === "left") return "Keluar";
    return "-";
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                {value || "-"}
            </p>
        </div>
    );
}

export default function SantriTable({ search }: Props) {
    const [data, setData] = useState<Santri[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState("");
    const [jenisSantriFilter, setJenisSantriFilter] = useState("");
    const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const { toast, showToast, hideToast } = useToast();
    const router = useRouter();

    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        id: number | null;
        nama: string;
    }>({ show: false, id: null, nama: "" });

    const handleSort = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const handleDeleteClick = (id: number, nama: string) => {
        setDeleteModal({ show: true, id, nama });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        try {
            await deleteSantri(deleteModal.id);
            setData((prev) => prev.filter((item) => item.id !== deleteModal.id));
            showToast(`Data santri ${deleteModal.nama} berhasil dihapus!`, "success");
            setDeleteModal({ show: false, id: null, nama: "" });
        } catch (error) {
            console.error(error);
            showToast("Gagal menghapus data santri", "error");
        }
    };

    useEffect(() => {
        getSantri()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // --- Filter ---
    const filteredData = data.filter((santri) => {
        const keyword = search.toLowerCase();

        const matchSearch =
            santri.name.toLowerCase().includes(keyword) ||
            (santri.nisn || "").toLowerCase().includes(keyword) ||
            (santri.nik || "").toLowerCase().includes(keyword) ||
            (santri.student_number || "").toLowerCase().includes(keyword) ||
            (santri.tpq_number || "").toLowerCase().includes(keyword) ||
            (santri.father_name || "").toLowerCase().includes(keyword) ||
            (santri.mother_name || "").toLowerCase().includes(keyword) ||
            (santri.contact_guardian || "").toLowerCase().includes(keyword) ||
            (santri.study_class?.name || "").toLowerCase().includes(keyword) ||
            (santri.village || "").toLowerCase().includes(keyword) ||
            (santri.district || "").toLowerCase().includes(keyword) ||
            (santri.city || "").toLowerCase().includes(keyword) ||
            (santri.province || "").toLowerCase().includes(keyword);

        const matchStatus = statusFilter === "" || santri.status === statusFilter;
        const matchJenis = jenisSantriFilter === "" || santri.student_type === jenisSantriFilter;

        return matchSearch && matchStatus && matchJenis;
    });

    // --- Sort ---
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortKey || !sortDirection) return 0;

        const getValue = (item: Santri): string => {
            switch (sortKey) {
                case "name": return item.name || "";
                case "kelas": return item.study_class?.name || "";
                case "jenis": return studentTypeLabel(item.student_type);
                case "gender": return genderLabel(item.gender);
                case "birth_date": return item.birth_date || "";
                case "join_date": return item.join_date || "";
                case "status": return item.status || "";
                default: return "";
            }
        };

        const valueA = getValue(a).toLowerCase();
        const valueB = getValue(b).toLowerCase();

        // Untuk kolom tanggal, sort berdasarkan nilai ISO string agar urutan kronologis benar
        if (sortKey === "birth_date" || sortKey === "join_date") {
            const dateA = new Date(valueA).getTime();
            const dateB = new Date(valueB).getTime();
            if (!isNaN(dateA) && !isNaN(dateB)) {
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
            }
        }

        const compare = valueA.localeCompare(valueB, "id", {
            numeric: true,
            sensitivity: "base",
        });

        return sortDirection === "asc" ? compare : -compare;
    });

    // --- Pagination ---
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(pageStart, pageStart + pageSize);

    const hasActiveFilter = statusFilter !== "" || jenisSantriFilter !== "";

    if (loading) return <p>Loading data santri...</p>;

    return (
        <>
            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setDeleteModal({ show: false, id: null, nama: "" })}
                    />
                    <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6 dark:bg-gray-900">
                        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-red-100">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18.132 19.142C18.058 20.178 17.195 21 16.157 21H7.843C6.805 21 5.942 20.178 5.868 19.142L5 6H19Z" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                            Hapus Data Santri?
                        </h4>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Apakah kamu yakin ingin menghapus data santri{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {deleteModal.nama}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null, nama: "" })}
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

            {selectedSantri && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSelectedSantri(null)}
                    />

                    <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                                    <Image
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-cover"
                                        src={getPhotoUrl(selectedSantri.photo)}
                                        alt={selectedSantri.name}
                                        onError={(event) => {
                                            event.currentTarget.src = DEFAULT_USER_PHOTO;
                                        }}
                                    />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        {selectedSantri.name}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {selectedSantri.study_class?.name || "Tanpa kelas"} - {studentTypeLabel(selectedSantri.student_type)}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedSantri(null)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Tutup
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-xl border border-gray-200 p-4">
                                <h5 className="mb-3 text-sm font-semibold text-gray-800">
                                    Data Pribadi
                                </h5>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <DetailItem label="Induk Santri" value={selectedSantri.student_number} />
                                    <DetailItem label="Induk TPQ" value={selectedSantri.tpq_number} />
                                    <DetailItem label="NISN" value={selectedSantri.nisn} />
                                    <DetailItem label="NIK" value={selectedSantri.nik} />
                                    <DetailItem label="No KK" value={selectedSantri.family_card_number} />
                                    <DetailItem label="Jenis Kelamin" value={genderLabel(selectedSantri.gender)} />
                                    <DetailItem label="Tempat Lahir" value={selectedSantri.birth_place} />
                                    <DetailItem label="Tanggal Lahir" value={formatDate(selectedSantri.birth_date)} />
                                    <DetailItem label="Tanggal Masuk" value={formatDate(selectedSantri.join_date)} />
                                    <DetailItem label="Anak Ke" value={selectedSantri.child_order} />
                                    <DetailItem label="Jumlah Saudara" value={selectedSantri.siblings_count} />
                                    <DetailItem label="Status" value={statusLabel(selectedSantri.status)} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-4">
                                <h5 className="mb-3 text-sm font-semibold text-gray-800">
                                    Orang Tua dan Alamat
                                </h5>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <DetailItem label="Nama Ayah" value={selectedSantri.father_name} />
                                    <DetailItem label="Nama Ibu" value={selectedSantri.mother_name} />
                                    <DetailItem label="Kontak Wali" value={selectedSantri.contact_guardian} />
                                    <DetailItem label="Dusun / Jalan" value={selectedSantri.hamlet} />
                                    <DetailItem label="Desa / Kelurahan" value={selectedSantri.village} />
                                    <DetailItem label="Kecamatan" value={selectedSantri.district} />
                                    <DetailItem label="Kabupaten / Kota" value={selectedSantri.city} />
                                    <DetailItem label="Provinsi" value={selectedSantri.province} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-4">
                                <h5 className="mb-3 text-sm font-semibold text-gray-800">
                                    Sekolah dan Dokumen
                                </h5>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <DetailItem label="Sekolah Formal" value={selectedSantri.formal_school} />
                                    <DetailItem label="Kelas Formal" value={selectedSantri.formal_class} />
                                    <DetailItem label="NPSN" value={selectedSantri.npsn} />
                                    <DetailItem label="Jenis Santri" value={studentTypeLabel(selectedSantri.student_type)} />
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">File KK</p>
                                        {selectedSantri.family_card_file ? (
                                            <a
                                                href={getFileUrl(selectedSantri.family_card_file)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-block text-sm font-medium text-blue-500 hover:underline"
                                            >
                                                Lihat file
                                            </a>
                                        ) : (
                                            <p className="mt-1 text-sm font-medium text-gray-700">-</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400">File Akte</p>
                                        {selectedSantri.birth_certificate_file ? (
                                            <a
                                                href={getFileUrl(selectedSantri.birth_certificate_file)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 inline-block text-sm font-medium text-blue-500 hover:underline"
                                            >
                                                Lihat file
                                            </a>
                                        ) : (
                                            <p className="mt-1 text-sm font-medium text-gray-700">-</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Toolbar */}
            <div className="mb-3 flex flex-wrap items-center gap-3">
                {/* Filter: Jenis Santri */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                        Jenis Santri
                    </label>
                    <select
                        value={jenisSantriFilter}
                        onChange={(e) => {
                            setJenisSantriFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                    >
                        <option value="">Semua</option>
                        <option value="regular">Biasa</option>
                        <option value="pre_qiraati">Pra PTPT</option>
                        <option value="qiraati">PTPT / Qiraati</option>
                    </select>
                </div>

                {/* Filter: Status */}
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-500 whitespace-nowrap">
                        Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                    >
                        <option value="">Semua</option>
                        <option value="pending">Pending</option>
                        <option value="active">Aktif</option>
                        <option value="graduated">Lulus</option>
                        <option value="left">Keluar</option>
                    </select>
                </div>

                {/* Reset filter — hanya muncul kalau ada filter aktif */}
                {hasActiveFilter && (
                    <button
                        onClick={() => {
                            setStatusFilter("");
                            setJenisSantriFilter("");
                            setCurrentPage(1);
                        }}
                        className="h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Reset Filter
                    </button>
                )}

                {/* Info jumlah hasil */}
                <span className="ml-auto text-xs text-gray-400">
                    {sortedData.length} data ditemukan
                </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1250px]">
                        <Table className="border-brand-300">
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        No
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        <SortableHeader
                                            label="Nama Santri"
                                            sortKey="name"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Kelas
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Jenis Santri
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Jenis Kelamin
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Tanggal Lahir
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Tanggal Masuk
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Kontak Wali
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Status
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                        Aksi
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {sortedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            className="px-4 py-6 text-center text-gray-500 text-theme-sm"
                                        >
                                            Data santri tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((santri, index) => (
                                        <TableRow key={santri.id}>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {pageStart + index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                                                        <Image
                                                            width={40}
                                                            height={40}
                                                            className="h-full w-full object-cover"
                                                            src={getPhotoUrl(santri.photo)}
                                                            alt={santri.name}
                                                            onError={(event) => {
                                                                event.currentTarget.src = DEFAULT_USER_PHOTO;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="block font-medium text-gray-800 text-theme-sm capitalize">
                                                            {santri.name}
                                                        </span>
                                                        <span className="block text-xs text-gray-400">
                                                            NISN: {santri.nisn || "-"} · NIK: {santri.nik || "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {santri.study_class?.name || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {studentTypeLabel(santri.student_type)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {genderLabel(santri.gender)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {formatDate(santri.birth_date)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {formatDate(santri.join_date)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {santri.contact_guardian || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-start text-theme-sm">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs capitalize font-medium ${santri.status === "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : santri.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : santri.status === "graduated"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : santri.status === "left"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {santri.status}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                <button
                                                    onClick={() => setSelectedSantri(santri)}
                                                    className="text-gray-500 hover:underline text-sm"
                                                >
                                                    Detail
                                                </button>
                                                <span className="mx-1 font-semibold text-gray-300">|</span>
                                                <button
                                                    onClick={() => router.push(`/santri/edit/${santri.id}`)}
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <span className="mx-1 font-semibold text-gray-300">|</span>
                                                <button
                                                    onClick={() => handleDeleteClick(santri.id, santri.name)}
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
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </>
    );
}
