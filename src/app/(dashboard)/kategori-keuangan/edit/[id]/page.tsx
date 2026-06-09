"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import KategoriKeuanganForm from "../../components/KategoriKeuanganForm";
import {
    getKategoriKeuanganById,
    updateKategoriKeuangan,
} from "@/services/kategori-keuangan";
import {
    KategoriKeuangan,
    KategoriKeuanganFormData,
} from "@/types/kategori-keuangan";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditKategoriKeuanganPage({ params }: Props) {
    const [kategori, setKategori] = useState<KategoriKeuangan | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                const { id } = await params;
                const data = await getKategoriKeuanganById(id);

                setKategori(data);
            } catch (error) {
                console.error("Gagal mengambil data kategori:", error);
                showToast("Gagal mengambil data kategori", "error");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [params, showToast]);

    const handleSubmit = async (data: KategoriKeuanganFormData) => {
        if (!kategori) return;

        await updateKategoriKeuangan(kategori.id, data);
    };

    const handleSuccess = (message: string) => {
        showToast(message, "success");

        setTimeout(() => {
            router.push("/kategori-keuangan");
        }, 1500);
    };

    if (loading) return <p>Loading...</p>;

    if (!kategori) return <p>Data kategori tidak ditemukan</p>;

    return (
        <RoleGuard allow={["admin"]}>
            <>
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}

                <div>
                    <PageBreadcrumb pageTitle="Edit Kategori Keuangan" />

                    <ComponentCard title="Form Edit Kategori Keuangan">
                        <KategoriKeuanganForm
                            initialData={kategori}
                            onSubmit={handleSubmit}
                            onSuccess={handleSuccess}
                        />
                    </ComponentCard>
                </div>
            </>
        </RoleGuard>
    );
}