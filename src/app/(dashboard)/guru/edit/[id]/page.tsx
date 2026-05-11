"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import GuruForm from "../../components/GuruForm";
import { getGuruById, updateGuru } from "@/services/guru";
import { Guru, GuruFormData } from "@/types/guru";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditGuruPage({ params }: Props) {
    const [guru, setGuru] = useState<Guru | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const { id } = await params;
            const data = await getGuruById(Number(id));
            setGuru(data);
            setLoading(false);
        };

        loadData();
    }, [params]);

    const handleSubmit = async (data: GuruFormData) => {
        if (!guru) return;

        console.log("guru.id:", guru.id);
        console.log("data yang dikirim:", data);

        await updateGuru(guru.id, data);
        router.push("/guru");
    };

    if (loading) return <p>Loading...</p>;
    if (!guru) return <p>Data tidak ditemukan</p>;

    return (
        <div>
            <PageBreadcrumb pageTitle="Edit Guru" />
            <ComponentCard title="Form Edit Guru">
                <GuruForm
                    initialData={guru}
                    onSubmit={handleSubmit}
                />
            </ComponentCard>
        </div>
    );
}