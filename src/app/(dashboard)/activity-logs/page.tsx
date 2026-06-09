"use client";

import { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import ActivityLogTable from "./components/ActivityLogTable";

export default function ActivityLogsPage() {
    const [search, setSearch] = useState("");

    return (
        <RoleGuard allow={["admin"]}>
            <div>
                <PageBreadcrumb pageTitle="Activity Log" />

                <ComponentCard
                    title="Riwayat Aktivitas Sistem"
                    desc="Pantau aktivitas login, perubahan data, export laporan, dan aktivitas admin lainnya."
                    action={
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                                &#128269;
                            </span>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari aktivitas..."
                                className="w-full rounded-lg border border-brand-300 bg-transparent px-4 py-2.5 pl-12 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 hover:bg-brand-100 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-56"
                            />
                        </div>
                    }
                >
                    <ActivityLogTable search={search} />
                </ComponentCard>
            </div>
        </RoleGuard>
    );
}
