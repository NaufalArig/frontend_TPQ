"use client";

import { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import AssetCategoryTable from "./components/AssetCategoryTable";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";

export default function AssetCategoriesPage() {
    const [search, setSearch] = useState("");

    return (
        <RoleGuard allow={["admin"]}>
            <PageBreadcrumb pageTitle="Kategori Aset" />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kategori aset..."
                        className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-700 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 sm:max-w-sm"
                    />

                    <Link
                        href="/kategori-aset/create"
                        className="rounded-lg bg-brand-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-brand-600"
                    >
                        Tambah Kategori
                    </Link>
                </div>

                <ComponentCard title="Daftar Kategori Aset">
                    <AssetCategoryTable search={search} />
                </ComponentCard>
            </div>
        </RoleGuard>
    );
}