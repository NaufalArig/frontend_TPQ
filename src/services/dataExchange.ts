import API_URL from "@/lib/api";

function getToken() {
    if (typeof document === "undefined") return null;
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
}

export async function downloadTemplate(module: string) {
    const token = getToken();
    const res = await fetch(`${API_URL}/data-exchange/${module}/template`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal mengunduh template");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template-import-${module}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export async function importData(module: string, file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/data-exchange/${module}/import`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
        throw new Error(result.message || "Gagal mengimport data");
    }
    return result as {
        message: string;
        created: number;
        updated: number;
        errors: Array<{ detail: string }>;
    };
}