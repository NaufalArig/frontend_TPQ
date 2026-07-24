"use client";

import { useState } from "react";
import { User, UserFormData } from "@/types/user";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { createUser } from "@/services/user";
import { Eye, EyeOff } from "lucide-react";

type Props = {
    initialData?: User;
    onSubmit?: (data: UserFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function UserForm({ initialData, onSubmit, onSuccess }: Props) {
    const [form, setForm] = useState<UserFormData>({
        name: initialData?.name || "",
        username: initialData?.username || "",
        email: initialData?.email || "",
        password: "",
        role: initialData?.role || "",
        status: initialData?.status || "active",
    });

    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const passwordValue = form.password || "";
    const passwordChecks = {
        length: passwordValue.length >= 6,
        upper: /[A-Z]/.test(passwordValue),
        number: /[0-9]/.test(passwordValue),
    };
    const isPasswordValid =
        passwordChecks.length && passwordChecks.upper && passwordChecks.number;

    const update = (field: keyof UserFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            showToast("Nama wajib diisi", "error");
            return;
        }

        if (!form.username.trim()) {
            showToast("Username wajib diisi", "error");
            return;
        }

        if (!initialData && !form.password?.trim()) {
            showToast("Password wajib diisi", "error");
            return;
        }
        // wajib valid saat buat baru, ATAU saat edit tapi password diisi
        if ((!initialData || form.password?.trim()) && !isPasswordValid) {
            showToast(
                "Password minimal 6 karakter, mengandung huruf kapital & angka",
                "error"
            );
            return;
        }

        if (!form.role) {
            showToast("Role wajib dipilih", "error");
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Username</Label>
                    <Input
                        type="text"
                        value={form.username}
                        placeholder="Masukkan username"
                        onChange={(e) => update("username", e.target.value)}
                    />
                </div>

                <div>
                    <Label>
                        Password{" "}
                        {initialData && (
                            <span className="text-gray-400">
                                (kosongkan jika tidak diganti)
                            </span>
                        )}
                    </Label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password || ""}
                            placeholder="Minimal 6 karakter"
                            onChange={(e) => update("password", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Indikator syarat password (muncul saat password diisi) */}
                    {form.password && (
                        <ul className="mt-2 space-y-1 text-xs">
                            <li className={passwordChecks.length ? "text-green-600" : "text-gray-400"}>
                                {passwordChecks.length ? "✓" : "○"} Minimal 6 karakter
                            </li>
                            <li className={passwordChecks.upper ? "text-green-600" : "text-gray-400"}>
                                {passwordChecks.upper ? "✓" : "○"} Mengandung huruf kapital (A-Z)
                            </li>
                            <li className={passwordChecks.number ? "text-green-600" : "text-gray-400"}>
                                {passwordChecks.number ? "✓" : "○"} Mengandung angka (0-9)
                            </li>
                        </ul>
                    )}
                </div>
            </div>

            <div>
                <Label>
                    Email <span className="text-gray-400">(opsional)</span>
                </Label>
                <Input
                    type="email"
                    value={form.email || ""}
                    placeholder="user@email.com"
                    onChange={(e) => update("email", e.target.value)}
                />
            </div>



            <div>
                <Label>Role</Label>
                <select
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih Role</option>
                    <option value="admin">Admin</option>
                    <option value="treasurer">Bendahara</option>
                </select>
            </div>

            <div>
                <Label>Status</Label>
                <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                    <option value="">Pilih Status</option>
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
