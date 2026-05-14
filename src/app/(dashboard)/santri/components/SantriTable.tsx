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
import Link from "next/link";
import router from "next/router";

export default function SantriTable() {
    const [data, setData] = useState<Santri[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (id: number) => {
        const confirmed = confirm(
            "Yakin ingin menghapus data santri ini?"
        );

        if (!confirmed) return;

        try {
            await deleteSantri(id);

            setData((prev) =>
                prev.filter((item) => item.id !== id)
            );

            alert("Data berhasil dihapus");
        } catch (error) {
            console.error(error);
            alert("Gagal menghapus data");
        }
    };

    useEffect(() => {
        getSantri()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading data santri...</p>;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5] dark:bg-white/3">
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-275.5">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/5]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    No
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Nama Santri
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Jenis Kelamin
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Tanggal Lahir
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Nama Wali
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Nomor Wali
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Alamat
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Status
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                            {data.map((santri, index) => (
                                <TableRow key={santri.id}>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {santri.nama}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {santri.jenis_kelamin === "L"
                                            ? "Laki-laki"
                                            : "Perempuan"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {santri.tanggal_lahir}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {santri.nama_wali}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {santri.kontak_wali}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {santri.alamat}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {santri.status}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <button
                                            onClick={() => router.push(`/keuangan/edit/${santri.id}`)}
                                            className="text-blue-500 hover:underline text-sm"
                                        >
                                            Edit
                                        </button>
                                        <span className="m-1 font-semibold text-gray-500">|</span>
                                        <button
                                            onClick={() => handleDelete(santri.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Hapus
                                        </button>
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
