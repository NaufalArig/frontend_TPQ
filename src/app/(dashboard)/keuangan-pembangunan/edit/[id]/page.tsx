"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import KeuanganPembangunanForm from "../../components/KeuanganPembangunanForm";
import {
    getKeuanganPembangunanById,
    updateKeuanganPembangunan,
} from "@/services/keuangan-pembangunan";
import {
    KeuanganPembangunan,
    KeuanganPembangunanFormData,
} from "@/types/keuangan-pembangunan";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditKeuanganPembangunanPage({ params }: Props) {
    const [data, setData] = useState<KeuanganPembangunan | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                const { id } = await params;
                const result = await getKeuanganPembangunanById(id);

                setData(result);
            } catch (error) {
                console.error("Gagal mengambil data keuangan pembangunan:", error);
                showToast("Gagal mengambil data keuangan pembangunan", "error");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [params, showToast]);

    const handleSubmit = async (form: KeuanganPembangunanFormData) => {
        if (!data) return;

        await updateKeuanganPembangunan(data.id, form);
    };

    const handleSuccess = (message: string) => {
        showToast(message, "success");

        setTimeout(() => {
            router.push("/keuangan-pembangunan");
        }, 1500);
    };

    if (loading) return <p>Loading...</p>;

    if (!data) return <p>Data keuangan pembangunan tidak ditemukan</p>;

    return (
        <RoleGuard allow={["admin", "treasurer"]}>
            <>
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}

                <div>
                    <PageBreadcrumb pageTitle="Edit Keuangan Pembangunan" />

                    <ComponentCard title="Form Edit Keuangan Pembangunan">
                        <KeuanganPembangunanForm
                            initialData={data}
                            onSubmit={handleSubmit}
                            onSuccess={handleSuccess}
                        />
                    </ComponentCard>
                </div>
            </>
        </RoleGuard>
    );
}