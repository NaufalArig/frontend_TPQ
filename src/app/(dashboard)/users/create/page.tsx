"use client";

import UserForm from "../components/UserForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function CreateUserPage() {

    return (
        <div>
            <PageBreadcrumb pageTitle="Tambah User" />
            <ComponentCard title="Form Tambah User">
                <div>
                    <UserForm />
                </div>
            </ComponentCard>
        </div>

    );
}