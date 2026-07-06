"use client";

import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import RiwayatAbsensiTable from "../components/RiwayatAbsensiTable";

export default function SemuaRiwayatAbsensiPage() {
    const { toast, showToast, hideToast } = useToast();

    return (
        <>
            <PageBreadcrumb pageTitle="Semua Riwayat Absensi" />

            <div className="space-y-6">
                <Link
                    href="/absensi/riwayat"
                    className="inline-flex w-full justify-center rounded-lg border border-brand-300 bg-brand-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-brand-100 sm:w-auto"
                >
                    Kembali ke Daftar Kelas
                </Link>

                <ComponentCard title="Riwayat Absensi Semua Kelas">
                    <RiwayatAbsensiTable onError={(message) => showToast(message, "error")} />
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
