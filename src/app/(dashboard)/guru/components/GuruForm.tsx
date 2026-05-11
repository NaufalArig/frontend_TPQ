"use client";

import { useState } from "react";
import { createGuru } from "@/services/guru";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/TextArea";
import { useRouter } from "next/navigation";
import { Guru, GuruFormData } from "@/types/guru";

type Props = {
    initialData?: Guru;
    onSubmit?: (data: GuruFormData) => Promise<void>;
};

export default function GuruForm({
    initialData,
    onSubmit,
}: Props) {
    const router = useRouter();

    const [form, setForm] = useState<GuruFormData>({
        nama: initialData?.nama || "",
        alamat: initialData?.alamat || "",
        kontak: initialData?.kontak || "",
        tanggal_masuk: initialData?.tanggal_masuk || "",
        tanggal_keluar: initialData?.tanggal_keluar || "",
        status: initialData?.status || "aktif",
    });

    const [loading, setLoading] = useState(false);

    const update = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);
            } else {
                await createGuru(form);
            }

            router.push("/guru");
        } catch (error) {
            console.error("Gagal menyimpan guru:", error);
            alert("Gagal menyimpan data guru");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">

            <div>
                <Label>Nama Guru</Label>
                <Input
                    type="text"
                    value={form.nama}
                    onChange={(e) =>
                        update("nama", e.target.value)
                    }
                />
            </div>

            <div>
                <Label>Kontak</Label>
                <Input
                    type="number"
                    value={form.kontak}
                    placeholder="08123456789"
                    onChange={(e) => update("kontak", e.target.value)}
                />
            </div>

            <div>
                <Label>Alamat</Label>
                <TextArea
                    value={form.alamat}
                    onChange={(e) => update("alamat", e)}
                    rows={6}
                />
            </div>

            <DatePicker
                id="tanggal-masuk"
                label="Tanggal Masuk"
                placeholder="Pilih tanggal masuk"
                defaultDate={form.tanggal_masuk}
                onChange={(_, currentDateString) => {
                    update("tanggal_masuk", currentDateString);
                }}
            />
            {initialData && (
                <>
                    <DatePicker
                        id="tanggal-keluar"
                        label="Tanggal Keluar"
                        placeholder="Pilih tanggal keluar (opsional)"
                        defaultDate={form.tanggal_keluar || ""}
                        onChange={(_, currentDateString) => {
                            update("tanggal_keluar", currentDateString);
                        }}
                    />

                    <div>
                        <Label>Status</Label>
                        <select
                            value={form.status}
                            onChange={(e) => update("status", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>
                </>
            )}

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