"use client";

import UserForm from "../components/UserForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function CreateUserPage() {

    return (
        <div>
            <PageBreadcrumb pageTitle="Tambah Guru" />
            <ComponentCard title="Form Tambah Guru">
                <div>
                    <UserForm />
                </div>
            </ComponentCard>
        </div>

    );
}