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

export default function RiwayatAbsensiPage() {
    const [data, setData] = useState<RiwayatAbsensiItem[]>([]);
    const [attendanceDate, setAttendanceDate] = useState("");
    const [status, setStatus] = useState<AttendanceStatus | "">("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(pageStart, pageStart + pageSize);

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
                                                <div className="space-y-2">
                                                    <span>Tanggal</span>
                                                    <input
                                                        type="date"
                                                        value={attendanceDate}
                                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                                        className="w-36 rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-normal text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
                                                    />
                                                </div>
                                            </TableCell>

                                            <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                Nama Santri
                                            </TableCell>
                                            <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                Kelas
                                            </TableCell>

                                            <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-black dark:text-gray-400">
                                                <div className="space-y-2">
                                                    <span>Status</span>
                                                    <select
                                                        value={status}
                                                        onChange={(e) =>
                                                            setStatus(e.target.value as AttendanceStatus | "")
                                                        }
                                                        className="w-32 rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-normal text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
                                                    >
                                                        <option value="">Semua</option>
                                                        <option value="present">Hadir</option>
                                                        <option value="permission">Izin</option>
                                                        <option value="sick">Sakit</option>
                                                        <option value="absent">Alpa</option>
                                                    </select>
                                                </div>
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
                                        {filteredData.length === 0 ? (
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
                            totalItems={filteredData.length}
                            currentPage={safeCurrentPage}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
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
