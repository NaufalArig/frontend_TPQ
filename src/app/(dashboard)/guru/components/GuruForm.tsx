"use client";

import { useState } from "react";
import { createGuru } from "@/services/guru";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/TextArea";
import { useRouter } from "next/navigation";
import { Guru, GuruFormData } from "@/types/guru";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

type Props = {
    initialData?: Guru;
    onSubmit?: (data: GuruFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function GuruForm({ initialData, onSubmit, onSuccess, }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

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

        if (!form.nama.trim()) {
            showToast("Nama guru wajib diisi", "error");
            return;
        }

        if (!form.tanggal_masuk) {
            showToast("Tanggal masuk wajib dipilih", "error");
            return;
        }

        if (!form.kontak.trim()) {
            showToast("Kontak wajib diisi", "error");
            return;
        }

        if (!form.alamat.trim()) {
            showToast("Alamat wajib diisi", "error");
            return;
        }

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);

                onSuccess?.(
                    initialData
                        ? `Data ${form.nama} berhasil diperbarui!`
                        : `Guru ${form.nama} berhasil ditambahkan!`
                );
            } else {
                await createGuru(form);

                showToast(
                    `Guru ${form.nama} berhasil ditambahkan!`,
                    "success"
                );

                setTimeout(() => router.push("/guru"), 1500);
            }
        } catch (error) {
            console.error("Gagal menyimpan guru:", error);
            showToast("Gagal menyimpan data guru", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">

                <div>
                    <Label>Nama Guru</Label>
                    <Input
                        type="text"
                        value={form.nama}
                        onChange={(e) => update("nama", e.target.value)}
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

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/guru")}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Batal
                    </button>
                </div>
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </form>
        </>
    );
}