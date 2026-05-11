"use client";

import { createKeuangan } from "@/services/keuangan";
import { KeuanganFormData } from "@/types/keuangan";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import KeuanganForm from "../components/KeuanganForm";

export default function TambahKeuanganPage() {
    const handleSubmit = async (data: KeuanganFormData) => {
        await createKeuangan(data);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Tambah Transaksi" />
            <ComponentCard title="Form Tambah Transaksi">
                <KeuanganForm onSubmit={handleSubmit} />
            </ComponentCard>
        </div>
    );
}