import api from "@/lib/axios";

export type DataExchangeModule =
    | "santri"
    | "guru"
    | "users"
    | "kelas"
    | "kategori-keuangan"
    | "assets"
    | "keuangan-spp"
    | "keuangan-pembangunan";

export async function exportData(module: DataExchangeModule, fileName: string) {
    const res = await api.get(`/data-exchange/${module}/export`, {
        responseType: "blob",
    });

    const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

export async function importData(module: DataExchangeModule, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/data-exchange/${module}/import`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data as {
        message: string;
        created: number;
        updated: number;
        errors: Array<{ row: number; message: string }>;
    };
}
