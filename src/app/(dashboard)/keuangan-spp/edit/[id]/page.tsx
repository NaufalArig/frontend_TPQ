"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import KeuanganSppForm from "../../components/KeuanganSppForm";
import {
    getKeuanganSppById,
    updateKeuanganSpp,
} from "@/services/keuangan-spp";
import {
    KeuanganSpp,
    KeuanganSppFormData,
} from "@/types/keuangan-spp";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditKeuanganSppPage({ params }: Props) {
    const [data, setData] = useState<KeuanganSpp | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                const { id } = await params;
                const result = await getKeuanganSppById(id);

                setData(result);
            } catch (error) {
                console.error("Gagal mengambil data SPP:", error);
                showToast("Gagal mengambil data SPP", "error");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [params, showToast]);

    const handleSubmit = async (form: KeuanganSppFormData) => {
        if (!data) return;

        await updateKeuanganSpp(data.id, form);
    };

    const handleSuccess = (message: string) => {
        showToast(message, "success");

        setTimeout(() => {
            router.push("/keuangan-spp");
        }, 1500);
    };

    if (loading) return <p>Loading...</p>;

    if (!data) return <p>Data SPP tidak ditemukan</p>;

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
                    <PageBreadcrumb pageTitle="Edit Keuangan SPP" />

                    <ComponentCard title="Form Edit Keuangan SPP">
                        <KeuanganSppForm
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