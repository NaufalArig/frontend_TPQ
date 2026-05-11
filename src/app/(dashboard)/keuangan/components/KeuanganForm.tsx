"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeuanganFormData } from "@/types/keuangan";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";

type Props = {
    initialData?: KeuanganFormData;
    onSubmit: (data: KeuanganFormData) => Promise<void>;
};

export default function KeuanganForm({ initialData, onSubmit }: Props) {
    const router = useRouter();
    const [form, setForm] = useState<KeuanganFormData>({
        tanggal: initialData?.tanggal || "",
        jenis: initialData?.jenis || "pemasukan",
        nominal: initialData?.nominal || 0,
        keterangan: initialData?.keterangan || "",
    });
    const [loading, setLoading] = useState(false);

    const update = (field: string, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSubmit(form);
            router.push("/keuangan");
        } catch (error) {
            console.error("Gagal menyimpan:", error);
            alert("Gagal menyimpan data transaksi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <DatePicker
                id="tanggal"
                label="Tanggal Transaksi"
                placeholder="Pilih tanggal"
                defaultDate={form.tanggal}
                onChange={(_, dateString) => update("tanggal", dateString)}
            />

            <div>
                <Label>Jenis Transaksi</Label>
                <select
                    value={form.jenis}
                    onChange={(e) => update("jenis", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="pemasukan">Pemasukan</option>
                    <option value="pengeluaran">Pengeluaran</option>
                </select>
            </div>

            <div>
                <Label>Nominal (Rp)</Label>
                <Input
                    type="number"
                    value={form.nominal}
                    placeholder="0"
                    onChange={(e) => update("nominal", Number(e.target.value))}
                />
            </div>

            <div>
                <Label>Keterangan</Label>
                <Input
                    type="text"
                    value={form.keterangan}
                    placeholder="Contoh: SPP bulan Mei"
                    onChange={(e) => update("keterangan", e.target.value)}
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/keuangan")}
                    className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}