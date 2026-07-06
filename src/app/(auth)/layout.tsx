import GridShape from "@/components/common/GridShape";
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
            <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 sm:p-0 lg:flex-row">
                {children}

                <div className="hidden h-full w-full items-center bg-brand-900 dark:bg-white/5 lg:grid lg:w-1/2">
                    <div className="relative z-1 flex h-full items-center justify-center overflow-hidden px-10">
                        <GridShape />

                        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center text-center">
                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10 shadow-lg backdrop-blur">
                                <span className="text-4xl">📖</span>
                            </div>

                            <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
                                Sistem Informasi Administrasi TPQ
                            </h1>

                            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
                                Satu platform untuk mengelola data santri, guru,
                                kelas, absensi, keuangan, aset, dan notifikasi.
                            </p>

                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                {[
                                    "Data Santri",
                                    "Guru & Kelas",
                                    "Absensi",
                                    "Keuangan",
                                    "Aset",
                                    "Notifikasi",
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-10 border-t border-white/10 pt-6">
                                <p className="text-center text-lg text-white/70">
                                    طَلَبُ العِلْمِ فَرِيْضَةٌ عَلَى كُلِّ مُسْلِمٍ
                                </p>
                                <p className="mt-2 text-center text-sm text-white/55">
                                    Menuntut ilmu itu wajib bagi setiap muslim
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}