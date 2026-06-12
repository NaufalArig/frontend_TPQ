import API_URL from "@/lib/api";
import { NotificationSummary } from "@/types/notification";

function getToken() {
    if (typeof document === "undefined") return null;

    return document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
}

const headers = () => ({
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
});

export async function getNotifications(): Promise<NotificationSummary> {
    const res = await fetch(`${API_URL}/notifications`, {
        headers: headers(),
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil notifikasi");
    }

    return res.json();
}

export async function markAsRead(id: number) {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: headers(),
    });

    if (!res.ok) {
        throw new Error("Gagal menandai notifikasi");
    }

    return res.json();
}

export async function markAllAsRead() {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: headers(),
    });

    if (!res.ok) {
        throw new Error("Gagal menandai semua notifikasi");
    }

    return res.json();
}