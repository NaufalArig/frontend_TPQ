"use client";

import { useState } from "react";
import { User, UserFormData } from "@/types/user";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/user";

type Props = {
    initialData?: User;
    onSubmit?: (data: UserFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function UserForm({ initialData, onSubmit, onSuccess }: Props) {
    const [form, setForm] = useState<UserFormData>({
        name: initialData?.name || "",
        email: initialData?.email || "",
        password: "",
        role: initialData?.role || "",
    });
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const [loading, setLoading] = useState(false);

    const update = (field: keyof UserFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            showToast("Nama wajib diisi", "error");
            return;
        }

        if (!form.email.trim()) {
            showToast("Email wajib diisi", "error");
            return;
        }

        if (!initialData && !form.password?.trim()) {
            showToast("Password wajib diisi", "error");
            return;
        }

        if (!form.role) {
            showToast("Role wajib dipilih", "error");
            return;
        }

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);

                onSuccess?.(
                    initialData
                        ? `Data ${form.name} berhasil diperbarui!`
                        : `User ${form.name} berhasil ditambahkan!`
                );
            } else {
                await createUser(form);

                showToast(
                    `User ${form.name} berhasil ditambahkan!`,
                    "success"
                );

                setTimeout(() => router.push("/users"), 1500);
            }
        } catch (error) {
            console.error("Gagal menyimpan user:", error);
            showToast("Gagal menyimpan data user", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Nama User</Label>
                <Input
                    type="text"
                    value={form.name}
                    placeholder="Masukkan nama user"
                    onChange={(e) => update("name", e.target.value)}
                />
            </div>

            <div>
                <Label>Email</Label>
                <Input
                    type="email"
                    value={form.email}
                    placeholder="user@email.com"
                    onChange={(e) => update("email", e.target.value)}
                />
            </div>

            <div>
                <Label>
                    Password {initialData && <span className="text-gray-400">(kosongkan jika tidak diganti)</span>}
                </Label>
                <Input
                    type="password"
                    value={form.password || ""}
                    placeholder="Minimal 6 karakter"
                    onChange={(e) => update("password", e.target.value)}
                />
            </div>

            <div>
                <Label>Role</Label>
                <select
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih role</option>
                    <option value="admin">Admin</option>
                    <option value="guru">Guru</option>
                    <option value="bendahara">Bendahara</option>
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
                    onClick={() => router.push("/users")}
                    className="w-full sm:w-auto border border-gray-600 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
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