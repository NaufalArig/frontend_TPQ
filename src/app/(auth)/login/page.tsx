"use client";

import { login } from "@/services/auth";
import Cookies from "js-cookie";
import Checkbox from "@/components/form/Checkbox";
import Input from "@/components/form/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            showToast("Email wajib diisi", "error");
            return;
        }

        if (!password.trim()) {
            showToast("Kata sandi wajib diisi", "error");
            return;
        }

        setLoading(true);

        try {
            const res = await login(email, password);

            localStorage.clear();
            Cookies.remove("token");
            Cookies.set("token", res.token, { expires: 1, sameSite: "lax" });

            setShowSuccess(true);

            setTimeout(() => {
                window.location.replace("/dashboard");
            }, 1000);

        } catch (err: unknown) {
            if (err instanceof Error) {
                showToast(err.message, "error");
            } else {
                showToast("Email atau password salah", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {showSuccess && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    <div className="relative z-10 flex flex-col items-center bg-white rounded-2xl shadow-2xl px-10 py-8 mx-4 animate-[fadeScaleIn_0.3s_ease-out]">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                            <svg
                                className="w-10 h-10 text-green-500 animate-[checkDraw_0.4s_ease-out_0.1s_both]"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5 13L9 17L19 7"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="24"
                                    strokeDashoffset="0"
                                    style={{
                                        animation: "dash 0.5s ease-out 0.2s both",
                                    }}
                                />
                            </svg>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                            Masuk Berhasil!
                        </h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Selamat datang kembali, <span className="font-semibold text-gray-700 capitalize">{email}</span>
                        </p>

                        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full animate-[loadBar_1s_linear_forwards]" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Mengalihkan ke dashboard...</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col flex-1 lg:w-1/2 w-full">
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                    <div>
                        <div className="mb-5 sm:mb-8">
                            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                Masuk
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Masukan email kamu dan kata sandi kamu!
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
                        >
                            <div className="space-y-6">
                                <div>
                                    <Label>Email<span className="text-error-500">*</span></Label>
                                    <Input
                                        placeholder="user@gmail.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Kata sandi<span className="text-error-500">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Ketik kata sandimu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox checked={isChecked} onChange={setIsChecked} />
                                        <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                                            Keep me logged in
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <Button
                                        type="submit"
                                        disabled={loading || showSuccess}
                                        className="w-full"
                                        size="sm"
                                    >
                                        {loading ? "Loading..." : "Masuk"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
}