"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getKelas } from "@/services/kelas";
import { Kelas } from "@/types/kelas";
import { useUser } from "@/context/UserContext";

export default function RiwayatAbsensiPage() {
    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();
    const { user } = useUser();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoading(true);
                const res = await getKelas();
                setKelasList((res ?? []).filter((kelas: Kelas) => kelas.status === "active"));
            } catch (error) {
                console.error(error);
                showToast("Gagal mengambil data kelas", "error");
            } finally {
                setLoading(false);
            }
        };

        void fetchClasses();
    }, [showToast]);

    return (
        <>
            <PageBreadcrumb pageTitle="Riwayat Absensi" />

            <div className="space-y-6">
                {user?.role !== "admin" && (
                    <Link
                        href="/absensi"
                        className="inline-flex w-full justify-center rounded-lg border border-brand-300 bg-brand-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-brand-100 sm:w-auto"
                    >
                        Kembali ke Absensi
                    </Link>
                )}

                <ComponentCard title="Kelas dan Guru Pengajar">
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading data kelas...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <Link
                                href="/absensi/riwayat/semua"
                                className="rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50"
                            >
                                <p className="text-sm font-semibold text-gray-800">Semua Riwayat</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Lihat seluruh riwayat absensi dari semua kelas.
                                </p>
                                <p className="mt-3 text-xs font-medium text-brand-600">
                                    Buka riwayat
                                </p>
                            </Link>

                            {kelasList.map((kelas) => (
                                <Link
                                    key={kelas.id}
                                    href={`/absensi/riwayat/kelas/${kelas.id}`}
                                    className="rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {kelas.name}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Guru: {kelas.teacher?.name || "Belum ada guru"}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                            {kelas.santris_count ?? kelas.students_count ?? kelas.santris?.length ?? 0} santri
                                        </span>
                                    </div>
                                    <p className="mt-3 text-xs font-medium text-brand-600">
                                        Buka riwayat kelas
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </ComponentCard>
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
