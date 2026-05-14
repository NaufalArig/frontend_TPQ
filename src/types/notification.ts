export type NotifItem = {
    id: number;
    santri_id: number;
    judul: string;
    pesan: string;
    dibaca: boolean;
    created_at: string;
    santri?: { id: number; nama: string };
};

export type NotificationSummary = {
    data: NotifItem[];
    unread: number;
};