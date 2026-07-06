"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import {
    createAssetCategory,
    updateAssetCategory,
} from "@/services/kategori-aset";
import {
    AssetCategory,
    AssetCategoryFormData,
} from "@/types/kategori-aset";

type Props = {
    initialData?: AssetCategory;
};

export default function AssetCategoryForm({ initialData }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<AssetCategoryFormData>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        status: initialData?.status || "active",
    });

    const update = (
        field: keyof AssetCategoryFormData,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            showToast("Nama kategori wajib diisi", "error");
            return;
        }

        if (!form.status) {
            showToast("Status wajib dipilih", "error");
            return;
        }

        try {
            setLoading(true);

            if (initialData) {
                await updateAssetCategory(initialData.id, form);
                showToast("Kategori aset berhasil diperbarui", "success");
            } else {
                await createAssetCategory(form);
                showToast("Kategori aset berhasil ditambahkan", "success");
            }

            setTimeout(() => {
                router.push("/kategori-aset");
            }, 1200);
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                        errors?: Record<string, string[]>;
                    };
                };
                message?: string;
            };

            const firstError =
                err.response?.data?.errors &&
                Object.values(err.response.data.errors)[0]?.[0];

            showToast(
                firstError ||
                    err.response?.data?.message ||
                    err.message ||
                    "Gagal menyimpan kategori aset",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <Label>
                        Nama Kategori <span className="text-error-500">*</span>
                    </Label>
                    <Input
                        type="text"
                        value={form.name}
                        placeholder="Contoh: Elektronik"
                        onChange={(e) => update("name", e.target.value)}
                    />
                </div>

                <div>
                    <Label>
                        Status <span className="text-error-500">*</span>
                    </Label>
                    <select
                        value={form.status}
                        onChange={(e) => update("status", e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>
            </div>

            <div>
                <Label>Deskripsi</Label>
                <textarea
                    value={form.description || ""}
                    placeholder="Deskripsi opsional"
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                />
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/kategori-aset")}
                    className="w-full rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 sm:w-auto"
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