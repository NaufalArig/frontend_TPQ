import API_URL from "@/lib/api";

function getToken() {
    if (typeof document === "undefined") return null;

    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
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

export async function createSantri(data: {
    nama: string;
    jenis_kelamin: "L" | "P";
    tanggal_lahir: string;
    nama_wali: string;
    kontak_wali: string;
    alamat: string;
    tanggal_masuk: string;
}) {
    const token = getToken();

    const res = await fetch(`${API_URL}/santri`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.message || "Gagal menambah santri");
    }

    return json;
}