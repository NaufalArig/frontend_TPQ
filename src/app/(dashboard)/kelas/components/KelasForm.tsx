"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { Kelas, KelasFormData } from "@/types/kelas";
import { Guru } from "@/types/guru";
import { createKelas } from "@/services/kelas";
import { getGuru } from "@/services/guru";

type Props = {
    initialData?: Kelas;
    onSubmit?: (data: KelasFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function KelasForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<Guru[]>([]);

    const [form, setForm] = useState<KelasFormData>({
        teacher_id: initialData?.teacher_id ? String(initialData.teacher_id) : "",
        name: initialData?.name || "",
        description: initialData?.description || "",
        status: initialData?.status || "active",
    });

    const loadTeachers = async () => {
        try {
            const data = await getGuru();
            setTeachers(data);
        } catch (error) {
            console.error(error);
            showToast("Gagal mengambil data guru", "error");
        }
    };


    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const data = await getGuru();
                setTeachers(data);
            } catch (error) {
                console.error(error);
                showToast("Gagal mengambil data guru", "error");
            }
        };

        fetchTeachers();
    }, []);


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

            const payload: KelasFormData = {
                ...form,
                teacher_id: form.teacher_id || "",
            };

            if (onSubmit) {
                await onSubmit(payload);
                onSuccess?.(
                    initialData
                        ? `Kelas ${form.name} berhasil diperbarui!`
                        : `Kelas ${form.name} berhasil ditambahkan!`
                );
            } else {
                await createKelas(payload);
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
                <Label>Guru Pengampu</Label>
                <select
                    value={form.teacher_id || ""}
                    onChange={(e) => update("teacher_id", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih guru pengampu</option>
                    {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                        </option>
                    ))}
                </select>
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
                    className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/kelas")}
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