"use client";

import { useState } from "react";

export type SortDirection = "asc" | "desc" | null;

type Props = {
    label: string;
    sortKey: string;
    activeKey: string | null;
    direction: SortDirection;
    onSort: (key: string, direction: SortDirection) => void;
    className?: string;
};

export default function SortableHeader({
    label,
    sortKey,
    activeKey,
    direction,
    onSort,
    className = "",
}: Props) {
    const [open, setOpen] = useState(false);
    const isActive = activeKey === sortKey;

    const indicator = isActive && direction === "asc"
        ? "A"
        : isActive && direction === "desc"
            ? "Z"
            : "v";

    return (
        <div className={`relative flex items-center justify-between gap-2 ${className}`}>
            <span>{label}</span>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                className={`flex h-5 w-5 items-center justify-center rounded border text-[10px] ${
                    isActive
                        ? "border-brand-500 bg-brand-100 text-brand-700"
                        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-100"
                }`}
                aria-label={`Sort ${label}`}
            >
                {indicator}
            </button>

            {open && (
                <div className="absolute right-0 top-7 z-50 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                    <button
                        type="button"
                        onClick={() => {
                            onSort(sortKey, "asc");
                            setOpen(false);
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                    >
                        Sort A ke Z
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onSort(sortKey, "desc");
                            setOpen(false);
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                    >
                        Sort Z ke A
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onSort(sortKey, null);
                            setOpen(false);
                        }}
                        className="block w-full rounded px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                    >
                        Hapus Sort
                    </button>
                </div>
            )}
        </div>
    );
}
