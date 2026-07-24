"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getKelas } from "@/services/kelas";
import { getKeuanganSpp } from "@/services/keuangan-spp";
import { getSantri } from "@/services/santri";
import { Kelas } from "@/types/kelas";
import { KeuanganSpp } from "@/types/keuangan-spp";
import { Santri } from "@/types/santri";

type Props = {
    search: string;
    filterYear: string;
    filterMonth: string;
    filterClass: string;
    onSearchChange: (value: string) => void;
    onFilterYearChange: (value: string) => void;
    onFilterMonthChange: (value: string) => void;
    onFilterClassChange: (value: string) => void;
};

type MonitoringRow = {
    student: Santri;
    paymentsByMonth: Map<number, KeuanganSpp>;
};

const MONTHS = [
    { value: 1, label: "Januari", short: "Jan" },
    { value: 2, label: "Februari", short: "Feb" },
    { value: 3, label: "Maret", short: "Mar" },
    { value: 4, label: "April", short: "Apr" },
    { value: 5, label: "Mei", short: "Mei" },
    { value: 6, label: "Juni", short: "Jun" },
    { value: 7, label: "Juli", short: "Jul" },
    { value: 8, label: "Agustus", short: "Agu" },
    { value: 9, label: "September", short: "Sep" },
    { value: 10, label: "Oktober", short: "Okt" },
    { value: 11, label: "November", short: "Nov" },
    { value: 12, label: "Desember", short: "Des" },
];

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

function formatDate(value?: string | null, monthStyle: "short" | "long" = "short") {
    const dateOnly = getDateOnly(value);
    if (!dateOnly) return "-";

    const date = new Date(`${dateOnly}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: monthStyle,
        year: monthStyle === "long" ? "numeric" : undefined,
    });
}

function isLate(year: number, month: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return year < currentYear || (year === currentYear && month < currentMonth);
}

function getClassName(student: Santri) {
    return student.study_class?.name || "-";
}

function getPaymentKey(studentId: number, month: number) {
    return `${studentId}-${month}`;
}

function StatusBadge({
    payment,
    year,
    month,
}: {
    payment?: KeuanganSpp;
    year: number;
    month: number;
}) {
    if (payment) {
        return (
            <span className="inline-flex min-w-[74px] flex-col items-center justify-center rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                <span className="text-sm leading-none">✓</span>
                <span>{formatDate(payment.payment_date)}</span>
            </span>
        );
    }

    if (isLate(year, month)) {
        return (
            <span className="inline-flex min-w-[74px] items-center justify-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700 ring-1 ring-yellow-200">
                Terlambat
            </span>
        );
    }

    return (
        <span className="inline-flex min-w-[74px] items-center justify-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
            Belum
        </span>
    );
}

export default function KeuanganSppTable({
    search,
    filterYear,
    filterMonth,
    filterClass,
    onSearchChange,
    onFilterYearChange,
    onFilterMonthChange,
    onFilterClassChange,
}: Props) {
    const [students, setStudents] = useState<Santri[]>([]);
    const [payments, setPayments] = useState<KeuanganSpp[]>([]);
    const [classes, setClasses] = useState<Kelas[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailRow, setDetailRow] = useState<MonitoringRow | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyDateFrom, setHistoryDateFrom] = useState("");
    const [historyDateTo, setHistoryDateTo] = useState("");
    const { toast, showToast, hideToast } = useToast();
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const yearNumber = Number(filterYear || currentYear);
    const monthNumber = filterMonth ? Number(filterMonth) : null;

    useEffect(() => {
        Promise.all([
            getSantri().catch(() => []),
            getKeuanganSpp().catch(() => []),
            getKelas().catch(() => []),
        ])
            .then(([studentData, paymentData, classData]) => {
                setStudents(Array.isArray(studentData) ? studentData : []);
                setPayments(Array.isArray(paymentData) ? paymentData : []);
                setClasses(Array.isArray(classData) ? classData : []);
            })
            .catch((error) => {
                console.error("Gagal memuat monitoring SPP:", error);
                showToast("Gagal memuat monitoring SPP", "error");
            })
            .finally(() => setLoading(false));
    }, [showToast]);

    const yearOptions = useMemo(() => {
        const years = new Set<number>([currentYear]);

        payments.forEach((payment) => {
            const year = Number(payment.year);
            if (year) years.add(year);
        });

        return [...years].sort((a, b) => b - a);
    }, [currentYear, payments]);

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
                a.name.localeCompare(b.name, "id", {
                    numeric: true,
                    sensitivity: "base",
                })
            );
    }, [filterClass, search, students]);

    const paymentMap = useMemo(() => {
        const map = new Map<string, KeuanganSpp>();

        payments.forEach((payment) => {
            const studentId = Number(payment.student_id || payment.student?.id || 0);
            const month = Number(payment.month);
            const year = Number(payment.year);

            if (!studentId || !month || year !== yearNumber) return;

            const key = getPaymentKey(studentId, month);
            const previous = map.get(key);
            const previousDate = getDateOnly(previous?.payment_date);
            const currentDate = getDateOnly(payment.payment_date);

            if (!previous || currentDate >= previousDate) {
                map.set(key, payment);
            }
        });

        return map;
    }, [payments, yearNumber]);

    const rows = useMemo<MonitoringRow[]>(() => {
        return filteredStudents.map((student) => {
            const paymentsByMonth = new Map<number, KeuanganSpp>();

            MONTHS.forEach((month) => {
                const payment = paymentMap.get(getPaymentKey(student.id, month.value));
                if (payment) paymentsByMonth.set(month.value, payment);
            });

            return { student, paymentsByMonth };
        });
    }, [filteredStudents, paymentMap]);

    const selectedStudentIds = useMemo(
        () => new Set(filteredStudents.map((student) => student.id)),
        [filteredStudents]
    );

    const filteredPayments = useMemo(() => {
        return payments
            .filter((payment) => {
                const studentId = Number(payment.student_id || payment.student?.id || 0);
                const matchStudent = selectedStudentIds.has(studentId);
                const matchYear = !filterYear || Number(payment.year) === yearNumber;
                const matchMonth = !monthNumber || Number(payment.month) === monthNumber;

                return matchStudent && matchYear && matchMonth;
            })
            .sort((a, b) => {
                const dateCompare = getDateOnly(b.payment_date).localeCompare(
                    getDateOnly(a.payment_date)
                );

                if (dateCompare !== 0) return dateCompare;

                return String(b.created_at || "").localeCompare(String(a.created_at || ""));
            });
    }, [filterYear, monthNumber, payments, selectedStudentIds, yearNumber]);

    const historyPayments = useMemo(() => {
        return payments
            .filter((payment) => {
                const studentId = Number(payment.student_id || payment.student?.id || 0);
                const matchStudent = selectedStudentIds.has(studentId);
                const dateOnly = getDateOnly(payment.payment_date);
                const matchFrom = !historyDateFrom || dateOnly >= historyDateFrom;
                const matchTo = !historyDateTo || dateOnly <= historyDateTo;

                return matchStudent && matchFrom && matchTo;
            })
            .sort((a, b) => {
                const dateCompare = getDateOnly(b.payment_date).localeCompare(
                    getDateOnly(a.payment_date)
                );

                if (dateCompare !== 0) return dateCompare;

                return String(b.created_at || "").localeCompare(String(a.created_at || ""));
            });
    }, [historyDateFrom, historyDateTo, payments, selectedStudentIds]);

    const latestHistoryPayments = historyPayments.slice(0, 5);

    const summary = useMemo(() => {
        const paidStudentIds = new Set<number>();
        let income = 0;

        filteredPayments.forEach((payment) => {
            const studentId = Number(payment.student_id || payment.student?.id || 0);
            if (studentId) paidStudentIds.add(studentId);
            income += Number(payment.amount || 0);
        });

        return {
            totalStudents: filteredStudents.length,
            paidStudents: paidStudentIds.size,
            unpaidStudents: Math.max(filteredStudents.length - paidStudentIds.size, 0),
            income,
        };
    }, [filteredPayments, filteredStudents.length]);

    const selectedMonthLabel = monthNumber
        ? MONTHS.find((month) => month.value === monthNumber)?.label || "-"
        : "Semua Bulan";
    const selectedPeriodLabel = `${selectedMonthLabel} ${filterYear || "Semua Tahun"}`;

    const resetFilters = () => {
        setLoading(true);
        onSearchChange("");
        onFilterClassChange("");
        onFilterYearChange("");
        onFilterMonthChange("");
        setHistoryDateFrom("");
        setHistoryDateTo("");

        Promise.all([
            getSantri().catch(() => []),
            getKeuanganSpp().catch(() => []),
            getKelas().catch(() => []),
        ])
            .then(([studentData, paymentData, classData]) => {
                setStudents(Array.isArray(studentData) ? studentData : []);
                setPayments(Array.isArray(paymentData) ? paymentData : []);
                setClasses(Array.isArray(classData) ? classData : []);
            })
            .catch((error) => {
                console.error("Gagal memuat ulang monitoring SPP:", error);
                showToast("Gagal memuat ulang monitoring SPP", "error");
            })
            .finally(() => setLoading(false));
    };

    const findActionPayment = (row: MonitoringRow) => {
        return (
            (monthNumber ? row.paymentsByMonth.get(monthNumber) : undefined) ||
            [...row.paymentsByMonth.values()].sort((a, b) =>
                getDateOnly(b.payment_date).localeCompare(getDateOnly(a.payment_date))
            )[0]
        );
    };

    const handleEdit = (row: MonitoringRow) => {
        const payment = findActionPayment(row);

        if (payment) {
            router.push(`/keuangan-spp/edit/${payment.id}`);
            return;
        }

        router.push("/keuangan-spp/create");
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                Loading monitoring pembayaran SPP...
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Santri"
                    value={summary.totalStudents}
                    subtitle="Sesuai filter aktif"
                    className="border-blue-100 bg-blue-50 text-blue-700"
                />
                <SummaryCard
                    title="Sudah Lunas Bulan yang Dipilih"
                    value={summary.paidStudents}
                    subtitle={selectedPeriodLabel}
                    className="border-green-100 bg-green-50 text-green-700"
                />
                <SummaryCard
                    title="Belum Membayar"
                    value={summary.unpaidStudents}
                    subtitle={selectedPeriodLabel}
                    className="border-red-100 bg-red-50 text-red-700"
                />
                <SummaryCard
                    title="Total Pemasukan"
                    value={formatRupiah(summary.income)}
                    subtitle={selectedPeriodLabel}
                    className="border-emerald-100 bg-emerald-50 text-emerald-700"
                    compact
                />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[140px_170px_180px_1fr_auto] lg:items-end">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Tahun
                        </label>
                        <select
                            value={filterYear}
                            onChange={(event) => onFilterYearChange(event.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                        >
                            <option value="">Semua Tahun</option>
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Bulan
                        </label>
                        <select
                            value={filterMonth}
                            onChange={(event) => onFilterMonthChange(event.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                        >
                            <option value="">Semua Bulan</option>
                            {MONTHS.map((month) => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Kelas
                        </label>
                        <select
                            value={filterClass}
                            onChange={(event) => onFilterClassChange(event.target.value)}
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
                                onChange={(event) => onSearchChange(event.target.value)}
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

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-3">
                    <h3 className="text-base font-semibold text-gray-800">
                        Monitoring Pembayaran SPP
                    </h3>
                    <p className="text-sm text-gray-500">
                        Pantau status pembayaran setiap santri sepanjang tahun {filterYear}.
                    </p>
                </div>

                <div className="max-h-[70vh] overflow-auto">
                    <table className="min-w-[1600px] w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-brand-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 shadow-sm">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">NISN</th>
                                <th className="sticky left-0 z-20 min-w-[220px] bg-brand-100 px-4 py-3">
                                    Nama Santri
                                </th>
                                {MONTHS.map((month) => (
                                    <th
                                        key={month.value}
                                        className={`min-w-[112px] px-3 py-3 text-center ${month.value === monthNumber ? "bg-brand-200" : ""
                                            }`}
                                    >
                                        {month.label}
                                    </th>
                                ))}
                                <th className="sticky right-0 z-20 min-w-[170px] bg-brand-100 px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={16}
                                        className="px-4 py-10 text-center text-sm text-gray-500"
                                    >
                                        Data santri tidak ditemukan
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, index) => (
                                    <tr
                                        key={row.student.id}
                                        className="group transition-colors hover:bg-green-50/40"
                                    >
                                        <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {row.student.nisn || "-"}
                                        </td>
                                        <td className="sticky left-0 bg-white px-4 py-3 group-hover:bg-green-50">
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {row.student.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {getClassName(row.student)}
                                                </p>
                                            </div>
                                        </td>

                                        {MONTHS.map((month) => (
                                            <td
                                                key={month.value}
                                                className={`px-3 py-3 text-center ${month.value === monthNumber
                                                    ? "bg-brand-50/70"
                                                    : ""
                                                    }`}
                                            >
                                                <StatusBadge
                                                    payment={row.paymentsByMonth.get(month.value)}
                                                    year={yearNumber}
                                                    month={month.value}
                                                />
                                            </td>
                                        ))}

                                        <td className="sticky right-0 z-10 bg-white px-4 py-3 group-hover:bg-green-50">
                                            <div className="flex justify-center gap-2 whitespace-nowrap text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailRow(row)}
                                                    className="font-medium text-gray-600 hover:text-brand-600"
                                                >
                                                    Detail
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(row)}
                                                    className="font-medium text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">
                            Riwayat Pembayaran Terbaru
                        </h3>
                        <p className="text-sm text-gray-500">
                            Maksimal 5 transaksi terbaru sesuai rentang tanggal di bawah.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={historyDateFrom}
                                onChange={(event) => setHistoryDateFrom(event.target.value)}
                                className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={historyDateTo}
                                onChange={(event) => setHistoryDateTo(event.target.value)}
                                className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                            />
                        </div>
                        {(historyDateFrom || historyDateTo) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setHistoryDateFrom("");
                                    setHistoryDateTo("");
                                }}
                                className="h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Reset Tanggal
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setHistoryOpen(true)}
                            className="h-10 rounded-lg border border-brand-200 px-4 text-sm font-medium text-brand-700 hover:bg-brand-50"
                        >
                            Lihat Semua Riwayat
                        </button>
                    </div>
                </div>

                <HistoryTable payments={latestHistoryPayments} />
            </section>

            {detailRow && (
                <Modal title={`Detail Pembayaran ${detailRow.student.name}`} onClose={() => setDetailRow(null)}>
                    <div className="mb-4 rounded-xl bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-800">{detailRow.student.name}</p>
                        <p className="text-xs text-gray-500">
                            NISN: {detailRow.student.nisn || "-"} • Kelas:{" "}
                            {getClassName(detailRow.student)}
                        </p>
                    </div>
                    <HistoryTable payments={[...detailRow.paymentsByMonth.values()]} emptyText="Belum ada pembayaran pada tahun ini" />
                </Modal>
            )}

            {historyOpen && (
                <Modal title="Semua Riwayat Pembayaran" onClose={() => setHistoryOpen(false)}>
                    <HistoryTable payments={historyPayments} emptyText="Belum ada riwayat pembayaran sesuai filter" />
                </Modal>
            )}

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    className,
    compact = false,
}: {
    title: string;
    value: number | string;
    subtitle: string;
    className: string;
    compact?: boolean;
}) {
    return (
        <div className={`rounded-xl border p-4 shadow-sm ${className}`}>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className={`mt-2 font-bold ${compact ? "text-xl" : "text-3xl"}`}>
                {value}
            </p>
            <p className="mt-1 text-xs opacity-70">{subtitle}</p>
        </div>
    );
}

function HistoryTable({
    payments,
    emptyText = "Belum ada transaksi",
}: {
    payments: KeuanganSpp[];
    emptyText?: string;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Nama Santri</th>
                        <th className="px-4 py-3">Bulan</th>
                        <th className="px-4 py-3">Nominal</th>
                        <th className="px-4 py-3">Petugas</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {payments.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        payments.map((payment) => {
                            const monthLabel =
                                MONTHS.find((month) => month.value === Number(payment.month))
                                    ?.label || "-";

                            return (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600">
                                        {formatDate(payment.payment_date, "long")}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {payment.student?.name || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {monthLabel} {payment.year}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-green-700">
                                        {formatRupiah(payment.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {payment.user?.name || "-"}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

function Modal({
    title,
    children,
    onClose,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                    >
                        Tutup
                    </button>
                </div>
                <div className="max-h-[calc(85vh-72px)] overflow-auto p-5">{children}</div>
            </div>
        </div>
    );
}
