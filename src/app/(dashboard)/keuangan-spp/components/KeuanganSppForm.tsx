"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getSantri } from "@/services/santri";
import { Santri } from "@/types/santri";
import { KeuanganSpp, KeuanganSppFormData } from "@/types/keuangan-spp";
import { createKeuanganSpp } from "@/services/keuangan-spp";

type Props = {
    initialData?: KeuanganSpp;
    onSubmit?: (data: KeuanganSppFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

const bulanOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
];

export default function KeuanganSppForm({
    initialData,
    onSubmit,
    onSuccess,
}: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [santriList, setSantriList] = useState<Santri[]>([]);

    const now = new Date();

    const [form, setForm] = useState<KeuanganSppFormData>({
        student_id: initialData?.student_id || "",
        payment_date: initialData?.payment_date || "",
        month: initialData?.month || now.getMonth() + 1,
        year: initialData?.year || now.getFullYear(),
        amount: initialData?.amount || "",
        note: initialData?.note || "",
    });

    useEffect(() => {
        getSantri()
            .then((data) => {
                setSantriList(
                    data.filter((item: Santri) => item.status === "active")
                );
            })
            .catch(console.error);
    }, []);

    const update = (field: keyof KeuanganSppFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.payment_date) {
            showToast("Tanggal wajib diisi", "error");
            return;
        }

        if (!form.month) {
            showToast("Bulan wajib dipilih", "error");
            return;
        }

        if (!form.year) {
            showToast("Tahun wajib diisi", "error");
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
                        ? "Data SPP berhasil diperbarui!"
                        : "Data SPP berhasil ditambahkan!"
                );
            } else {
                await createKeuanganSpp(form);
                showToast("Data SPP berhasil ditambahkan!", "success");

                setTimeout(() => router.push("/keuangan-spp"), 1500);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan data SPP", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Santri</Label>
                <select
                    value={form.student_id || ""}
                    onChange={(e) => update("student_id", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih santri</option>
                    {santriList.map((santri) => (
                        <option key={santri.id} value={santri.id}>
                            {santri.name} {santri.nisn ? `- ${santri.nisn}` : ""}
                        </option>
                    ))}
                </select>
            </div>

            <DatePicker
                id="tanggal-spp"
                label="Tanggal Pembayaran"
                placeholder="Pilih tanggal"
                defaultDate={form.payment_date || undefined}
                onChange={(_, value) => update("payment_date", value)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <Label>Bulan SPP</Label>
                    <select
                        value={form.month}
                        onChange={(e) => update("month", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    >
                        <option value="">Pilih bulan</option>
                        {bulanOptions.map((bulan) => (
                            <option key={bulan.value} value={bulan.value}>
                                {bulan.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Tahun</Label>
                    <Input
                        type="number"
                        value={String(form.year || "")}
                        placeholder="Contoh: 2026"
                        onChange={(e) => update("year", e.target.value)}
                    />
                </div>
            </div>

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
                    onClick={() => router.push("/keuangan-spp")}
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