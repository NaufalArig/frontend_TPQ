"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { getAbsensiSantri, saveAbsensiSantri } from "@/services/absensi";
import { AbsensiSantriItem } from "@/types/absensi";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

export default function AbsensiPage() {
    const today = new Date().toISOString().split("T")[0];

    const [tanggal, setTanggal] = useState(today);
    const [data, setData] = useState<AbsensiSantriItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    const loadAbsensi = async () => {
        try {
            setLoading(true);
            const res = await getAbsensiSantri(tanggal);
            setData(res.data);
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil data absensi", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAbsensi();
    }, [tanggal]);

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

            await saveAbsensiSantri({
                tanggal,
                absensi: data.map((item) => ({
                    santri_id: item.santri_id,
                    status: item.status,
                    keterangan: item.keterangan,
                })),
            });

            showToast("Absensi berhasil disimpan", "success");
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan absensi", "error");
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
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
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
                            <table className="w-full text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">No</th>
                                        <th className="px-4 py-3 text-left">Nama Santri</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Keterangan</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {data.map((item, index) => (
                                        <tr key={item.santri_id}>
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3 font-medium">{item.nama}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={item.status}
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
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={item.keterangan}
                                                    onChange={(e) =>
                                                        updateKeterangan(item.santri_id, e.target.value)
                                                    }
                                                    placeholder="Opsional"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70"
                            >
                                {saving ? "Menyimpan..." : "Simpan Absensi"}
                            </button>
                        </div>
                    </>
                )}
            </ComponentCard>

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={hideToast} />
            )}
        </>
    );
}