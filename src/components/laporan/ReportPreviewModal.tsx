"use client";

import { Download, Loader2, X } from "lucide-react";

type ReportPreviewModalProps = {
    isOpen: boolean;
    title: string;
    previewUrl: string | null;
    loading: boolean;
    downloading: boolean;
    onClose: () => void;
    onDownload: () => void;
};

export default function ReportPreviewModal({
    isOpen,
    title,
    previewUrl,
    loading,
    downloading,
    onClose,
    onDownload,
}: ReportPreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            <div className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">
                            Preview {title}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Periksa tampilan laporan sebelum file di-download.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={onDownload}
                            disabled={downloading || loading || !previewUrl}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {downloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Download
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <X className="h-4 w-4" />
                            Tutup
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 bg-gray-100 p-3">
                    {loading ? (
                        <div className="flex h-full items-center justify-center rounded-xl bg-white">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Memuat preview laporan...
                            </div>
                        </div>
                    ) : previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="h-full w-full rounded-xl border border-gray-200 bg-white"
                            title={`Preview ${title}`}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center rounded-xl bg-white text-sm text-gray-500">
                            Preview laporan tidak tersedia.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
