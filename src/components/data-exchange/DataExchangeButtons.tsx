"use client";

import { Download, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
    DataExchangeModule,
    ImportErrorDetail,
    exportData,
    importData,
} from "@/services/data-exchange";
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
    const [importErrors, setImportErrors] = useState<ImportErrorDetail[]>([]);
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
            setImportErrors([]);
            const result = await importData(module, file);
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

            {importErrors.length > 0 && (
                <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold">
                            Detail gagal import {label}
                        </p>
                        <p className="text-xs text-yellow-700">
                            {importErrors.length} kesalahan ditemukan
                        </p>
                    </div>

                    <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
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
                            Menampilkan 10 error pertama. Perbaiki file Excel lalu import ulang.
                        </p>
                    )}
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
