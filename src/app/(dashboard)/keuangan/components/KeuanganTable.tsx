"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getKeuangan, deleteKeuangan } from "@/services/keuangan";
import { Keuangan, KeuanganSummary } from "@/types/keuangan";
import router from "next/router";

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
}

export default function KeuanganTable() {
    const [summary, setSummary] = useState<KeuanganSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const data = await getKeuangan();
        setSummary(data);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Hapus transaksi ini?")) return;
        await deleteKeuangan(id);
        loadData();
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getKeuangan();
            setSummary(data);
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading data guru...</p>;

    if (loading) return <p>Loading...</p>;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5] dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-275.5">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-sm text-green-600 font-medium">Total Pemasukan</p>
                            <p className="text-xl font-bold text-green-700">
                                {formatRupiah(summary?.pemasukan || 0)}
                            </p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
                            <p className="text-xl font-bold text-red-700">
                                {formatRupiah(summary?.pengeluaran || 0)}
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-600 font-medium">Saldo</p>
                            <p className="text-xl font-bold text-blue-700">
                                {formatRupiah(summary?.saldo || 0)}
                            </p>
                        </div>
                    </div>

                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/5]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Tanggal
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Jenis
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Keterangan
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Nominal
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Dibuat oleh
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                            {summary?.data.map((item: Keuangan) => (
                                <TableRow key={item.id}>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.tanggal}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.jenis === "pemasukan"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}>
                                            {item.jenis}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.keterangan}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {formatRupiah(item.nominal)}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {item.user?.name || "-"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => router.push(`/keuangan/edit/${item.id}`)}
                                                className="text-blue-500 hover:underline text-sm"
                                            >
                                                Edit
                                            </button>
                                            <span className="m-1 font-semibold text-gray-500">|</span>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-500 hover:underline text-sm"
                                            >
                                                Hapus
                                            </button>
                                        </div>

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
