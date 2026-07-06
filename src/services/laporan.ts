import api from "@/lib/axios";

export type LaporanParams = {
    type?: "all" | "spp" | "pembangunan";
    date_from?: string;
    date_to?: string;
    filter_month?: string;
    search?: string;
    transaction_type?: "income" | "expense" | "";
};

function getLaporanFileName(params?: LaporanParams) {
    const type = params?.type || "all";

    return (
        type === "spp"
            ? "laporan-keuangan-spp.pdf"
            : type === "pembangunan"
            ? "laporan-keuangan-pembangunan.pdf"
            : "laporan-keuangan.pdf"
    );
}

export async function getLaporanKeuanganPreviewUrl(params?: LaporanParams) {
    const res = await api.get("/laporan/keuangan", {
        params,
        responseType: "blob",
    });

    const blob = new Blob([res.data], {
        type: "application/pdf",
    });

    return window.URL.createObjectURL(blob);
}

export async function downloadLaporanKeuangan(params?: LaporanParams) {
    const res = await api.get("/laporan/keuangan/download", {
        params,
        responseType: "blob",
    });

    const blob = new Blob([res.data], {
        type: "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getLaporanFileName(params);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}
