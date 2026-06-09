"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleGuard from "@/components/RoleGuard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getAssetById, updateAsset } from "@/services/aset";
import { Asset, AssetFormData } from "@/types/aset";
import AssetForm from "../../components/AssetForm";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditAsetPage({ params }: Props) {
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const loadAsset = useCallback(async () => {
        try {
            const { id } = await params;
            const data = await getAssetById(id);
            setAsset(data);
        } catch (error) {
            console.error("Gagal mengambil data aset:", error);
            showToast("Gagal mengambil data aset", "error");
        } finally {
            setLoading(false);
        }
    }, [params, showToast]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadAsset();
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [loadAsset]);

    const handleSubmit = async (data: AssetFormData) => {
        if (!asset) return;

        await updateAsset(asset.id, data);
    };

    const handleSuccess = (message: string) => {
        showToast(message, "success");

        setTimeout(() => {
            router.push("/aset");
        }, 1500);
    };

    if (loading) return <p>Loading...</p>;

    if (!asset) return <p>Data aset tidak ditemukan</p>;

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
                    <PageBreadcrumb pageTitle="Edit Aset" />

                    <ComponentCard title="Form Edit Aset">
                        <AssetForm
                            initialData={asset}
                            onSubmit={handleSubmit}
                            onSuccess={handleSuccess}
                        />
                    </ComponentCard>
                </div>
            </>
        </RoleGuard>
    );
}
