"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getKelasById } from "@/services/kelas";
import { Kelas } from "@/types/kelas";
import RiwayatAbsensiTable from "../../components/RiwayatAbsensiTable";

export default function RiwayatAbsensiKelasPage() {
    const params = useParams<{ id: string }>();
    const classId = params.id;
    const [kelas, setKelas] = useState<Kelas | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const fetchClass = async () => {
            try {
                setLoading(true);
                const res = await getKelasById(classId);
                setKelas(res);
            } catch (error) {
                console.error(error);
                showToast("Gagal mengambil detail kelas", "error");
            } finally {
                setLoading(false);
            }
        };

        void fetchClass();
    }, [classId, showToast]);

    const title = kelas ? `Riwayat Absensi ${kelas.name}` : "Riwayat Absensi Kelas";

    return (
        <>
            <PageBreadcrumb pageTitle={title} />

            <div className="space-y-6">
                <Link
                    href="/absensi/riwayat"
                    className="inline-flex w-full justify-center rounded-lg border border-brand-300 bg-brand-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-brand-100 sm:w-auto"
                >
                    Kembali ke Daftar Kelas
                </Link>

                <ComponentCard
                    title={title}
                    desc={
                        loading
                            ? "Loading data kelas..."
                            : `Guru: ${kelas?.teacher?.name || "Belum ada guru"}`
                    }
                >
                    <RiwayatAbsensiTable
                        studyClassId={classId}
                        onError={(message) => showToast(message, "error")}
                    />
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
