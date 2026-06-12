"use client";

import { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import KeuanganSppTable from "./components/KeuanganSppTable";
import ReportPreviewModal from "@/components/laporan/ReportPreviewModal";
import { Search } from "lucide-react";
import DataExchangeButtons from "@/components/data-exchange/DataExchangeButtons";
import {
    downloadLaporanKeuangan,
    getLaporanKeuanganPreviewUrl,
    LaporanParams,
} from "@/services/laporan";

export default function KeuanganSppPage() {
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const laporanParams: LaporanParams = {
        type: "spp",
        search: search.trim(),
        date_from: filterDate,
        date_to: filterDate,
    };

    const closePreview = () => {
        setPreviewOpen(false);

        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleOpenPreview = async () => {
        try {
            if (previewUrl) {
                window.URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }

            setPreviewOpen(true);
            setPreviewLoading(true);
            const url = await getLaporanKeuanganPreviewUrl(laporanParams);
            setPreviewUrl(url);
        } catch (error) {
            console.error("Gagal membuka preview laporan SPP:", error);
            alert("Gagal membuka preview laporan SPP");
            setPreviewOpen(false);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            await downloadLaporanKeuangan(laporanParams);
        } catch (error) {
            console.error("Gagal download laporan SPP:", error);
            alert("Gagal download laporan SPP");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <RoleGuard allow={["admin", "treasurer"]}>
            <div>
                <PageBreadcrumb pageTitle="Keuangan SPP" />

                <div className="space-y-6">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href="/keuangan-spp/create"
                            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-500 sm:w-auto"
                        >
                            Tambah Data
                        </Link>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <DataExchangeButtons
                                module="keuangan-spp"
                                fileName="data-keuangan-spp.xlsx"
                                label="Keuangan SPP"
                            />

                            <button
                                type="button"
                                onClick={handleOpenPreview}
                                className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 sm:w-auto"
                            >
                                Download Laporan SPP
                            </button>
                        </div>
                    </div>

                    <ComponentCard
                        title="Daftar Keuangan SPP"
                        action={
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari data SPP..."
                                        className="w-full rounded-lg border border-brand-300 bg-transparent px-4 py-2.5 pl-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 hover:bg-brand-100 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 lg:w-64"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setFilterDate("");
                                    }}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:w-auto"
                                >
                                    Reset
                                </button>
                            </div>
                        }
                    >
                        <KeuanganSppTable
                            search={search}
                            filterDate={filterDate}
                            onFilterDateChange={setFilterDate}
                        />
                    </ComponentCard>
                </div>

                <ReportPreviewModal
                    isOpen={previewOpen}
                    title="Laporan Keuangan SPP"
                    previewUrl={previewUrl}
                    loading={previewLoading}
                    downloading={downloading}
                    onClose={closePreview}
                    onDownload={handleDownload}
                />
            </div>
        </RoleGuard>
    );
}
