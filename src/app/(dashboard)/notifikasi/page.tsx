"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notification";
import { NotifItem , NotificationSummary } from "@/types/notification";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/ui/pagination/Pagination";

export default function NotifikasiPage() {
    const [summary, setSummary] = useState<NotificationSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const loadData = async () => {
        const data = await getNotifications();
        setSummary(data);
        setLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            const data = await getNotifications();
            setSummary(data);
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleRead = async (id: number) => {
        await markAsRead(id);
        loadData();
    };

    const handleReadAll = async () => {
        await markAllAsRead();
        loadData();
    };

    if (loading) return <p>Loading...</p>;

    const notifications = summary?.data ?? [];
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
                        {summary?.unread} notifikasi belum dibaca
                    </p>
                    {(summary?.unread ?? 0) > 0 && (
                        <button
                            onClick={handleReadAll}
                            className="w-full rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 sm:w-auto sm:border-0 sm:p-0 sm:hover:bg-transparent sm:hover:underline"
                        >
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {notifications.length === 0 && (
                        <p className="text-center text-gray-400 py-8">
                            Tidak ada notifikasi
                        </p>
                    )}

                    {paginatedNotifications.map((notif: NotifItem) => (
                        <div
                            key={notif.id}
                            className={`flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-start sm:justify-between ${notif.is_read
                                    ? "bg-white border-gray-100"
                                    : "bg-blue-50 border-blue-200"
                                }`}
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                {/* Dot indikator */}
                                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.is_read ? "bg-gray-300" : "bg-blue-500"
                                    }`} />

                                <div className="min-w-0">
                                    <p className={`text-sm font-semibold ${notif.is_read ? "text-gray-500" : "text-gray-800"
                                        }`}>
                                        {notif.title}
                                    </p>
                                    <p className="mt-0.5 break-words text-sm text-gray-500">
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notif.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>

                            {!notif.is_read && (
                                <button
                                    onClick={() => handleRead(notif.id)}
                                    className="w-full shrink-0 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-500 hover:bg-blue-50 sm:mt-1 sm:w-auto sm:border-0 sm:p-0 sm:hover:bg-transparent sm:hover:underline"
                                >
                                    Tandai dibaca
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <Pagination
                        totalItems={notifications.length}
                        currentPage={safeCurrentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            </ComponentCard>
        </div>
    );
}
