"use client";

import { useRouter } from "next/navigation";
import SantriForm from "@/app/(dashboard)/santri/components/SantriForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function CreateSantriPage() {
    const router = useRouter();

    return (
        <div>
            <PageBreadcrumb pageTitle="Tambah Santri" />
            <ComponentCard title="Form Tambah Santri">
                <div>
                    <SantriForm onSuccess={() => router.push("/santri")} />
                </div>
            </ComponentCard>
        </div>

    );
}