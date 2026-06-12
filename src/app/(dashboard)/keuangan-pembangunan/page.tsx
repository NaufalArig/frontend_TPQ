"use client";

import { useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import KeuanganPembangunanTable from "./components/KeuanganPembangunanTable";
import ReportPreviewModal from "@/components/laporan/ReportPreviewModal";
import { Search } from "lucide-react";
import DataExchangeButtons from "@/components/data-exchange/DataExchangeButtons";
import {
    downloadLaporanKeuangan,
    getLaporanKeuanganPreviewUrl,
    LaporanParams,
} from "@/services/laporan";

type TransactionTypeFilter = "" | "income" | "expense";

export default function KeuanganPembangunanPage() {
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [transactionType, setTransactionType] =
        useState<TransactionTypeFilter>("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const laporanParams: LaporanParams = {
        type: "pembangunan",
        search: search.trim(),
        date_from: filterDate,
        date_to: filterDate,
        transaction_type: transactionType,
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
            console.error("Gagal membuka preview laporan pembangunan:", error);
            alert("Gagal membuka preview laporan pembangunan");
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
            console.error("Gagal download laporan pembangunan:", error);
            alert("Gagal download laporan pembangunan");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <RoleGuard allow={["admin", "treasurer"]}>
            <div>
                <PageBreadcrumb pageTitle="Keuangan Pembangunan" />

                <div className="space-y-6">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href="/keuangan-pembangunan/create"
                            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-500 sm:w-auto"
                        >
                            Tambah Data
                        </Link>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <DataExchangeButtons
                                module="keuangan-pembangunan"
                                fileName="data-keuangan-pembangunan.xlsx"
                                label="Keuangan Pembangunan"
                            />

                            <button
                                type="button"
                                onClick={handleOpenPreview}
                                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 sm:w-auto"
                            >
                                Download Laporan Pembangunan
                            </button>
                        </div>
                    </div>

                    <ComponentCard
                        title="Daftar Keuangan Pembangunan"
                        action={
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari data..."
                                        className="w-full rounded-lg border border-brand-300 bg-transparent px-4 py-2.5 pl-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 hover:bg-brand-100 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 lg:w-64"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setFilterDate("");
                                        setTransactionType("");
                                    }}
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:w-auto"
                                >
                                    Reset
                                </button>
                            </div>
                        }
                    >
                        <KeuanganPembangunanTable
                            search={search}
                            filterDate={filterDate}
                            transactionType={transactionType}
                            onFilterDateChange={setFilterDate}
                            onTransactionTypeChange={setTransactionType}
                        />
                    </ComponentCard>
                </div>

                <ReportPreviewModal
                    isOpen={previewOpen}
                    title="Laporan Keuangan Pembangunan"
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
