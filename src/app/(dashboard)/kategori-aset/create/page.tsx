"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AssetCategoryForm from "../components/AssetCategoryForm";
import RoleGuard from "@/components/RoleGuard";

export default function CreateAssetCategoryPage() {
    return (
        <RoleGuard allow={["admin"]}>
            <PageBreadcrumb pageTitle="Tambah Kategori Aset" />

            <ComponentCard title="Form Tambah Kategori Aset">
                <AssetCategoryForm />
            </ComponentCard>
        </RoleGuard>
    );
}