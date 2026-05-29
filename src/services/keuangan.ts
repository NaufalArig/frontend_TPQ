import API_URL from "@/lib/api";
import { KeuanganFormData } from "@/types/keuangan";
import api from "@/lib/axios";

function getToken() {
    if (typeof document === "undefined") return null;
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
}

export async function getKeuangan() {
    const res = await fetch(`${API_URL}/keuangan`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
        },
    });
    if (!res.ok) throw new Error("Gagal mengambil data keuangan");
    return res.json();
}

export async function getKeuanganById(id: number) {
    const res = await fetch(`${API_URL}/keuangan/${id}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
        },
    });
    if (!res.ok) throw new Error("Gagal mengambil data");
    return res.json();
}

export async function createKeuangan(data: KeuanganFormData) {
    const res = await fetch(`${API_URL}/keuangan`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error.errors || error));
    }
    return res.json();
}

export async function updateKeuangan(id: number, data: KeuanganFormData) {
    const res = await fetch(`${API_URL}/keuangan/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error.errors || error));
    }
    return res.json();
}

export async function deleteKeuangan(id: number) {
    const res = await fetch(`${API_URL}/keuangan/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
        },
    });
    if (!res.ok) throw new Error("Gagal menghapus transaksi");
    return res.json();
}

export async function downloadLaporanKeuangan() {
    const res = await api.get("/laporan/keuangan/download", {
        responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "laporan-keuangan.pdf");
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
}