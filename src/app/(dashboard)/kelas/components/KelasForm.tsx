"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { Kelas, KelasFormData } from "@/types/kelas";
import { Guru } from "@/types/guru";
import { createKelas } from "@/services/kelas";
import { getGuru } from "@/services/guru";
import { Search, X } from "lucide-react";
import axios from "axios";

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
    const teacherBoxRef = useRef<HTMLDivElement>(null);
    const [teacherSearch, setTeacherSearch] = useState("");
    const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

    const [form, setForm] = useState<KelasFormData>({
        teacher_id: initialData?.teacher_id ? String(initialData.teacher_id) : "",
        name: initialData?.name || "",
        description: initialData?.description || "",
        status: initialData?.status || "active",
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const data = await getGuru();
                setTeachers(data);
                if (initialData?.teacher_id) {
                    const current = data.find(
                        (t: Guru) => String(t.id) === String(initialData.teacher_id)
                    );
                    if (current) setTeacherSearch(current.name);
                }
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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                teacherBoxRef.current &&
                !teacherBoxRef.current.contains(e.target as Node)
            ) {
                setShowTeacherDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredTeachers = teachers.filter((t) =>
        t.name.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    const selectTeacher = (teacher: Guru) => {
        update("teacher_id", String(teacher.id));
        setTeacherSearch(teacher.name);
        setShowTeacherDropdown(false);
    };

    const clearTeacher = () => {
        update("teacher_id", "");
        setTeacherSearch("");
        setShowTeacherDropdown(true);
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
        } catch (error: unknown) {
            console.error("ERROR CREATE KELAS:", error);

            if (axios.isAxiosError(error)) {
                console.log("STATUS:", error.response?.status);
                console.log("DATA:", error.response?.data);

                if (error.response?.status === 409 ||
                    error.response?.status === 422) {
                    showToast(
                        `Gagal membuat kelas: Kelas ${form.name} sudah ada`,
                        "error"
                    );
                } else {
                    showToast(
                        `Gagal membuat kelas ${form.name}`,
                        "error"
                    );
                }
            } else {
                showToast(
                    `Gagal membuat kelas ${form.name}`,
                    "error"
                );
            }
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

            <div ref={teacherBoxRef}>
                <Label>Guru Pengampu</Label>
                <div className="relative">
                    <input
                        type="text"
                        value={teacherSearch}
                        placeholder="Cari nama guru pengampu..."
                        onChange={(e) => {
                            setTeacherSearch(e.target.value);
                            setShowTeacherDropdown(true);
                            if (e.target.value === "") update("teacher_id", "");
                        }}
                        onFocus={() => setShowTeacherDropdown(true)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    />

                    {teacherSearch ? (
                        <button
                            type="button"
                            onClick={clearTeacher}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Bersihkan"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search className="h-4 w-4" />
                        </span>
                    )}

                    {showTeacherDropdown && (
                        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                            {filteredTeachers.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-gray-500">
                                    Guru tidak ditemukan
                                </p>
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <button
                                        key={teacher.id}
                                        type="button"
                                        onClick={() => selectTeacher(teacher)}
                                        className={`flex w-full flex-col items-start px-4 py-2.5 text-left text-sm transition-colors hover:bg-brand-50 dark:hover:bg-gray-800 ${String(teacher.id) === form.teacher_id
                                            ? "bg-brand-50 dark:bg-gray-800"
                                            : ""
                                            }`}
                                    >
                                        <span className="font-medium text-gray-800 dark:text-gray-100">
                                            {teacher.name}
                                        </span>
                                        {teacher.teacher_number && (
                                            <span className="text-xs text-gray-400">
                                                Induk: {teacher.teacher_number}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
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