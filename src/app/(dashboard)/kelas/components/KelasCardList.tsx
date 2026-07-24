"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Kelas } from "@/types/kelas";
import {
    assignSantriToKelas,
    deleteKelas,
    getAvailableSantriForKelas,
    getKelas,
} from "@/services/kelas";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import Pagination from "@/components/ui/pagination/Pagination";
import { useUser } from "@/context/UserContext";
import { graduateSantri } from "@/services/santri";

type Props = {
    search: string;
};

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? "-"
        : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

type AvailableSantri = {
    id: number;
    name: string;
    nisn?: string | null;
    birth_date?: string | null;
    join_date?: string | null;
    status: string;
    study_class_id?: number | null;
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

    const [assignModal, setAssignModal] = useState<{
        show: boolean;
        kelasId: number | null;
        kelasName: string;
    }>({
        show: false,
        kelasId: null,
        kelasName: "",
    });

    const [availableSantri, setAvailableSantri] = useState<AvailableSantri[]>([]);
    const [selectedSantriIds, setSelectedSantriIds] = useState<number[]>([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [graduatingId, setGraduatingId] = useState<number | null>(null);

    const router = useRouter();
    const { user } = useUser();
    const { toast, showToast, hideToast } = useToast();

    const isTeacher = user?.role === "teacher";

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
            (kelas.description || "").toLowerCase().includes(keyword) ||
            (kelas.teacher?.name || "").toLowerCase().includes(keyword);

        const matchStatus =
            statusFilter === "" || kelas.status === statusFilter;

        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(pageStart, pageStart + pageSize);

    const openAssignModal = async (kelasId: number, kelasName: string) => {
        try {
            setAssignLoading(true);
            setAssignModal({
                show: true,
                kelasId,
                kelasName,
            });
            setSelectedSantriIds([]);

            const res = await getAvailableSantriForKelas(kelasId);
            setAvailableSantri(res.data ?? []);
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil daftar santri yang belum punya kelas", "error");
        } finally {
            setAssignLoading(false);
        }
    };

    const [viewStudentsModal, setViewStudentsModal] = useState<{
        show: boolean;
        kelasName: string;
        santris: {
            id: number;
            name: string;
            status: string;
            join_date?: string | null;
        }[];
    }>({
        show: false,
        kelasName: "",
        santris: [],
    });

    const toggleSantriSelection = (id: number) => {
        setSelectedSantriIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const handleAssignSantri = async () => {
        if (!assignModal.kelasId) return;

        if (selectedSantriIds.length === 0) {
            showToast("Pilih minimal 1 santri", "error");
            return;
        }

        try {
            setAssignLoading(true);

            await assignSantriToKelas(assignModal.kelasId, selectedSantriIds);

            showToast(
                `Santri berhasil dimasukkan ke kelas ${assignModal.kelasName}`,
                "success"
            );

            const kelasData = await getKelas();
            setData(kelasData);

            setAssignModal({
                show: false,
                kelasId: null,
                kelasName: "",
            });
            setAvailableSantri([]);
            setSelectedSantriIds([]);
        } catch (error) {
            console.error(error);
            showToast("Gagal memasukkan santri ke kelas", "error");
        } finally {
            setAssignLoading(false);
        }
    };

    const handleGraduate = async (santriId: number, nama: string) => {
        if (
            !window.confirm(
                `Luluskan (naik tingkat) santri ${nama}? Santri akan keluar dari kelas ini dan bisa dimasukkan ke kelas berikutnya.`
            )
        ) return;

        try {
            setGraduatingId(santriId);
            await graduateSantri(santriId);

            // hapus dari daftar di modal
            setViewStudentsModal((prev) => ({
                ...prev,
                santris: prev.santris.filter((s) => s.id !== santriId),
            }));

            // segarkan jumlah santri di kartu kelas
            const kelasData = await getKelas();
            setData(kelasData);

            showToast(`${nama} berhasil diluluskan (naik tingkat)`, "success");
        } catch (error) {
            console.error(error);
            showToast("Gagal meluluskan santri", "error");
        } finally {
            setGraduatingId(null);
        }
    };

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
            {deleteModal.show && !isTeacher && (
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

            {viewStudentsModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setViewStudentsModal({ show: false, kelasName: "", santris: [] })}
                    />
                    <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-white px-6 py-5 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-xl">
                                    &#128101;
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        Daftar Santri
                                    </h4>
                                    <p className="mt-0.5 text-sm text-gray-500">
                                        Kelas{" "}
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                                            {viewStudentsModal.kelasName}
                                        </span>
                                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                                            {viewStudentsModal.santris.length} santri
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewStudentsModal({ show: false, kelasName: "", santris: [] })}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Tutup"
                            >
                                &#10005;
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {viewStudentsModal.santris.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                                    <p className="text-3xl">&#128235;</p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Belum ada santri aktif di kelas ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-[440px] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800">
                                            <tr>
                                                <th className="w-12 px-4 py-3">No</th>
                                                <th className="px-4 py-3">Nama Santri</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Tanggal Masuk</th>
                                                <th className="px-4 py-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {viewStudentsModal.santris.map((santri, index) => (
                                                <tr key={santri.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                                                    <td className="px-4 py-3 font-medium capitalize text-gray-700 dark:text-gray-200">
                                                        {santri.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${santri.status === "active"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : santri.status === "pending"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-gray-100 text-gray-600"
                                                                }`}
                                                        >
                                                            {santri.status === "active"
                                                                ? "Aktif"
                                                                : santri.status === "pending"
                                                                    ? "Pending"
                                                                    : santri.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {formatDate(santri.join_date)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {santri.status === "active" ? (
                                                            <button
                                                                onClick={() => handleGraduate(santri.id, santri.name)}
                                                                disabled={graduatingId === santri.id}
                                                                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 disabled:opacity-60"
                                                            >
                                                                {graduatingId === santri.id ? "Memproses..." : "Luluskan"}
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => setViewStudentsModal({ show: false, kelasName: "", santris: [] })}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {assignModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() =>
                            setAssignModal({
                                show: false,
                                kelasId: null,
                                kelasName: "",
                            })
                        }
                    />

                    <div className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mb-5">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Tambah Santri ke Kelas
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                                Kelas:{" "}
                                <span className="font-semibold text-gray-700">
                                    {assignModal.kelasName}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Hanya santri aktif yang belum punya kelas yang ditampilkan.
                            </p>
                        </div>

                        {assignLoading ? (
                            <p className="py-8 text-center text-sm text-gray-500">
                                Memuat data santri...
                            </p>
                        ) : availableSantri.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                                <p className="text-sm text-gray-500">
                                    Tidak ada santri aktif yang belum punya kelas.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[360px] overflow-y-auto rounded-xl border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-gray-50 text-left text-gray-500">
                                        <tr>
                                            <th className="w-12 px-4 py-3">Pilih</th>
                                            <th className="px-4 py-3">Nama</th>
                                            <th className="px-4 py-3">NISN</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {availableSantri.map((santri) => (
                                            <tr key={santri.id}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSantriIds.includes(santri.id)}
                                                        onChange={() => toggleSantriSelection(santri.id)}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                </td>

                                                <td className="px-4 py-3 font-medium text-gray-700">
                                                    {santri.name}
                                                </td>

                                                <td className="px-4 py-3 text-gray-500">
                                                    {santri.nisn || "-"}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                        Aktif
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setAssignModal({
                                        show: false,
                                        kelasId: null,
                                        kelasName: "",
                                    })
                                }
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={assignLoading || selectedSantriIds.length === 0}
                                onClick={handleAssignSantri}
                                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
                            >
                                {assignLoading
                                    ? "Menyimpan..."
                                    : `Masukkan ${selectedSantriIds.length} Santri`}
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
                            {isTeacher
                                ? "Belum ada kelas yang kamu ajar"
                                : "Data kelas tidak ditemukan"}
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

                                            {!isTeacher && (
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Guru: {kelas.teacher?.name || "-"}
                                                </p>
                                            )}
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${kelas.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {kelas.status === "active" ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </div>

                                    <div className="mb-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                                        <p className="text-xs text-gray-500">
                                            Jumlah Santri Aktif
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                                            {kelas.santris_count ?? kelas.students_count ?? 0}
                                        </p>
                                    </div>



                                    <div className="flex gap-2">
                                        {isTeacher ? (
                                            <>
                                                <button
                                                    onClick={() => openAssignModal(kelas.id, kelas.name)}
                                                    className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
                                                >
                                                    Tambah Santri
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setViewStudentsModal({
                                                            show: true,
                                                            kelasName: kelas.name,
                                                            santris: kelas.santris ?? [],
                                                        })
                                                    }
                                                    className="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                                                >
                                                    Lihat Santri
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => router.push(`/kelas/edit/${kelas.id}`)}
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
                                            </>
                                        )}
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
                                onPageSizeChange={(size) => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                }}
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