"use client";

import GuruForm from "../components/GuruForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function CreateGuruPage() {

    return (
        <div>
            <PageBreadcrumb pageTitle="Tambah Guru" />
            <ComponentCard title="Form Tambah Guru">
                <div>
                    <GuruForm />
                </div>
            </ComponentCard>
        </div>

    );
}