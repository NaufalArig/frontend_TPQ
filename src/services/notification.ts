import API_URL from "@/lib/api";
import {
    NotificationFilter,
    NotificationSummary,
} from "@/types/notification";

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

export async function getNotifications(
    status: NotificationFilter = "all"
): Promise<NotificationSummary> {
    const query = status === "all" ? "" : `?status=${status}`;

    const res = await fetch(`${API_URL}/notifications${query}`, {
        headers: headers(),
    });

    if (!res.ok) {
        throw new Error("Gagal mengambil notifikasi");
    }

    const data = await res.json();

    return {
        data: data.data ?? [],
        unread: data.unread ?? data.unread_count ?? 0,
        unread_count: data.unread_count ?? data.unread ?? 0,
    };
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

export async function deleteNotification(id: number) {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: headers(),
    });

    if (!res.ok) {
        throw new Error("Gagal menghapus notifikasi");
    }

    return res.json();
}

export async function deleteAllNotifications() {
    const res = await fetch(`${API_URL}/notifications/delete-all`, {
        method: "DELETE",
        headers: headers(),
    });

    if (!res.ok) {
        throw new Error("Gagal menghapus semua notifikasi");
    }

    return res.json();
}