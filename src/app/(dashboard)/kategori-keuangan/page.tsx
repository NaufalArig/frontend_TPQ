"use client";

import { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import KategoriKeuanganCardList from "./components/KategoriKeuanganCardList";
import DataExchangeButtons from "@/components/data-exchange/DataExchangeButtons";

export default function KategoriKeuanganPage() {
    const [search, setSearch] = useState("");

    return (
        <RoleGuard allow={["admin"]}>
            <div>
                <PageBreadcrumb pageTitle="Kategori Keuangan" />

                <div className="space-y-6">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href="/kategori-keuangan/create"
                            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-500 sm:w-auto"
                        >
                            Tambah Kategori
                        </Link>
                        <DataExchangeButtons
                            module="kategori-keuangan"
                            fileName="data-kategori-keuangan.xlsx"
                            label="Kategori Keuangan"
                        />
                    </div>

                    <ComponentCard
                        title="Daftar Kategori Keuangan"
                        action={
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                                    &#128269;
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kategori..."
                                    className="w-full rounded-lg border border-brand-300 bg-transparent px-4 py-2.5 pl-12 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 hover:bg-brand-100 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-52"
                                />
                            </div>
                        }
                    >
                        <KategoriKeuanganCardList search={search} />
                    </ComponentCard>
                </div>
            </div>
        </RoleGuard>
    );
}
