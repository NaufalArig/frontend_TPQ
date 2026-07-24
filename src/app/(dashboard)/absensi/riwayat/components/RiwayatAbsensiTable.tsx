"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getRiwayatAbsensi } from "@/services/absensi";
import { getKelas } from "@/services/kelas";
import { getSantri } from "@/services/santri";
import { AttendanceStatus, RiwayatAbsensiItem } from "@/types/absensi";
import { Kelas } from "@/types/kelas";
import { Santri } from "@/types/santri";

type Props = {
    studyClassId?: string | number;
    onError: (message: string) => void;
};

type GridRow = {
    student: Santri;
    recordsByDay: Map<number, RiwayatAbsensiItem>;
};

const WEEKDAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const MONTHS = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
];

function pad2(value: number) {
    return String(value).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
    // month is 1-based here; day 0 of next month = last day of this month
    return new Date(year, month, 0).getDate();
}

function getClassName(student: Santri) {
    return student.study_class?.name || "-";
}

function badgeClass(value: AttendanceStatus) {
    switch (value) {
        case "present":
            return "bg-green-100 text-green-700";
        case "permission":
            return "bg-yellow-100 text-yellow-700";
        case "sick":
            return "bg-blue-100 text-blue-700";
        case "absent":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

function statusShort(value: AttendanceStatus) {
    switch (value) {
        case "present":
            return "H";
        case "permission":
            return "I";
        case "sick":
            return "S";
        case "absent":
            return "A";
        default:
            return "-";
    }
}

function statusLabel(value: AttendanceStatus) {
    switch (value) {
        case "present":
            return "Hadir";
        case "permission":
            return "Izin";
        case "sick":
            return "Sakit";
        case "absent":
            return "Alpa";
        default:
            return value;
    }
}

export default function RiwayatAbsensiTable({ studyClassId, onError }: Props) {
    const now = new Date();

    const [students, setStudents] = useState<Santri[]>([]);
    const [records, setRecords] = useState<RiwayatAbsensiItem[]>([]);
    const [classes, setClasses] = useState<Kelas[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterYear, setFilterYear] = useState(now.getFullYear());
    const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
    const [filterClass, setFilterClass] = useState(
        studyClassId ? String(studyClassId) : ""
    );
    const [search, setSearch] = useState("");
    const [detailStudent, setDetailStudent] = useState<GridRow | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);

                // CATATAN: backend getRiwayatAbsensi hanya menerima attendance_date
                // tunggal (bukan range bulan). Di sini kita ambil tanpa attendance_date
                // (data luas) lalu filter Tahun/Bulan di client, sama pola dengan
                // Monitoring SPP. Untuk data besar ini berpotensi lambat — pertimbangkan
                // menambah param month/year di backend kalau data sudah banyak.
                const [studentData, recordData, classData] = await Promise.all([
                    getSantri().catch(() => []),
                    getRiwayatAbsensi({
                        attendance_date: "",
                        study_class_id: filterClass || undefined,
                        status: "",
                    }).catch(() => []),
                    getKelas().catch(() => []),
                ]);

                setStudents(Array.isArray(studentData) ? studentData : []);
                setRecords(Array.isArray(recordData) ? recordData : []);
                setClasses(Array.isArray(classData) ? classData : []);
            } catch (error) {
                console.error(error);
                onError("Gagal mengambil riwayat absensi");
            } finally {
                setLoading(false);
            }
        };

        void fetchAll();
    }, [filterClass, onError]);

    const dayColumns = useMemo(() => {
        const total = daysInMonth(filterYear, filterMonth);

        return Array.from({ length: total }, (_, index) => {
            const day = index + 1;
            const dateStr = `${filterYear}-${pad2(filterMonth)}-${pad2(day)}`;
            const weekday = WEEKDAY_SHORT[new Date(dateStr).getDay()];

            return { day, dateStr, weekday };
        });
    }, [filterYear, filterMonth]);

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return students
            .filter((student) => {
                const matchClass =
                    !filterClass || String(student.study_class_id || "") === filterClass;
                const matchSearch =
                    !keyword ||
                    student.name.toLowerCase().includes(keyword) ||
                    (student.nisn || "").toLowerCase().includes(keyword);

                return matchClass && matchSearch;
            })
            .sort((a, b) =>
                a.name.localeCompare(b.name, "id", { numeric: true, sensitivity: "base" })
            );
    }, [filterClass, search, students]);

    // ASUMSI: RiwayatAbsensiItem punya field student.id (belum terlihat eksplisit
    // di tipe yang diberikan). Sesuaikan bila field-nya ternyata student_id di root.
    const recordMap = useMemo(() => {
        const map = new Map<string, RiwayatAbsensiItem>();

        records.forEach((item) => {
            const studentId = Number(
                (item as unknown as { student_id?: number }).student_id ?? item.student?.id
            );
            const dateOnly = (item.attendance_date || "").slice(0, 10);

            if (!studentId || !dateOnly) return;
            if (!dateOnly.startsWith(`${filterYear}-${pad2(filterMonth)}`)) return;

            map.set(`${studentId}-${dateOnly}`, item);
        });

        return map;
    }, [filterMonth, filterYear, records]);

    const rows = useMemo<GridRow[]>(() => {
        return filteredStudents.map((student) => {
            const recordsByDay = new Map<number, RiwayatAbsensiItem>();

            dayColumns.forEach(({ day, dateStr }) => {
                const record = recordMap.get(`${student.id}-${dateStr}`);
                if (record) recordsByDay.set(day, record);
            });

            return { student, recordsByDay };
        });
    }, [dayColumns, filteredStudents, recordMap]);

    const resetFilters = () => {
        setFilterYear(now.getFullYear());
        setFilterMonth(now.getMonth() + 1);
        setFilterClass(studyClassId ? String(studyClassId) : "");
        setSearch("");
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                Loading riwayat absensi...
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[130px_160px_180px_1fr_auto] lg:items-end">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Tahun
                        </label>
                        <select
                            value={filterYear}
                            onChange={(event) => setFilterYear(Number(event.target.value))}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                        >
                            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(
                                (year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Bulan
                        </label>
                        <select
                            value={filterMonth}
                            onChange={(event) => setFilterMonth(Number(event.target.value))}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                        >
                            {MONTHS.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Kelas
                        </label>
                        <select
                            value={filterClass}
                            onChange={(event) => setFilterClass(event.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                        >
                            <option value="">Semua kelas</option>
                            {classes.map((kelas) => (
                                <option key={kelas.id} value={kelas.id}>
                                    {kelas.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Pencarian Nama Santri
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama santri atau NISN..."
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="h-11 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-3">
                    <h3 className="text-base font-semibold text-gray-800">
                        Riwayat Absensi Semua Kelas
                    </h3>
                    <p className="text-sm text-gray-500">
                        Pantau status kehadiran setiap santri sepanjang{" "}
                        {MONTHS.find((m) => m.value === filterMonth)?.label} {filterYear}.
                    </p>
                </div>

                <div className="max-h-[70vh] overflow-auto">
                    <table className="w-full text-sm" style={{ minWidth: `${280 + dayColumns.length * 56}px` }}>
                        <thead className="sticky top-0 z-10 bg-brand-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 shadow-sm">
                            <tr>
                                <th className="sticky left-0 z-20 min-w-[220px] bg-brand-100 px-4 py-3">
                                    Nama Santri
                                </th>
                                {dayColumns.map(({ day, weekday }) => (
                                    <th
                                        key={day}
                                        className="min-w-[52px] px-1 py-2 text-center"
                                    >
                                        <div>{day}</div>
                                        <div className="text-[10px] font-normal normal-case text-gray-500">
                                            {weekday}
                                        </div>
                                    </th>
                                ))}
                                <th className="sticky right-0 z-20 min-w-[100px] bg-brand-100 px-4 py-3 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={dayColumns.length + 2}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        Data santri tidak ditemukan
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.student.id} className="group hover:bg-green-50/40">
                                        <td className="sticky left-0 z-10 bg-white px-4 py-2 group-hover:bg-green-50">
                                            <p className="font-semibold text-gray-800">
                                                {row.student.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {getClassName(row.student)}
                                            </p>
                                        </td>

                                        {dayColumns.map(({ day }) => {
                                            const record = row.recordsByDay.get(day);

                                            return (
                                                <td key={day} className="px-1 py-2 text-center">
                                                    {record ? (
                                                        <span
                                                            title={statusLabel(record.status)}
                                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${badgeClass(
                                                                record.status
                                                            )}`}
                                                        >
                                                            {statusShort(record.status)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        <td className="sticky right-0 z-10 bg-white px-4 py-2 text-center group-hover:bg-green-50">
                                            <button
                                                type="button"
                                                onClick={() => setDetailStudent(row)}
                                                className="font-medium text-brand-600 hover:underline"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {detailStudent && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setDetailStudent(null)}
                    />
                    <div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h3 className="font-semibold text-gray-800">
                                    Detail Absensi {detailStudent.student.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {MONTHS.find((m) => m.value === filterMonth)?.label} {filterYear}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailStudent(null)}
                                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                            >
                                Tutup
                            </button>
                        </div>
                        <div className="max-h-[calc(85vh-72px)] overflow-auto p-5">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-3 py-2">Tanggal</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Keterangan</th>
                                        <th className="px-3 py-2">Diinput</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[...detailStudent.recordsByDay.entries()]
                                        .sort((a, b) => a[0] - b[0])
                                        .map(([day, record]) => (
                                            <tr key={day}>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {day} {MONTHS.find((m) => m.value === filterMonth)?.label}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass(
                                                            record.status
                                                        )}`}
                                                    >
                                                        {statusLabel(record.status)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {record.note || "-"}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {record.user?.name || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    {detailStudent.recordsByDay.size === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                                                Belum ada catatan absensi bulan ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}