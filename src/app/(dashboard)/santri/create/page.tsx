"use client";

import SantriForm from "../components/SantriForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function CreateSantriPage() {

    return (
        <div>
            <PageBreadcrumb pageTitle="Tambah Santri" />
            <ComponentCard title="Form Tambah Santri">
                <div>
                    <SantriForm />
                </div>
            </ComponentCard>
        </div>

    );
}