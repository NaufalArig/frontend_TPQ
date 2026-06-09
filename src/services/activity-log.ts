import api from "@/lib/axios";
import { ActivityLogParams } from "@/types/activity-log";

export async function getActivityLogs(params?: ActivityLogParams) {
    const res = await api.get("/activity-logs", { params });
    return res.data;
}

export async function getActivityLogById(id: string | number) {
    const res = await api.get(`/activity-logs/${id}`);
    return res.data;
}
