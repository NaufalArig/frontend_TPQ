"use client";

import { useState } from "react";
import { createSantri } from "@/services/santri";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/TextArea";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { ChevronDownIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { Santri, SantriFormData } from "@/types/santri";

type Props = {
    initialData?: Santri;
    onSubmit?: (data: SantriFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function SantriForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [form, setForm] = useState<SantriFormData>({
        nama: initialData?.nama || "",
        jenis_kelamin: initialData?.jenis_kelamin || "",
        tanggal_lahir: initialData?.tanggal_lahir || "",
        nama_wali: initialData?.nama_wali || "",
        kontak_wali: initialData?.kontak_wali || "",
        alamat: initialData?.alamat || "",
        tanggal_masuk: initialData?.tanggal_masuk || "",
        status: initialData?.status || "pending",
    });

    const [loading, setLoading] = useState(false);

    const genderOptions = [
        { value: "L", label: "Laki-Laki" },
        { value: "P", label: "Perempuan" },
    ];

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "aktif", label: "Aktif" },
        { value: "lulus", label: "Lulus" },
        { value: "keluar", label: "Keluar" },
    ];

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (onSubmit) {
                // Mode edit — serahkan semua ke parent
                await onSubmit(form);
                onSuccess?.(
                    initialData
                        ? `Data ${form.nama} berhasil diperbarui!`
                        : `Santri ${form.nama} berhasil ditambahkan!`
                );
                // Jangan redirect di sini, biar parent yang handle
            } else {
                // Mode tambah — handle sendiri
                await createSantri(form);
                showToast(`Santri ${form.nama} berhasil ditambahkan!`, "success");
                setTimeout(() => router.push("/santri"), 1500);
            }
        } catch (error) {
            console.error("Gagal menyimpan santri:", error);
            showToast("Gagal menyimpan data santri", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                    <Label>Nama Santri <span className="text-error-500">*</span></Label>
                    <Input
                        type="text"
                        value={form.nama}
                        placeholder="Masukkan nama santri"
                        onChange={(e) => update("nama", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>Jenis Kelamin <span className="text-error-500">*</span></Label>
                    <div className="relative">
                        <Select
                            options={genderOptions}
                            defaultValue={form.jenis_kelamin}
                            placeholder="Pilih jenis kelamin"
                            onChange={(value) => update("jenis_kelamin", value)}
                            className="dark:bg-dark-900"
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                            <ChevronDownIcon />
                        </span>
                    </div>
                </div>

                <DatePicker
                    id="tanggal-lahir"
                    label="Tanggal Lahir"
                    placeholder="Pilih tanggal lahir"
                    defaultDate={form.tanggal_lahir}
                    onChange={(_, currentDateString) => {
                        update("tanggal_lahir", currentDateString);
                        const birthDate = new Date(currentDateString);
                        if (!isNaN(birthDate.getTime())) {
                            birthDate.setFullYear(birthDate.getFullYear() + 3);
                            update("tanggal_masuk", birthDate.toISOString().split("T")[0]);
                        }
                    }}
                />

                <div>
                    <Label>Nama Wali <span className="text-error-500">*</span></Label>
                    <Input
                        type="text"
                        value={form.nama_wali}
                        placeholder="Masukkan nama wali"
                        onChange={(e) => update("nama_wali", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>Kontak Wali <span className="text-error-500">*</span></Label>
                    <Input
                        type="number"
                        value={form.kontak_wali}
                        placeholder="08123456789"
                        onChange={(e) => update("kontak_wali", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label>Alamat</Label>
                    <TextArea
                        value={form.alamat}
                        onChange={(value) => update("alamat", value)}
                        rows={4}
                    />
                </div>

                {initialData && (
                    <div>
                        <Label>Status</Label>
                        <div className="relative">
                            <select
                                value={form.status}
                                onChange={(e) => update("status", e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                                {statusOptions.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                                <ChevronDownIcon />
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${form.status === "aktif" ? "bg-green-100 text-green-700" :
                                form.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                    form.status === "lulus" ? "bg-blue-100 text-blue-700" :
                                        "bg-red-100 text-red-700"
                                }`}>
                                {statusOptions.find(s => s.value === form.status)?.label}
                            </span>
                        </div>
                    </div>
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
                        onClick={() => router.push("/santri")}
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