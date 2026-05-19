"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import GuruForm from "../../components/GuruForm";
import { getGuruById, updateGuru } from "@/services/guru";
import { Guru, GuruFormData } from "@/types/guru";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditGuruPage({ params }: Props) {
    const [guru, setGuru] = useState<Guru | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();
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
    };

    const handleSuccess = (message: string) => {
        showToast(message, "success");
        setTimeout(() => router.push("/guru"), 1500);
    };

    if (loading) return <p>Loading...</p>;
    if (!guru) return <p>Data tidak ditemukan</p>;

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
            <div>
                <PageBreadcrumb pageTitle="Edit Guru" />
                <ComponentCard title="Form Edit Guru">
                    <GuruForm
                        initialData={guru}
                        onSubmit={handleSubmit}
                        onSuccess={handleSuccess}
                    />
                </ComponentCard>
            </div>
        </>
    );
}