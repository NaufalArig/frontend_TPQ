"use client";

import { useCallback, useEffect, useState } from "react";
import {
    deleteAllNotifications,
    deleteNotification,
    getNotifications,
    markAllAsRead,
} from "@/services/notification";
import {
    NotifItem,
    NotificationFilter,
    NotificationSummary,
} from "@/types/notification";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/ui/pagination/Pagination";

export default function NotifikasiPage() {
    const [summary, setSummary] = useState<NotificationSummary>({
        data: [],
        unread: 0,
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState<NotificationFilter>("all");
    const [actionLoading, setActionLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        type: "single" | "all";
        id: number | null;
    }>({
        show: false,
        type: "single",
        id: null,
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const data = await getNotifications(filter);

            setSummary({
                data: data.data ?? [],
                unread: data.unread ?? data.unread_count ?? 0,
            });
        } catch (error) {
            console.error(error);

            setSummary({
                data: [],
                unread: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            loadData();
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [loadData]);

    const handleReadAll = async () => {
        try {
            setActionLoading(true);
            await markAllAsRead();
            await loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setActionLoading(true);

            await deleteNotification(id);
            await loadData();

            setDeleteModal({
                show: false,
                type: "single",
                id: null,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        try {
            setActionLoading(true);

            await deleteAllNotifications();
            await loadData();

            setDeleteModal({
                show: false,
                type: "single",
                id: null,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteModal.type === "single" && deleteModal.id) {
            await handleDelete(deleteModal.id);
            return;
        }

        if (deleteModal.type === "all") {
            await handleDeleteAll();
        }
    };

    if (loading) return <p>Loading...</p>;

    const notifications = summary.data ?? [];
    const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedNotifications = notifications.slice(
        pageStart,
        pageStart + pageSize
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Notifikasi" />

            <ComponentCard title="Daftar Notifikasi">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        {summary.unread} notifikasi belum dibaca
                    </p>

                    {summary.unread > 0 && (
                        <button
                            onClick={handleReadAll}
                            className="w-full rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 sm:w-auto sm:border-0 sm:p-0 sm:hover:bg-transparent sm:hover:underline"
                        >
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex rounded-xl bg-gray-100 p-1">
                        {[
                            { value: "all", label: "Semua" },
                            { value: "unread", label: "Belum Dibaca" },
                            { value: "read", label: "Sudah Dibaca" },
                        ].map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                    setFilter(item.value as NotificationFilter);
                                    setCurrentPage(1);
                                }}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filter === item.value
                                    ? "bg-white text-brand-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            disabled={actionLoading || summary.unread === 0}
                            onClick={handleReadAll}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
                        >
                            Baca Semua
                        </button>

                        <button
                            type="button"
                            disabled={actionLoading || notifications.length === 0}
                            onClick={() =>
                                setDeleteModal({
                                    show: true,
                                    type: "all",
                                    id: null,
                                })
                            }
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                        >
                            Hapus Semua
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {notifications.length === 0 && (
                        <p className="py-8 text-center text-gray-400">
                            Tidak ada notifikasi
                        </p>
                    )}

                    {paginatedNotifications.map((notif: NotifItem) => (
                        <div
                            key={notif.id}
                            className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-start sm:justify-between ${notif.is_read
                                ? "border-gray-100 bg-white"
                                : "border-blue-200 bg-blue-50"
                                }`}
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <span
                                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notif.is_read
                                        ? "bg-gray-300"
                                        : "bg-blue-500"
                                        }`}
                                />

                                <div className="min-w-0">
                                    <p
                                        className={`text-sm font-semibold ${notif.is_read
                                            ? "text-gray-500"
                                            : "text-gray-800"
                                            }`}
                                    >
                                        {notif.title}
                                    </p>

                                    <p className="mt-0.5 break-words text-sm text-gray-500">
                                        {notif.message}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {new Date(
                                            notif.created_at
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                    setDeleteModal({
                                        show: true,
                                        type: "single",
                                        id: notif.id,
                                    })
                                }
                                className="w-full shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60 sm:mt-1 sm:w-auto"
                            >
                                Hapus
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <Pagination
                        totalItems={notifications.length}
                        currentPage={safeCurrentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </ComponentCard>
            {deleteModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() =>
                            !actionLoading &&
                            setDeleteModal({
                                show: false,
                                type: "single",
                                id: null,
                            })
                        }
                    />

                    <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.53 21H20.47A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                            {deleteModal.type === "all"
                                ? "Hapus Semua Notifikasi?"
                                : "Hapus Notifikasi?"}
                        </h3>

                        <p className="mt-2 text-center text-sm text-gray-500">
                            {deleteModal.type === "all"
                                ? "Semua notifikasi akan dihapus dan tidak dapat dikembalikan."
                                : "Notifikasi ini akan dihapus dan tidak dapat dikembalikan."}
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        type: "single",
                                        id: null,
                                    })
                                }
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleConfirmDelete}
                                className="w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                            >
                                {actionLoading ? "Menghapus..." : "Ya, Hapus"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}