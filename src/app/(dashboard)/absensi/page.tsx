"use client";

import { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { getAbsensiSantri, saveAbsensiSantri } from "@/services/absensi";
import { AbsensiSantriItem, AttendanceStatus } from "@/types/absensi";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import DatePicker from "@/components/form/date-picker";
import SortableHeader, {
    SortDirection,
} from "@/components/ui/table/SortableHeader";
import { getKelas } from "@/services/kelas";
import { Kelas } from "@/types/kelas";

const getTodayLocal = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

type AbsensiRow = AbsensiSantriItem & {
    status: AttendanceStatus;
    note?: string | null;
};

export default function AbsensiPage() {
    const [attendanceDate, setAttendanceDate] = useState(getTodayLocal());
    const [data, setData] = useState<AbsensiRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [hasAbsensi, setHasAbsensi] = useState(false);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        getKelas()
            .then((res) => {
                setKelasList((res ?? []).filter((kelas: Kelas) => kelas.status === "active"));
            })
            .catch((error) => {
                console.error(error);
                showToast("Gagal mengambil data kelas", "error");
            });
    }, [showToast]);

    const markAllPresent = () => {
        setData((prev) =>
            prev.map((item) => ({
                ...item,
                status: "present",
                note: "",
            }))
        );

        showToast("Semua santri ditandai hadir", "success");
    };

    const loadAbsensi = useCallback(async () => {
        try {
            setLoading(true);

            if (!selectedClassId) {
                setData([]);
                setHasAbsensi(false);
                setIsEditing(false);
                return;
            }

            const res = await getAbsensiSantri(attendanceDate, selectedClassId);
            const students = res.students ?? [];

            const rows: AbsensiRow[] = students.map((item) => ({
                ...item,
                status: item.attendance?.status ?? "present",
                note: item.attendance?.note ?? "",
            }));

            setData(rows);

            const alreadyHasAttendance = students.some(
                (item) => item.attendance !== null
            );

            setHasAbsensi(alreadyHasAttendance);
            setIsEditing(!alreadyHasAttendance);
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil data absensi", "error");
        } finally {
            setLoading(false);
        }
    }, [attendanceDate, selectedClassId, showToast]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            loadAbsensi();
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [loadAbsensi]);

    const updateStatus = (studentId: number, status: AttendanceStatus) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === studentId ? { ...item, status } : item
            )
        );
    };

    const updateNote = (studentId: number, note: string) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === studentId ? { ...item, note } : item
            )
        );
    };

    const handleSort = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
    };

    const statusLabel = (status: AttendanceStatus) => {
        if (status === "present") return "Hadir";
        if (status === "permission") return "Izin";
        if (status === "sick") return "Sakit";
        if (status === "absent") return "Alpa";
        return status;
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortKey || !sortDirection) return 0;

        const getValue = (item: AbsensiRow) => {
            switch (sortKey) {
                case "name":
                    return item.name || "";
                case "class":
                    return item.study_class?.name || "";
                case "status":
                    return statusLabel(item.status);
                case "note":
                    return item.note || "";
                default:
                    return "";
            }
        };

        const compare = String(getValue(a)).localeCompare(String(getValue(b)), "id", {
            numeric: true,
            sensitivity: "base",
        });

        return sortDirection === "asc" ? compare : -compare;
    });

    const handleSave = async () => {
        try {
            setSaving(true);

            await saveAbsensiSantri({
                attendance_date: attendanceDate,
                attendances: data.map((item) => ({
                    student_id: item.id,
                    status: item.status ?? "present",
                    note: item.note?.trim() ? item.note : null,
                })),
            });

            showToast("Absensi berhasil disimpan", "success");
            setHasAbsensi(true);
            setIsEditing(false);
            await loadAbsensi();
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
                "Gagal menyimpan absensi",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <PageBreadcrumb pageTitle="Absensi Santri" />

            <ComponentCard
                title="Form Absensi Santri"
                action={
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-56"
                        >
                            <option value="">Pilih kelas</option>
                            {kelasList.map((kelas) => (
                                <option key={kelas.id} value={kelas.id}>
                                    {kelas.name}
                                </option>
                            ))}
                        </select>

                        <div className="w-full sm:w-52">
                            <DatePicker
                                key={attendanceDate}
                                id="attendance-date"
                                placeholder="Pilih tanggal"
                                defaultDate={attendanceDate}
                                useTodayDefault
                                onChange={(_, currentDateString) => {
                                    setAttendanceDate(currentDateString || getTodayLocal());
                                }}
                            />
                        </div>
                    </div>
                }
            >
                {loading ? (
                    <p>Loading data absensi...</p>
                ) : data.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        {!selectedClassId
                            ? "Pilih kelas terlebih dahulu untuk menampilkan santri."
                            : "Tidak ada santri aktif di kelas ini."}
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
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
                                            Status
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                            Keterangan
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {sortedData.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 capitalize">
                                                {item.name}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {item.study_class?.name || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <select
                                                    value={item.status}
                                                    disabled={hasAbsensi && !isEditing}
                                                    onChange={(e) =>
                                                        updateStatus(
                                                            item.id,
                                                            e.target.value as AttendanceStatus
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                >
                                                    <option value="present">Hadir</option>
                                                    <option value="permission">Izin</option>
                                                    <option value="sick">Sakit</option>
                                                    <option value="absent">Alpa</option>
                                                </select>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <input
                                                    type="text"
                                                    value={item.note ?? ""}
                                                    disabled={hasAbsensi && !isEditing}
                                                    onChange={(e) =>
                                                        updateNote(item.id, e.target.value)
                                                    }
                                                    placeholder="Opsional"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => router.push("/absensi/riwayat")}
                                className="w-full rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 sm:w-auto"
                            >
                                Riwayat Absensi
                            </button>

                            {(!hasAbsensi || isEditing) && (
                                <button
                                    onClick={markAllPresent}
                                    type="button"
                                    className="w-full rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600 sm:w-auto"
                                >
                                    Tandai Semua Hadir
                                </button>
                            )}

                            {hasAbsensi && !isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full rounded-lg bg-yellow-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-yellow-600 sm:w-auto"
                                >
                                    Edit Absensi
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
                                >
                                    {saving
                                        ? "Menyimpan..."
                                        : hasAbsensi
                                            ? "Update Absensi"
                                            : "Simpan Absensi"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </ComponentCard>

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
