import api from "@/lib/axios";
import { DashboardStats } from "@/types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get("/dashboard");
    return res.data;
}