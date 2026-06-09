"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { Kelas, KelasFormData } from "@/types/kelas";
import { createKelas } from "@/services/kelas";

type Props = {
    initialData?: Kelas;
    onSubmit?: (data: KelasFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function KelasForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<KelasFormData>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        status: initialData?.status || "active",
    });

    const update = (field: keyof KelasFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            showToast("Nama kelas wajib diisi", "error");
            return;
        }

        if (!form.status) {
            showToast("Status wajib dipilih", "error");
            return;
        }

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);
                onSuccess?.(
                    initialData
                        ? `Kelas ${form.name} berhasil diperbarui!`
                        : `Kelas ${form.name} berhasil ditambahkan!`
                );
            } else {
                await createKelas(form);
                showToast(`Kelas ${form.name} berhasil ditambahkan!`, "success");
                setTimeout(() => router.push("/kelas"), 1500);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan data kelas", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Nama Kelas</Label>
                <Input
                    type="text"
                    value={form.name}
                    placeholder="Contoh: Iqro 1"
                    onChange={(e) => update("name", e.target.value)}
                />
            </div>

            <div>
                <Label>Deskripsi</Label>
                <Input
                    type="text"
                    value={form.description || ""}
                    placeholder="Deskripsi opsional"
                    onChange={(e) => update("description", e.target.value)}
                />
            </div>

            <div>
                <Label>Status</Label>
                <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                </select>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/kelas")}
                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
    );
}