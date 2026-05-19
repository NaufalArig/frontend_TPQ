"use client";

import { useEffect } from "react";

type ToastType = "success" | "error" | "warning";

type Props = {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
};

export default function Toast({ message, type = "success", onClose, duration = 1500 }: Props) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const styles = {
        success: { box: "bg-white border-green-200", icon: "bg-green-100", text: "text-green-500" },
        error:   { box: "bg-white border-red-200",   icon: "bg-red-100",   text: "text-red-500"   },
        warning: { box: "bg-white border-yellow-200", icon: "bg-yellow-100", text: "text-yellow-500" },
    };

    const s = styles[type];

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" />

            <div
                className={`relative z-10 flex flex-col items-center gap-3 px-10 py-7 rounded-2xl border shadow-xl ${s.box}`}
                style={{ animation: "fadeScaleIn 0.25s ease-out" }}
            >
                {/* Icon dengan animasi */}
                <div className={`flex items-center justify-center w-16 h-16 rounded-full ${s.icon}`}>
                    {type === "success" && (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className={s.text}>
                            <path
                                d="M5 13L9 17L19 7"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="30"
                                strokeDashoffset="30"
                                style={{ animation: "dash 0.5s ease-out 0.2s forwards" }}
                            />
                        </svg>
                    )}
                    {type === "error" && (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className={s.text}>
                            <path
                                d="M6 18L18 6"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray="20"
                                strokeDashoffset="20"
                                style={{ animation: "dash 0.4s ease-out 0.1s forwards" }}
                            />
                            <path
                                d="M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray="20"
                                strokeDashoffset="20"
                                style={{ animation: "dash 0.4s ease-out 0.2s forwards" }}
                            />
                        </svg>
                    )}
                    {type === "warning" && (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className={s.text}>
                            <path
                                d="M12 9v4"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray="10"
                                strokeDashoffset="10"
                                style={{ animation: "dash 0.3s ease-out 0.1s forwards" }}
                            />
                            <path
                                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="60"
                                strokeDashoffset="60"
                                style={{ animation: "dash 0.5s ease-out 0.2s forwards" }}
                            />
                        </svg>
                    )}
                </div>

                <p className="text-base font-semibold text-center text-gray-700">
                    {message}
                </p>
            </div>
        </div>
    );
}