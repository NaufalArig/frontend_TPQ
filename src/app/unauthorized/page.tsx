import GridShape from "@/components/common/GridShape";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { LockIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Unauthorized Access | TPQ Admin",
    description: "Halaman akses ditolak TPQ Admin",
};

export default function UnauthorizedPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 dark:bg-gray-900">
            <GridShape />

            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-xl rounded-3xl border border-gray-200 bg-white/80 p-10 text-center shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">

                {/* Icon */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                    <LockIcon className="h-12 w-12 text-red-500" />
                </div>

                {/* Status */}
                <div className="mb-4 inline-flex items-center rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    403 Forbidden
                </div>

                {/* Title */}
                <h1 className="mb-4 text-4xl font-extrabold text-gray-800 dark:text-white">
                    Akses Ditolak
                </h1>

                {/* Description */}
                <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    Kamu tidak memiliki izin untuk membuka halaman ini.
                    Silakan hubungi administrator jika merasa ini adalah kesalahan.
                </p>

                {/* Buttons */}
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-brand-600"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} TPQ Baraqatul Qur&apos;an
            </p>
        </div>
    );
}