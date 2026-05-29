"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { getAbsensiSantri, saveAbsensiSantri } from "@/services/absensi";
import { AbsensiSantriItem } from "@/types/absensi";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import DatePicker from "@/components/form/date-picker";

const getTodayLocal = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export default function AbsensiPage() {

    const [tanggal, setTanggal] = useState(getTodayLocal());
    const [data, setData] = useState<AbsensiSantriItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [hasAbsensi, setHasAbsensi] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    const loadAbsensi = async () => {
        try {
            setLoading(true);
            const res = await getAbsensiSantri(tanggal);
            const absensiData = res.data ?? [];

            setData(absensiData);

            const sudahAdaAbsensi = absensiData.some(
                (item: AbsensiSantriItem) => item.tanggal !== null
            );

            setHasAbsensi(sudahAdaAbsensi);
            setIsEditing(!sudahAdaAbsensi);
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil data absensi", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAbsensi = async () => {
            try {
                setLoading(true);

                const res = await getAbsensiSantri(tanggal);
                const absensiData = res.data ?? [];

                setData(absensiData);

                const sudahAdaAbsensi = absensiData.some(
                    (item: AbsensiSantriItem) => item.tanggal !== null
                );

                setHasAbsensi(sudahAdaAbsensi);
                setIsEditing(!sudahAdaAbsensi);
            } catch (error) {
                console.error(error);
                showToast("Gagal mengambil data absensi", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchAbsensi();
    }, [showToast, tanggal]);

    const updateStatus = (
        santriId: number,
        status: "hadir" | "izin" | "sakit" | "alpa"
    ) => {
        setData((prev) =>
            prev.map((item) =>
                item.santri_id === santriId ? { ...item, status } : item
            )
        );
    };

    const updateKeterangan = (santriId: number, keterangan: string) => {
        setData((prev) =>
            prev.map((item) =>
                item.santri_id === santriId ? { ...item, keterangan } : item
            )
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            console.log({
                tanggal,
                absensi: data.map((item) => ({
                    santri_id: item.santri_id,
                    status: item.status,
                    keterangan: item.keterangan,
                })),
            });

            await saveAbsensiSantri({
                tanggal,
                absensi: data.map((item) => ({
                    santri_id: item.santri_id,
                    status: item.status ?? "hadir",
                    keterangan: item.keterangan?.trim() ? item.keterangan : null,
                })),
            });

            showToast("Absensi berhasil disimpan", "success");
            setHasAbsensi(true);
            setIsEditing(false);
            loadAbsensi();
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                        errors?: Record<string, string[]>;
                    };
                };
            };

            console.log("ERROR FULL:", err.response?.data);

            showToast(
                err.response?.data?.message || "Gagal menyimpan absensi",
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
                    <div className="w-52">
                        <DatePicker
                            key={tanggal}
                            id="tanggal-absensi"
                            placeholder="Pilih tanggal"
                            defaultDate={tanggal}
                            useTodayDefault
                            onChange={(_, currentDateString) => {
                                setTanggal(currentDateString || getTodayLocal());
                            }}
                        />
                    </div>
                }
            >
                {loading ? (
                    <p>Loading data absensi...</p>
                ) : data.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Tidak ada santri aktif untuk diabsen.
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <Table>
                                <TableHeader className="border-b border-brand-300 bg-brand-100">
                                    <TableRow>
                                        {["No", "Nama Santri", "Status", "Keterangan"].map((h) => (
                                            <TableCell key={h} isHeader className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400">
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {data.map((item, index) => (
                                        <TableRow key={item.santri_id}>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">{index + 1}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 capitalize">{item.nama}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <select
                                                    value={item.status}
                                                    disabled={hasAbsensi && !isEditing}
                                                    onChange={(e) =>
                                                        updateStatus(
                                                            item.santri_id,
                                                            e.target.value as
                                                            | "hadir"
                                                            | "izin"
                                                            | "sakit"
                                                            | "alpa"
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                >
                                                    <option value="hadir">Hadir</option>
                                                    <option value="izin">Izin</option>
                                                    <option value="sakit">Sakit</option>
                                                    <option value="alpa">Alpa</option>
                                                </select>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <input
                                                    type="text"
                                                    value={item.keterangan ?? ""}
                                                    disabled={hasAbsensi && !isEditing}
                                                    onChange={(e) =>
                                                        updateKeterangan(item.santri_id, e.target.value)
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

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => router.push("/absensi/riwayat")}
                                className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Riwayat Absensi
                            </button>

                            {hasAbsensi && !isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-lg bg-yellow-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-yellow-600"
                                >
                                    Edit Absensi
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70"
                                >
                                    {saving ? "Menyimpan..." : hasAbsensi ? "Update Absensi" : "Simpan Absensi"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </ComponentCard >

            {
                toast.show && (
                    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
                )
            }
        </>
    );
}