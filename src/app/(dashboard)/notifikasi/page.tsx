"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "@/services/notification";
import { NotifItem , NotificationSummary } from "@/types/notification";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

export default function NotifikasiPage() {
    const [summary, setSummary] = useState<NotificationSummary | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <div>
            <PageBreadcrumb pageTitle="Notifikasi" />
            <ComponentCard title="Daftar Notifikasi">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">
                        {summary?.unread} notifikasi belum dibaca
                    </p>
                    {(summary?.unread ?? 0) > 0 && (
                        <button
                            onClick={handleReadAll}
                            className="text-sm text-blue-500 hover:underline"
                        >
                            Tandai semua dibaca
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {summary?.data.length === 0 && (
                        <p className="text-center text-gray-400 py-8">
                            Tidak ada notifikasi
                        </p>
                    )}

                    {summary?.data.map((notif: NotifItem ) => (
                        <div
                            key={notif.id}
                            className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors ${notif.dibaca
                                    ? "bg-white border-gray-100"
                                    : "bg-blue-50 border-blue-200"
                                }`}
                        >
                            <div className="flex gap-3 items-start">
                                {/* Dot indikator */}
                                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.dibaca ? "bg-gray-300" : "bg-blue-500"
                                    }`} />

                                <div>
                                    <p className={`text-sm font-semibold ${notif.dibaca ? "text-gray-500" : "text-gray-800"
                                        }`}>
                                        {notif.judul}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {notif.pesan}
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

                            {!notif.dibaca && (
                                <button
                                    onClick={() => handleRead(notif.id)}
                                    className="text-xs text-blue-500 hover:underline shrink-0 mt-1"
                                >
                                    Tandai dibaca
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </ComponentCard>
        </div>
    );
}