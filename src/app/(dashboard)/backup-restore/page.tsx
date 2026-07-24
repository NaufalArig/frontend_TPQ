"use client";

import { useEffect, useState } from "react";
import {
    DatabaseBackup as DatabaseBackupIcon,
    Download,
    RefreshCcw,
    RotateCcw,
    Trash2,
    Upload,
} from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { DatabaseBackup } from "@/types/database-backup";
import {
    createDatabaseBackup,
    deleteDatabaseBackup,
    downloadDatabaseBackup,
    getDatabaseBackups,
    restoreDatabaseBackup,
    restoreExistingDatabaseBackup,
} from "@/services/database-backup";

function formatBytes(bytes: number) {
    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value: string) {
    const date = new Date(value.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function BackupRestorePage() {
    const [backups, setBackups] = useState<DatabaseBackup[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const { toast, showToast, hideToast } = useToast();

    const loadBackups = async () => {
        try {
            setLoading(true);
            setBackups(await getDatabaseBackups());
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil daftar backup", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadBackups();
        }, 0);

        return () => window.clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateBackup = async () => {
        try {
            setProcessing(true);
            const result = await createDatabaseBackup();
            showToast(result.message, "success");
            await loadBackups();
        } catch (error) {
            console.error(error);
            showToast("Gagal membuat backup database", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleRestoreUpload = async () => {
        if (!restoreFile) {
            showToast("Pilih file backup .sql terlebih dahulu", "error");
            return;
        }

        const confirmed = window.confirm(
            "Restore akan mengganti isi database saat ini. Pastikan file backup benar. Lanjutkan?"
        );

        if (!confirmed) return;

        try {
            setProcessing(true);
            const result = await restoreDatabaseBackup(restoreFile);
            showToast(result.message, "success");
            setRestoreFile(null);
            await loadBackups();
        } catch (error) {
            console.error(error);
            showToast("Gagal restore database", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleRestoreExisting = async (fileName: string) => {
        const confirmed = window.confirm(
            `Restore database dari ${fileName}? Data saat ini akan diganti.`
        );

        if (!confirmed) return;

        try {
            setProcessing(true);
            const result = await restoreExistingDatabaseBackup(fileName);
            showToast(result.message, "success");
            await loadBackups();
        } catch (error) {
            console.error(error);
            showToast("Gagal restore backup tersimpan", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (fileName: string) => {
        const confirmed = window.confirm(`Hapus file backup ${fileName}?`);

        if (!confirmed) return;

        try {
            setProcessing(true);
            const result = await deleteDatabaseBackup(fileName);
            showToast(result.message, "success");
            await loadBackups();
        } catch (error) {
            console.error(error);
            showToast("Gagal menghapus backup", "error");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <RoleGuard allow={["admin"]}>
            <div>
                <PageBreadcrumb pageTitle="Backup & Restore" />

                <div className="space-y-6">
                    <ComponentCard
                        title="Backup Database"
                        desc="Backup otomatis dibuat setiap Senin pukul 02:00 lewat Laravel scheduler. Backup manual bisa dibuat kapan saja."
                        action={
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => void loadBackups()}
                                    disabled={processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60 sm:w-auto"
                                >
                                    <RefreshCcw size={16} />
                                    Refresh
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateBackup}
                                    disabled={processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60 sm:w-auto"
                                >
                                    <DatabaseBackupIcon size={16} />
                                    Buat Backup
                                </button>
                            </div>
                        }
                    >

                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-[820px] w-full text-left text-sm">
                                    <thead className="border-b border-brand-300 bg-brand-100 text-xs font-semibold text-black">
                                        <tr>
                                            <th className="px-4 py-3">Nama File</th>
                                            <th className="px-4 py-3">Ukuran</th>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                                    Loading backup...
                                                </td>
                                            </tr>
                                        ) : backups.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                                    Belum ada file backup.
                                                </td>
                                            </tr>
                                        ) : (
                                            backups.map((backup) => (
                                                <tr key={backup.name}>
                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                        {backup.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {formatBytes(backup.size)}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {formatDate(backup.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => downloadDatabaseBackup(backup.name)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                                            >
                                                                <Download size={14} />
                                                                Download
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRestoreExisting(backup.name)}
                                                                disabled={processing}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-60"
                                                            >
                                                                <RotateCcw size={14} />
                                                                Restore
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(backup.name)}
                                                                disabled={processing}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                                                            >
                                                                <Trash2 size={14} />
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </ComponentCard>

                    <ComponentCard
                        title="Restore Manual"
                        desc="Gunakan file .sql hasil backup sistem ini. Restore akan mengganti isi database saat ini."
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                                type="file"
                                accept=".sql"
                                onChange={(event) => setRestoreFile(event.target.files?.[0] ?? null)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700"
                            />
                            <button
                                type="button"
                                onClick={handleRestoreUpload}
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60 sm:w-auto"
                            >
                                <Upload size={16} />
                                Restore File
                            </button>
                        </div>
                    </ComponentCard>
                </div>

                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </div>
        </RoleGuard>
    );
}
