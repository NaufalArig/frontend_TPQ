"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getActivityLogById, getActivityLogs } from "@/services/activity-log";
import { ActivityLog } from "@/types/activity-log";
import Pagination from "@/components/ui/pagination/Pagination";

type Props = {
    search: string;
};

const actionOptions = [
    { value: "", label: "Semua Aksi" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
    { value: "create", label: "Tambah" },
    { value: "update", label: "Ubah" },
    { value: "delete", label: "Hapus" },
    { value: "print", label: "Preview" },
    { value: "export", label: "Export" },
    { value: "import", label: "Import" },
];

const moduleOptions = [
    { value: "", label: "Semua Modul" },
    { value: "auth", label: "Auth" },
    { value: "students", label: "Santri" },
    { value: "teachers", label: "Guru" },
    { value: "users", label: "User" },
    { value: "study_classes", label: "Kelas" },
    { value: "financial_categories", label: "Kategori Keuangan" },
    { value: "tuition", label: "Keuangan SPP" },
    { value: "development_funds", label: "Keuangan Pembangunan" },
    { value: "reports", label: "Laporan" },
    { value: "asset_categories", label: "Kategori Aset" },
    { value: "assets", label: "Aset" },
    { value: "santri", label: "Santri (Excel)" },
    { value: "guru", label: "Guru (Excel)" },
    { value: "kelas", label: "Kelas (Excel)" },
    { value: "kategori-keuangan", label: "Kategori Keuangan (Excel)" },
    { value: "keuangan-spp", label: "Keuangan SPP (Excel)" },
    { value: "keuangan-pembangunan", label: "Keuangan Pembangunan (Excel)" },
];

const actionLabel: Record<string, string> = {
    login: "Login",
    logout: "Logout",
    create: "Tambah",
    update: "Ubah",
    delete: "Hapus",
    print: "Preview",
    export: "Export",
    import: "Import",
};

const actionClass: Record<string, string> = {
    login: "bg-blue-100 text-blue-700",
    logout: "bg-gray-100 text-gray-700",
    create: "bg-green-100 text-green-700",
    update: "bg-yellow-100 text-yellow-700",
    delete: "bg-red-100 text-red-700",
    print: "bg-purple-100 text-purple-700",
    export: "bg-indigo-100 text-indigo-700",
    import: "bg-teal-100 text-teal-700",
};

function formatDate(value?: string | null) {
    if (!value) return "-";

    return new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function stringifyValue(value: unknown) {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}

function renderJsonPreview(value: ActivityLog["old_values"]) {
    if (!value) {
        return <p className="text-sm text-gray-400">Tidak ada data</p>;
    }

    if (Array.isArray(value)) {
        return (
            <pre className="max-h-64 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    }

    return (
        <div className="max-h-64 space-y-2 overflow-auto rounded-lg bg-gray-50 p-3">
            {Object.entries(value).map(([key, item]) => (
                <div key={key} className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-[140px_1fr]">
                    <span className="font-semibold text-gray-700">{key}</span>
                    <span className="break-words text-gray-500">
                        {stringifyValue(item)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function ActivityLogTable({ search }: Props) {
    const [data, setData] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [action, setAction] = useState("");
    const [module, setModule] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);

            const result = await getActivityLogs({
                search,
                action,
                module,
                date_from: dateFrom,
                date_to: dateTo,
            });

            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Gagal mengambil activity log:", error);
            showToast("Gagal mengambil activity log", "error");
        } finally {
            setLoading(false);
        }
    }, [action, dateFrom, dateTo, module, search, showToast]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadLogs();
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [loadLogs]);

    const handleOpenDetail = async (log: ActivityLog) => {
        try {
            setDetailLoading(true);
            setSelectedLog(log);

            const detail = await getActivityLogById(log.id);
            setSelectedLog(detail);
        } catch (error) {
            console.error("Gagal mengambil detail activity log:", error);
            showToast("Gagal mengambil detail activity log", "error");
        } finally {
            setDetailLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = data.slice(pageStart, pageStart + pageSize);

    if (loading) return <p>Loading activity log...</p>;

    return (
        <>
            {selectedLog && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSelectedLog(null)}
                    />

                    <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    Detail Activity Log
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedLog.description}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Tutup
                            </button>
                        </div>

                        {detailLoading ? (
                            <p className="text-sm text-gray-500">Loading detail...</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 text-sm sm:grid-cols-2">
                                    <p>
                                        <span className="font-semibold">User:</span>{" "}
                                        {selectedLog.user?.name || "-"}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Username:</span>{" "}
                                        {selectedLog.user?.username || "-"}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Aksi:</span>{" "}
                                        {actionLabel[selectedLog.action] || selectedLog.action}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Modul:</span>{" "}
                                        {selectedLog.module}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Entity:</span>{" "}
                                        {selectedLog.entity_type || "-"} #{selectedLog.entity_id || "-"}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Waktu:</span>{" "}
                                        {formatDate(selectedLog.created_at)}
                                    </p>
                                    <p>
                                        <span className="font-semibold">IP:</span>{" "}
                                        {selectedLog.ip_address || "-"}
                                    </p>
                                    <p className="break-words">
                                        <span className="font-semibold">User Agent:</span>{" "}
                                        {selectedLog.user_agent || "-"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <div>
                                        <h5 className="mb-2 text-sm font-semibold text-gray-800">
                                            Data Lama
                                        </h5>
                                        {renderJsonPreview(selectedLog.old_values)}
                                    </div>

                                    <div>
                                        <h5 className="mb-2 text-sm font-semibold text-gray-800">
                                            Data Baru
                                        </h5>
                                        {renderJsonPreview(selectedLog.new_values)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1120px]">
                        <Table>
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        No
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        <div className="space-y-2">
                                            <span>Waktu</span>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={dateFrom}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    className="w-32 rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-normal text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
                                                />
                                                <input
                                                    type="date"
                                                    value={dateTo}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    className="w-32 rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-normal text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        User
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        <div className="space-y-2">
                                            <span>Aksi</span>
                                            <select
                                                value={action}
                                                onChange={(e) => setAction(e.target.value)}
                                                className="w-36 rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-normal text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
                                            >
                                                {actionOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        <div className="space-y-2">
                                            <span>Modul</span>
                                            <select
                                                value={module}
                                                onChange={(e) => setModule(e.target.value)}
                                                className="w-44 rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-normal text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
                                            >
                                                {moduleOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </TableCell>

                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Deskripsi
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        IP
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black">
                                        Detail
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="px-4 py-6 text-center text-theme-sm text-gray-500"
                                        >
                                            Activity log tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((log, index) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {pageStart + index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {formatDate(log.created_at)}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-700">
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {log.user?.name || "System"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {log.user?.role || "-"}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${actionClass[log.action] || "bg-gray-100 text-gray-700"}`}
                                                >
                                                    {actionLabel[log.action] || log.action}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {log.module}
                                            </TableCell>

                                            <TableCell className="max-w-[300px] px-4 py-3 text-theme-sm text-gray-500">
                                                <span className="line-clamp-2">
                                                    {log.description}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm text-gray-500">
                                                {log.ip_address || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetail(log)}
                                                    className="text-sm text-blue-500 hover:underline"
                                                >
                                                    Lihat
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
                    totalItems={data.length}
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
