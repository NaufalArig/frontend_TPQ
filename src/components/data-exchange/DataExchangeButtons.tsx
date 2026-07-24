"use client";
import { Download, Loader2, Upload, FileDown, FileSpreadsheet } from "lucide-react";
import { useRef, useState } from "react";
import {
    DataExchangeModule,
    ImportErrorDetail,
    exportData,
    importData,
} from "@/services/data-exchange";
import { downloadTemplate } from "@/services/dataExchange";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import axios from "axios";

type DataExchangeButtonsProps = {
    module: DataExchangeModule;
    fileName: string;
    label?: string;
};

function normalizeImportErrors(errors: unknown): ImportErrorDetail[] {
    if (Array.isArray(errors)) {
        return errors.map((item, index) => ({
            row: Number(item?.row ?? index + 1),
            field: item?.field ?? null,
            label: item?.label ?? null,
            message: String(item?.message ?? item?.detail ?? "Data tidak valid"),
            detail: item?.detail,
        }));
    }
    if (errors && typeof errors === "object") {
        return Object.entries(errors as Record<string, unknown>).flatMap(
            ([field, messages]) => {
                const list = Array.isArray(messages) ? messages : [messages];
                return list.map((message) => ({
                    row: 1,
                    field,
                    label: field,
                    message: String(message ?? "Data tidak valid"),
                    detail: `${field}: ${String(message ?? "Data tidak valid")}`,
                }));
            }
        );
    }
    return [];
}

export default function DataExchangeButtons({
    module,
    fileName,
    label = "Data",
}: DataExchangeButtonsProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importErrors, setImportErrors] = useState<ImportErrorDetail[]>([]);
    const { toast, showToast, hideToast } = useToast();

    const closeModal = () => {
        setShowImportModal(false);
        setSelectedFile(null);
        setImportErrors([]);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            await exportData(module, fileName);
            showToast(`Export ${label} berhasil`, "success");
        } catch (error) {
            console.error(`Gagal export ${label}:`, error);
            showToast(`Gagal export ${label}`, "error");
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setDownloading(true);
            await downloadTemplate(module);
        } catch (error) {
            console.error(`Gagal download template ${label}:`, error);
            showToast(`Gagal mengunduh template ${label}`, "error");
        } finally {
            setDownloading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            showToast("Pilih file Excel terlebih dahulu", "error");
            return;
        }
        try {
            setImporting(true);
            setImportErrors([]);
            const result = await importData(module, selectedFile);
            setImportErrors(result.errors);
            const errorInfo =
                result.errors.length > 0
                    ? `, ${result.errors.length} baris gagal`
                    : "";
            showToast(
                `Import ${label} selesai: ${result.created} baru, ${result.updated} update${errorInfo}`,
                result.errors.length > 0 ? "warning" : "success"
            );
            if (result.errors.length === 0) {
                window.setTimeout(() => {
                    window.location.reload();
                }, 1200);
            }
        } catch (error) {
            console.error(`Gagal import ${label}:`, error);
            const payload = axios.isAxiosError(error) ? error.response?.data : null;
            const payloadErrors = normalizeImportErrors(payload?.errors);
            const message = payload?.message || `Gagal import ${label}`;
            setImportErrors(payloadErrors);
            showToast(message, "error");
        } finally {
            setImporting(false);
        }
    };

    return (
        <>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {/* Export */}
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting || importing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Export Excel
                </button>

                {/* Import → buka modal */}
                <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    disabled={exporting || importing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    <Upload className="h-4 w-4" />
                    Import Excel
                </button>
            </div>

            {/* MODAL IMPORT */}
            {showImportModal && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Import {label} dari Excel
                            </h4>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Tutup"
                            >
                                &#10005;
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-5 p-6">
                            {/* Info penting */}
                            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <span className="text-lg">&#128161;</span>
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold">Unduh template terlebih dahulu</p>
                                    <p className="mt-1 text-amber-700">
                                        Untuk hasil maksimal &amp; menghindari error, isi data pada
                                        template resmi. Jangan mengubah nama kolom pada baris header.
                                    </p>
                                </div>
                            </div>

                            {/* Langkah 1: Download template */}
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">Langkah 1</p>
                                        <p className="text-gray-500">Unduh template Excel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadTemplate}
                                    disabled={downloading}
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
                                >
                                    {downloading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileDown className="h-4 w-4" />
                                    )}
                                    Download Template
                                </button>
                            </div>

                            {/* Langkah 2: Pilih file */}
                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Langkah 2</p>
                                <p className="mb-3 text-sm text-gray-500">Pilih file yang sudah diisi</p>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => {
                                        setSelectedFile(e.target.files?.[0] ?? null);
                                        setImportErrors([]);
                                    }}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600 hover:file:bg-brand-100"
                                />
                            </div>

                            {/* Daftar error import */}
                            {importErrors.length > 0 && (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">Detail gagal import {label}</p>
                                        <p className="text-xs text-yellow-700">
                                            {importErrors.length} kesalahan
                                        </p>
                                    </div>
                                    <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
                                        {importErrors.slice(0, 10).map((item, index) => (
                                            <li
                                                key={`${item.row}-${item.field ?? "row"}-${index}`}
                                                className="rounded-lg bg-white/70 px-3 py-2"
                                            >
                                                <span className="font-medium">
                                                    Baris {item.row}
                                                    {item.label ? ` - ${item.label}` : ""}
                                                </span>
                                                <span className="block text-yellow-800">
                                                    {item.detail || item.message}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    {importErrors.length > 10 && (
                                        <p className="mt-2 text-xs text-yellow-700">
                                            Menampilkan 10 error pertama. Perbaiki lalu import ulang.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                            <button
                                onClick={closeModal}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || !selectedFile}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
                            >
                                {importing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {importing ? "Mengimport..." : "Import Sekarang"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
}