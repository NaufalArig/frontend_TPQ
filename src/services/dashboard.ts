import api from "@/lib/axios";

export async function getDashboardStats() {
    const res = await api.get("/dashboard");
    return res.data;
}