"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import KelasForm from "../../components/KelasForm";
import RoleGuard from "@/components/RoleGuard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getKelasById, updateKelas } from "@/services/kelas";
import { Kelas, KelasFormData } from "@/types/kelas";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditKelasPage({ params }: Props) {
    const [kelas, setKelas] = useState<Kelas | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                const { id } = await params;
                const data = await getKelasById(id);

                setKelas(data);
            } catch (error) {
                console.error("Gagal mengambil data kelas:", error);
                showToast("Gagal mengambil data kelas", "error");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [params, showToast]);

    const handleSubmit = async (data: KelasFormData) => {
        if (!kelas) return;

        await updateKelas(kelas.id, data);
    };

    const handleSuccess = (message: string) => {
        showToast(message, "success");

        setTimeout(() => {
            router.push("/kelas");
        }, 1500);
    };

    if (loading) return <p>Loading...</p>;

    if (!kelas) return <p>Data kelas tidak ditemukan</p>;

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
                    <PageBreadcrumb pageTitle="Edit Kelas" />

                    <ComponentCard title="Form Edit Kelas">
                        <KelasForm
                            initialData={kelas}
                            onSubmit={handleSubmit}
                            onSuccess={handleSuccess}
                        />
                    </ComponentCard>
                </div>
            </>
        </RoleGuard>
    );
}