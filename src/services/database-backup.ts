import api from "@/lib/axios";
import { DatabaseBackup } from "@/types/database-backup";

export async function getDatabaseBackups() {
    const res = await api.get<{ data: DatabaseBackup[] }>("/database-backups");

    return res.data.data;
}

export async function createDatabaseBackup() {
    const res = await api.post<{ message: string; data: DatabaseBackup }>(
        "/database-backups"
    );

    return res.data;
}

export async function deleteDatabaseBackup(fileName: string) {
    const res = await api.delete<{ message: string }>(
        `/database-backups/${encodeURIComponent(fileName)}`
    );

    return res.data;
}

export async function restoreDatabaseBackup(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<{ message: string }>(
        "/database-backups/restore",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
}

export async function restoreExistingDatabaseBackup(fileName: string) {
    const res = await api.post<{ message: string }>(
        `/database-backups/${encodeURIComponent(fileName)}/restore`
    );

    return res.data;
}

export async function downloadDatabaseBackup(fileName: string) {
    const res = await api.get(
        `/database-backups/${encodeURIComponent(fileName)}/download`,
        {
            responseType: "blob",
        }
    );

    const blob = new Blob([res.data], {
        type: "application/sql",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}
