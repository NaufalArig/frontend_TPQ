"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleGuard from "@/components/RoleGuard";
import KeuanganSppTable from "./components/KeuanganSppTable";
import ReportPreviewModal from "@/components/laporan/ReportPreviewModal";
import DataExchangeButtons from "@/components/data-exchange/DataExchangeButtons";
import {
    downloadLaporanKeuangan,
    getLaporanKeuanganPreviewUrl,
    LaporanParams,
} from "@/services/laporan";

export default function KeuanganSppPage() {
    const [search, setSearch] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterMonth, setFilterMonth] = useState("");
    const [filterClass, setFilterClass] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const laporanParams: LaporanParams = useMemo(() => {
        return {
            type: "spp",
            search: search.trim(),
            year: filterYear,
            filter_month:
                filterYear && filterMonth
                    ? `${filterYear}-${filterMonth.padStart(2, "0")}`
                    : "",
        };
    }, [filterMonth, filterYear, search]);

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
                            Tambah Pembayaran
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

                    <KeuanganSppTable
                        search={search}
                        filterYear={filterYear}
                        filterMonth={filterMonth}
                        filterClass={filterClass}
                        onSearchChange={setSearch}
                        onFilterYearChange={setFilterYear}
                        onFilterMonthChange={setFilterMonth}
                        onFilterClassChange={setFilterClass}
                    />
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
