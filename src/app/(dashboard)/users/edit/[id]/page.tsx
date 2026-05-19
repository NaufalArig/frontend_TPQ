"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import UserForm from "../../components/UserForm";
import { getUserById, updateUser } from "@/services/user";
import { User, UserFormData } from "@/types/user";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default function EditUserPage({ params }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const { id } = await params;
            const data = await getUserById(Number(id));
            setUser(data);
            setLoading(false);
        };

        loadData();
    }, [params]);

    const handleSubmit = async (data: UserFormData) => {
        if (!user) return;

        console.log("user.id:", user.id);
        console.log("data yang dikirim:", data);

        await updateUser(user.id, data);
    };

    const handleSuccess = (message: string) => {
        showToast(message, "success");
        setTimeout(() => router.push("/users"), 1500);
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>Data tidak ditemukan</p>;

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
                <PageBreadcrumb pageTitle="Edit User" />
                <ComponentCard title="Form Edit User">
                    <UserForm
                        initialData={user}
                        onSubmit={handleSubmit}
                        onSuccess={handleSuccess}
                    />
                </ComponentCard>
            </div>
        </>
    );
}