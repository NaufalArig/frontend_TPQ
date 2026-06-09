"use client";

import { Download, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { DataExchangeModule, exportData, importData } from "@/services/data-exchange";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import axios from "axios";

type DataExchangeButtonsProps = {
    module: DataExchangeModule;
    fileName: string;
    label?: string;
};

export default function DataExchangeButtons({
    module,
    fileName,
    label = "Data",
}: DataExchangeButtonsProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const { toast, showToast, hideToast } = useToast();

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

    const handleImport = async (file: File) => {
        try {
            setImporting(true);
            const result = await importData(module, file);

            const errorInfo =
                result.errors.length > 0
                    ? `, ${result.errors.length} baris gagal`
                    : "";

            showToast(
                `Import ${label} selesai: ${result.created} baru, ${result.updated} update${errorInfo}`,
                result.errors.length > 0 ? "warning" : "success"
            );

            window.setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (error) {
            console.error(`Gagal import ${label}:`, error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || `Gagal import ${label}`
                : `Gagal import ${label}`;

            showToast(message, "error");
        } finally {
            setImporting(false);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    return (
        <>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={exporting || importing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {importing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    Import Excel
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                            void handleImport(file);
                        }
                    }}
                />
            </div>

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
