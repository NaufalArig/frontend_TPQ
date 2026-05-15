"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getGuru, deleteGuru } from "@/services/guru";
import { Guru } from "@/types/guru";
import { useRouter } from "next/navigation";
import router from 'next/router';

export default function GuruTable() {
    const [data, setData] = useState<Guru[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleDelete = async (id: number) => {
        const confirmed = confirm(
            "Yakin ingin menghapus data guru ini?"
        );

        if (!confirmed) return;

        try {
            await deleteGuru(id);

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
        getGuru()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading data guru...</p>;

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
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    No
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Nama Guru
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Nomor
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Alamat
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Tanggal Masuk
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Tanggal Keluar
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                >
                                    Status
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
                            {data.map((guru, index) => (
                                <TableRow key={guru.id}>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {guru.nama}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {guru.kontak}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {guru.alamat}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {guru.tanggal_masuk}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {guru.status === "aktif" ? "-" : guru.tanggal_keluar}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {guru.status}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <button
                                            onClick={() => router.push(`/guru/edit/${guru.id}`)}
                                            className="text-blue-500 hover:underline text-sm"
                                        >
                                            Edit
                                        </button>
                                        <span className="m-1 font-semibold text-gray-500">|</span>
                                        <button
                                            onClick={() => handleDelete(guru.id)}
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
