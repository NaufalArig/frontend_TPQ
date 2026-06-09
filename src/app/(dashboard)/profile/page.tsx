"use client";

import { useEffect, useMemo, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/InputField";
import Label from "@/components/form/Label";
import RoleGuard from "@/components/RoleGuard";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { DEFAULT_USER_PHOTO, getStorageUrl } from "@/lib/storage";
import { updateProfile, updateProfilePassword } from "@/services/user";
import { PasswordFormData, ProfileFormData } from "@/types/user";
import { useUser } from "@/context/UserContext";

function getRoleLabel(role?: string) {
    if (role === "admin") return "Admin";
    if (role === "teacher") return "Guru";
    if (role === "treasurer") return "Bendahara";
    return role || "-";
}

function getStatusLabel(status?: string) {
    if (status === "active") return "Aktif";
    if (status === "inactive") return "Nonaktif";
    return status || "-";
}

export default function ProfilePage() {
    const { user, setUser } = useUser();
    const { toast, showToast, hideToast } = useToast();
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [preview, setPreview] = useState(DEFAULT_USER_PHOTO);

    const [profileForm, setProfileForm] = useState<ProfileFormData>({
        name: "",
        username: "",
        email: "",
        photo: null,
    });

    const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const currentPhotoUrl = useMemo(
        () => getStorageUrl(user?.photo),
        [user?.photo]
    );

    useEffect(() => {
        if (!user) return;

        const timeout = window.setTimeout(() => {
            setProfileForm({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                photo: null,
            });
            setPreview(currentPhotoUrl);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [currentPhotoUrl, user]);

    const updateProfileField = (
        field: keyof ProfileFormData,
        value: string | File | null
    ) => {
        setProfileForm((prev) => ({ ...prev, [field]: value }));
    };

    const updatePasswordField = (
        field: keyof PasswordFormData,
        value: string
    ) => {
        setPasswordForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileForm.name.trim()) {
            showToast("Nama wajib diisi", "error");
            return;
        }

        if (!profileForm.username.trim()) {
            showToast("Username wajib diisi", "error");
            return;
        }

        try {
            setProfileLoading(true);
            const result = await updateProfile(profileForm);

            setUser(result.user);
            setProfileForm((prev) => ({ ...prev, photo: null }));
            showToast("Profile berhasil diperbarui", "success");
        } catch (error) {
            console.error("Gagal update profile:", error);
            showToast("Gagal memperbarui profile", "error");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.current_password) {
            showToast("Password lama wajib diisi", "error");
            return;
        }

        if (passwordForm.password.length < 6) {
            showToast("Password baru minimal 6 karakter", "error");
            return;
        }

        if (passwordForm.password !== passwordForm.password_confirmation) {
            showToast("Konfirmasi password tidak sama", "error");
            return;
        }

        try {
            setPasswordLoading(true);
            await updateProfilePassword(passwordForm);
            setPasswordForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
            showToast("Password berhasil diperbarui", "success");
        } catch (error) {
            console.error("Gagal update password:", error);
            showToast("Gagal memperbarui password", "error");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <RoleGuard allow={["admin", "teacher", "treasurer"]}>
            <div>
                <PageBreadcrumb pageTitle="Edit Profile" />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
                    <ComponentCard
                        title="Data Profile"
                        desc="Perbarui nama, username, email, dan foto akun."
                    >
                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={preview}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.src = DEFAULT_USER_PHOTO;
                                        }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <Label>Foto Profile</Label>
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            updateProfileField("photo", file);
                                            setPreview(
                                                file
                                                    ? URL.createObjectURL(file)
                                                    : currentPhotoUrl
                                            );
                                        }}
                                        className="block w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600 hover:file:bg-brand-100 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Format JPG, PNG, atau WebP. Maksimal 2MB.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label>Nama</Label>
                                    <Input
                                        type="text"
                                        value={profileForm.name}
                                        placeholder="Masukkan nama"
                                        onChange={(e) =>
                                            updateProfileField("name", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Username</Label>
                                    <Input
                                        type="text"
                                        value={profileForm.username}
                                        placeholder="Masukkan username"
                                        onChange={(e) =>
                                            updateProfileField("username", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={profileForm.email || ""}
                                        placeholder="user@email.com"
                                        onChange={(e) =>
                                            updateProfileField("email", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Role</Label>
                                    <Input
                                        type="text"
                                        value={getRoleLabel(user?.role)}
                                        disabled
                                    />
                                </div>

                                <div>
                                    <Label>Status</Label>
                                    <Input
                                        type="text"
                                        value={getStatusLabel(user?.status)}
                                        disabled
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
                            >
                                {profileLoading ? "Menyimpan..." : "Simpan Profile"}
                            </button>
                        </form>
                    </ComponentCard>

                    <ComponentCard
                        title="Ganti Password"
                        desc="Gunakan password lama untuk mengganti password akun."
                    >
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <Label>Password Lama</Label>
                                <Input
                                    type="password"
                                    value={passwordForm.current_password}
                                    placeholder="Masukkan password lama"
                                    onChange={(e) =>
                                        updatePasswordField(
                                            "current_password",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <Label>Password Baru</Label>
                                <Input
                                    type="password"
                                    value={passwordForm.password}
                                    placeholder="Minimal 6 karakter"
                                    onChange={(e) =>
                                        updatePasswordField("password", e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <Label>Konfirmasi Password</Label>
                                <Input
                                    type="password"
                                    value={passwordForm.password_confirmation}
                                    placeholder="Ulangi password baru"
                                    onChange={(e) =>
                                        updatePasswordField(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-70"
                            >
                                {passwordLoading ? "Menyimpan..." : "Ganti Password"}
                            </button>
                        </form>
                    </ComponentCard>
                </div>

                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </div>
        </RoleGuard>
    );
}
