"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AssetCategoryForm from "../../components/AssetCategoryForm";
import RoleGuard from "@/components/RoleGuard";
import { AssetCategory } from "@/types/kategori-aset";
import { getAssetCategoryById } from "@/services/kategori-aset";

export default function EditAssetCategoryPage() {
    const params = useParams();
    const id = params.id as string;

    const [data, setData] = useState<AssetCategory | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            getAssetCategoryById(id)
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false));
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [id]);

    return (
        <RoleGuard allow={["admin"]}>
            <PageBreadcrumb pageTitle="Edit Kategori Aset" />

            <ComponentCard title="Form Edit Kategori Aset">
                {loading ? (
                    <p className="text-sm text-gray-500">
                        Memuat data kategori...
                    </p>
                ) : data ? (
                    <AssetCategoryForm initialData={data} />
                ) : (
                    <p className="text-sm text-red-500">
                        Data kategori aset tidak ditemukan.
                    </p>
                )}
            </ComponentCard>
        </RoleGuard>
    );
}