import API_URL from "@/lib/api";
import Cookies from "js-cookie";

function getToken() {
    if (typeof document === "undefined") return null;

    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
}

export async function getSantriById(id: string | number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil data santri");
    }

    return res.json();
}

export async function getSantri() {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil data santri");
    }

    return res.json();
}

//Function Tambah Santri
export async function createSantri(data: {
    nama: string;
    jenis_kelamin: "L" | "P" | "";
    tanggal_lahir: string;
    nama_wali: string;
    kontak_wali: string;
    alamat: string;
}) {
    const token = Cookies.get("token");

    const res = await fetch(`${API_URL}/santri`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const result = await res.json();

    // DEBUG: tampilkan response backend
    console.log("STATUS:", res.status);
    console.log("RESULT:", result);

    if (!res.ok) {
        throw new Error(result.message || JSON.stringify(result));
    }

    return result;
}

//Function Edit Santri
export async function updateSantri(
    id: string | number,
    data: {
        nama: string;
        jenis_kelamin: "L" | "P";
        tanggal_lahir: string;
        nama_wali: string;
        kontak_wali: string;
        alamat: string;
    }
) {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

export async function deleteSantri(id: number) {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Gagal menghapus santri");
    }

    return res.json();
}