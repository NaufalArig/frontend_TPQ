"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKeuanganById, updateKeuangan } from "@/services/keuangan";
import { Keuangan, KeuanganFormData } from "@/types/keuangan";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import KeuanganForm from "../../components/KeuanganForm";

type Props = {
    params: Promise<{ id: string }>;
};

export default function EditKeuanganPage({ params }: Props) {
    const [keuangan, setKeuangan] = useState<Keuangan | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const { id } = await params;
            const data = await getKeuanganById(Number(id));
            setKeuangan(data);
            setLoading(false);
        };
        loadData();
    }, [params]);

    const handleSubmit = async (data: KeuanganFormData) => {
        if (!keuangan) return;
        await updateKeuangan(keuangan.id, data);
        router.push("/keuangan");
    };

    if (loading) return <p>Loading...</p>;
    if (!keuangan) return <p>Data tidak ditemukan</p>;

    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Transaksi" />
            <ComponentCard title="Form Edit Transaksi">
                <KeuanganForm
                    initialData={{
                        tanggal: keuangan.tanggal,
                        jenis: keuangan.jenis,
                        nominal: keuangan.nominal,
                        keterangan: keuangan.keterangan,
                    }}
                    onSubmit={handleSubmit}
                />
            </ComponentCard>
        </div>
    );
}