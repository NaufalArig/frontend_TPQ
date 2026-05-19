"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersTable from "./components/UserTable";
import Link from "next/link";

export default function UsersPage() {

    return (
        <div>
            <PageBreadcrumb pageTitle="Menu Users" />
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href="/users/create"
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-500"
                    >Tambah User
                    </Link>
                </div>
                <ComponentCard title="Daftar Tabel User">
                    <UsersTable />
                </ComponentCard>
            </div>
        </div>
    );
}
