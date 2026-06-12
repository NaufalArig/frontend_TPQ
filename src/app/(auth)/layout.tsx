import GridShape from "@/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
                {children}
                <div className="lg:w-1/2 w-full h-full bg-brand-900 dark:bg-white/5 lg:grid items-center hidden">
                    <div className="relative items-center justify-center  flex z-1">
                        <GridShape />
                        <div className="flex flex-col items-center max-w-xs">
                            <p className="text-center text-gray-400 dark:text-white/60">
                                طَلَبُ العِلْمِ فَرِيْضَةٌ عَلَى كُلِّ مُسْلِمٍ
                            </p>
                            <p className="text-center text-gray-400 dark:text-white/60">
                                Menuntut ilmu itu wajib bagi setiap muslim
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
