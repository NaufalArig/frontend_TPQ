"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import SantriForm from "../../components/SantriForm";
import { getSantriById, updateSantri } from "@/services/santri";
import { Santri, SantriFormData } from "@/types/santri";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditSantriPage({ params }: Props) {
    const [santri, setSantri] = useState<Santri | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const { id } = await params;
            const data = await getSantriById(Number(id));
            setSantri(data);
            setLoading(false);
        };

        loadData();
    }, [params]);

    const handleSubmit = async (data: SantriFormData) => {
        if (!santri) return;

        await updateSantri(santri.id, data);
        router.push("/santri");
    };

    if (loading) return <p>Loading...</p>;
    if (!santri) return <p>Data tidak ditemukan</p>;

    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Santri" />
            <ComponentCard title="Form Edit Santri">
                <SantriForm
                    initialData={santri}
                    onSubmit={handleSubmit}
                />
            </ComponentCard>
        </div>
    );
}