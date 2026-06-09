"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
};

function getPageNumbers(currentPage: number, totalPages: number) {
    const pages: Array<number | "..."> = [];

    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
        pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (currentPage < totalPages - 2) {
        pages.push("...");
    }

    pages.push(totalPages);

    return pages;
}

export default function Pagination({
    totalItems,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50],
}: PaginationProps) {
    if (totalItems <= 0) return null;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startItem = (safeCurrentPage - 1) * pageSize + 1;
    const endItem = Math.min(safeCurrentPage * pageSize, totalItems);
    const pageNumbers = getPageNumbers(safeCurrentPage, totalPages);

    const goToPage = (page: number) => {
        onPageChange(Math.min(Math.max(page, 1), totalPages));
    };

    return (
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center">
                <span>
                    Menampilkan {startItem}-{endItem} dari {totalItems} data
                </span>

                {onPageSizeChange && (
                    <label className="flex items-center gap-2">
                        <span className="sr-only">Jumlah data per halaman</span>
                        <select
                            value={pageSize}
                            onChange={(event) => {
                                onPageSizeChange(Number(event.target.value));
                                onPageChange(1);
                            }}
                            className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option} / halaman
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Halaman sebelumnya"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                    {pageNumbers.map((page, index) =>
                        page === "..." ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="inline-flex h-9 w-9 items-center justify-center text-sm text-gray-400"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                type="button"
                                onClick={() => goToPage(page)}
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium ${
                                    page === safeCurrentPage
                                        ? "bg-brand-500 text-white"
                                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <span className="text-sm font-medium text-gray-600 sm:hidden">
                    {safeCurrentPage} / {totalPages}
                </span>

                <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Halaman berikutnya"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
