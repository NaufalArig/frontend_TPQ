"use client";

import { useState } from "react";
import { createSantri } from "@/services/santri";

type Props = {
    onSuccess?: () => void;
};

export default function SantriForm({ onSuccess }: Props) {
    const [form, setForm] = useState({
        nama: "",
        jenis_kelamin: "L" as "L" | "P",
        tanggal_lahir: "",
        nama_wali: "",
        kontak_wali: "",
        alamat: "",
        tanggal_masuk: "",
    });

    const [loading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await createSantri(form);

        onSuccess?.();
    };

    const update = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* <input
                type="text"
                placeholder="NIS"
                className="w-full border rounded-lg p-3"
                value={form.nis}
                onChange={(e) => update("nis", e.target.value)}
                required
            /> */}

            <input
                type="text"
                placeholder="Nama Santri"
                className="w-full border rounded-lg p-3"
                value={form.nama}
                onChange={(e) => update("nama", e.target.value)}
                required
            />

            <select
                className="w-full border rounded-lg p-3"
                value={form.jenis_kelamin}
                onChange={(e) =>
                    update("jenis_kelamin", e.target.value)
                }
            >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
            </select>

            <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={form.tanggal_lahir}
                onChange={(e) =>
                    update("tanggal_lahir", e.target.value)
                }
            />

            <input
                type="text"
                placeholder="Nama Wali"
                className="w-full border rounded-lg p-3"
                value={form.nama_wali}
                onChange={(e) => update("nama", e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Kontak Wali"
                className="w-full border rounded-lg p-3"
                value={form.kontak_wali}
                onChange={(e) => update("nama", e.target.value)}
                required
            />

            <textarea
                placeholder="Alamat"
                className="w-full border rounded-lg p-3"
                value={form.alamat}
                onChange={(e) => update("alamat", e.target.value)}
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
                {loading ? "Menyimpan..." : "Simpan"}
            </button>
        </form>
    );
}