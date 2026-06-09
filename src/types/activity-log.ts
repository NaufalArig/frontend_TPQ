import { User } from "@/types/user";

export type ActivityLogAction =
    | "login"
    | "logout"
    | "create"
    | "update"
    | "delete"
    | "print"
    | "export"
    | string;

export type ActivityLog = {
    id: number;
    user_id?: number | null;
    user?: Pick<User, "id" | "name" | "username" | "role"> | null;
    action: ActivityLogAction;
    module: string;
    entity_type?: string | null;
    entity_id?: number | null;
    description: string;
    old_values?: Record<string, unknown> | unknown[] | null;
    new_values?: Record<string, unknown> | unknown[] | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
    updated_at?: string;
};

export type ActivityLogParams = {
    search?: string;
    action?: string;
    module?: string;
    user_id?: string | number;
    date_from?: string;
    date_to?: string;
};
