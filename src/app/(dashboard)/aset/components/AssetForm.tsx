"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/InputField";
import Label from "@/components/form/Label";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { createAsset, getAssetCategories } from "@/services/aset";
import { Asset, AssetCategory, AssetFormData } from "@/types/aset";

type Props = {
    initialData?: Asset;
    onSubmit?: (data: AssetFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function AssetForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<AssetCategory[]>([]);

    const [form, setForm] = useState<AssetFormData>({
        asset_category_id: initialData?.asset_category_id || "",
        asset_code: initialData?.asset_code || "",
        name: initialData?.name || "",
        brand: initialData?.brand || "",
        quantity: initialData?.quantity || 1,
        unit: initialData?.unit || "unit",
        acquisition_date: initialData?.acquisition_date || "",
        source: initialData?.source || "",
        location: initialData?.location || "",
        condition: initialData?.condition || "good",
        status: initialData?.status || "available",
        estimated_value: initialData?.estimated_value || "",
        photo: null,
        note: initialData?.note || "",
    });

    const loadCategories = useCallback(async () => {
        try {
            const data = await getAssetCategories();
            setCategories(
                data.filter((category: AssetCategory) => category.status === "active")
            );
        } catch (error) {
            console.error("Gagal mengambil kategori aset:", error);
            showToast("Gagal mengambil kategori aset", "error");
        }
    }, [showToast]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadCategories();
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [loadCategories]);

    const update = (
        field: keyof AssetFormData,
        value: string | number | File | null
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            showToast("Nama aset wajib diisi", "error");
            return;
        }

        if (!String(form.quantity).trim() || Number(form.quantity) < 1) {
            showToast("Jumlah aset minimal 1", "error");
            return;
        }

        if (!form.condition) {
            showToast("Kondisi wajib dipilih", "error");
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
                        ? "Aset berhasil diperbarui!"
                        : "Aset berhasil ditambahkan!"
                );
            } else {
                await createAsset(form);
                showToast("Aset berhasil ditambahkan!", "success");
                setTimeout(() => router.push("/aset"), 1500);
            }
        } catch (error) {
            console.error("Gagal menyimpan aset:", error);
            showToast("Gagal menyimpan data aset", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <Label>Kategori</Label>
                    <select
                        value={form.asset_category_id}
                        onChange={(e) =>
                            update("asset_category_id", e.target.value)
                        }
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    >
                        <option value="">Pilih kategori</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Kode Aset</Label>
                    <Input
                        type="text"
                        value={form.asset_code || ""}
                        placeholder="Contoh: AST-001"
                        onChange={(e) => update("asset_code", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Nama Aset</Label>
                    <Input
                        type="text"
                        value={form.name}
                        placeholder="Contoh: Meja Belajar"
                        onChange={(e) => update("name", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Merek</Label>
                    <Input
                        type="text"
                        value={form.brand || ""}
                        placeholder="Merek opsional"
                        onChange={(e) => update("brand", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Jumlah</Label>
                    <Input
                        type="number"
                        min="1"
                        value={String(form.quantity || "")}
                        placeholder="Contoh: 10"
                        onChange={(e) => update("quantity", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Satuan</Label>
                    <Input
                        type="text"
                        value={form.unit || ""}
                        placeholder="Contoh: unit, pcs, buah"
                        onChange={(e) => update("unit", e.target.value)}
                    />
                </div>

                <DatePicker
                    id="tanggal-perolehan-aset"
                    label="Tanggal Perolehan"
                    placeholder="Pilih tanggal"
                    defaultDate={form.acquisition_date || undefined}
                    onChange={(_, value) => update("acquisition_date", value)}
                />

                <div>
                    <Label>Sumber</Label>
                    <Input
                        type="text"
                        value={form.source || ""}
                        placeholder="Contoh: Pembelian / Donasi"
                        onChange={(e) => update("source", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Lokasi</Label>
                    <Input
                        type="text"
                        value={form.location || ""}
                        placeholder="Contoh: Ruang Kelas 1"
                        onChange={(e) => update("location", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Estimasi Nilai</Label>
                    <Input
                        type="number"
                        min="0"
                        value={String(form.estimated_value || "")}
                        placeholder="Contoh: 250000"
                        onChange={(e) => update("estimated_value", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Kondisi</Label>
                    <select
                        value={form.condition}
                        onChange={(e) => update("condition", e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    >
                        <option value="">Pilih kondisi</option>
                        <option value="good">Baik</option>
                        <option value="minor_damage">Rusak Ringan</option>
                        <option value="damaged">Rusak Berat</option>
                        <option value="lost">Hilang</option>
                    </select>
                </div>

                <div>
                    <Label>Status</Label>
                    <select
                        value={form.status}
                        onChange={(e) => update("status", e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    >
                        <option value="">Pilih status</option>
                        <option value="available">Tersedia</option>
                        <option value="in_use">Dipakai</option>
                        <option value="maintenance">Perbaikan</option>
                        <option value="disposed">Dihapuskan</option>
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <Label>Foto Aset</Label>
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) =>
                            update("photo", e.target.files?.[0] || null)
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600 hover:file:bg-brand-100 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    />
                    {initialData?.photo && (
                        <p className="mt-1 text-xs text-gray-500">
                            Kosongkan jika tidak ingin mengganti foto.
                        </p>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <Label>Catatan</Label>
                    <textarea
                        value={form.note || ""}
                        placeholder="Catatan opsional"
                        onChange={(e) => update("note", e.target.value)}
                        className="min-h-24 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/aset")}
                    className="w-full rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:w-auto"
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
