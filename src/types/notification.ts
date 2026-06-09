export type NotifItem = {
    id: number;

    student_id?: number | null;
    user_id?: number | null;

    title: string;
    message: string;
    type?: string | null;

    is_read: boolean;

    created_at: string;
    updated_at?: string;

    student?: {
        id: number;
        name: string;
        birth_date?: string | null;
        join_date?: string | null;
        status?: "pending" | "active" | "graduated" | "left";
    } | null;

    user?: {
        id: number;
        name: string;
        username?: string;
    } | null;
};

export type NotificationSummary = {
    data: NotifItem[];
    unread: number;
};