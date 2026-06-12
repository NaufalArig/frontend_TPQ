"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { getRiwayatAbsensi } from "@/services/absensi";
import { AttendanceStatus, RiwayatAbsensiItem } from "@/types/absensi";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/ui/pagination/Pagination";
import SortableHeader, {
    SortDirection,
} from "@/components/ui/table/SortableHeader";

export default function RiwayatAbsensiPage() {
    const [data, setData] = useState<RiwayatAbsensiItem[]>([]);
    const [attendanceDate, setAttendanceDate] = useState("");
    const [status, setStatus] = useState<AttendanceStatus | "">("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await getRiwayatAbsensi({
                    attendance_date: attendanceDate,
                    status,
                });

                setData(res ?? []);
            } catch (error) {
                console.error(error);
                showToast("Gagal mengambil riwayat absensi", "error");
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [attendanceDate, status, showToast]);

    const badgeClass = (value: AttendanceStatus) => {
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
    };

    const statusLabel = (value: AttendanceStatus) => {
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
    };

    const filteredData = data.filter((item) => {
        const keyword = search.toLowerCase();

        return (
            item.student?.name?.toLowerCase().includes(keyword) ||
            item.note?.toLowerCase().includes(keyword) ||
            item.user?.name?.toLowerCase().includes(keyword)
        );
    });

    const handleSort = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortKey || !sortDirection) return 0;

        const getValue = (item: RiwayatAbsensiItem) => {
            switch (sortKey) {
                case "attendance_date":
                    return item.attendance_date || "";
                case "student":
                    return item.student?.name || "";
                case "class":
                    return item.student?.study_class?.name || "";
                case "status":
                    return statusLabel(item.status);
                case "note":
                    return item.note || "";
                case "user":
                    return item.user?.name || "";
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

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(pageStart, pageStart + pageSize);
    const hasActiveFilter = attendanceDate !== "" || status !== "";

    return (
        <>
            <PageBreadcrumb pageTitle="Riwayat Absensi" />

            <div className="mb-4">
                <Link
                    href="/absensi"
                    className="inline-flex w-full justify-center rounded-lg border border-brand-300 bg-brand-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-brand-100 sm:w-auto"
                >
                    Kembali ke Absensi
                </Link>
            </div>

            <ComponentCard
                title="Riwayat Absensi Santri"
                action={
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama santri, keterangan, atau penginput..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 sm:w-80"
                    />
                }
            >
                {loading ? (
                    <p>Loading riwayat absensi...</p>
                ) : (
                    <>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={(e) => {
                                    setAttendanceDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                                aria-label="Tanggal absensi"
                            />

                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value as AttendanceStatus | "");
                                    setCurrentPage(1);
                                }}
                                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                                aria-label="Filter status absensi"
                            >
                                <option value="">Semua Status</option>
                                <option value="present">Hadir</option>
                                <option value="permission">Izin</option>
                                <option value="sick">Sakit</option>
                                <option value="absent">Alpa</option>
                            </select>

                            {hasActiveFilter && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAttendanceDate("");
                                        setStatus("");
                                        setCurrentPage(1);
                                    }}
                                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                                >
                                    Reset Filter
                                </button>
                            )}

                            <span className="ml-auto text-xs text-gray-400">
                                {sortedData.length} data ditemukan
                            </span>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <div className="overflow-x-auto">
                                <div className="min-w-[900px]">
                                    <Table className="w-full text-sm">
                                        <TableHeader className="border-b border-brand-300 bg-brand-100">
                                            <TableRow>
                                                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                    No
                                                </TableCell>

                                                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                    Tanggal
                                                </TableCell>

                                                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                    <SortableHeader
                                                        label="Nama Santri"
                                                        sortKey="student"
                                                        activeKey={sortKey}
                                                        direction={sortDirection}
                                                        onSort={handleSort}
                                                    />
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                    Kelas
                                                </TableCell>

                                                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                    Status
                                                </TableCell>

                                                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                    Keterangan
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                    Diinput
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {sortedData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
                                                        className="px-4 py-6 text-center text-theme-sm text-gray-500"
                                                    >
                                                        Belum ada data absensi.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedData.map((item, index) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                                            {pageStart + index + 1}
                                                        </TableCell>

                                                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(item.attendance_date).toLocaleDateString(
                                                            "id-ID",
                                                            {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 capitalize dark:text-gray-400">
                                                        {item.student?.name ?? "-"}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                                        {item.student?.study_class?.name ?? "-"}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-medium ${badgeClass(
                                                                item.status
                                                            )}`}
                                                        >
                                                            {statusLabel(item.status)}
                                                        </span>
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                                        {item.note || "-"}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                                        {item.user?.name ?? "-"}
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
