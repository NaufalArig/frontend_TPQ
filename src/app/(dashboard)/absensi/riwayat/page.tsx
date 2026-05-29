"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { getRiwayatAbsensi } from "@/services/absensi";
import { RiwayatAbsensiItem } from "@/types/absensi";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import DatePicker from "@/components/form/date-picker";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

export default function RiwayatAbsensiPage() {
    const [data, setData] = useState<RiwayatAbsensiItem[]>([]);
    const [tanggal, setTanggal] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const res = await getRiwayatAbsensi({
                    tanggal,
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

        fetchData();
    }, [tanggal, status, showToast]);

    const badgeClass = (status: string) => {
        switch (status) {
            case "hadir":
                return "bg-green-100 text-green-700";
            case "izin":
                return "bg-yellow-100 text-yellow-700";
            case "sakit":
                return "bg-blue-100 text-blue-700";
            case "alpa":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const filteredData = data.filter((item) => {
        const keyword = search.toLowerCase();

        return (
            item.santri?.nama?.toLowerCase().includes(keyword) ||
            item.keterangan?.toLowerCase().includes(keyword) ||
            item.user?.name?.toLowerCase().includes(keyword)
        );
    });

    return (
        <>
            <PageBreadcrumb pageTitle="Riwayat Absensi" />

            <div className="mb-4">
                <Link
                    href="/absensi"
                    className="inline-flex rounded-lg bg-brand-200 px-4 py-2 border border-brand-300 text-sm font-medium text-gray-700 hover:bg-brand-100"
                >
                    Kembali ke Absensi
                </Link>
            </div>

            <ComponentCard
                title="Riwayat Absensi Santri"
                action={
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama santri, keterangan, atau penginput..."
                                className="w-80 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />

                            <button
                                type="button"
                                onClick={() => setShowFilter(!showFilter)}
                                className="rounded-lg bg-brand-100 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-200"
                            >
                                Filter
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setTanggal("");
                                    setStatus("");
                                    setSearch("");
                                }}
                                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Reset
                            </button>
                        </div>

                        {showFilter && (
                            <div className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <DatePicker
                                    key={tanggal || "empty-date"}
                                    id="tanggal-riwayat-absensi"
                                    placeholder="Pilih tanggal"
                                    defaultDate={tanggal}
                                    onChange={(_, currentDateString) => {
                                        setTanggal(currentDateString);
                                    }}
                                />

                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="hadir">Hadir</option>
                                    <option value="izin">Izin</option>
                                    <option value="sakit">Sakit</option>
                                    <option value="alpa">Alpa</option>
                                </select>
                            </div>
                        )}
                    </div>
                }
            >
                {loading ? (
                    <p>Loading riwayat absensi...</p>
                ) : filteredData.length === 0 ? (
                    <p className="text-sm text-gray-500">Belum ada data absensi.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <Table className="w-full text-sm">
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    {["No", "Tanggal", "Nama Santri", "Status", "Keterangan", "Diinput"].map((h) => (
                                        <TableCell key={h} isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredData.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{index + 1}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 capitalize">
                                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 capitalize">
                                            {item.santri?.nama ?? "-"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${badgeClass(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{item.keterangan || "-"}</TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{item.user?.name ?? "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </ComponentCard>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </>
    );
}