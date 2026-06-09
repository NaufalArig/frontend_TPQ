"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getKategoriKeuangan } from "@/services/kategori-keuangan";
import { KategoriKeuangan } from "@/types/kategori-keuangan";
import {
    KeuanganPembangunan,
    KeuanganPembangunanFormData,
} from "@/types/keuangan-pembangunan";
import { createKeuanganPembangunan } from "@/services/keuangan-pembangunan";

type Props = {
    initialData?: KeuanganPembangunan;
    onSubmit?: (data: KeuanganPembangunanFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function KeuanganPembangunanForm({
    initialData,
    onSubmit,
    onSuccess,
}: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [kategoriList, setKategoriList] = useState<KategoriKeuangan[]>([]);

    const [form, setForm] = useState<KeuanganPembangunanFormData>({
        financial_category_id: initialData?.financial_category_id || "",
        payment_date: initialData?.payment_date || "",
        transaction_type: initialData?.transaction_type || "income",
        amount: initialData?.amount || "",
        note: initialData?.note || "",
    });

    useEffect(() => {
        getKategoriKeuangan()
            .then((data) => {
                setKategoriList(
                    data.filter((item: KategoriKeuangan) => item.status === "active")
                );
            })
            .catch(console.error);
    }, []);

    const update = (
        field: keyof KeuanganPembangunanFormData,
        value: string
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.financial_category_id) {
            showToast("Kategori wajib dipilih", "error");
            return;
        }

        if (!form.payment_date) {
            showToast("Tanggal wajib diisi", "error");
            return;
        }

        if (!form.transaction_type) {
            showToast("Jenis keuangan wajib dipilih", "error");
            return;
        }

        if (!String(form.amount).trim()) {
            showToast("Nominal wajib diisi", "error");
            return;
        }

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);
                onSuccess?.(
                    initialData
                        ? "Data keuangan pembangunan berhasil diperbarui!"
                        : "Data keuangan pembangunan berhasil ditambahkan!"
                );
            } else {
                await createKeuanganPembangunan(form);
                showToast("Data keuangan pembangunan berhasil ditambahkan!", "success");

                setTimeout(() => router.push("/keuangan-pembangunan"), 1500);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan data keuangan pembangunan", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Kategori</Label>
                <select
                    value={form.financial_category_id}
                    onChange={(e) => update("financial_category_id", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih kategori</option>
                    {kategoriList.map((kategori) => (
                        <option key={kategori.id} value={kategori.id}>
                            {kategori.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <Label>Jenis Keuangan</Label>
                <select
                    value={form.transaction_type}
                    onChange={(e) => update("transaction_type", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih jenis</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                </select>
            </div>

            <DatePicker
                id="tanggal-keuangan-pembangunan"
                label="Tanggal"
                placeholder="Pilih tanggal"
                defaultDate={form.payment_date || undefined}
                onChange={(_, value) => update("payment_date", value)}
            />

            <div>
                <Label>Nominal</Label>
                <Input
                    type="number"
                    value={String(form.amount || "")}
                    placeholder="Contoh: 50000"
                    onChange={(e) => update("amount", e.target.value)}
                />
            </div>

            <div>
                <Label>Keterangan</Label>
                <Input
                    type="text"
                    value={form.note || ""}
                    placeholder="Keterangan opsional"
                    onChange={(e) => update("note", e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-70"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/keuangan-pembangunan")}
                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium"
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
